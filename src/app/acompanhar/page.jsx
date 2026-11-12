
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Search, ShoppingBag, ChevronRight,
    Clock3, ChefHat, Bike, Store, CheckCircle2, XCircle
} from 'lucide-react';

import { usePedidosCliente } from '@/hooks/usePedidos';
import { orderDate, paymentLabels, kitchenProgress } from '@/utils/customerOrderDisplay';
import TelefoneInput from '@/components/ui/inputMask/index.jsx';
import styles from './page.module.css';

const filtros = [
    { id: 'todos', label: 'Todos' },
    { id: 'pendentes', label: 'Aguardando' },
    { id: 'pagos', label: 'Pagos' }
];

function estiloFinanceiro(status) {
    if (status === 'PAGO') return styles.pago;
    if (status === 'PENDENTE') return styles.aguardando;
    if (status === 'FALHOU' || status === 'CANCELADO') return styles.falhou;
    return styles.tradicional;
}

function estiloCozinha(status) {
    if (status === 'Cancelado') return styles.cozinhaCancelada;
    if (status === 'Entregue') return styles.cozinhaConcluida;
    if (status === 'Pendente') return styles.cozinhaPendente;
    return styles.cozinhaAndamento;
}

function ProgressoPedido({ pedido }) {
    const { steps, index, blocked } = kitchenProgress(pedido);
    const cancelado = pedido.status === 'Cancelado';

    // Pedido online sem pagamento continua somente na etapa pendente.
    const atual = cancelado ? -1 : blocked ? 0 : index;

    const icones = [
        Clock3,
        ChefHat,
        pedido.metodo_entrega === 'Retirada' ? Store : Bike,
        CheckCircle2
    ];

    return (
        <div className={styles.progressoArea}>
            {cancelado && (
                <p className={styles.avisoCancelado}>
                    <XCircle size={15} /> Pedido cancelado
                </p>
            )}

            <ol className={styles.progresso} aria-label="Progresso do pedido">
                {steps.map((etapa, i) => {
                    const Icone = icones[i];
                    const concluida = !cancelado && i < atual;
                    const finalizada = !cancelado && atual === 3;
                    const atualEtapa = !cancelado && i === atual && !finalizada;

                    const classe = cancelado && i === 0
                        ? styles.etapaCancelada
                        : finalizada || concluida
                            ? styles.etapaConcluida
                            : atualEtapa
                                ? styles.etapaAtual
                                : styles.etapaFutura;

                    return (
                        <li
                            key={etapa}
                            className={`${styles.etapa} ${classe}`}
                            aria-current={atualEtapa ? 'step' : undefined}
                        >
                            <span className={styles.iconeEtapa}>
                                {cancelado && i === 0
                                    ? <XCircle size={17} />
                                    : <Icone size={17} />}
                            </span>
                            <span className={styles.nomeEtapa}>{etapa}</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

function CardPedido({ pedido }) {
    const pagamento = pedido.pagamento_status || 'TRADICIONAL';

    return (
        <li>
            <Link
                href={`/acompanhar/${pedido.id}`}
                className={styles.card}
                aria-label={`Abrir detalhes do pedido ${pedido.id}`}
            >
                <div className={styles.topoCard}>
                    <div className={styles.identificacao}>
                        <h2>Pedido #{pedido.id}</h2>
                        <time dateTime={pedido.criado_em}>
                            <Clock3 size={13} />
                            {orderDate(pedido.criado_em)}
                        </time>
                    </div>

                    <div className={styles.statusCozinha}>
                        <span>Cozinha</span>
                        <strong className={`${styles.seloCozinha} ${estiloCozinha(pedido.status)}`}>
                            {pedido.status || 'Indisponível'}
                        </strong>
                    </div>

                    <ChevronRight className={styles.seta} size={19} />
                </div>

                <div className={styles.financeiro}>
                    <span className={styles.rotuloPagamento}>Pagamento</span>
                    <span className={`${styles.seloPagamento} ${estiloFinanceiro(pagamento)}`}>
                        <span className={styles.ponto} />
                        {paymentLabels[pagamento] || 'Status indisponível'}
                    </span>
                </div>

                <ProgressoPedido pedido={pedido} />
            </Link>
        </li>
    );
}

export default function AcompanharPedido() {
    const { telefone, setTelefone, pedidos, buscando, erro, consultou, buscar } = usePedidosCliente();
    const [filtro, setFiltro] = useState('todos');

    const pedidosFiltrados = pedidos.filter(pedido => {
        if (filtro === 'pendentes') return pedido.pagamento_status === 'PENDENTE';
        if (filtro === 'pagos') return pedido.pagamento_status === 'PAGO';
        return true;
    });

    const pesquisar = event => {
        event.preventDefault();
        setFiltro('todos');
        void buscar(telefone);
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.voltar} aria-label="Voltar ao início">
                    <ArrowLeft size={21} />
                </Link>
                <h1>Meus Pedidos</h1>
                <span aria-hidden="true" />
            </header>

            <section className={styles.buscaArea}>
                <p className={styles.introducao}>Acompanhe seus pedidos em tempo real.</p>

                <form className={styles.busca} onSubmit={pesquisar}>
                    <label className={styles.campoTelefone}>
                        <span>Telefone com DDD</span>
                        <TelefoneInput
                            name="telefone"
                            value={telefone}
                            onChange={event => setTelefone(event.target.value)}
                            className={styles.input}
                            placeholder="(00) 00000-0000"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className={styles.botaoBuscar}
                        disabled={buscando}
                        aria-label="Buscar pedidos"
                    >
                        <Search size={20} />
                    </button>
                </form>
            </section>

            <div className={styles.filtros} role="group" aria-label="Filtrar pagamentos">
                {filtros.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        className={`${styles.filtro} ${filtro === item.id ? styles.filtroAtivo : ''}`}
                        onClick={() => setFiltro(item.id)}
                        aria-pressed={filtro === item.id}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {(erro || buscando) && (
                <p className={styles.mensagem} role="status" aria-live="polite">
                    {erro || 'Consultando seus pedidos...'}
                </p>
            )}

            {!consultou && !buscando && !erro && (
                <div className={styles.vazio}>
                    <ShoppingBag size={28} />
                    <p>Informe seu telefone para consultar seus pedidos.</p>
                </div>
            )}

            {consultou && !buscando && pedidosFiltrados.length === 0 && !erro && (
                <div className={styles.vazio}>
                    <ShoppingBag size={28} />
                    <p>Nenhum pedido encontrado nesta categoria.</p>
                </div>
            )}

            <ul className={styles.lista} aria-label="Pedidos encontrados" aria-busy={buscando}>
                {pedidosFiltrados.map(pedido => (
                    <CardPedido key={pedido.id} pedido={pedido} />
                ))}
            </ul>
        </main>
    );
}
