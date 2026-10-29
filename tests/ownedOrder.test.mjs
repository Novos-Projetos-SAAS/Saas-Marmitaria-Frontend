import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { handleCheckout } from '../src/server/checkoutBff.mjs';
import * as checkoutService from '../src/services/ownedOrder.mjs';

const token = randomBytes(32).toString('base64url');
const origin = 'https://shop.invalid.test';
const settings = { backendUrl: 'https://backend.invalid.test', siteOrigin: origin };
const ownedRequest = (query = '?pedido=37', headers = {}) => new Request(origin + '/api/checkout/acompanhamento' + query, {
    headers: { Cookie: '__Host-marmitaria-checkout=' + token, ...headers }
});

test('owned tracking reads the selected historical order through its private session and strips unrelated fields', async () => {
    const response = await handleCheckout(ownedRequest(), 'acompanhamento', { ...settings, fetchImpl: async (url, init) => {
        assert.equal(url, settings.backendUrl + '/pagamentos/sessao/pedido/37');
        assert.equal(init.method, 'GET'); assert.equal(init.headers.Authorization, 'Bearer ' + token);
        assert.equal(init.cache, 'no-store'); assert.equal(init.redirect, 'error');
        return Response.json({ status: 'success', data: { pedido_id: 37, pagamento_status: 'PAGA', cozinha_liberada: true,
            receipt_url: 'https://recibo.infinitepay.io/SYNTHETIC-37', access_token: token, transaction_nsu: 'SYNTHETIC-37' } });
    } });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data, { pedido_id: 37, pagamento_status: 'PAGA', cozinha_liberada: true,
        receipt_url: 'https://recibo.infinitepay.io/SYNTHETIC-37' });
    assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('phone, STATUS access and malformed order IDs cannot authorize private tracking', async () => {
    for (const request of [ownedRequest('?pedido=37', { Cookie: '__Host-marmitaria-status=' + token }),
        ownedRequest('?pedido=37', { Cookie: '', 'X-Checkout-Status': token }),
        ...['', '?pedido=0', '?pedido=01', '?pedido=-1', '?pedido=1.5', '?pedido=2147483648', '?pedido=37&pedido=38',
            '?pedido=37&telefone=11999999999', '?pedido=37&requisicao=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']
            .map(query => ownedRequest(query))]) {
        const response = await handleCheckout(request, 'acompanhamento', { ...settings, fetchImpl: () => assert.fail('must reject before backend') });
        assert.ok([400,404].includes(response.status));
    }
});

test('a backend ownership denial is retained without exposing receipt or provider data', async () => {
    const response = await handleCheckout(ownedRequest(), 'acompanhamento', { ...settings,
        fetchImpl: async () => Response.json({ status: 'fail', message: 'SYNTHETIC_PRIVATE_RECEIPT' }, { status: 404 }) });
    assert.equal(response.status, 404); assert.doesNotMatch(await response.text(), /SYNTHETIC_PRIVATE_RECEIPT/);
});

test('owner-only status ignores a stale shared STATUS cookie and recovers the private current order', async () => {
    const stale = randomBytes(32).toString('base64url');
    const request = new Request(origin + '/api/checkout/status', { headers: {
        Cookie: '__Host-marmitaria-checkout=' + token + '; __Host-marmitaria-status=' + stale,
        'X-Checkout-Owner-Only': '1'
    } });
    const response = await handleCheckout(request, 'status', { ...settings, fetchImpl: async (url, init) => {
        assert.equal(url, settings.backendUrl + '/pagamentos/sessao/pedido');
        assert.equal(init.headers.Authorization, 'Bearer ' + token);
        return Response.json({ status: 'success', data: { pedido_id: 37, pagamento_status: 'AGUARDANDO', cozinha_liberada: false } });
    } });
    assert.equal(response.status, 200); assert.equal((await response.json()).data.pedido_id, 37);
    assert.equal(response.headers.has('set-cookie'), false);
    const statusOnly = new Request(origin + '/api/checkout/status', { headers: {
        Cookie: '__Host-marmitaria-status=' + stale, 'X-Checkout-Owner-Only': '1'
    } });
    const denied = await handleCheckout(statusOnly, 'status', { ...settings, fetchImpl: () => assert.fail('STATUS is not ownership') });
    assert.equal(denied.status, 404);
});

test('tracking client uses a GET by order with first-party credentials and no financial token in the URL', async () => {
    assert.equal(typeof checkoutService.requestOwnedOrder, 'function');
    const previous = globalThis.fetch;
    try {
        globalThis.fetch = async (url, init) => {
            assert.equal(url, '/api/checkout/acompanhamento?pedido=37'); assert.equal(init.method, 'GET');
            assert.equal(init.credentials, 'same-origin'); assert.equal(init.cache, 'no-store');
            return Response.json({ status: 'success', data: { pedido_id: 37, pagamento_status: 'AGUARDANDO', cozinha_liberada: false } });
        };
        assert.equal((await checkoutService.requestOwnedOrder(37)).pedido_id, 37);
        for (const id of [0, -1, '01', 2147483648, '37&pedido=38']) await assert.rejects(checkoutService.requestOwnedOrder(id));
    } finally { globalThis.fetch = previous; }
});
