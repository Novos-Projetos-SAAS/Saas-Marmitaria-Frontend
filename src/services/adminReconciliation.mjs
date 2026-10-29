export function createAdminReconciliation(api, createId = () => crypto.randomUUID()) {
    const ids = new Map(), pending = new Map();
    async function send(pedidoId) {
        const requestId = ids.get(pedidoId) || createId();
        ids.set(pedidoId, requestId);
        const csrf = (await api.get('/pagamentos/admin/csrf')).data?.csrf_token;
        if (typeof csrf !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(csrf)) throw new Error('Sessão de conciliação indisponível.');
        const response = await api.post(`/pagamentos/admin/${pedidoId}/conciliar`, { request_id: requestId },
            { headers: { 'X-Infinitepay-CSRF': csrf } });
        const result = response.data?.data;
        if (response.data?.status !== 'success' || Number(result?.pedido_id) !== pedidoId || result?.solicitacao_id !== requestId ||
            !Number.isSafeInteger(result?.eventos_reagendados) || result.eventos_reagendados < 0 ||
            !['SOLICITADA', 'SEM_IDENTIFICADORES', 'JA_CONFIRMADO'].includes(result?.status)) throw new Error('Resposta de conciliação inconclusiva.');
        ids.delete(pedidoId);
        return result;
    }
    return {
        request(id) {
            const pedidoId = Number(id);
            if (!Number.isSafeInteger(pedidoId) || pedidoId <= 0) return Promise.reject(new Error('Pedido inválido.'));
            if (!pending.has(pedidoId)) pending.set(pedidoId, send(pedidoId).finally(() => pending.delete(pedidoId)));
            return pending.get(pedidoId);
        }
    };
}
