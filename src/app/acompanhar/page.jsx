
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Clock, ChefHat, Bike, CheckCircle2, Search,
    ArrowLeft, Store, XCircle, Receipt, CreditCard
} from 'lucide-react';

import { usePedidos } from '@/hooks/usePedidos';
import {
    savedPayments,
    readPayment,
    providerUrl
} from '@/services/infinitepayService.js';

import TelefoneInput from '@/components/ui/inputMask/index.jsx';
import styles from './page.module.css';

export default function AcompanharPedido() {
    const router = useRouter();

    const [telefone, setTelefone] = useState('');
    const [pedidos, setPedidos] = useState([]);
    const [erro, setErro] = useState('');
    const [acaoPedidoId, setAcaoPedidoId] = useState(null);

    const { buscarPedidoPorTelefoneUsuario, buscando } = usePedidos();

    const fazerBusca = async (telefoneBusca) => {
        setErro('');

        const telefoneLimpo = String(telefoneBusca || '')
            .replace(/\D/g, '');

        if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
            setPedidos([]);
            setErro('Informe um telefone válido com DDD.');
            return;
        }

        const response = await buscarPedidoPorTelefoneUsuario(telefoneLimpo);

        if (response?.status === 'success' && response.data?.length > 0) {
            setPedidos(response.data);
        } else {
            setPedidos([]);
            setErro('Nenhum pedido encontrado para este telefone.');
        }
    };

    useEffect(() => {
        const telefoneSalvo = localStorage.getItem(
            'marmitaria_telefone_cliente'
        );

        if (telefoneSalvo) {
            // Mantém a busca automática que existia na main.
            const timeout = setTimeout(() => {
                setTelefone(telefoneSalvo);
                void fazerBusca(telefoneSalvo);
            }, 0);

            return () => clearTimeout(timeout);
        }
    }, []);

    const handleBusca = (event) => {
        event.preventDefault();
        void fazerBusca(telefone);
    };

    // O token privado nunca é colocado na URL.
    const acessoDoPedido = (id) =>
        savedPayments().find(
            item => String(item.pedido_id) === String(id) && item.token
        );

    const mensagemSemAcesso = (id) => {
        setErro(
            `O pedido #${id} foi encontrado, mas o acesso privado ao pagamento ` +
            'não está salvo neste navegador. Consulte pelo navegador usado ' +
            'na compra ou entre em contato com a marmitaria.'
        );
    };

    // Reutiliza o checkout existente, sem criar nova cobrança.
    const continuarPagamento = async (pedido) => {
        const acesso = acessoDoPedido(pedido.id);

        if (!acesso) {
            mensagemSemAcesso(pedido.id);
            return;
        }

        setErro('');
        setAcaoPedidoId(pedido.id);

        try {
            const pagamento = await readPayment(acesso);

            if (pagamento.pagamento_status !== 'PENDENTE') {
                router.push(`/pedido/sucesso?pedido=${pedido.id}`);
                return;
            }

            const checkout = providerUrl(pagamento.checkout_url);

            if (checkout) {
                window.location.assign(checkout);
                return;
            }

            // Caso o link não esteja disponível, mantém
            // o acompanhamento e a consulta financeira.
            router.push(`/pedido/sucesso?pedido=${pedido.id}`);
        } catch {
            setErro(
                `Não foi possível consultar o pagamento do pedido #${pedido.id}. ` +
                'Tente novamente.'
            );
        } finally {
            setAcaoPedidoId(null);
        }
    };

    const abrirComprovante = async (pedido) => {
        const acesso = acessoDoPedido(pedido.id);

        if (!acesso) {
            mensagemSemAcesso(pedido.id);
            return;
        }

        setErro('');
        setAcaoPedidoId(pedido.id);

        // A janela é aberta diretamente no clique para evitar
        // o bloqueio de pop-ups após a consulta assíncrona.
        const janela = window.open('about:blank', '_blank');
        if (janela) janela.opener = null;

        try {
            const pagamento = await readPayment(acesso);

            const recibo = pagamento.pagamento_status === 'PAGO'
                ? providerUrl(pagamento.receipt_url, 'receipt')
                : null;

            if (!recibo) {
                throw new Error('Comprovante indisponível');
            }

            if (janela) {
                janela.location.replace(recibo);
            } else {
                window.location.assign(recibo);
            }
        } catch {
            janela?.close();

            setErro(
                `O comprovante do pedido #${pedido.id} não está disponível ` +
                'para consulta neste momento.'
            );
        } finally {
            setAcaoPedidoId(null);
        }
    };

    const getStatusIndex = (statusAtual) => {
        const status = String(statusAtual || '').toLowerCase();

        if (status === 'pendente') return 0;
        if (status === 'em preparo') return 1;
        if (
            status === 'saiu para entrega' ||
            status === 'pronto para retirada'
        ) return 2;
        if (status === 'entregue') return 3;

        return -1;
    };

    const getBadgeClass = (statusAtual) => {
        const status = String(statusAtual || '').toLowerCase();

        if (status === 'pendente') return styles.badgePendente;
        if (status === 'em preparo') return styles.badgePreparo;
        if (status === 'pronto para retirada') return styles.badgeRetirada;
        if (status === 'saiu para entrega') return styles.badgeEntrega;
        if (status === 'entregue') return styles.badgeEntregue;
        if (status === 'cancelado') return styles.badgeCancelado;

        return styles.badgeDefault;
    };

    const formatarHora = (dataIso) =>
        new Date(dataIso).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

    const formatarData = (dataIso) =>
        new Date(dataIso).toLocaleDateString('pt-BR');

    const formatarValor = (valor) =>
        Number(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className={styles.btnVoltar}
                    aria-label="Voltar ao início"
                >
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

                <button
                    type="submit"
                    className={styles.btnBuscar}
                    disabled={buscando}
                    aria-label="Buscar pedidos"
                >
                    {buscando
                        ? <Clock className={styles.spin} size={20} />
                        : <Search size={20} />}
                </button>
            </form>

            {erro && (
                <p className={styles.erro} role="alert">
                    {erro}
                </p>
            )}

            {buscando && pedidos.length === 0 && (
                <div className={styles.loading}>
                    Consultando a cozinha...
                </div>
            )}

            {pedidos.length > 0 && !buscando && (
                <div className={styles.listaPedidos}>
                    {pedidos.map((pedido) => {
                        const online =
                            pedido.fluxo_pagamento === 'INFINITEPAY';

                        const pendente =
                            online && pedido.pagamento_status === 'PENDENTE';

                        const pagamentoFalhou =
                            online && ['FALHOU', 'CANCELADO'].includes(
                                pedido.pagamento_status
                            );

                        const pago =
                            online && pedido.pagamento_status === 'PAGO';

                        const cancelado =
                            String(pedido.status || '').toLowerCase() ===
                            'cancelado';

                        const temComprovante =
                            pago && pedido.comprovante_disponivel === true;

                        const ocupado = acaoPedidoId === pedido.id;

                        const comprovanteUrl = pago
                            ? providerUrl(pedido.comprovante_url, 'receipt')
                            : null;

                        return (
                            <div
                                key={pedido.id}
                                className={styles.cardRastreio}
                            >
                                {/* CABEÇALHO ORIGINAL */}

                                <div className={styles.cardHeader}>
                                    <div>
                                        <h2>Pedido #{pedido.id}</h2>
                                        <span>
                                            {formatarData(pedido.criado_em)} às{' '}
                                            {formatarHora(pedido.criado_em)}
                                        </span>
                                    </div>

                                    <div className={styles.cardAcoes}>
                                        <span>Cozinha</span>
                                        <span className={`${styles.badgeStatus} ${getBadgeClass(pedido.status)}`}>{pedido.status}</span>
                                    </div>
                                </div>


                                {/* INFORMAÇÃO FINANCEIRA */}

                                {online && (
                                    <div
                                        className={`${styles.pagamentoInfo} ${pago
                                            ? styles.pagamentoPago
                                            : pendente
                                                ? styles.pagamentoPendente
                                                : styles.pagamentoFalhou
                                            }`}
                                    >
                                        <span className={styles.pagamentoDescricao}>
                                            {pago ? (
                                                <>
                                                    <CheckCircle2 size={17} />
                                                    Pagamento confirmado
                                                </>
                                            ) : pendente ? (
                                                <>
                                                    <CreditCard size={17} />
                                                    Aguardando pagamento
                                                </>
                                            ) : (
                                                <>
                                                    <Clock size={17} />
                                                    Pagamento não concluído
                                                </>
                                            )}
                                        </span>

                                        {pendente && !cancelado && (
                                            <button
                                                type="button"
                                                className={styles.btnContinuar}
                                                disabled={ocupado}
                                                onClick={() => continuarPagamento(pedido)}
                                            >
                                                {ocupado ? 'Consultando...' : 'Continuar pagamento'}
                                            </button>
                                        )}

                                        {/* {pago && temComprovante && (
                                            <button
                                                type="button"
                                                className={styles.btnComprovanteInline}
                                                disabled={ocupado}
                                                onClick={() => abrirComprovante(pedido)}
                                                title="Ver comprovante"
                                                aria-label={`Ver comprovante do pedido ${pedido.id}`}
                                            >
                                                Comprovante
                                            </button>
                                        )} */}


                                        {comprovanteUrl && (
                                            <a
                                                href={comprovanteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                referrerPolicy="no-referrer"
                                                className={styles.btnComprovanteInline}
                                                title={`Comprovante do pedido #${pedido.id}`}
                                                aria-label={`Abrir comprovante do pedido ${pedido.id}`}
                                            >
                                                Comprovante
                                            </a>
                                        )}

                                    </div>
                                )}


                                {/* LINHA DO TEMPO ORIGINAL */}
                                {cancelado ? (
                                    <div className={styles.alertaCancelado}>
                                        <XCircle size={32} />
                                        <p>Este pedido foi cancelado.</p>
                                    </div>
                                ) : (
                                    <div className={styles.timeline}>
                                        <EtapaTimeline
                                            icone={<Clock />}
                                            titulo="Pendente"
                                            ativo={
                                                !pendente &&
                                                getStatusIndex(pedido.status) >= 0
                                            }
                                        />

                                        <div
                                            className={
                                                `${styles.linha} ` +
                                                (!pendente &&
                                                    getStatusIndex(pedido.status) >= 1
                                                    ? styles.linhaAtiva
                                                    : '')
                                            }
                                        />

                                        <EtapaTimeline
                                            icone={<ChefHat />}
                                            titulo="Em Preparo"
                                            ativo={
                                                !pendente &&
                                                getStatusIndex(pedido.status) >= 1
                                            }
                                        />

                                        <div
                                            className={
                                                `${styles.linha} ` +
                                                (!pendente &&
                                                    getStatusIndex(pedido.status) >= 2
                                                    ? styles.linhaAtiva
                                                    : '')
                                            }
                                        />

                                        <EtapaTimeline
                                            icone={
                                                pedido.metodo_entrega === 'Retirada'
                                                    ? <Store />
                                                    : <Bike />
                                            }
                                            titulo={
                                                pedido.metodo_entrega === 'Retirada'
                                                    ? 'Pronto para Retirada'
                                                    : 'Saiu para Entrega'
                                            }
                                            ativo={
                                                !pendente &&
                                                getStatusIndex(pedido.status) >= 2
                                            }
                                        />

                                        <div
                                            className={
                                                `${styles.linha} ` +
                                                (!pendente &&
                                                    getStatusIndex(pedido.status) >= 3
                                                    ? styles.linhaAtiva
                                                    : '')
                                            }
                                        />

                                        <EtapaTimeline
                                            icone={<CheckCircle2 />}
                                            titulo="Entregue"
                                            ativo={
                                                !pendente &&
                                                getStatusIndex(pedido.status) >= 3
                                            }
                                        />
                                    </div>
                                )}

                                {/* RESUMO ORIGINAL */}
                                <div className={styles.itensResumo}>
                                    <h3>Resumo do Pedido</h3>

                                    {(pedido.marmitas || []).map((marmita) => {
                                        const especial =
                                            marmita.tipo === 'ESPECIAL';

                                        return (
                                            <div
                                                key={marmita.id}
                                                className={styles.itemMarmita}
                                            >
                                                <strong>
                                                    {marmita.quantidade}x{' '}
                                                    {especial
                                                        ? marmita.nome
                                                        : `Marmita ${marmita.tamanho}`}
                                                </strong>

                                                {especial ? (
                                                    <>
                                                        {marmita.descricao && (
                                                            <span>
                                                                {marmita.descricao}
                                                            </span>
                                                        )}

                                                        <span>
                                                            {formatarValor(
                                                                marmita.subtotal
                                                            )}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            {(marmita.alimentos || [])
                                                                .map((alimento) =>
                                                                    typeof alimento === 'string'
                                                                        ? alimento
                                                                        : alimento.nome
                                                                )
                                                                .join(', ')}
                                                        </span>

                                                        {marmita.observacao && (
                                                            <span
                                                                className={
                                                                    styles.itemObservacao
                                                                }
                                                            >
                                                                * Obs: {marmita.observacao}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {(pedido.produtos || []).map((produto) => (
                                        <div
                                            key={produto.id}
                                            className={styles.itemMarmita}
                                        >
                                            <strong>
                                                {produto.quantidade}x {produto.nome}
                                            </strong>
                                            <span>
                                                {produto.categoria_nome || 'Complemento'}
                                                {' • '}
                                                {formatarValor(produto.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* RODAPÉ ORIGINAL */}
                                <div className={styles.cardFooter}>
                                    <strong>Total:</strong>
                                    <span>
                                        {formatarValor(pedido.valor_total)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

function EtapaTimeline({ icone, titulo, ativo }) {
    return (
        <div className={`${styles.etapa} ${ativo ? styles.etapaAtiva : ''}`}>
            <div className={styles.iconeWrap}>{icone}</div>
            <span>{titulo}</span>
        </div>
    );
}
