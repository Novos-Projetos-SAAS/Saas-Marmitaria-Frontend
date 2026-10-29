export async function requestOwnedOrder(pedidoId, { signal } = {}) {
    const id = String(pedidoId);
    if (!/^[1-9]\d{0,9}$/.test(id) || Number(id) > 2147483647) throw new Error('Pedido inválido.');
    const response = await fetch('/api/checkout/acompanhamento?pedido=' + id, {
        method: 'GET', credentials: 'same-origin', cache: 'no-store', referrerPolicy: 'no-referrer', signal
    });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.message || 'Não foi possível consultar o pedido.'), { status: response.status });
    return result.data;
}
