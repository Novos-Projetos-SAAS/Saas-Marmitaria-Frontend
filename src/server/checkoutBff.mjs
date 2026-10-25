const ownerCookie = '__Host-marmitaria-checkout', statusCookie = '__Host-marmitaria-status';
const opaque = value => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value);
const commonHeaders = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'same-origin' };
const conflicts = new Set(['ALIMENTOS_INDISPONIVEIS','MARMITAS_ESPECIAIS_ALTERADAS','PRODUTOS_INDISPONIVEIS','PRODUTOS_ALTERADOS','LOJA_FECHADA']);
function reply(body, status = 200) { return Response.json(body, { status, headers: commonHeaders }); }
function fail(status) { return reply({ status: 'fail', message: status === 403 ? 'Solicitação não autorizada. Atualize a página.' : 'Não foi possível confirmar a solicitação. Consulte seu pedido antes de tentar novamente.' }, status); }
function cookie(request, name) {
    const values = (request.headers.get('cookie') || '').split(';').map(value => value.trim()).filter(value => value.startsWith(name + '='));
    if (values.length > 1) throw new Error();
    const value = values[0]?.slice(name.length + 1);
    if (value !== undefined && !opaque(value)) throw new Error();
    return value;
}
function setCookie(response, name, value, seconds) {
    response.headers.append('Set-Cookie', `${name}=${value}; Path=/; Max-Age=${seconds}; HttpOnly; Secure; SameSite=Lax`);
}
function configuredUrl(value, allowLoopback) {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
        !(url.protocol === 'https:' || allowLoopback && url.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) throw new Error();
    return url.origin;
}
function providerUrl(value, origin) {
    if (typeof value !== 'string' || /[\s\p{C}\\]/u.test(value)) throw new Error();
    const url = new URL(value);
    if (url.origin !== origin || url.username || url.password || url.hash || url.href !== value) throw new Error();
    return value;
}
function publicData(data) {
    if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error();
    const clean = {};
    for (const key of ['pedido_id','total','client_request_id','fluxo_pagamento','pagamento_status','pedido_status','cozinha_liberada']) {
        if (Object.hasOwn(data, key)) clean[key] = data[key];
    }
    if (data.checkout_url !== undefined) clean.checkout_url = providerUrl(data.checkout_url, 'https://checkout.infinitepay.io');
    if (data.receipt_url !== undefined) clean.receipt_url = providerUrl(data.receipt_url, 'https://recibo.infinitepay.io');
    return clean;
}
async function boundedJson(stream, limit) {
    if (!stream) throw new Error();
    const reader = stream.getReader(), chunks = []; let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read(); if (done) break;
            size += value.byteLength; if (size > limit) throw new Error(); chunks.push(value);
        }
    } finally { await reader.cancel().catch(() => {}); }
    const all = new Uint8Array(size); let offset = 0;
    for (const value of chunks) { all.set(value, offset); offset += value.length; }
    return JSON.parse(new TextDecoder().decode(all));
}

export async function handleCheckout(request, action, { backendUrl, siteOrigin, fetchImpl = fetch, allowLoopback = false } = {}) {
    let backend, origin;
    try { backend = configuredUrl(backendUrl, allowLoopback); origin = configuredUrl(siteOrigin, allowLoopback); } catch { return fail(503); }
    if (!['sessao','status','pedido','retomar','nova-compra'].includes(action)) return fail(404);
    const write = action !== 'status';
    if (request.method !== (write ? 'POST' : 'GET')) return fail(405);
    if (request.headers.get('sec-fetch-site') === 'cross-site') return fail(403);
    if (write && request.headers.get('origin') !== origin) return fail(403);
    if (write && request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return fail(415);
    try {
        const owner = cookie(request, ownerCookie), storedRef = cookie(request, statusCookie);
        const requestId = new URL(request.url).searchParams.get('requisicao');
        const ref = request.headers.get('X-Checkout-Status') || (!requestId ? storedRef : undefined);
        if (requestId !== null && !uuid(requestId) || ref && !opaque(ref)) return fail(400);
        if (action !== 'sessao' && !owner && !(action === 'status' && ref)) return fail(404);
        const csrf = request.headers.get('X-Checkout-CSRF');
        if (write && action !== 'sessao' && !opaque(csrf)) return fail(403);
        const headers = { 'Content-Type': 'application/json', ...(owner ? { Authorization: 'Bearer ' + owner } : {}),
            ...(csrf ? { 'X-Checkout-CSRF': csrf } : {}) };
        const path = action === 'sessao' ? '/pagamentos/sessao' : action === 'status'
            ? ref ? (owner ? '/pagamentos/sessao/retorno?ref=' : '/pagamentos/consulta?ref=') + ref : '/pagamentos/sessao/pedido' + (requestId ? '?requisicao=' + requestId : '')
            : '/pagamentos/sessao/' + action;
        const input = write ? await boundedJson(request.body, 65536) : undefined;
        const response = await fetchImpl(backend + path, { method: write ? 'POST' : 'GET', headers, redirect: 'error',
            cache: 'no-store', signal: AbortSignal.timeout(15000), ...(write ? { body: JSON.stringify(input) } : {}) });
        if (response.status >= 300 && response.status < 400) return fail(502);
        const body = await boundedJson(response.body, 262144);
        if (!response.ok) {
            if (response.status === 409 && conflicts.has(body.code)) return reply({ status: 'conflict', code: body.code, message: body.message, details: body.details }, 409);
            return fail([400,403,404,409,415,429].includes(response.status) ? response.status : 503);
        }
        if (body.status !== 'success') throw new Error();
        if (action === 'sessao' || action === 'nova-compra') {
            const data = body.data;
            if (!opaque(data?.session_token) || !opaque(data.csrf_token) || !uuid(data.client_request_id) || owner && owner !== data.session_token) throw new Error();
            const seconds = Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000);
            if (!Number.isSafeInteger(seconds) || seconds <= 0 || seconds > 30 * 86400) throw new Error();
            const result = reply({ status: 'success', data: { csrf_token: data.csrf_token, client_request_id: data.client_request_id } });
            setCookie(result, ownerCookie, data.session_token, seconds); return result;
        }
        const result = reply({ status: 'success', data: publicData(body.data) });
        if (ref) setCookie(result, statusCookie, ref, 86400);
        return result;
    } catch { return fail(503); }
}
