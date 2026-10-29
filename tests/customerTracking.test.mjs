import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ownedPaymentDetails, loadCustomerTracking, loadCurrentOwnedOrder, mergeCurrentOwnedOrder } from '../src/services/customerTracking.mjs';

const confirmed = { pedido_id: 7, fluxo_pagamento: 'INFINITEPAY', pagamento_status: 'PAGA', cozinha_liberada: true,
    receipt_url: 'https://recibo.infinitepay.io/TRANSACTION' };

test('financial details belong only to the exact protected order response', () => {
    assert.equal(ownedPaymentDetails(8, confirmed), null);
    assert.equal(ownedPaymentDetails(7, null), null);
    assert.equal(ownedPaymentDetails(7, { ...confirmed, fluxo_pagamento: 'POSTERIOR' }), null);
    assert.equal(ownedPaymentDetails(7, confirmed).receiptUrl, confirmed.receipt_url);
});

test('unconfirmed, refunded and historical orders never expose a receipt link', () => {
    for (const pagamento_status of ['AGUARDANDO', 'INCERTA', 'DIVERGENTE', 'ESTORNADA']) {
        assert.equal(ownedPaymentDetails(7, { ...confirmed, pagamento_status }).receiptUrl, null);
    }
    assert.equal(ownedPaymentDetails(7, { ...confirmed, receipt_url: undefined }).receiptUrl, null);
    assert.equal(ownedPaymentDetails(7, { ...confirmed, receipt_url: 'https://evil.invalid/receipt' }).receiptUrl, null);
});

test('tracking looks up each listed order independently through the holder session', async () => {
    const calls = [];
    const result = await loadCustomerTracking('(11) 99999-9999', async phone => {
        assert.equal(phone, '11999999999');
        return { status: 'success', data: [{ id: 7 }, { id: 8, receipt_url: 'https://evil.invalid/public' }] };
    }, async id => { calls.push(id); if (id === 7) return confirmed; throw new Error('not owned'); });
    assert.deepEqual(calls, [7, 8]);
    assert.equal(result.pedidos[0].pagamentoTitular.receiptUrl, confirmed.receipt_url);
    assert.equal(result.pedidos[1].pagamentoTitular, null);
});

test('a mismatched or unauthorized holder lookup does not remove the public order', async () => {
    const result = await loadCustomerTracking('11999999999', async () => ({ status: 'success', data: [{ id: 8 }] }), async () => confirmed);
    assert.equal(result.pedidos[0].id, 8);
    assert.equal(result.pedidos[0].pagamentoTitular, null);
});

test('invalid phone numbers and cancelled searches do not start holder lookups', async () => {
    const fail = () => assert.fail('must not request');
    assert.match((await loadCustomerTracking('123', fail, fail)).erro, /telefone válido/);
    const controller = new AbortController(); controller.abort();
    assert.equal(await loadCustomerTracking('11999999999', fail, fail, controller.signal), null);
});

test('current pending recovery requires a second holder-only authorization for the exact order', async () => {
    const current = { ...confirmed, pagamento_status: 'AGUARDANDO', cozinha_liberada: false, total: 20, pedido_status: 'Pendente' };
    assert.equal(await loadCurrentOwnedOrder(async () => current, async () => { throw new Error('not owned'); }), null);
    assert.equal(await loadCurrentOwnedOrder(async () => current, async () => ({ ...current, pedido_id: 8 })), null);
    assert.equal(await loadCurrentOwnedOrder(async () => current, async id => { assert.equal(id, 7); return current; }), current);
});

test('a protected pending order missing from the phone list remains visible without invented order details', () => {
    const current = { ...confirmed, pagamento_status: 'AGUARDANDO', cozinha_liberada: false, total: 20, pedido_status: 'Pendente' };
    const [order] = mergeCurrentOwnedOrder([], current);
    assert.equal(order.id, 7);
    assert.equal(order.somenteTitular, true);
    assert.equal(order.valor_total, 20);
    assert.equal(order.status, 'Pendente');
    assert.equal(order.criado_em, undefined);
    assert.equal(order.pagamentoTitular.title, 'Aguardando pagamento');
    assert.equal(order.pagamentoTitular.receiptUrl, null);
});

test('merging current holder state never duplicates a public card or transfers it to another order', () => {
    const rows = [{ id: 7, nome_cliente: 'Existing detail' }, { id: 8 }];
    const merged = mergeCurrentOwnedOrder(rows, confirmed);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].nome_cliente, 'Existing detail');
    assert.equal(merged[0].pagamentoTitular.receiptUrl, confirmed.receipt_url);
    assert.equal(merged[1].pagamentoTitular, undefined);
    assert.deepEqual(mergeCurrentOwnedOrder(rows, null), rows);
});
