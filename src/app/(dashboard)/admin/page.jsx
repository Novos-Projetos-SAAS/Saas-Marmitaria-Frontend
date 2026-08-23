

"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    Ban,
    CalendarDays,
    ChefHat,
    Clock3,
    DollarSign,
    ReceiptText,
    RefreshCw,
    ShoppingBag
} from "lucide-react";

import { useDashboard } from "@/hooks/useDashboard.js";

import { CARDS_ATIVOS, GRAFICOS_ATIVOS, PERIODOS_DISPONIVEIS } from "./dashboardConfig.js";
import styles from "./page.module.css";

const CORES_GRAFICOS = [
    "#ea580c", // Laranja principal
    "#3b82f6", // Azul info
    "#22c55e", // Verde sucesso
    "#eab308", // Amarelo aviso
    "#8b5cf6", // Roxo secundário
    "#ef4444"  // Vermelho perigo
];

const ESTILO_EIXO = {
    fill: "#475569",
    fontSize: 12
};

const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
}).format(Number(valor || 0));

const formatarNumero = (valor) => new Intl.NumberFormat("pt-BR").format(Number(valor || 0));

const formatarDia = (valor) => {
    if (!valor) return "";
    const [, mes, dia] = valor.split("-");
    return `${dia}/${mes}`;
};

const formatarDataHora = (valor) => {
    if (!valor) return "";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) return "";

    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const formatarPeriodo = (inicio, fim) => {
    if (!inicio || !fim) return "Carregando período...";

    const formatar = (valor, incluirAno = false) => {
        const [ano, mes, dia] = valor.split("-");
        return incluirAno ? `${dia}/${mes}/${ano}` : `${dia}/${mes}`;
    };

    if (inicio === fim) return formatar(inicio, true);
    return `${formatar(inicio)} a ${formatar(fim, true)}`;
};

const estiloTooltip = {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    color: "#0f172a",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
    fontSize: "0.78rem"
};

const PROPRIEDADES_TOOLTIP = {
    contentStyle: estiloTooltip,
    labelStyle: { color: "#0f172a", fontWeight: 700 },
    itemStyle: { color: "#475569" },
    cursor: { fill: "#f1f5f9", opacity: 0.55 }
};

function CardResumo({ icon: Icone, titulo, valor, detalhe, variante = "padrao", children }) {
    return (
        <article className={`${styles.cardResumo} ${styles[variante] || ""}`}>
            <div className={styles.cardCabecalho}>
                <span className={styles.cardIcone}>
                    <Icone size={22} />
                </span>
                <span className={styles.cardTitulo}>{titulo}</span>
            </div>

            {children || (
                <div className={styles.cardConteudo}>
                    <strong className={styles.cardValor}>{valor}</strong>
                    <span className={styles.cardDetalhe}>{detalhe}</span>
                </div>
            )}
        </article>
    );
}

function CardGrafico({ titulo, descricao, children, amplo = false }) {
    return (
        <article className={`${styles.cardGrafico} ${amplo ? styles.graficoAmplo : ""}`}>
            <header className={styles.graficoCabecalho}>
                <h2>{titulo}</h2>
                <p>{descricao}</p>
            </header>
            <div className={styles.graficoCorpo}>{children}</div>
        </article>
    );
}

function SemDados({ mensagem }) {
    return (
        <div className={styles.semDados}>
            <ReceiptText size={32} />
            <span>{mensagem}</span>
        </div>
    );
}

export default function Dashboard() {
    const {
        dados,
        loading,
        erro,
        periodo,
        setPeriodo,
        dataInicioPersonalizada,
        setDataInicioPersonalizada,
        dataFimPersonalizada,
        setDataFimPersonalizada,
        atualizar
    } = useDashboard();

    const cards = dados?.cards || {};
    const graficos = dados?.graficos || {};
    const ultimoPedido = cards.ultimo_pedido;
    const serieDiaria = graficos.serie_diaria || [];
    const periodoExibicao = formatarPeriodo(
        dados?.periodo?.data_inicio,
        dados?.periodo?.data_fim
    );

    const cardsPreparados = {
        faturamento: (
            <CardResumo
                key="faturamento"
                icon={DollarSign}
                titulo="Faturamento do período"
                valor={formatarMoeda(cards.faturamento)}
                detalhe="Pedidos cancelados não entram no valor"
                variante="faturamento"
            />
        ),
        pedidosPendentes: (
            <CardResumo
                key="pedidosPendentes"
                icon={Clock3}
                titulo="Pedidos pendentes"
                valor={formatarNumero(cards.pedidos_pendentes)}
                detalhe="Aguardando atendimento"
                variante="pendentes"
            />
        ),
        ultimoPedido: (
            <CardResumo key="ultimoPedido" icon={ShoppingBag} titulo="Último pedido" variante="ultimoPedido">
                {ultimoPedido ? (
                    <div className={styles.ultimoPedidoConteudo}>
                        <div className={styles.ultimoPedidoCliente}>
                            <strong>{ultimoPedido.nome_cliente}</strong>
                            <span>Pedido #{ultimoPedido.id}</span>
                        </div>
                        <div className={styles.ultimoPedidoMeta}>
                            <span>{formatarDataHora(ultimoPedido.criado_em)}</span>
                            <strong>{formatarMoeda(ultimoPedido.valor_total)}</strong>
                        </div>
                    </div>
                ) : (
                    <span className={styles.cardSemRegistro}>Nenhum pedido no período selecionado.</span>
                )}
            </CardResumo>
        ),
        quantidadePedidos: (
            <CardResumo
                key="quantidadePedidos"
                icon={ShoppingBag}
                titulo="Pedidos do período"
                valor={formatarNumero(cards.quantidade_pedidos)}
                detalhe="Todos os pedidos recebidos"
            />
        ),
        ticketMedio: (
            <CardResumo
                key="ticketMedio"
                icon={ReceiptText}
                titulo="Ticket médio"
                valor={formatarMoeda(cards.ticket_medio)}
                detalhe="Média por pedido não cancelado"
            />
        ),
        pedidosEmPreparo: (
            <CardResumo
                key="pedidosEmPreparo"
                icon={ChefHat}
                titulo="Pedidos em preparo"
                valor={formatarNumero(cards.pedidos_em_preparo)}
                detalhe="Em produção na cozinha"
            />
        ),
        pedidosCancelados: (
            <CardResumo
                key="pedidosCancelados"
                icon={Ban}
                titulo="Pedidos cancelados"
                valor={formatarNumero(cards.pedidos_cancelados)}
                detalhe="Cancelados no período"
            />
        )
    };

    const graficosPreparados = {
        faturamentoPorDia: (
            <CardGrafico
                key="faturamentoPorDia"
                titulo="Faturamento por dia"
                descricao="Evolução do valor vendido no período"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={serieDiaria} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
                        <defs>
                            <linearGradient id="corFaturamento" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.38} />
                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                        
                        <XAxis dataKey="data" tick={ESTILO_EIXO} tickFormatter={formatarDia} tickLine={false} axisLine={false} minTickGap={24} />
                        <YAxis tick={ESTILO_EIXO} tickFormatter={(valor) => `R$ ${valor}`} tickLine={false} axisLine={false} width={72} />
                        <Tooltip
                            {...PROPRIEDADES_TOOLTIP}
                            labelFormatter={(valor) => `Dia ${formatarDia(valor)}`}
                            formatter={(valor) => [formatarMoeda(valor), "Faturamento"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="faturamento"
                            stroke="#ea580c"
                            strokeWidth={3}
                            fill="url(#corFaturamento)"
                            activeDot={{ r: 5, fill: "#ea580c", stroke: "#ffffff", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardGrafico>
        ),
        pedidosPorDia: (
            <CardGrafico
                key="pedidosPorDia"
                titulo="Quantidade de pedidos por dia"
                descricao="Volume de pedidos recebidos no período"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serieDiaria} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="data" tick={ESTILO_EIXO} tickFormatter={formatarDia} tickLine={false} axisLine={false} minTickGap={24} />
                        <YAxis tick={ESTILO_EIXO} allowDecimals={false} tickLine={false} axisLine={false} width={36} />
                        <Tooltip
                            {...PROPRIEDADES_TOOLTIP}
                            labelFormatter={(valor) => `Dia ${formatarDia(valor)}`}
                            formatter={(valor) => [formatarNumero(valor), "Pedidos"]}
                        />
                        <Bar dataKey="pedidos" fill="#3b82f6" radius={[7, 7, 0, 0]} maxBarSize={44} />
                    </BarChart>
                </ResponsiveContainer>
            </CardGrafico>
        ),
        tamanhosMaisVendidos: (
            <CardGrafico
                key="tamanhosMaisVendidos"
                titulo="Tamanhos de marmita mais vendidos"
                descricao="Quantidade vendida por tamanho"
                amplo
            >
                {graficos.tamanhos_marmita?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={graficos.tamanhos_marmita}
                            layout="vertical"
                            margin={{ top: 8, right: 28, left: 12, bottom: 0 }}
                            accessibilityLayer
                        >
                            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" horizontal={false} />
                            <XAxis type="number" tick={ESTILO_EIXO} allowDecimals={false} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="nome" tick={ESTILO_EIXO} tickLine={false} axisLine={false} width={110} />
                            <Tooltip
                                {...PROPRIEDADES_TOOLTIP}
                                formatter={(valor) => [formatarNumero(valor), "Marmitas"]}
                            />
                            <Bar dataKey="quantidade" fill="#22c55e" radius={[0, 7, 7, 0]} maxBarSize={34} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <SemDados mensagem="Nenhuma marmita vendida neste período." />
                )}
            </CardGrafico>
        ),
        alimentosMaisEscolhidos: (
            <CardGrafico
                key="alimentosMaisEscolhidos"
                titulo="Alimentos mais escolhidos"
                descricao="Preferências dos clientes no período"
            >
                {graficos.alimentos?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={graficos.alimentos} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
                            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                            <XAxis dataKey="nome" tick={ESTILO_EIXO} tickLine={false} axisLine={false} minTickGap={12} />
                            <YAxis tick={ESTILO_EIXO} allowDecimals={false} tickLine={false} axisLine={false} width={36} />
                            <Tooltip {...PROPRIEDADES_TOOLTIP} formatter={(valor) => [formatarNumero(valor), "Escolhas"]} />
                            <Bar dataKey="quantidade" fill="#8b5cf6" radius={[7, 7, 0, 0]} maxBarSize={44} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <SemDados mensagem="Nenhum alimento escolhido neste período." />
                )}
            </CardGrafico>
        ),
        metodosPagamento: (
            <CardGrafico
                key="metodosPagamento"
                titulo="Métodos de pagamento"
                descricao="Distribuição dos pedidos por forma de pagamento"
            >
                {graficos.metodos_pagamento?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart accessibilityLayer>
                            <Pie
                                data={graficos.metodos_pagamento}
                                dataKey="quantidade"
                                nameKey="nome"
                                innerRadius={62}
                                outerRadius={100}
                                paddingAngle={3}
                            >
                                {graficos.metodos_pagamento.map((item, index) => (
                                    <Cell key={item.nome} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...PROPRIEDADES_TOOLTIP} formatter={(valor) => [formatarNumero(valor), "Pedidos"]} />
                            <Legend wrapperStyle={{ color: "#475569", fontSize: "0.78rem" }} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                ) : (
                    <SemDados mensagem="Nenhum pagamento registrado neste período." />
                )}
            </CardGrafico>
        ),
        tiposEntrega: (
            <CardGrafico
                key="tiposEntrega"
                titulo="Entrega e retirada"
                descricao="Como os clientes recebem os pedidos"
            >
                {graficos.tipos_entrega?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart accessibilityLayer>
                            <Pie
                                data={graficos.tipos_entrega}
                                dataKey="quantidade"
                                nameKey="nome"
                                outerRadius={102}
                                label
                            >
                                {graficos.tipos_entrega.map((item, index) => (
                                    <Cell key={item.nome} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                                ))}
                            </Pie>
                            <Tooltip {...PROPRIEDADES_TOOLTIP} formatter={(valor) => [formatarNumero(valor), "Pedidos"]} />
                            <Legend wrapperStyle={{ color: "#475569", fontSize: "0.78rem" }} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                ) : (
                    <SemDados mensagem="Nenhum tipo de entrega registrado neste período." />
                )}
            </CardGrafico>
        ),
        statusPedidos: (
            <CardGrafico
                key="statusPedidos"
                titulo="Pedidos por status"
                descricao="Situação dos pedidos no período"
            >
                {graficos.status_pedidos?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={graficos.status_pedidos} margin={{ top: 12, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
                            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                            <XAxis dataKey="nome" tick={ESTILO_EIXO} tickLine={false} axisLine={false} />
                            <YAxis tick={ESTILO_EIXO} allowDecimals={false} tickLine={false} axisLine={false} width={36} />
                            <Tooltip {...PROPRIEDADES_TOOLTIP} formatter={(valor) => [formatarNumero(valor), "Pedidos"]} />
                            <Line
                                type="monotone"
                                dataKey="quantidade"
                                stroke="#ef4444"
                                strokeWidth={3}
                                activeDot={{ r: 5, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <SemDados mensagem="Nenhum status registrado neste período." />
                )}
            </CardGrafico>
        )
    };

    return (
        <main className={styles.container}>
            <section className={styles.apresentacao}>
                <div>
                    <span className={styles.sobretitulo}>Painel de apresentação</span>
                    <h1>Visão geral da marmitaria</h1>
                    <p>Acompanhe os números mais importantes assim que entrar no sistema.</p>
                </div>

                <button
                    type="button"
                    className={styles.botaoAtualizar}
                    onClick={atualizar}
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? styles.girando : ""} />
                    Atualizar
                </button>
            </section>

            <section className={styles.filtros} aria-label="Filtros da dashboard">
                <div className={styles.filtroPrincipal}>
                    <label htmlFor="periodo-dashboard">
                        <CalendarDays size={18} />
                        Período
                    </label>
                    <select
                        id="periodo-dashboard"
                        value={periodo}
                        onChange={(event) => setPeriodo(event.target.value)}
                    >
                        {PERIODOS_DISPONIVEIS.map((opcao) => (
                            <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                        ))}
                    </select>
                </div>

                {periodo === "personalizado" && (
                    <div className={styles.datasPersonalizadas}>
                        <label htmlFor="data-inicio-dashboard">
                            De
                            <input
                                id="data-inicio-dashboard"
                                type="date"
                                value={dataInicioPersonalizada}
                                max={dataFimPersonalizada}
                                onChange={(event) => setDataInicioPersonalizada(event.target.value)}
                            />
                        </label>
                        <label htmlFor="data-fim-dashboard">
                            Até
                            <input
                                id="data-fim-dashboard"
                                type="date"
                                value={dataFimPersonalizada}
                                min={dataInicioPersonalizada}
                                onChange={(event) => setDataFimPersonalizada(event.target.value)}
                            />
                        </label>
                    </div>
                )}

                <div className={styles.periodoAtual} aria-live="polite">
                    <span>Período analisado</span>
                    <strong>{periodoExibicao}</strong>
                </div>
            </section>

            {erro && (
                <section className={styles.erro} role="alert">
                    <span>{erro}</span>
                    <button type="button" onClick={atualizar}>Tentar novamente</button>
                </section>
            )}

            {loading && !dados ? (
                <section className={styles.carregando} aria-label="Carregando dashboard">
                    <div />
                    <div />
                    <div />
                </section>
            ) : (
                <>
                    <section className={styles.blocoDashboard} aria-labelledby="titulo-indicadores">
                        <header className={styles.secaoCabecalho}>
                            <div>
                                <span>Resumo</span>
                                <h2 id="titulo-indicadores">Indicadores principais</h2>
                            </div>
                            <p>Dados consolidados do período selecionado</p>
                        </header>

                        <div className={styles.gridCards}>
                            {CARDS_ATIVOS.map((opcao) => cardsPreparados[opcao]).filter(Boolean)}
                        </div>
                    </section>

                    <section className={styles.blocoDashboard} aria-labelledby="titulo-graficos">
                        <header className={styles.secaoCabecalho}>
                            <div>
                                <span>Análise visual</span>
                                <h2 id="titulo-graficos">Desempenho no período</h2>
                            </div>
                            <p>Passe o cursor sobre os gráficos para ver os valores</p>
                        </header>

                        <div className={styles.gridGraficos}>
                            {GRAFICOS_ATIVOS.map((opcao) => graficosPreparados[opcao]).filter(Boolean)}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

// "use client";

// import {
//     Area,
//     AreaChart,
//     Bar,
//     BarChart,
//     CartesianGrid,
//     Cell,
//     Legend,
//     Line,
//     LineChart,
//     Pie,
//     PieChart as RechartsPieChart,
//     ResponsiveContainer,
//     Tooltip,
//     XAxis,
//     YAxis
// } from "recharts";
// import {
//     Ban,
//     CalendarDays,
//     ChefHat,
//     Clock3,
//     DollarSign,
//     ReceiptText,
//     RefreshCw,
//     ShoppingBag
// } from "lucide-react";

// import { useDashboard } from "@/hooks/useDashboard.js";

// import { CARDS_ATIVOS, GRAFICOS_ATIVOS, PERIODOS_DISPONIVEIS } from "./dashboardConfig.js";
// import styles from "./page.module.css";

// const CORES_GRAFICOS = [
//     "#ea580c", // Laranja principal
//     "#3b82f6", // Azul info
//     "#22c55e", // Verde sucesso
//     "#eab308", // Amarelo aviso
//     "#8b5cf6", // Roxo secundário
//     "#ef4444"  // Vermelho perigo
// ];

// const ESTILO_EIXO = {
//     fill: "#475569",
//     fontSize: 12
// };

// const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", {
//     style: "currency",
//     currency: "BRL"
// }).format(Number(valor || 0));

// const formatarNumero = (valor) => new Intl.NumberFormat("pt-BR").format(Number(valor || 0));

// const formatarDia = (valor) => {
//     if (!valor) return "";
//     const [, mes, dia] = valor.split("-");
//     return `${dia}/${mes}`;
// };

// const formatarDataHora = (valor) => {
//     if (!valor) return "";

//     const data = new Date(valor);

//     if (Number.isNaN(data.getTime())) return "";

//     return data.toLocaleString("pt-BR", {
//         day: "2-digit",
//         month: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit"
//     });
// };

// const formatarPeriodo = (inicio, fim) => {
//     if (!inicio || !fim) return "Carregando período...";

//     const formatar = (valor, incluirAno = false) => {
//         const [ano, mes, dia] = valor.split("-");
//         return incluirAno ? `${dia}/${mes}/${ano}` : `${dia}/${mes}`;
//     };

//     if (inicio === fim) return formatar(inicio, true);
//     return `${formatar(inicio)} a ${formatar(fim, true)}`;
// };

// const estiloTooltip = {
//     backgroundColor: "#ffffff",
//     border: "1px solid #e2e8f0",
//     borderRadius: "10px",
//     color: "#0f172a",
//     boxShadow: "0 10px 30px rgba(15, 23, 42, 0.18)",
//     fontSize: "0.78rem"
// };

// const PROPRIEDADES_TOOLTIP = {
//     contentStyle: estiloTooltip,
//     labelStyle: { color: "#0f172a", fontWeight: 700 },
//     itemStyle: { color: "#475569" },
//     cursor: { fill: "#f1f5f9", opacity: 0.55 }
// };

// function CardResumo({ icon: Icone, titulo, valor, detalhe, variante = "padrao", children }) {
//     return (
//         <article className={`${styles.cardResumo} ${styles[variante] || ""}`}>
//             <div className={styles.cardCabecalho}>
//                 <span className={styles.cardIcone}>
//                     <Icone size={22} />
//                 </span>
//                 <span className={styles.cardTitulo}>{titulo}</span>
//             </div>

//             {children || (
//                 <div className={styles.cardConteudo}>
//                     <strong className={styles.cardValor}>{valor}</strong>
//                     <span className={styles.cardDetalhe}>{detalhe}</span>
//                 </div>
//             )}
//         </article>
//     );
// }

// function CardGrafico({ titulo, descricao, children, amplo = false }) {
//     return (
//         <article className={`${styles.cardGrafico} ${amplo ? styles.graficoAmplo : ""}`}>
//             <header className={styles.graficoCabecalho}>
//                 <h2>{titulo}</h2>
//                 <p>{descricao}</p>
//             </header>
//             <div className={styles.graficoCorpo}>{children}</div>
//         </article>
//     );
// }

// function SemDados({ mensagem }) {
//     return (
//         <div className={styles.semDados}>
//             <ReceiptText size={32} />
//             <span>{mensagem}</span>
//         </div>
//     );
// }

// export default function Dashboard() {
//     const {
//         dados,
//         loading,
//         erro,
//         periodo,
//         setPeriodo,
//         dataInicioPersonalizada,
//         setDataInicioPersonalizada,
//         dataFimPersonalizada,
//         setDataFimPersonalizada,
//         atualizar
//     } = useDashboard();

//     const cards = dados?.cards || {};
//     const graficos = dados?.graficos || {};
//     const ultimoPedido = cards.ultimo_pedido;
//     const serieDiaria = graficos.serie_diaria || [];
//     const periodoExibicao = formatarPeriodo(
//         dados?.periodo?.data_inicio,
//         dados?.periodo?.data_fim
//     );

//     const cardsPreparados = {
//         faturamento: (
//             <CardResumo
//                 key="faturamento"
//                 icon={DollarSign}
//                 titulo="Faturamento do período"
//                 valor={formatarMoeda(cards.faturamento)}
//                 detalhe="Pedidos cancelados não entram no valor"
//                 variante="faturamento"
//             />
//         ),
//         pedidosPendentes: (
//             <CardResumo
//                 key="pedidosPendentes"
//                 icon={Clock3}
//                 titulo="Pedidos pendentes"
//                 valor={formatarNumero(cards.pedidos_pendentes)}
//                 detalhe="Aguardando atendimento"
//                 variante="pendentes"
//             />
//         ),
//         ultimoPedido: (
//             <CardResumo key="ultimoPedido" icon={ShoppingBag} titulo="Último pedido" variante="ultimoPedido">
//                 {ultimoPedido ? (
//                     <div className={styles.ultimoPedidoConteudo}>
//                         <div className={styles.ultimoPedidoCliente}>
//                             <strong>{ultimoPedido.nome_cliente}</strong>
//                             <span>Pedido #{ultimoPedido.id}</span>
//                         </div>
//                         <div className={styles.ultimoPedidoMeta}>
//                             <span>{formatarDataHora(ultimoPedido.criado_em)}</span>
//                             <strong>{formatarMoeda(ultimoPedido.valor_total)}</strong>
//                         </div>
//                     </div>
//                 ) : (
//                     <span className={styles.cardSemRegistro}>Nenhum pedido no período selecionado.</span>
//                 )}
//             </CardResumo>
//         ),
//         quantidadePedidos: (
//             <CardResumo
//                 key="quantidadePedidos"
//                 icon={ShoppingBag}
//                 titulo="Pedidos do período"
//                 valor={formatarNumero(cards.quantidade_pedidos)}
//                 detalhe="Todos os pedidos recebidos"
//             />
//         ),
//         ticketMedio: (
//             <CardResumo
//                 key="ticketMedio"
//                 icon={ReceiptText}
//                 titulo="Ticket médio"
//                 valor={formatarMoeda(cards.ticket_medio)}
//                 detalhe="Média por pedido não cancelado"
//             />
//         ),
//         pedidosEmPreparo: (
//             <CardResumo
//                 key="pedidosEmPreparo"
//                 icon={ChefHat}
//                 titulo="Pedidos em preparo"
//                 valor={formatarNumero(cards.pedidos_em_preparo)}
//                 detalhe="Em produção na cozinha"
//             />
//         ),
//         pedidosCancelados: (
//             <CardResumo
//                 key="pedidosCancelados"
//                 icon={Ban}
//                 titulo="Pedidos cancelados"
//                 valor={formatarNumero(cards.pedidos_cancelados)}
//                 detalhe="Cancelados no período"
//             />
//         )
//     };

//     const graficosPreparados = {
//         faturamentoPorDia: (
//             <CardGrafico
//                 key="faturamentoPorDia"
//                 titulo="Faturamento por dia"
//                 descricao="Evolução do valor vendido no período"
//             >
//                 <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart data={serieDiaria} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
//                         <defs>
//                             <linearGradient id="corFaturamento" x1="0" y1="0" x2="0" y2="1">
//                                 <stop offset="5%" stopColor="#ea580c" stopOpacity={0.38} />
//                                 <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
//                             </linearGradient>
//                         </defs>

//                         <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
                       
//                         <XAxis dataKey="data" tick={ESTILO_EIXO} tickFormatter={formatarDia} tickLine={false} axisLine={false} minTickGap={24} />
//                         <YAxis tick={ESTILO_EIXO} tickFormatter={(valor) => `R$ ${valor}`} tickLine={false} axisLine={false} width={72} />
//                         <Tooltip
//                             {...PROPRIEDADES_TOOLTIP}
//                             labelFormatter={(valor) => `Dia ${formatarDia(valor)}`}
//                             formatter={(valor) => [formatarMoeda(valor), "Faturamento"]}
//                         />
//                         <Area
//                             type="monotone"
//                             dataKey="faturamento"
//                             stroke="var(--brand-primary)"
//                             strokeWidth={3}
//                             fill="url(#corFaturamento)"
//                             activeDot={{ r: 5, fill: "var(--brand-primary)", stroke: "var(--color-surface)", strokeWidth: 2 }}
//                         />
//                     </AreaChart>
//                 </ResponsiveContainer>
//             </CardGrafico>
//         ),
//         pedidosPorDia: (
//             <CardGrafico
//                 key="pedidosPorDia"
//                 titulo="Quantidade de pedidos por dia"
//                 descricao="Volume de pedidos recebidos no período"
//             >
//                 <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={serieDiaria} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
//                         <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
//                         <XAxis dataKey="data" tick={ESTILO_EIXO} tickFormatter={formatarDia} tickLine={false} axisLine={false} minTickGap={24} />
//                         <YAxis tick={ESTILO_EIXO} allowDecimals={false} tickLine={false} axisLine={false} width={36} />
//                         <Tooltip
//                             {...PROPRIEDADES_TOOLTIP}
//                             labelFormatter={(valor) => `Dia ${formatarDia(valor)}`}
//                             formatter={(valor) => [formatarNumero(valor), "Pedidos"]}
//                         />
//                         <Bar dataKey="pedidos" fill="var(--color-info)" radius={[7, 7, 0, 0]} maxBarSize={44} />
//                     </BarChart>
//                 </ResponsiveContainer>
//             </CardGrafico>
//         ),
//         tamanhosMaisVendidos: (
//             <CardGrafico
//                 key="tamanhosMaisVendidos"
//                 titulo="Tamanhos de marmita mais vendidos"
//                 descricao="Quantidade vendida por tamanho"
//                 amplo
//             >
//                 {graficos.tamanhos_marmita?.length ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                         <BarChart
//                             data={graficos.tamanhos_marmita}
//                             layout="vertical"
//                             margin={{ top: 8, right: 28, left: 12, bottom: 0 }}
//                             accessibilityLayer
//                         >
//                             <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" horizontal={false} />
//                             <XAxis type="number" tick={ESTILO_EIXO} allowDecimals={false} tickLine={false} axisLine={false} />
//                             <YAxis type="category" dataKey="nome" tick={ESTILO_EIXO} tickLine={false} axisLine={false} width={110} />
//                             <Tooltip
//                                 {...PROPRIEDADES_TOOLTIP}
//                                 formatter={(valor) => [formatarNumero(valor), "Marmitas"]}
//                             />
//                             <Bar dataKey="quantidade" fill="var(--color-success)" radius={[0, 7, 7, 0]} maxBarSize={34} />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 ) : (
//                     <SemDados mensagem="Nenhuma marmita vendida neste período." />
//                 )}
//             </CardGrafico>
//         ),
//         alimentosMaisEscolhidos: (
//             <CardGrafico
//                 key="alimentosMaisEscolhidos"
//                 titulo="Alimentos mais escolhidos"
//                 descricao="Preferências dos clientes no período"
//             >
//                 {graficos.alimentos?.length ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={graficos.alimentos} margin={{ top: 12, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
//                             <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
//                             <XAxis dataKey="nome" tick={ESTILO_EIXO} tickLine={false} axisLine={false} minTickGap={12} />
//                             <YAxis tick={ESTILO_EIXO} allowDecimals={false} tickLine={false} axisLine={false} width={36} />
//                             <Tooltip {...PROPRIEDADES_TOOLTIP} formatter={(valor) => [formatarNumero(valor), "Escolhas"]} />
//                             <Bar dataKey="quantidade" fill="var(--brand-secondary)" radius={[7, 7, 0, 0]} maxBarSize={44} />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 ) : (
//                     <SemDados mensagem="Nenhum alimento escolhido neste período." />
//                 )}
//             </CardGrafico>
//         ),
//         metodosPagamento: (
//             <CardGrafico
//                 key="metodosPagamento"
//                 titulo="Métodos de pagamento"
//                 descricao="Distribuição dos pedidos por forma de pagamento"
//             >
//                 {graficos.metodos_pagamento?.length ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                         <RechartsPieChart accessibilityLayer>
//                             <Pie
//                                 data={graficos.metodos_pagamento}
//                                 dataKey="quantidade"
//                                 nameKey="nome"
//                                 innerRadius={62}
//                                 outerRadius={100}
//                                 paddingAngle={3}
//                             >
//                                 {graficos.metodos_pagamento.map((item, index) => (
//                                     <Cell key={item.nome} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
//                                 ))}
//                             </Pie>
//                             <Tooltip {...PROPRIEDADES_TOOLTIP} formatter={(valor) => [formatarNumero(valor), "Pedidos"]} />
//                             <Legend wrapperStyle={{ color: "var(--color-text-secondary)", fontSize: "0.78rem" }} />
//                         </RechartsPieChart>
//                     </ResponsiveContainer>
//                 ) : (
//                     <SemDados mensagem="Nenhum pagamento registrado neste período." />
//                 )}
//             </CardGrafico>
//         ),
//         tiposEntrega: (
//             <CardGrafico
//                 key="tiposEntrega"
//                 titulo="Entrega e retirada"
//                 descricao="Como os clientes recebem os pedidos"
//             >
//                 {graficos.tipos_entrega?.length ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                         <RechartsPieChart accessibilityLayer>
//                             <Pie
//                                 data={graficos.tipos_entrega}
//                                 dataKey="quantidade"
//                                 nameKey="nome"
//                                 outerRadius={102}
//                                 label
//                             >
//                                 {graficos.tipos_entrega.map((item, index) => (
//                                     <Cell key={item.nome} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
//                                 ))}
//                             </Pie>
//                             <Tooltip {...PROPRIEDADES_TOOLTIP} formatter={(valor) => [formatarNumero(valor), "Pedidos"]} />
//                             <Legend wrapperStyle={{ color: "var(--color-text-secondary)", fontSize: "0.78rem" }} />
//                         </RechartsPieChart>
//                     </ResponsiveContainer>
//                 ) : (
//                     <SemDados mensagem="Nenhum tipo de entrega registrado neste período." />
//                 )}
//             </CardGrafico>
//         ),
//         statusPedidos: (
//             <CardGrafico
//                 key="statusPedidos"
//                 titulo="Pedidos por status"
//                 descricao="Situação dos pedidos no período"
//             >
//                 {graficos.status_pedidos?.length ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                         <LineChart data={graficos.status_pedidos} margin={{ top: 12, right: 12, left: 0, bottom: 0 }} accessibilityLayer>
//                             <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
//                             <XAxis dataKey="nome" tick={ESTILO_EIXO} tickLine={false} axisLine={false} />
//                             <YAxis tick={ESTILO_EIXO} allowDecimals={false} tickLine={false} axisLine={false} width={36} />
//                             <Tooltip {...PROPRIEDADES_TOOLTIP} formatter={(valor) => [formatarNumero(valor), "Pedidos"]} />
//                             <Line
//                                 type="monotone"
//                                 dataKey="quantidade"
//                                 stroke="var(--color-danger)"
//                                 strokeWidth={3}
//                                 activeDot={{ r: 5, fill: "var(--color-danger)", stroke: "var(--color-surface)", strokeWidth: 2 }}
//                             />
//                         </LineChart>
//                     </ResponsiveContainer>
//                 ) : (
//                     <SemDados mensagem="Nenhum status registrado neste período." />
//                 )}
//             </CardGrafico>
//         )
//     };

//     return (
//         <main className={styles.container}>
//             <section className={styles.apresentacao}>
//                 <div>
//                     <span className={styles.sobretitulo}>Painel de apresentação</span>
//                     <h1>Visão geral da marmitaria</h1>
//                     <p>Acompanhe os números mais importantes assim que entrar no sistema.</p>
//                 </div>

//                 <button
//                     type="button"
//                     className={styles.botaoAtualizar}
//                     onClick={atualizar}
//                     disabled={loading}
//                 >
//                     <RefreshCw size={18} className={loading ? styles.girando : ""} />
//                     Atualizar
//                 </button>
//             </section>

//             <section className={styles.filtros} aria-label="Filtros da dashboard">
//                 <div className={styles.filtroPrincipal}>
//                     <label htmlFor="periodo-dashboard">
//                         <CalendarDays size={18} />
//                         Período
//                     </label>
//                     <select
//                         id="periodo-dashboard"
//                         value={periodo}
//                         onChange={(event) => setPeriodo(event.target.value)}
//                     >
//                         {PERIODOS_DISPONIVEIS.map((opcao) => (
//                             <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
//                         ))}
//                     </select>
//                 </div>

//                 {periodo === "personalizado" && (
//                     <div className={styles.datasPersonalizadas}>
//                         <label htmlFor="data-inicio-dashboard">
//                             De
//                             <input
//                                 id="data-inicio-dashboard"
//                                 type="date"
//                                 value={dataInicioPersonalizada}
//                                 max={dataFimPersonalizada}
//                                 onChange={(event) => setDataInicioPersonalizada(event.target.value)}
//                             />
//                         </label>
//                         <label htmlFor="data-fim-dashboard">
//                             Até
//                             <input
//                                 id="data-fim-dashboard"
//                                 type="date"
//                                 value={dataFimPersonalizada}
//                                 min={dataInicioPersonalizada}
//                                 onChange={(event) => setDataFimPersonalizada(event.target.value)}
//                             />
//                         </label>
//                     </div>
//                 )}

//                 <div className={styles.periodoAtual} aria-live="polite">
//                     <span>Período analisado</span>
//                     <strong>{periodoExibicao}</strong>
//                 </div>
//             </section>

//             {erro && (
//                 <section className={styles.erro} role="alert">
//                     <span>{erro}</span>
//                     <button type="button" onClick={atualizar}>Tentar novamente</button>
//                 </section>
//             )}

//             {loading && !dados ? (
//                 <section className={styles.carregando} aria-label="Carregando dashboard">
//                     <div />
//                     <div />
//                     <div />
//                 </section>
//             ) : (
//                 <>
//                     <section className={styles.blocoDashboard} aria-labelledby="titulo-indicadores">
//                         <header className={styles.secaoCabecalho}>
//                             <div>
//                                 <span>Resumo</span>
//                                 <h2 id="titulo-indicadores">Indicadores principais</h2>
//                             </div>
//                             <p>Dados consolidados do período selecionado</p>
//                         </header>

//                         <div className={styles.gridCards}>
//                             {CARDS_ATIVOS.map((opcao) => cardsPreparados[opcao]).filter(Boolean)}
//                         </div>
//                     </section>

//                     <section className={styles.blocoDashboard} aria-labelledby="titulo-graficos">
//                         <header className={styles.secaoCabecalho}>
//                             <div>
//                                 <span>Análise visual</span>
//                                 <h2 id="titulo-graficos">Desempenho no período</h2>
//                             </div>
//                             <p>Passe o cursor sobre os gráficos para ver os valores</p>
//                         </header>

//                         <div className={styles.gridGraficos}>
//                             {GRAFICOS_ATIVOS.map((opcao) => graficosPreparados[opcao]).filter(Boolean)}
//                         </div>
//                     </section>
//                 </>
//             )}
//         </main>
//     );
// }