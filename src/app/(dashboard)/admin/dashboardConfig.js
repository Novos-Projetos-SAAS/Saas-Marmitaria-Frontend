/*
 * Somente as opções escolhidas estão ativas.
 * As demais continuam totalmente preparadas; remova o // para exibi-las.
 */
export const CARDS_ATIVOS = [
    "faturamento",
    "pedidosPendentes",
    "ultimoPedido",
    // "quantidadePedidos",
    // "ticketMedio",
    // "pedidosEmPreparo",
    // "pedidosCancelados"
];

export const GRAFICOS_ATIVOS = [
    "faturamentoPorDia",
    "pedidosPorDia",
    "tamanhosMaisVendidos",
    // "alimentosMaisEscolhidos",
    // "metodosPagamento",
    // "tiposEntrega",
    // "statusPedidos"
];

export const PERIODOS_DISPONIVEIS = [
    { value: "hoje", label: "Hoje" },
    { value: "semana", label: "Esta semana" },
    { value: "mes", label: "Este mês" },
    { value: "personalizado", label: "Período personalizado" },
    // { value: "ultimos7dias", label: "Últimos 7 dias" },
    // { value: "ultimos30dias", label: "Últimos 30 dias" }
];
