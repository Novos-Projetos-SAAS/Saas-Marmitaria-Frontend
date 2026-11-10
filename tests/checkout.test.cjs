const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { webcrypto } = require('node:crypto');
const swc = require('next/dist/build/swc');

const compiled = {};
before(async () => {
    await swc.loadBindings();
    for (const file of ['hooks/useFinancialOrders.js', 'hooks/useCheckout.js', 'services/infinitepayService.js', 'services/pedidosService.js']) {
        const source = readFileSync('src/' + file, 'utf8');
        compiled[file] = (await swc.transform(source, { filename: file, module: { type: 'commonjs' } })).code;
    }
});

function mockCheckout(respond, entries = new Map()) {
    const requests = [];
    const notices = [];
    const localStorage = {
        getItem: key => entries.get(key),
        setItem: (key, value) => entries.set(key, value)
    };
    const post = async (path, body) => {
        requests.push({ path, body });
        const attempts = JSON.parse([...entries.values()][0]);
        assert.ok(attempts.some(a => a.pending && a.token === body.client_request_id));
        return respond(path, body);
    };
    const mocks = {
        './api': { __esModule: true, default: { post: async (path, body) => ({ data: await post(path, body) }) } },
        react: { useRef: current => ({ current }), useState: initial => [initial, () => {}] },
        'react-hot-toast': { __esModule: true, default: { success: text => notices.push(text), error() {} } }
    };
    function load(file) {
        const loaded = { exports: {} };
        runInNewContext(compiled[file], {
            module: loaded, exports: loaded.exports, require: id => {
                assert.ok(id in mocks, 'Unknown test import: ' + id);
                return mocks[id];
            },
            localStorage, crypto: webcrypto, TextEncoder, URL, AbortSignal,
            process: { env: {} },
            fetch: async (path, request) => ({ ok: true, json: async () => post(path, JSON.parse(request.body)) })
        }, { filename: file });
        return loaded.exports;
    }
    mocks['@/services/infinitepayService.js'] = load('services/infinitepayService.js');
    mocks['@/services/pedidosService.js'] = load('services/pedidosService.js');
    return { ...load('hooks/useCheckout.js').useCheckout(), requests, notices, entries,
        saved: mocks['@/services/infinitepayService.js'].savedPayments };
}

const CHECKOUT_URL = 'https://checkout.infinitepay.io/marmitaria';
const PAYLOAD = { metodo_pagamento_id: 1, endereco_cliente: 'Rua Um', marmitas: [{ quantidade: 2 }] };

for (const [name, id, active] of [['PIX', 1, true], ['Crédito', 2, true], ['PIX', 1, false], ['Crédito', 2, false], ['Dinheiro', 3, false]]) {
    test(name + ' segue o fluxo informado pelo backend (' + active + ')', async () => {
        const app = mockCheckout(async () => ({
            status: 'success',
            data: active
                ? { fluxo_pagamento: 'INFINITEPAY', pedido_id: 8, order_nsu: 'order8', checkout_url: CHECKOUT_URL, pagamento_status: 'PENDENTE' }
                : { fluxo_pagamento: 'POSTERIOR', pedido_id: 8 }
        }));
        const result = await app.checkout({ ...PAYLOAD, metodo_pagamento_id: id });
        assert.equal(result.destination, active ? CHECKOUT_URL : '/pedido/sucesso?tradicional=1');
        assert.equal(app.requests[0].path, '/pedidos');
        assert.equal(app.requests[0].body.metodo_pagamento_id, id);
        assert.equal(app.requests[0].body.marmitas[0].quantidade, 2);
        assert.equal('ativo' in app.requests[0].body, false);
        assert.equal(app.notices.length, active ? 0 : 1);
        assert.equal(app.saved().length, active ? 1 : 0);
    });
}

test('resposta sem link mantém carrinho e token para nova tentativa ou recarga', async () => {
    const first = mockCheckout(async () => ({
        status: 'success', data: { fluxo_pagamento: 'INFINITEPAY', pedido_id: 8,
            order_nsu: 'order8', checkout_url: null, pagamento_status: 'PENDENTE', checkout_error: 'Link indisponível' }
    }));
    const waiting = await first.checkout(PAYLOAD);
    assert.equal(waiting.preserveCart, true);
    assert.equal(waiting.destination, '/pedido/sucesso?pedido=8');
    const next = mockCheckout(async () => ({
        status: 'success', data: { fluxo_pagamento: 'INFINITEPAY', pedido_id: 8, order_nsu: 'order8',
            checkout_url: CHECKOUT_URL, pagamento_status: 'PENDENTE', reused: true }
    }), first.entries);
    const retry = await next.checkout(PAYLOAD);
    assert.equal(retry.destination, CHECKOUT_URL);
    assert.equal(next.requests[0].body.client_request_id, first.requests[0].body.client_request_id);
    assert.equal(next.saved()[0].pending, false);
});

test('cliques simultâneos fazem apenas uma requisição e falha mantém tentativa', async () => {
    const app = mockCheckout(async () => { throw new Error('Resposta interrompida'); });
    const [first, second] = await Promise.all([app.checkout(PAYLOAD), app.checkout(PAYLOAD)]);
    assert.equal(first, null);
    assert.equal(second, null);
    assert.equal(app.requests.length, 1);
    assert.equal(app.saved()[0].pending, true);
    assert.equal(app.notices.length, 0);
});

test('recuperação de pedido tradicional preserva carrinho alterado', async () => {
    const original = mockCheckout(async () => { throw new Error('Resposta perdida'); });
    await original.checkout(PAYLOAD);
    const retry = mockCheckout(async () => ({
        status: 'success', data: { fluxo_pagamento: 'POSTERIOR', pedido_id: 8, reused: true }
    }), original.entries);
    const result = await retry.checkout({ ...PAYLOAD, metodo_pagamento_id: 2 });
    assert.equal(result.preserveCart, true);
    assert.equal(result.data.pedido_id, 8);
    assert.equal(retry.saved().length, 0);
    assert.equal(retry.requests[0].body.client_request_id, original.requests[0].body.client_request_id);
});

test('fluxo desconhecido não confirma o pedido', async () => {
    const app = mockCheckout(async () => ({ status: 'success', data: { pedido_id: 8 } }));
    assert.equal(await app.checkout(PAYLOAD), null);
    assert.equal(app.notices.length, 0);
    assert.equal(app.saved()[0].pending, true);
});

test('primeiro envio aceito com carrinho alterado não simula recuperação', async () => {
    const original = mockCheckout(async () => { throw new Error('Sem resposta'); });
    await original.checkout(PAYLOAD);
    const retry = mockCheckout(async () => ({
        status: 'success', data: { fluxo_pagamento: 'POSTERIOR', pedido_id: 8 }
    }), original.entries);
    const result = await retry.checkout({ ...PAYLOAD, metodo_pagamento_id: 2 });
    assert.equal(result.preserveCart, false);
    assert.equal(retry.requests[0].body.client_request_id, original.requests[0].body.client_request_id);
});

test('conflito de disponibilidade preserva o tratamento do carrinho', async () => {
    const conflict = { status: 'error', code: 'PRODUTOS_ALTERADOS', details: { produtos: [3] } };
    const app = mockCheckout(async () => { throw Object.assign(new Error('Conflito'), {
        response: { status: 409, data: conflict }
    }); });
    assert.equal(await app.checkout(PAYLOAD), conflict);
    assert.equal(app.saved().length, 0);
    assert.equal(app.notices.length, 0);
});

test('histórico agrupa por confirmação em São Paulo e mantém total completo da API', () => {
    const loaded = { exports: {} };
    runInNewContext(compiled['hooks/useFinancialOrders.js'], {
        module: loaded, exports: loaded.exports, require: () => ({}), Intl, Date, Map, Set,
    });
    const { groupPayments } = loaded.exports;
    const rows = [
        { pagamento_id: 1, status_financeiro: 'PAGA', pago_em: '2026-11-11T02:00:00Z', criado_em: '2026-11-08T12:00:00Z', valor_centavos: 2400, total_dia_centavos: 7200 },
        { pagamento_id: 2, status_financeiro: 'AGUARDANDO', pagamento_criado_em: '2026-11-11T03:00:00Z', valor_centavos: 1000, total_dia_centavos: 0 },
    ];
    const groups = groupPayments([...rows, rows[0]]);
    assert.deepEqual(Array.from(groups, group => group.key), ['2026-11-11', '2026-11-10']);
    assert.equal(groups[1].totalCents, 7200);
    assert.equal(groups[1].completeTotal, true);
    assert.equal(groups[1].orders.length, 1);
    assert.equal(groups[1].orders[0].time, '23:00');
});

test('histórico distingue estorno, pendência, método ausente e data não informada', () => {
    const loaded = { exports: {} };
    runInNewContext(compiled['hooks/useFinancialOrders.js'], {
        module: loaded, exports: loaded.exports, require: () => ({}), Intl, Date, Map, Set,
    });
    const groups = loaded.exports.groupPayments([
        { pagamento_id: 1, status_financeiro: 'ESTORNADA', pago_em: '2026-11-10T12:00:00Z', valor_centavos: 2400, capture_method: 'credit_card' },
        { pagamento_id: 2, status_financeiro: 'PAGA', criado_em: '2026-11-09T12:00:00Z' },
    ]);
    assert.equal(groups[0].totalCents, 0);
    assert.equal(groups[0].completeTotal, false);
    assert.equal(groups[0].orders[0].refunded, true);
    assert.equal(groups[0].orders[0].paid, false);
    assert.equal(groups[0].orders[0].methodIcon, 'card');
    assert.equal(groups[1].key, 'sem-data');
    assert.equal(groups[1].orders[0].time, 'Horário não informado');
    assert.equal(groups[1].orders[0].amountCents, null);
    assert.equal(groups[1].orders[0].methodIcon, 'unknown');
});
