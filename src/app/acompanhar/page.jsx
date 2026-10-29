'use client'

import { useRouter } from 'next/navigation';
import { useCustomerTracking } from '@/hooks/useCustomerTracking.js';
import { Clock, ChefHat, Bike, CheckCircle2, Search, ArrowLeft, Store, XCircle } from 'lucide-react';

import TelefoneInput from '@/components/ui/inputMask/index.jsx';
import styles from './page.module.css';
import paymentStyles from '../pedido/sucesso/page.module.css';

export default function AcompanharPedido() {
    const router = useRouter();
    const { telefone, setTelefone, pedidos, erro, buscando, buscar: handleBusca } = useCustomerTracking();

    const getStatusIndex = (statusAtual) => {
        if (!statusAtual) return -1;
        const s = statusAtual.toLowerCase();

        if (s === 'pendente') return 0;
        if (s === 'em preparo') return 1;
        if (s === 'saiu para entrega' || s === 'pronto para retirada') return 2;
        if (s === 'entregue') return 3;

        return -1;
    };

    const getBadgeClass = (statusAtual) => {
        if (!statusAtual) return styles.badgeDefault;
        const s = statusAtual.toLowerCase();

        if (s === 'pendente') return styles.badgePendente;
        if (s === 'em preparo') return styles.badgePreparo;
        if (s === 'pronto para retirada') return styles.badgeRetirada;
        if (s === 'saiu para entrega') return styles.badgeEntrega;
        if (s === 'entregue') return styles.badgeEntregue;
        if (s === 'cancelado') return styles.badgeCancelado;

        return styles.badgeDefault;
    };

    const formatarHora = (dataIso) => {
        return new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatarData = (dataIso) => {
        return new Date(dataIso).toLocaleDateString('pt-BR');
    };

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.push('/')} className={styles.btnVoltar}>
                    <ArrowLeft size={20} />
                </button>
                <h1>Meus Pedidos</h1>
            </header>

            <form onSubmit={handleBusca} className={styles.buscaForm}>
                <TelefoneInput
                    name="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className={styles.inputBusca}
                    placeholder="(00) 00000-0000"
                />
                {/* <InputForm> */}
                <button type="submit" className={styles.btnBuscar} disabled={buscando}>
                    {buscando ? <Clock className={styles.spin} size={20} /> : <Search size={20} />}
                </button>
            </form>

            {erro && <p className={styles.erro}>{erro}</p>}

            {buscando && pedidos.length === 0 && <div className={styles.loading}>Consultando pedidos...</div>}

            {pedidos.length > 0 && !buscando && (
                <div className={styles.listaPedidos}>
                    {pedidos.map((pedido) => (
                        <div key={pedido.id} className={styles.cardRastreio}>

                            {/* CABEÇALHO DO CARD */}
                            <div className={styles.cardHeader}>
                                <div>
                                    <h2>Pedido #{pedido.id}</h2>
                                    {pedido.criado_em && <span>{formatarData(pedido.criado_em)} às {formatarHora(pedido.criado_em)}</span>}
                                    {pedido.somenteTitular && <span>Pedido deste navegador</span>}
                                </div>
                                <div className={`${styles.badgeStatus} ${getBadgeClass(pedido.status)}`}>
                                    {pedido.status}
                                </div>
                            </div>

                            {pedido.pagamentoTitular && (
                                <div className={styles.itensResumo}>
                                    <h3>{pedido.pagamentoTitular.title}</h3>
                                    <p>{pedido.pagamentoTitular.message}</p>
                                    {pedido.pagamentoTitular.receiptUrl && (
                                        <a href={pedido.pagamentoTitular.receiptUrl} target="_blank" rel="noopener noreferrer"
                                            referrerPolicy="no-referrer" className={paymentStyles.btnSecondary}>Ver comprovante</a>
                                    )}
                                </div>
                            )}

                            {/* LINHA DO TEMPO / CANCELADO */}
                            {!pedido.somenteTitular && (pedido.status.toLowerCase() === 'cancelado' ? (
                                <div className={styles.alertaCancelado}>
                                    <XCircle size={32} />
                                    <p>Este pedido foi cancelado.</p>
                                </div>
                            ) : (
                                <div className={styles.timeline}>
                                    <EtapaTimeline icone={<Clock />} titulo="Pendente" ativo={getStatusIndex(pedido.status) >= 0} />
                                    <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 1 ? styles.linhaAtiva : ''}`} />

                                    <EtapaTimeline icone={<ChefHat />} titulo="Em Preparo" ativo={getStatusIndex(pedido.status) >= 1} />
                                    <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 2 ? styles.linhaAtiva : ''}`} />

                                    <EtapaTimeline
                                        icone={pedido.metodo_entrega === 'Retirada' ? <Store /> : <Bike />}
                                        titulo={pedido.metodo_entrega === 'Retirada' ? 'Pronto para Retirada' : 'Saiu para Entrega'}
                                        ativo={getStatusIndex(pedido.status) >= 2}
                                    />
                                    <div className={`${styles.linha} ${getStatusIndex(pedido.status) >= 3 ? styles.linhaAtiva : ''}`} />

                                    <EtapaTimeline icone={<CheckCircle2 />} titulo="Entregue" ativo={getStatusIndex(pedido.status) >= 3} />
                                </div>
                            ))}

                            {/* RESUMO DOS ITENS */}
                            {!pedido.somenteTitular && <div className={styles.itensResumo}>
                                <h3>Resumo do Pedido</h3>

                                {/* MARMITAS */}
                                {(pedido.marmitas || []).map((marmita) => {
                                    const especial = marmita.tipo === 'ESPECIAL';

                                    return (
                                        <div key={marmita.id} className={styles.itemMarmita}>
                                            <strong>
                                                {marmita.quantidade}x {especial ? marmita.nome : `Marmita ${marmita.tamanho}`}
                                            </strong>

                                            {especial ? (
                                                <>
                                                    {marmita.descricao && <span>{marmita.descricao}</span>}
                                                    <span>
                                                        R$ {Number(marmita.subtotal).toFixed(2).replace('.', ',')}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>
                                                        {(marmita.alimentos || [])
                                                            .map((alimento) => typeof alimento === 'string' ? alimento : alimento.nome)
                                                            .join(', ')}
                                                    </span>

                                                    {marmita.observacao && (
                                                        <span className={styles.itemObservacao}>
                                                            * Obs: {marmita.observacao}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* PRODUTOS */}
                                {(pedido.produtos || []).map((produto) => (
                                    <div key={produto.id} className={styles.itemMarmita}>
                                        <strong>{produto.quantidade}x {produto.nome}</strong>
                                        <span>
                                            {produto.categoria_nome || 'Complemento'}
                                            {' • '}
                                            R$ {Number(produto.subtotal).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                ))}
                            </div>}

                            {/* RODAPÉ COM TOTAL */}
                            <div className={styles.cardFooter}>
                                <strong>Total:</strong>
                                <span>R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}</span>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

const EtapaTimeline = ({ icone, titulo, ativo }) => (
    <div className={`${styles.etapa} ${ativo ? styles.etapaAtiva : ''}`}>
        <div className={styles.iconeWrap}>{icone}</div>
        <span>{titulo}</span>
    </div>
);
