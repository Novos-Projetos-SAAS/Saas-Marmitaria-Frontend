'use client'

import { useState } from "react";
import { usePedidosAdmin } from "@/hooks/usePedidosAdmin.js";
import { RefreshCw, Eye, Plus, List, X } from "lucide-react";
import FormPedidoPresencial from "@/components/forms/pedidoPresencial/pedidoPresencialForm";
import styles from "./PedidosClient.module.css";

const STATUS_OPCOES = ['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Saiu para Entrega', 'Entregue', 'Cancelado'];

export default function PedidosClient() {
    const { pedidos, loading, carregarPedidos, atualizarStatus } = usePedidosAdmin();
    const [abaAtiva, setAbaAtiva] = useState('lista'); // 'lista' ou 'novo'
    const [pedidoSelecionado, setPedidoSelecionado] = useState(null); // Para o Modal

    if (loading) {
        return <div className={styles.loading}><RefreshCw className={styles.spin} /> Carregando pedidos...</div>;
    }

    return (
        <div className={styles.wrapper}>
            {/* Navegação de Abas */}
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tabBtn} ${abaAtiva === 'lista' ? styles.tabAtiva : ''}`}
                    onClick={() => setAbaAtiva('lista')}
                >
                    <List size={18} /> Pedidos do Dia
                </button>
                <button 
                    className={`${styles.tabBtn} ${abaAtiva === 'novo' ? styles.tabAtiva : ''}`}
                    onClick={() => setAbaAtiva('novo')}
                >
                    <Plus size={18} /> Lançar Pedido Balcão
                </button>
            </div>

            {/* CONTEÚDO: LISTA */}
            {abaAtiva === 'lista' && (
                <div className={styles.cardGeral}>
                    <div className={styles.headerRow}>
                        <h2>Pedidos Recentes</h2>
                        <button onClick={carregarPedidos} className={styles.btnAtualizar}>
                            <RefreshCw size={16} /> Atualizar
                        </button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#ID</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Ações Rápida (Status)</th>
                                    <th>Detalhes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.length === 0 ? (
                                    <tr><td colSpan="5" className={styles.empty}>Nenhum pedido encontrado.</td></tr>
                                ) : (
                                    pedidos.map(pedido => (
                                        <tr key={pedido.id}>
                                            <td><b>#{pedido.id}</b></td>
                                            <td>
                                                {pedido.nome_cliente} <br/>
                                                <small>{pedido.telefone_cliente}</small>
                                            </td>
                                            <td>R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}</td>
                                            <td>
                                                {/* Select Inline para Status */}
                                                <select 
                                                    className={`${styles.selectStatus} ${styles[`status_${pedido.status.replace(/\s+/g, '')}`]}`}
                                                    value={pedido.status}
                                                    onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                                                >
                                                    {STATUS_OPCOES.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <button className={styles.btnVer} onClick={() => setPedidoSelecionado(pedido)}>
                                                    <Eye size={18} /> Ver Itens
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CONTEÚDO: FORMULÁRIO */}
            {abaAtiva === 'novo' && (
                <FormPedidoPresencial voltarParaLista={() => { setAbaAtiva('lista'); carregarPedidos(); }} />
            )}

            {/* MODAL DE DETALHES (Só renderiza se tiver um pedido selecionado) */}
            {pedidoSelecionado && (
                <div className={styles.modalOverlay} onClick={() => setPedidoSelecionado(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Detalhes do Pedido #{pedidoSelecionado.id}</h2>
                            <button onClick={() => setPedidoSelecionado(null)}><X size={24} /></button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <p><b>Endereço:</b> {pedidoSelecionado.endereco_cliente || 'Retirada no Balcão'}</p>
                            <p><b>Obs:</b> {pedidoSelecionado.observacoes || 'Nenhuma'}</p>
                            <hr />
                            
                            <h3>Marmitas do Pedido:</h3>
                            <div className={styles.marmitasGrid}>
                                {pedidoSelecionado.marmitas && pedidoSelecionado.marmitas.map(marmita => (
                                    <div key={marmita.id} className={styles.marmitaCard}>
                                        <div className={styles.marmitaHeader}>
                                            <span><b>{marmita.quantidade}x</b> Marmita {marmita.tamanho}</span>
                                            <span>R$ {Number(marmita.preco_unitario).toFixed(2)}</span>
                                        </div>
                                        <ul className={styles.alimentosList}>
                                            {marmita.alimentos && marmita.alimentos.map((alimento, idx) => (
                                                <li key={idx}>✓ {alimento}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}