import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAdminReconciliation } from '../src/services/adminReconciliation.mjs';

const requestId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const csrf = 'a'.repeat(43);

test('reconciliation obtains session CSRF and only requests durable processing of the selected order', async () => {
    const calls = [];
    const controller = createAdminReconciliation({
        get: async path => { calls.push(path); return { data: { status: 'success', csrf_token: csrf } }; },
        post: async (path, body, config) => {
            calls.push(path);
            assert.deepEqual(body, { request_id: requestId });
            assert.deepEqual(config, { headers: { 'X-Infinitepay-CSRF': csrf } });
            return { data: { status: 'success', data: { pedido_id: 7, solicitacao_id: requestId, status: 'SOLICITADA', eventos_reagendados: 0 } } };
        }
    }, () => requestId);
    assert.equal((await controller.request(7)).status, 'SOLICITADA');
    assert.deepEqual(calls, ['/pagamentos/admin/csrf', '/pagamentos/admin/7/conciliar']);
});

test('a lost response preserves the request UUID for an explicit retry', async () => {
    const ids = []; let attempts = 0, generated = 0;
    const controller = createAdminReconciliation({
        get: async () => ({ data: { status: 'success', csrf_token: csrf } }),
        post: async (path, body) => {
            ids.push(body.request_id);
            if (++attempts === 1) throw new Error('lost synthetic response');
            return { data: { status: 'success', data: { pedido_id: 7, solicitacao_id: requestId, status: 'SOLICITADA', eventos_reagendados: 0 } } };
        }
    }, () => { generated++; return requestId; });
    await assert.rejects(controller.request(7));
    await controller.request(7);
    assert.deepEqual(ids, [requestId, requestId]);
    assert.equal(generated, 1);
});

test('concurrent clicks share one request and a missing CSRF never posts', async () => {
    let finish, posts = 0;
    const controller = createAdminReconciliation({
        get: async () => ({ data: { status: 'success', csrf_token: csrf } }),
        post: async () => { posts++; return new Promise(resolve => { finish = () => resolve({ data: { status: 'success', data: { pedido_id: 7, solicitacao_id: requestId, status: 'JA_CONFIRMADO', eventos_reagendados: 0 } } }); }); }
    }, () => requestId);
    const first = controller.request(7), second = controller.request(7);
    await Promise.resolve();
    finish();
    await Promise.all([first, second]);
    assert.equal(posts, 1);
    const denied = createAdminReconciliation({ get: async () => ({ data: { status: 'success' } }), post: () => assert.fail() }, () => requestId);
    await assert.rejects(denied.request(7));
});

test('an incomplete or mismatched response retains the original reconciliation UUID', async () => {
    for (const fields of [{ solicitacao_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' }, { eventos_reagendados: -1 }, { eventos_reagendados: undefined }]) {
        const ids = []; let attempt = 0, generated = 0;
        const controller = createAdminReconciliation({
            get: async () => ({ data: { status: 'success', csrf_token: csrf } }),
            post: async (path, body) => {
                ids.push(body.request_id);
                return { data: { status: 'success', data: { pedido_id: 7, solicitacao_id: requestId, status: 'SOLICITADA', eventos_reagendados: 0,
                    ...(++attempt === 1 ? fields : {}) } } };
            }
        }, () => { generated++; return requestId; });
        await assert.rejects(controller.request(7));
        await controller.request(7);
        assert.deepEqual(ids, [requestId, requestId]);
        assert.equal(generated, 1);
    }
});
