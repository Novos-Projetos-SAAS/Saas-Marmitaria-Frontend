'use client'

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { renderToString } from 'react-dom/server';

import { usePedidosAdmin } from "@/hooks/usePedidosAdmin.js";
import { buscarDadosEmpresa } from "@/services/dadosEmpresaService.js";
import { imprimirCupom } from "@/services/qzService.js";

import FormPedidoPresencial from "@/components/forms/pedidoPresencial/pedidoPresencialForm";
import Pagination from "@/components/ui/pagination";
import CupomPedido from "@/components/CupomPedido/cupomPedido";
import Can from "@/components/ui/can";

import { RefreshCw, Eye, Plus, List, X, Search, Filter, Printer } from "lucide-react";
import styles from "./PedidosClient.module.css";

const STATUS_OPCOES = ['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Saiu para Entrega', 'Entregue', 'Cancelado'];

export default function PedidosClient() {
    const {
        pedidos, loading, carregarPedidos, atualizarStatus,
        page, setPage, totalPages, search, setSearch, statusFilter, setStatusFilter
    } = usePedidosAdmin();

    const [abaAtiva, setAbaAtiva] = useState('lista');
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [pedidoParaImprimir, setPedidoParaImprimir] = useState(null);

    // Debounce para a busca
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(inputValue);
            setPage(1);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, setSearch, setPage]);

    // INTEGRAÇÃO MANUAL COM O QZ TRAY
    const handleImprimirPedido = async (pedido) => {
        try {
            const resEmpresa = await buscarDadosEmpresa();
            const config = resEmpresa.data;

            if (config?.imprimir_automaticamente && config?.nome_impressora) {
                toast.loading("Enviando para a impressora térmica...", { id: "printQZ" });

                const htmlDoCupom = renderToString(<CupomPedido pedido={pedido} />);
                await imprimirCupom(htmlDoCupom, config.nome_impressora);

                toast.success("Cupom impresso com sucesso!", { id: "printQZ" });
            } else {
                // Plano B: Fluxo antigo (Navegador) caso o QZ Tray não esteja configurado
                setPedidoParaImprimir(pedido);
                setTimeout(() => window.print(), 1000);
            }
        } catch (error) {
            console.error("Erro ao imprimir via QZ Tray:", error);
            toast.error("Falha ao usar QZ Tray. Abrindo tela padrão.", { id: "printQZ" });

            // Se o QZ falhar, ainda garante a impressão via navegador
            setPedidoParaImprimir(pedido);
            setTimeout(() => window.print(), 1000);
        }
    };

    function obterStatusOpcoes(pedido) {
        const opcoes = ['Pendente', 'Em Preparo'];

        if (pedido.metodo_entrega === 'Retirada') {
            opcoes.push('Pronto para Retirada');
        } else {
            opcoes.push('Saiu para Entrega');
        }

        opcoes.push('Entregue', 'Cancelado');

        if (!opcoes.includes(pedido.status)) {
            opcoes.unshift(pedido.status);
        }

        return opcoes;
    }

    return (
        <>
            <div className="no-print">
                <div className={styles.wrapper}>

                    {/* ABAS */}
                    <div className={styles.tabs}>
                        <button className={`${styles.tabBtn} ${abaAtiva === 'lista' ? styles.tabAtiva : ''}`} onClick={() => setAbaAtiva('lista')}>
                            <List size={18} /> Pedidos do Dia
                        </button>

                        <Can perform="pedidos.criar">
                            <button
                                className={`${styles.tabBtn} ${abaAtiva === 'novo' ? styles.tabAtiva : ''}`}
                                onClick={() => setAbaAtiva('novo')}
                            >
                                <Plus size={18} /> Lançar Pedido Balcão
                            </button>
                        </Can>
                    </div>

                    {/* ABA: LISTA */}
                    {abaAtiva === 'lista' && (
                        <div className={styles.cardGeral}>
                            <div className={styles.headerRow}>
                                <h2>Gestão de Pedidos</h2>
                                <button onClick={carregarPedidos} className={styles.btnAtualizar} disabled={loading}>
                                    <RefreshCw size={16} className={loading ? styles.spin : ''} /> Atualizar
                                </button>
                            </div>

                            {/* BARRA DE FILTROS */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#f4f4f5', padding: '8px 12px', borderRadius: '8px' }}>
                                    <Search size={18} color="#71717a" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por Nome, Telefone ou #ID..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f4f4f5', padding: '8px 16px', borderRadius: '8px' }}>
                                    <Filter size={18} color="#71717a" />
                                    <select
                                        className={styles.selectFiltro}
                                        value={statusFilter}
                                        onChange={(event) => {
                                            setStatusFilter(event.target.value);
                                            setPage(1);
                                        }}
                                    >
                                        <option value="todos">Todos os Status</option>
                                        {STATUS_OPCOES.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>#ID</th>
                                            <th>Cliente</th>
                                            <th>Total</th>
                                            <th>Status (Atualizar)</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading && pedidos.length === 0 ? (
                                            <tr><td colSpan="5" className={styles.empty}>Carregando pedidos...</td></tr>
                                        ) : pedidos.length === 0 ? (
                                            <tr><td colSpan="5" className={styles.empty}>Nenhum pedido encontrado.</td></tr>
                                        ) : (
                                            pedidos.map(pedido => (
                                                <tr key={pedido.id}>
                                                    <td data-label="#ID" style={{ fontWeight: '500', color: '#71717a' }}>
                                                        #{pedido.id}
                                                    </td>
                                                    <td data-label="Cliente">
                                                        <div className={styles.clienteInfo}>
                                                            <span className={styles.clienteNome}>{pedido.nome_cliente}</span>
                                                            <span className={styles.clienteTelefone}>{pedido.telefone_cliente || 'Sem telefone'}</span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Total" style={{ fontWeight: '600', color: '#ea580c' }}>
                                                        R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}
                                                    </td>
                                                    <td data-label="Status">
                                                        <Can
                                                            perform="pedidos.status"
                                                            fallback={<span className={`${styles.selectStatus} ${styles[`status_${pedido.status.replace(/\s+/g, '')}`]}`}>{pedido.status}</span>}
                                                        >
                                                            <select
                                                                className={`${styles.selectStatus} ${styles[`status_${pedido.status.replace(/\s+/g, '')}`]}`}
                                                                value={pedido.status}
                                                                onChange={event => atualizarStatus(pedido.id, event.target.value)}
                                                            >
                                                                {obterStatusOpcoes(pedido).map(status => (
                                                                    <option key={status} value={status}>{status}</option>
                                                                ))}
                                                            </select>
                                                        </Can>
                                                    </td>
                                                    <td data-label="Ações" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                                        <button className={styles.btnVer} onClick={() => setPedidoSelecionado(pedido)} title="Ver Detalhes">
                                                            <Eye size={18} /> <span>Detalhes</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleImprimirPedido(pedido)}
                                                            title="Imprimir Comanda"
                                                            className={styles.btnImprimirGrid}
                                                        >
                                                            <Printer size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINAÇÃO */}
                            {!loading && totalPages > 1 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* ABA: NOVO PEDIDO */}
                    {abaAtiva === 'novo' && (
                        <FormPedidoPresencial voltarParaLista={() => { setAbaAtiva('lista'); carregarPedidos(); }} />
                    )}

                    {/* MODAL DETALHES PEDIDO */}
                    {pedidoSelecionado && (
                        <div className={styles.modalOverlay} onClick={() => setPedidoSelecionado(null)}>
                            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                                <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <h2 style={{ margin: 0 }}>Pedido #{pedidoSelecionado.id}</h2>
                                        <span style={{ fontSize: '0.95rem', color: '#52525b' }}>
                                            <b>Cliente:</b> {pedidoSelecionado.nome_cliente} &nbsp;|&nbsp;
                                            <b>Pagamento:</b> {pedidoSelecionado.metodo_pagamento_nome || 'A verificar'}
                                        </span>
                                    </div> */}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <h2 style={{ margin: 0 }}>Pedido #{pedidoSelecionado.id}</h2>
                                        <span style={{ fontSize: '0.95rem', color: '#52525b' }}>
                                            <b>Cliente:</b> {pedidoSelecionado.nome_cliente} &nbsp;|&nbsp;
                                            <b>Pagamento:</b> {pedidoSelecionado.metodo_pagamento_nome || 'A verificar'}
                                        </span>
                                        {/* 👇 Data e Hora adicionadas aqui */}
                                        <span style={{ fontSize: '0.85rem', color: '#71717a' }}>
                                            <b>Realizado em:</b> {new Date(pedidoSelecionado.criado_em).toLocaleString('pt-BR')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <button className={styles.btnImprimirModal} onClick={() => handleImprimirPedido(pedidoSelecionado)}>
                                            <Printer size={18} /> Imprimir
                                        </button>
                                        <button onClick={() => setPedidoSelecionado(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                                            <X size={24} color="#71717a" />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.modalBody}>
                                    <p><b>Endereço:</b> {pedidoSelecionado.endereco_cliente || 'Retirada no Balcão'}</p>
                                    <p><b>Obs:</b> {pedidoSelecionado.observacoes || 'Nenhuma'}</p>

                                    {/* 👇 NOVO BLOCO DO TROCO EXIBIDO NO MODAL */}
                                    {pedidoSelecionado.precisa_troco && (
                                        <p>
                                            <b style={{ color: '#ea580c' }}>Precisa de troco para:</b> R$ {Number(pedidoSelecionado.troco_para).toFixed(2).replace('.', ',')}
                                        </p>
                                    )}

                                    <hr />

                                    <h3>Marmitas do Pedido:</h3>
                                    <div className={styles.marmitasGrid}>
                                        {pedidoSelecionado.marmitas && pedidoSelecionado.marmitas.map((marmita, idx) => (
                                            <div key={idx} className={styles.marmitaCard}>
                                                <div className={styles.marmitaHeader}>
                                                    <span><b>{marmita.quantidade}x</b> Marmita {marmita.tamanho}</span>
                                                    <span>R$ {Number(marmita.preco_unitario).toFixed(2).replace('.', ',')}</span>
                                                </div>
                                                <ul className={styles.alimentosList}>
                                                    {marmita.alimentos && marmita.alimentos.map((alimento, idxAli) => (
                                                        <li key={alimento?.id || idxAli}>✓ {typeof alimento === 'string' ? alimento : alimento.nome}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    {pedidoSelecionado.produtos && pedidoSelecionado.produtos.length > 0 && (
                                        <>
                                            <hr />
                                            <h3>Complementos do Pedido:</h3>
                                            <div className={styles.marmitasGrid}>
                                                {pedidoSelecionado.produtos.map(produto => (
                                                    <div key={produto.id} className={styles.marmitaCard}>
                                                        <div className={styles.marmitaHeader}>
                                                            <span><b>{produto.quantidade}x</b> {produto.nome}</span>
                                                            <span>R$ {Number(produto.subtotal).toFixed(2).replace('.', ',')}</span>
                                                        </div>
                                                        <span style={{ color: '#71717A', fontSize: '0.85rem' }}>
                                                            {produto.categoria_nome} {' • '} R$ {Number(produto.preco_unitario).toFixed(2).replace('.', ',')} {' cada'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* O Cupom continuará sendo renderizado invisível caso seja necessário acionar o print nativo do navegador */}
            <CupomPedido pedido={pedidoParaImprimir} />
        </>
    );
}