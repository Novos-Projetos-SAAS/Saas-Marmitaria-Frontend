export async function requestCheckout(action, body, csrf, requestId, { signal, statusRef } = {}) {
    const response = await fetch('/api/checkout/' + action + (requestId ? '?requisicao=' + encodeURIComponent(requestId) : ''), {
        method: action === 'status' ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', referrerPolicy: 'no-referrer',
        headers: { ...(action !== 'status' ? { 'Content-Type': 'application/json' } : {}),
            ...(csrf ? { 'X-Checkout-CSRF': csrf } : {}), ...(statusRef ? { 'X-Checkout-Status': statusRef } : {}) },
        ...(action !== 'status' ? { body: JSON.stringify(body ?? {}) } : {}), signal
    });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.message || 'Não foi possível consultar o pedido.'), {
        status: response.status, conflict: Boolean(result.code), result
    });
    return result.data;
}
export function withCheckoutLock(action) {
    if (!navigator.locks?.request) throw new Error('Use um navegador atualizado e uma conexão segura para finalizar o pedido.');
    return navigator.locks.request('marmitaria-checkout', action);
}
export async function startAnotherOrder() {
    return withCheckoutLock(async () => {
        const session = await requestCheckout('sessao', {});
        return requestCheckout('nova-compra', {}, session.csrf_token);
    });
}
