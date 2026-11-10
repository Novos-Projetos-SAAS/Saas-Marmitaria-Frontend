import api from './api';

const storageKey = 'marmitaria_infinitepay_pedidos';

export async function readConfiguration() {
    return (await api.get('/configuracoes/infinitepay')).data;
}

export async function saveConfiguration(input, csrf) {
    return (await api.put('/configuracoes/infinitepay', input, {
        headers: { 'X-Infinitepay-CSRF': csrf }
    })).data;
}

export async function setActivation(ativo, csrf) {
    return (await api.patch('/configuracoes/infinitepay/ativacao', { ativo }, {
        headers: { 'X-Infinitepay-CSRF': csrf }
    })).data;
}

export function savedPayments() {
    try {
        const values = JSON.parse(localStorage.getItem(storageKey) || '[]');
        return Array.isArray(values) ? values.filter(value => value && typeof value === 'object' && typeof value.token === 'string') : [];
    } catch { return []; }
}

export function savePayment(payment) {
    const values = savedPayments().filter(item => item.token !== payment.token);
    // Keep the access secret off URLs and retain it across the provider redirect.
    localStorage.setItem(storageKey, JSON.stringify([...values, payment].slice(-30)));
}

export function forgetPayment(token) {
    localStorage.setItem(storageKey, JSON.stringify(savedPayments().filter(item => item.token !== token)));
}

async function publicRequest(path, { token, body, signal } = {}) {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
    const response = await fetch(`${baseUrl}${path}`, {
        method: body ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
        referrerPolicy: 'no-referrer', signal: signal || AbortSignal.timeout(50000),
        headers: { ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {})
    });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error(result.message || 'Não foi possível consultar o pagamento.'), {
        status: response.status, result
    });
    return result.data;
}

export function readPayment(payment, signal) {
    return publicRequest(`/pagamentos/pedidos/${Number(payment.pedido_id)}`, { token: payment.token, signal });
}

export function confirmPayment(payment, identifiers) {
    return publicRequest(`/pagamentos/pedidos/${Number(payment.pedido_id)}/confirmar`, {
        token: payment.token, body: identifiers
    });
}

export function providerUrl(value, kind = 'checkout') {
    try {
        const url = new URL(value);
        const allowed = kind === 'checkout' ? ['checkout.infinitepay.io', 'buy.infinitepay.io'] : ['recibo.infinitepay.io', 'comprovante.infinitepay.io'];
        return url.protocol === 'https:' && allowed.includes(url.hostname) && !url.username && !url.password && !url.port ? url.href : null;
    } catch { return null; }
}

export async function readFinancialOrders(page = 1) {
    return (await api.get('/pagamentos/admin', { params: { page, limit: 20 } })).data;
}

export async function reconcilePayment(id, identifiers, csrf) {
    return (await api.post(`/pagamentos/admin/${Number(id)}/conciliar`, identifiers, {
        headers: { 'X-Infinitepay-CSRF': csrf }
    })).data;
}
