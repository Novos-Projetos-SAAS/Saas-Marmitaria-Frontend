export function operationallyAllowed(order) {
    return order?.fluxo_pagamento !== 'INFINITEPAY' || order.cozinha_autorizada === true;
}
export async function authorizePrintOrder(order, authorize) {
    const current = await authorize(order.id);
    if (current?.id !== order.id || !operationallyAllowed(current)) throw new Error('Pedido sem autorização operacional.');
    return current;
}
export function trackingLocation(order, statusRef) {
    const base = '/pedido/sucesso';
    if (/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(order?.client_request_id ?? ''))
        return base + '?requisicao=' + order.client_request_id;
    return /^[A-Za-z0-9_-]{43}$/.test(statusRef ?? '') ? base + '#ref=' + statusRef : base;
}
export function paymentPresentation(order, error = false) {
    if (error) return { title: 'Verificação inconclusiva', message: 'Não foi possível consultar agora. Não refaça o pedido; tente consultar novamente.' };
    if (!order?.pedido_id && !order?.pagamento_status) return { title: 'Pedido não localizado', message: 'Use o mesmo navegador em que fez o pedido. Telefone e número do pedido não substituem seu acesso seguro.' };
    if (order.pagamento_status === 'ESTORNADA') return { title: 'Pagamento estornado', message: 'O Backend registrou um estorno. A liberação anterior e o histórico do pedido foram preservados; consulte a marmitaria.' };
    if (order.cozinha_liberada) return { title: 'Pedido liberado', message: order.fluxo_pagamento === 'POSTERIOR'
        ? 'Seu pedido foi registrado. O pagamento será realizado na entrega ou retirada.' : 'Pagamento confirmado e pedido liberado para preparo.' };
    const status = order.pagamento_status;
    if (['PAGA','LIQUIDADA'].includes(status)) return { title: 'Pagamento confirmado', message: 'Aguardando a liberação do pedido pelo servidor.' };
    if (status === 'AGUARDANDO') return { title: 'Aguardando pagamento', message: 'Conclua o pagamento no checkout seguro. O pedido ainda não foi liberado para preparo.' };
    if (['CRIANDO','SEM_TENTATIVA'].includes(status)) return { title: 'Pagamento em verificação', message: 'Estamos verificando sua tentativa. Não crie outro pedido para tentar pagar novamente.' };
    if (['FALHOU','CANCELADA','EXPIRADA','ESTORNADA'].includes(status)) return { title: 'Pagamento não confirmado', message: 'Consulte a marmitaria antes de iniciar outra tentativa de pagamento.' };
    return { title: 'Verificação inconclusiva', message: status === 'DIVERGENTE' ? 'Identificamos uma divergência financeira. Aguarde a conferência da marmitaria.' : 'A cobrança pode existir. Aguarde a verificação; não gere outra tentativa.' };
}
export function checkoutDestination(order) {
    if (order.checkout_url !== undefined) {
        const url = new URL(order.checkout_url);
        if (url.origin !== 'https://checkout.infinitepay.io' || url.username || url.password || url.hash ||
            /[\s\p{C}\\]/u.test(order.checkout_url) || url.href !== order.checkout_url) throw new Error('Link de pagamento inválido.');
        return url.href;
    }
    return '/pedido/sucesso?requisicao=' + encodeURIComponent(order.client_request_id);
}
export function createCheckoutFlow({ api, navigate, onState = () => {}, withLock = action => action() }) {
    let pending;
    async function create(payload) {
        onState({ phase: 'PREPARANDO_ACESSO' });
        const session = await api('sessao', {});
        const current = await api('status', undefined, undefined, session.client_request_id);
        let result = current, recovered = Boolean(current.pedido_id);
        if (!recovered) {
            onState({ phase: 'CRIANDO_PEDIDO' });
            try { result = await api('pedido', { ...payload, client_request_id: session.client_request_id }, session.csrf_token); }
            catch (error) {
                if (error.conflict) throw error;
                // A missing response is not permission to send another creation request.
                result = await api('status', undefined, undefined, session.client_request_id);
                if (!result.pedido_id) throw error;
            }
        }
        if (!result.pedido_id) throw new Error('Pedido ainda não identificado.');
        result = { ...result, client_request_id: session.client_request_id, recovered };
        const target = checkoutDestination(result);
        onState({ phase: result.pagamento_status === 'INCERTA' ? 'INCERTA' : result.checkout_url ? 'REDIRECIONANDO' : 'IDENTIFICADO', order: result });
        navigate(target); return result;
    }
    return { submit(payload) {
        if (pending) return pending;
        pending = Promise.resolve().then(() => withLock(() => create(payload))).catch(error => {
            onState({ phase: error.conflict ? 'FALHA' : 'INCERTA' }); throw error;
        }).finally(() => { pending = undefined; });
        return pending;
    } };
}
