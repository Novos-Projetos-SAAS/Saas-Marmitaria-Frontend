import { paymentPresentation } from './checkoutFlow.mjs';
import { validateReceiptUrl } from './adminReceipt.mjs';

export async function loadCurrentOwnedOrder(readCurrent, lookupOwned, signal) {
    if (signal?.aborted) return null;
    try {
        const current = await readCurrent({ signal });
        if (signal?.aborted || !Number.isSafeInteger(current?.pedido_id) || current.pedido_id <= 0) return null;
        const owned = await lookupOwned(current.pedido_id, { signal });
        return !signal?.aborted && ownedPaymentDetails(current.pedido_id, owned) ? owned : null;
    } catch { return null; }
}

export function mergeCurrentOwnedOrder(pedidos, ownedOrder) {
    const details = ownedPaymentDetails(ownedOrder?.pedido_id, ownedOrder);
    if (!details) return pedidos;
    if (pedidos.some(pedido => Number(pedido.id) === Number(ownedOrder.pedido_id))) {
        return pedidos.map(pedido => Number(pedido.id) === Number(ownedOrder.pedido_id)
            ? { ...pedido, pagamentoTitular: details } : pedido);
    }
    if (typeof ownedOrder.pedido_status !== 'string' || !ownedOrder.pedido_status) return pedidos;
    return [{ id: ownedOrder.pedido_id, status: ownedOrder.pedido_status, valor_total: ownedOrder.total,
        somenteTitular: true, pagamentoTitular: details }, ...pedidos];
}

export function ownedPaymentDetails(pedidoId, ownedOrder) {
    if (!Number.isSafeInteger(Number(pedidoId)) || Number(pedidoId) <= 0 ||
        Number(ownedOrder?.pedido_id) !== Number(pedidoId) || ownedOrder?.fluxo_pagamento !== 'INFINITEPAY') return null;
    let receiptUrl = null;
    if (['PAGA', 'LIQUIDADA'].includes(ownedOrder.pagamento_status) && ownedOrder.receipt_url) {
        try { receiptUrl = validateReceiptUrl(ownedOrder.receipt_url); } catch { /* Invalid provider URL has no link. */ }
    }
    return { ...paymentPresentation(ownedOrder), receiptUrl };
}

export async function loadCustomerTracking(telefone, listByPhone, lookupOwned, signal) {
    if (signal?.aborted) return null;
    const phone = String(telefone || '').replace(/\D/g, '');
    if (!phone) return { pedidos: [], erro: 'Digite seu número de telefone para consultar os pedidos.' };
    if (phone.length < 10 || phone.length > 11) return { pedidos: [], erro: 'Informe um telefone válido com DDD.' };
    const response = await listByPhone(phone);
    if (signal?.aborted) return null;
    if (response?.status !== 'success' || !response.data?.length) {
        return { pedidos: [], erro: 'Nenhum pedido encontrado para este telefone.' };
    }
    const pedidos = await Promise.all(response.data.map(async pedido => {
        let ownedOrder = null;
        if (!signal?.aborted) {
            try { ownedOrder = await lookupOwned(pedido.id, { signal }); } catch { /* Public tracking remains available without holder access. */ }
        }
        return { ...pedido, pagamentoTitular: ownedPaymentDetails(pedido.id, ownedOrder) };
    }));
    return signal?.aborted ? null : { pedidos, erro: '' };
}
