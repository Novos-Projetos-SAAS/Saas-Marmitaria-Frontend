const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { webcrypto } = require('node:crypto');
const swc = require('next/dist/build/swc');

const compiled = {};
before(async () => {
    await swc.loadBindings();
    for (const file of ['hooks/useFinancialOrders.js', 'hooks/useCheckout.js', 'hooks/useInfinitepayConfiguration.js', 'services/infinitepayService.js', 'services/pedidosService.js',
        'components/InfinitepayConfiguration/InfinitepayConfiguration.jsx', 'components/ui/can/index.jsx',
        'app/(dashboard)/admin/configuracoes-loja/page.jsx', 'app/(dashboard)/admin/configuracoes-loja/ConfiguracoesClient.jsx', 'components/sidebar/page.jsx']) {
        const source = readFileSync('src/' + file, 'utf8');
        compiled[file] = (await swc.transform(source, { filename: file, module: { type: 'commonjs' },
            jsc: { parser: { syntax: 'ecmascript', jsx: file.endsWith('.jsx') }, transform: { react: { runtime: 'automatic' } } } })).code;
    }
});

function configurationHook(service) {
    const state = [], refs = [];
    let stateIndex, refIndex, mounted = false;
    const effects = [];
    const loaded = { exports: {} };
    const react = {
        useState(initial) {
            const index = stateIndex++;
            if (!(index in state)) state[index] = initial;
            return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
        },
        useRef(initial) { const index = refIndex++; return refs[index] ||= { current: initial }; },
        useCallback: callback => callback,
        useEffect: callback => { if (!mounted) effects.push(callback); },
    };
    runInNewContext(compiled['hooks/useInfinitepayConfiguration.js'], {
        module: loaded, exports: loaded.exports,
        require: id => id === 'react' ? react : service,
    });
    const render = () => {
        stateIndex = refIndex = 0;
        const hook = loaded.exports.useInfinitepayConfiguration();
        mounted = true;
        return hook;
    };
    render();
    effects.forEach(effect => effect());
    return render;
}

const CONFIG = { handle: 'loja', ativo: true, assured_installments: 1, has_api_key: true,
    pix_habilitado: false, credito_habilitado: true };
const settle = () => new Promise(resolve => setImmediate(resolve));

test('configuração carrega preferências e salva booleanos pelo serviço existente', async () => {
    const requests = [];
    let persisted = { ...CONFIG };
    const service = {
        readConfiguration: async () => ({ data: persisted, csrf_token: 'csrf-test' }),
        saveConfiguration: async (input, csrf) => {
            requests.push({ input, csrf }); persisted = { ...persisted, ...input }; return { data: persisted };
        },
    };
    const render = configurationHook(service);
    await settle();
    assert.equal(render().form.pix_habilitado, false);
    assert.equal(render().form.credito_habilitado, true);
    render().setForm(previous => ({ ...previous, pix_habilitado: true, credito_habilitado: false }));
    await render().save({ preventDefault() {} });
    assert.equal(requests[0].input.pix_habilitado, true);
    assert.equal(requests[0].input.credito_habilitado, false);
    assert.equal(requests[0].csrf, 'csrf-test');
    assert.equal(render().notice, 'Configuração salva.');
    const remount = configurationHook(service);
    await settle();
    assert.equal(remount().form.credito_habilitado, false);
});

test('erro ao salvar preserva preferências e cliques concorrentes não duplicam requisição', async () => {
    let reject, calls = 0;
    const render = configurationHook({
        readConfiguration: async () => ({ data: { ...CONFIG } }),
        saveConfiguration: () => { calls++; return new Promise((resolve, fail) => { reject = fail; }); },
    });
    await settle();
    render().setForm(previous => ({ ...previous, pix_habilitado: true, credito_habilitado: false }));
    const first = render().save({ preventDefault() {} });
    await render().save({ preventDefault() {} });
    assert.equal(calls, 1);
    reject(new Error('Falha simulada'));
    await first;
    assert.equal(render().form.pix_habilitado, true);
    assert.equal(render().form.credito_habilitado, false);
    assert.ok(render().error);
    assert.equal(render().configuration.pix_habilitado, false);
});

test('alternar integração preserva edições pendentes dos métodos', async () => {
    const render = configurationHook({
        readConfiguration: async () => ({ data: { ...CONFIG } }),
        setActivation: async ativo => ({ data: { ...CONFIG, ativo } }),
    });
    await settle();
    render().setForm(previous => ({ ...previous, pix_habilitado: true, credito_habilitado: false }));
    await render().toggle(false);
    assert.equal(render().configuration.ativo, false);
    assert.equal(render().form.pix_habilitado, true);
    assert.equal(render().form.credito_habilitado, false);
});

function configurationMarkup(permissions, configuration = CONFIG) {
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');
    const mocks = {
        react: React, 'react/jsx-runtime': require('react/jsx-runtime'), 'lucide-react': require('lucide-react'),
        '@/context/AuthContext.js': { useAuthContext: () => ({ isReady: true, hasPermission: name => permissions.includes(name) }) },
        '@/hooks/useInfinitepayConfiguration.js': { useInfinitepayConfiguration: () => ({ configuration, form: configuration,
            loading: false, busy: false, apiKey: '', error: '', notice: '' }) },
        'next/navigation': { usePathname: () => '/admin/configuracoes-loja' },
        '@/hooks/useLoja.js': {}, '@/hooks/useCardapio.js': {},
        '@/components/forms/empresa/empresaForm.jsx': { default: () => null, __esModule: true },
        '@/components/ui/accessDenied/index.jsx': { default: () => React.createElement('p', null, 'Sem acesso'), __esModule: true },
        '../ui/itemSidebar/index.jsx': { default: ({ href, children, label, nome }) => React.createElement('a', { href }, children || label || nome), __esModule: true },
    };
    function load(file) {
        const loaded = { exports: {} };
        runInNewContext(compiled[file], { module: loaded, exports: loaded.exports, require: id => {
            if (id.endsWith('.module.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
            assert.ok(id in mocks, 'Unknown UI test import: ' + id);
            return mocks[id];
        } });
        return loaded.exports;
    }
    const can = load('components/ui/can/index.jsx');
    mocks['@/components/ui/can/index.jsx'] = mocks['../ui/can/index.jsx'] = can;
    mocks['@/components/InfinitepayConfiguration/InfinitepayConfiguration.jsx'] = load('components/InfinitepayConfiguration/InfinitepayConfiguration.jsx');
    mocks['./ConfiguracoesClient.jsx'] = load('app/(dashboard)/admin/configuracoes-loja/ConfiguracoesClient.jsx');
    return {
        page: renderToStaticMarkup(React.createElement(load('app/(dashboard)/admin/configuracoes-loja/page.jsx').default)),
        sidebar: renderToStaticMarkup(React.createElement(load('components/sidebar/page.jsx').default, { menuAberto: true })),
    };
}

test('visualização acessa página, aba e menu com checkboxes somente leitura', () => {
    const markup = configurationMarkup(['pagamentos.visualizar'], { ...CONFIG, ativo: false });
    assert.match(markup.page, /Receber Pix pela InfinitePay/);
    assert.match(markup.page, /Receber cartão de crédito pela InfinitePay/);
    assert.match(markup.page, /preferências salvas serão aplicadas/);
    assert.equal((markup.page.match(/type="checkbox"[^>]*disabled=""/g) || []).length, 2);
    assert.doesNotMatch(markup.page, /Salvar configuração/);
    assert.doesNotMatch(markup.page, /Habilitar pagamentos online/);
    assert.match(markup.sidebar, /href="\/admin\/configuracoes-loja"/);
});

test('permissão configurar edita métodos sem permitir ativação global', () => {
    const { page } = configurationMarkup(['pagamentos.configurar']);
    assert.equal((page.match(/type="checkbox"/g) || []).length, 2);
    assert.doesNotMatch(page, /type="checkbox"[^>]*disabled=""/);
    assert.match(page, /Salvar configuração/);
    assert.doesNotMatch(page, /Habilitar pagamentos online/);
    assert.match(page, /id="infinitepay-configuration-form"/);
    assert.match(page, /form="infinitepay-configuration-form"/);
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
