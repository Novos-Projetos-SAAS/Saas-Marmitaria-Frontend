import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { handleCheckout } from '../src/server/checkoutBff.mjs';
import { createCheckoutFlow, paymentPresentation, operationallyAllowed } from '../src/services/checkoutFlow.mjs';

const token = randomBytes(32).toString('base64url'), csrf = randomBytes(32).toString('base64url');
const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', origin = 'https://shop.invalid.test';
const settings = { backendUrl: 'https://backend.invalid.test', siteOrigin: origin };
const session = { session_token: token, csrf_token: csrf, client_request_id: id, expires_at: new Date(Date.now() + 86400000).toISOString() };
const request = (action, method = 'POST', options = {}) => new Request(origin + '/api/checkout/' + action, {
    method, headers: { Origin: origin, 'Content-Type': 'application/json', ...options.headers }, ...(method === 'POST' ? { body: '{}' } : {}) });
test('BFF sets persistent host-only HttpOnly Secure Lax cookie and never exposes bearer or upstream secrets', async () => {
    const response = await handleCheckout(request('sessao'), 'sessao', { ...settings, fetchImpl: async () => Response.json({ status: 'success', data: { ...session, api_key: 'PRIVATE' } }) });
    assert.equal(response.status, 200);
    const cookie = response.headers.get('set-cookie');
    for (const part of ['__Host-marmitaria-checkout=', 'HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', 'Max-Age=']) assert.ok(cookie.includes(part));
    assert.equal(cookie.includes('Domain='), false); assert.equal(response.headers.get('cache-control'), 'no-store');
    const serialized = JSON.stringify(await response.json()); assert.equal(serialized.includes(token), false); assert.equal(serialized.includes('PRIVATE'), false);
});
test('BFF rejects forged/missing Origin, cross-site writes and non-JSON before calling backend', async () => {
    for (const headers of [{ Origin: 'https://attacker.invalid' }, { Origin: '' }, { 'Sec-Fetch-Site': 'cross-site' }, { 'Content-Type': 'text/plain' }]) {
        const result = await handleCheckout(request('sessao', 'POST', { headers }), 'sessao', { ...settings, fetchImpl: () => assert.fail('must not call backend') });
        assert.ok([403,415].includes(result.status));
    }
});
test('BFF uses only configured backend, forwards session server-side and strips unexpected financial fields', async () => {
    const result = await handleCheckout(request('status', 'GET', { headers: { Cookie: '__Host-marmitaria-checkout=' + token } }), 'status', {
        ...settings, fetchImpl: async (url, init) => {
            assert.equal(url, settings.backendUrl + '/pagamentos/sessao/pedido'); assert.equal(init.headers.Authorization, 'Bearer ' + token);
            assert.equal(init.redirect, 'error');
            return Response.json({ status: 'success', data: { pagamento_status: 'INCERTA', cozinha_liberada: false, access_token: token, transaction_nsu: 'PRIVATE' } });
        } });
    assert.deepEqual((await result.json()).data, { pagamento_status: 'INCERTA', cozinha_liberada: false });
});
test('STATUS-only access cannot resume checkout or retrieve a receipt', async () => {
    const cookie = '__Host-marmitaria-status=' + token;
    const denied = await handleCheckout(request('retomar', 'POST', { headers: { Cookie: cookie, 'X-Checkout-CSRF': csrf } }), 'retomar', { ...settings, fetchImpl: () => assert.fail() });
    assert.equal(denied.status, 404);
});
for (const kind of ['timeout', 'redirect', 'bad-json']) test('BFF ' + kind + ' never retries or exposes raw upstream errors', async () => {
    let calls = 0;
    const result = await handleCheckout(request('sessao'), 'sessao', { ...settings, fetchImpl: async () => {
        calls++; if (kind === 'timeout') throw new Error('API_KEY_PRIVATE');
        return new Response('API_KEY_PRIVATE', { status: kind === 'redirect' ? 302 : 200 });
    } });
    assert.equal(calls, 1); assert.ok(result.status >= 500); assert.equal((await result.text()).includes('API_KEY_PRIVATE'), false);
});
for (const type of ['PIX', 'CREDITO', 'DINHEIRO', 'DEBITO']) test('client submits ' + type + ' once and follows only backend state', async () => {
    let creates = 0; const navigation = [], states = [];
    const online = ['PIX','CREDITO'].includes(type);
    const data = { pedido_id: 1, client_request_id: id, fluxo_pagamento: online ? 'INFINITEPAY' : 'POSTERIOR',
        pagamento_status: online ? 'AGUARDANDO' : 'POSTERIOR', ...(online ? { checkout_url: 'https://checkout.infinitepay.io/SYNTHETIC' } : {}) };
    const flow = createCheckoutFlow({ api: async (action, body) => {
        if (action === 'sessao') return session;
        if (action === 'status') return { pedido_id: null };
        creates++; assert.equal(body.client_request_id, id); assert.equal(body.fluxo_pagamento, undefined); return data;
    }, navigate: url => navigation.push(url), onState: value => states.push(value.phase) });
    await Promise.all([flow.submit({ metodo_pagamento_id: 91 }), flow.submit({ metodo_pagamento_id: 91 })]);
    assert.equal(creates, 1); assert.equal(navigation.length, 1);
    assert.equal(navigation[0], online ? data.checkout_url : '/pedido/sucesso?requisicao=' + id);
    assert.ok(states.includes('CRIANDO_PEDIDO'));
});
test('lost first response recovers through the established session without another creation', async () => {
    let creates = 0, reads = 0;
    const flow = createCheckoutFlow({ api: async action => {
        if (action === 'sessao') return session;
        if (action === 'status') return ++reads > 1 ? { pedido_id: 7, client_request_id: id, pagamento_status: 'INCERTA' } : { pedido_id: null };
        creates++; throw new Error('lost response');
    }, navigate() {} });
    const result = await flow.submit({}); assert.equal(result.pedido_id, 7); assert.equal(creates, 1);
});
test('reload and reopened browser recover an existing intention without submitting a new order', async () => {
    const flow = createCheckoutFlow({ api: async action => action === 'sessao' ? session : action === 'status'
        ? { pedido_id: 7, client_request_id: id, pagamento_status: 'INCERTA' } : assert.fail('no creation'), navigate() {} });
    assert.equal((await flow.submit({})).pedido_id, 7);
});
test('INCERTA, delayed webhook and inconclusive checks never become a paid presentation', () => {
    for (const status of ['INCERTA','CRIANDO','SEM_TENTATIVA','DIVERGENTE','FALHOU']) assert.notEqual(paymentPresentation({ pagamento_status: status }).title, 'Pagamento confirmado');
    assert.equal(paymentPresentation({ pagamento_status: 'PAGA', cozinha_liberada: false }).title, 'Pagamento confirmado');
    assert.equal(paymentPresentation({ pagamento_status: 'PAGA', cozinha_liberada: true }).title, 'Pedido liberado');
});
test('unpaid administrative printing is blocked even with a spoofed release timestamp', () => {
    assert.equal(operationallyAllowed({ fluxo_pagamento: 'INFINITEPAY', liberado_cozinha_em: new Date().toISOString() }), false);
    assert.equal(operationallyAllowed({ fluxo_pagamento: 'INFINITEPAY', cozinha_autorizada: true }), true);
    assert.equal(operationallyAllowed({ fluxo_pagamento: 'POSTERIOR' }), true);
});
test('an arbitrary checkout URL is rejected without navigation', async () => {
    const flow = createCheckoutFlow({ api: async action => action === 'sessao' ? session : action === 'status' ? { pedido_id: null }
        : { pedido_id: 1, checkout_url: 'https://attacker.invalid/' }, navigate: () => assert.fail() });
    await assert.rejects(flow.submit({}));
});
test('printing revalidates a queued socket order and uses only the fresh authorized response', async () => {
    const { authorizePrintOrder } = await import('../src/services/checkoutFlow.mjs');
    const stale = { id: 7, fluxo_pagamento: 'INFINITEPAY', cozinha_autorizada: true };
    await assert.rejects(authorizePrintOrder(stale, async () => { throw new Error('authorization revoked'); }));
    await assert.rejects(authorizePrintOrder(stale, async () => ({ ...stale, cozinha_autorizada: false })));
    const fresh = { ...stale, nome_cliente: 'CURRENT' };
    assert.equal(await authorizePrintOrder(stale, async id => { assert.equal(id, 7); return fresh; }), fresh);
});
test('return status stays bound across reload and only the backend may enrich holder data', async () => {
    for (const owner of [false, true]) {
        const cookies = '__Host-marmitaria-status=' + csrf + (owner ? '; __Host-marmitaria-checkout=' + token : '');
        const result = await handleCheckout(request('status', 'GET', { headers: { Cookie: cookies } }), 'status', { ...settings, fetchImpl: async url => {
            assert.equal(url, settings.backendUrl + (owner ? '/pagamentos/sessao/retorno?ref=' : '/pagamentos/consulta?ref=') + csrf);
            return Response.json({ status: 'success', data: { pagamento_status: 'PAGA', cozinha_liberada: true } });
        } });
        assert.equal(result.status, 200);
    }
});
test('a previously released refunded order never displays a current successful payment', () => {
    assert.equal(paymentPresentation({ pedido_id: 1, pagamento_status: 'ESTORNADA', cozinha_liberada: true }).title, 'Pagamento estornado');
});

test('holder return pins its owned intention so another tab cannot replace it on reload', async () => {
    const { trackingLocation } = await import('../src/services/checkoutFlow.mjs');
    assert.equal(trackingLocation({ client_request_id: id }), '/pedido/sucesso?requisicao=' + id);
    assert.equal(trackingLocation({ pagamento_status: 'PAGA' }), '/pedido/sucesso');
    assert.equal(trackingLocation({ client_request_id: 'invalid' }), '/pedido/sucesso');
    assert.equal(trackingLocation({ pagamento_status: 'PAGA' }, csrf), '/pedido/sucesso#ref=' + csrf);
    const result = await handleCheckout(new Request(origin + '/api/checkout/status?requisicao=' + id, {
        headers: { Cookie: '__Host-marmitaria-checkout=' + token + '; __Host-marmitaria-status=' + csrf }
    }), 'status', { ...settings, fetchImpl: async url => {
        assert.equal(url, settings.backendUrl + '/pagamentos/sessao/pedido?requisicao=' + id);
        return Response.json({ status: 'success', data: { client_request_id: id, pedido_id: 7 } });
    } });
    assert.equal(result.status, 200);
});
