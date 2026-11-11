export const paymentLabels = {
    PAGO: 'Pagamento confirmado', PENDENTE: 'Aguardando pagamento', FALHOU: 'Falhou',
    CANCELADO: 'Cancelado', TRADICIONAL: 'Pagamento tradicional'
};

export function orderDate(value) {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) return 'Data indisponível';
    return `${date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} às ${date.toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
    })}`;
}

export function money(value) {
    return value !== null && value !== undefined && Number.isFinite(Number(value))
        ? Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Não informado';
}

export function kitchenProgress(pedido) {
    const steps = ['Pendente', 'Em Preparo', pedido.metodo_entrega === 'Retirada' ? 'Pronto para Retirada' : 'Saiu para Entrega', 'Entregue'];
    const blocked = pedido.fluxo_pagamento === 'INFINITEPAY' && pedido.pagamento_status !== 'PAGO';
    return { steps, blocked, index: blocked || pedido.status === 'Cancelado' ? -1 : steps.indexOf(pedido.status) };
}

export function catalogImage(value) {
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
}
