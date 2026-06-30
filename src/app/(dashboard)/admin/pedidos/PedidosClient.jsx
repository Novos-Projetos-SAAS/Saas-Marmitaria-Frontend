// 'use client'

// import { useState } from "react";

// import { usePedidosAdmin } from "@/hooks/usePedidosAdmin.js";

// import FormPedidoPresencial from "@/components/forms/pedidoPresencial/pedidoPresencialForm";

// import { RefreshCw, Eye, Plus, List, X } from "lucide-react";

// import styles from "./PedidosClient.module.css";

// const STATUS_OPCOES = ['Pendente', 'Em Preparo', 'Pronto para Retirada', 'Saiu para Entrega', 'Entregue', 'Cancelado'];

// export default function PedidosClient() {
//     const { pedidos, loading, carregarPedidos, atualizarStatus } = usePedidosAdmin();
//     const [abaAtiva, setAbaAtiva] = useState('lista'); // 'lista' ou 'novo'
//     const [pedidoSelecionado, setPedidoSelecionado] = useState(null); // Para o Modal

//     if (loading) {
//         return <div className={styles.loading}><RefreshCw className={styles.spin} /> Carregando pedidos...</div>;
//     }

//     return (
//         <div className={styles.wrapper}>
//             {/* Navegação de Abas */}
//             <div className={styles.tabs}>
//                 <button
//                     className={`${styles.tabBtn} ${abaAtiva === 'lista' ? styles.tabAtiva : ''}`}
//                     onClick={() => setAbaAtiva('lista')}
//                 >
//                     <List size={18} /> Pedidos do Dia
//                 </button>
//                 <button
//                     className={`${styles.tabBtn} ${abaAtiva === 'novo' ? styles.tabAtiva : ''}`}
//                     onClick={() => setAbaAtiva('novo')}
//                 >
//                     <Plus size={18} /> Lançar Pedido Balcão
//                 </button>
//             </div>

//             {/* CONTEÚDO: LISTA */}
//             {abaAtiva === 'lista' && (
//                 <div className={styles.cardGeral}>
//                     <div className={styles.headerRow}>
//                         <h2>Pedidos Recentes</h2>
//                         <button onClick={carregarPedidos} className={styles.btnAtualizar}>
//                             <RefreshCw size={16} /> Atualizar
//                         </button>
//                     </div>

//                     {/* <div className={styles.tableContainer}>
//                         <table className={styles.table}>
//                             <thead>
//                                 <tr>
//                                     <th>#ID</th>
//                                     <th>Cliente</th>
//                                     <th>Total</th>
//                                     <th>Ações Rápida (Status)</th>
//                                     <th>Detalhes</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {pedidos.length === 0 ? (
//                                     <tr><td colSpan="5" className={styles.empty}>Nenhum pedido encontrado.</td></tr>
//                                 ) : (
//                                     pedidos.map(pedido => (
//                                         <tr key={pedido.id}>
//                                             <td><b>#{pedido.id}</b></td>
//                                             <td>
//                                                 {pedido.nome_cliente} <br/>
//                                                 <small>{pedido.telefone_cliente}</small>
//                                             </td>
//                                             <td>R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}</td>
//                                             <td>
                          
//                                                 <select
//                                                     className={`${styles.selectStatus} ${styles[`status_${pedido.status.replace(/\s+/g, '')}`]}`}
//                                                     value={pedido.status}
//                                                     onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
//                                                 >
//                                                     {STATUS_OPCOES.map(opt => (
//                                                         <option key={opt} value={opt}>{opt}</option>
//                                                     ))}
//                                                 </select>
//                                             </td>
//                                             <td>
//                                                 <button className={styles.btnVer} onClick={() => setPedidoSelecionado(pedido)}>
//                                                     <Eye size={18} /> Ver Itens
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div> */}

//                     <div className={styles.tableContainer}>
//                         <table className={styles.table}>
//                             <thead>
//                                 <tr>
//                                     <th>#ID</th>
//                                     <th>Cliente</th>
//                                     <th>Total</th>
//                                     <th>Status (Atualizar)</th>
//                                     <th>Ações</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {pedidos.length === 0 ? (
//                                     <tr><td colSpan="5" className={styles.empty}>Nenhum pedido encontrado.</td></tr>
//                                 ) : (
//                                     pedidos.map(pedido => (
//                                         <tr key={pedido.id}>
//                                             <td style={{ fontWeight: '500', color: '#71717a' }}>#{pedido.id}</td>
                                            
//                                             <td>
//                                                 <div className={styles.clienteInfo}>
//                                                     <span className={styles.clienteNome}>{pedido.nome_cliente}</span>
//                                                     <span className={styles.clienteTelefone}>{pedido.telefone_cliente || 'Sem telefone'}</span>
//                                                 </div>
//                                             </td>
                                            
//                                             <td style={{ fontWeight: '600', color: '#ea580c' }}>
//                                                 R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}
//                                             </td>
                                            
//                                             <td>
//                                                 <select
//                                                     className={`${styles.selectStatus} ${styles[`status_${pedido.status.replace(/\s+/g, '')}`]}`}
//                                                     value={pedido.status}
//                                                     onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
//                                                 >
//                                                     {STATUS_OPCOES.map(opt => (
//                                                         <option key={opt} value={opt}>{opt}</option>
//                                                     ))}
//                                                 </select>
//                                             </td>
                                            
//                                             <td>
//                                                 <button className={styles.btnVer} onClick={() => setPedidoSelecionado(pedido)} title="Ver Detalhes">
//                                                     <Eye size={18} /> <span>Detalhes</span>
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             )}

//             {/* CONTEÚDO: FORMULÁRIO */}
//             {abaAtiva === 'novo' && (
//                 <FormPedidoPresencial voltarParaLista={() => { setAbaAtiva('lista'); carregarPedidos(); }} />
//             )}

//             {/* MODAL DE DETALHES (Só renderiza se tiver um pedido selecionado) */}
//             {pedidoSelecionado && (
//                 <div className={styles.modalOverlay} onClick={() => setPedidoSelecionado(null)}>
//                     <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
//                         <div className={styles.modalHeader}>
//                             <h2>Detalhes do Pedido #{pedidoSelecionado.id}</h2>
//                             <button onClick={() => setPedidoSelecionado(null)}><X size={24} /></button>
//                         </div>
                        
//                         <div className={styles.modalBody}>
//                             <p><b>Endereço:</b> {pedidoSelecionado.endereco_cliente || 'Retirada no Balcão'}</p>
//                             <p><b>Obs:</b> {pedidoSelecionado.observacoes || 'Nenhuma'}</p>
//                             <hr />
                            
//                             <h3>Marmitas do Pedido:</h3>
//                             <div className={styles.marmitasGrid}>
//                                 {pedidoSelecionado.marmitas && pedidoSelecionado.marmitas.map(marmita => (
//                                     <div key={marmita.id} className={styles.marmitaCard}>
//                                         <div className={styles.marmitaHeader}>
//                                             <span><b>{marmita.quantidade}x</b> Marmita {marmita.tamanho}</span>
//                                             <span>R$ {Number(marmita.preco_unitario).toFixed(2)}</span>
//                                         </div>
//                                         <ul className={styles.alimentosList}>
//                                             {marmita.alimentos && marmita.alimentos.map((alimento, idx) => (
//                                                 <li key={idx}>✓ {alimento}</li>
//                                             ))}
//                                         </ul>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

'use client'

import { useState, useEffect } from "react";
import { usePedidosAdmin } from "@/hooks/usePedidosAdmin.js";
import FormPedidoPresencial from "@/components/forms/pedidoPresencial/pedidoPresencialForm";
import Pagination from "@/components/ui/pagination"; // Importação da paginação

import { RefreshCw, Eye, Plus, List, X, Search, Filter } from "lucide-react"; // Adicionado Search e Filter
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

    // Debounce para a busca
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(inputValue);
            setPage(1); // Volta à página 1 ao buscar
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, setSearch, setPage]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.tabs}>
                <button className={`${styles.tabBtn} ${abaAtiva === 'lista' ? styles.tabAtiva : ''}`} onClick={() => setAbaAtiva('lista')}>
                    <List size={18} /> Pedidos do Dia
                </button>
                <button className={`${styles.tabBtn} ${abaAtiva === 'novo' ? styles.tabAtiva : ''}`} onClick={() => setAbaAtiva('novo')}>
                    <Plus size={18} /> Lançar Pedido Balcão
                </button>
            </div>

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
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            >
                                <option value="todos">Todos os Status</option>
                                {STATUS_OPCOES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
                                    <tr><td colSpan="5" className={styles.empty}>A carregar pedidos...</td></tr>
                                ) : pedidos.length === 0 ? (
                                    <tr><td colSpan="5" className={styles.empty}>Nenhum pedido encontrado.</td></tr>
                                ) : (
                                    // pedidos.map(pedido => (
                                    //     <tr key={pedido.id}>
                                    //         <td style={{ fontWeight: '500', color: '#71717a' }}>#{pedido.id}</td>
                                    //         <td>
                                    //             <div className={styles.clienteInfo}>
                                    //                 <span className={styles.clienteNome}>{pedido.nome_cliente}</span>
                                    //                 <span className={styles.clienteTelefone}>{pedido.telefone_cliente || 'Sem telefone'}</span>
                                    //             </div>
                                    //         </td>
                                    //         <td style={{ fontWeight: '600', color: '#ea580c' }}>
                                    //             R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}
                                    //         </td>
                                    //         <td>
                                    //             <select 
                                    //                 className={`${styles.selectStatus} ${styles[`status_${pedido.status.replace(/\s+/g, '')}`]}`}
                                    //                 value={pedido.status}
                                    //                 onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                                    //             >
                                    //                 {STATUS_OPCOES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    //             </select>
                                    //         </td>
                                    //         <td>
                                    //             <button className={styles.btnVer} onClick={() => setPedidoSelecionado(pedido)} title="Ver Detalhes">
                                    //                 <Eye size={18} /> <span>Detalhes</span>
                                    //             </button>
                                    //         </td>
                                    //     </tr>
                                    // ))
                                    
                                    pedidos.map(pedido => (
                                        <tr key={pedido.id}>
                                            {/* 👇 Adicionado data-label em todos os TDs */}
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
                                                <select 
                                                    className={`${styles.selectStatus} ${styles[`status_${pedido.status.replace(/\s+/g, '')}`]}`}
                                                    value={pedido.status}
                                                    onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
                                                >
                                                    {STATUS_OPCOES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </td>
                                            
                                            <td data-label="Ações">
                                                <button className={styles.btnVer} onClick={() => setPedidoSelecionado(pedido)} title="Ver Detalhes">
                                                    <Eye size={18} /> <span>Detalhes</span>
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
                            <Pagination 
                                currentPage={page} 
                                totalPages={totalPages} 
                                onPageChange={setPage} 
                            />
                        </div>
                    )}
                </div>
            )}

            {abaAtiva === 'novo' && (
                <FormPedidoPresencial voltarParaLista={() => { setAbaAtiva('lista'); carregarPedidos(); }} />
            )}

            {/* Modal de Detalhes omitido para brevidade (mantenha o código do seu modal exatamente como estava) */}
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
                                {pedidoSelecionado.marmitas && pedidoSelecionado.marmitas.map((marmita, idx) => (
                                    <div key={idx} className={styles.marmitaCard}>
                                        <div className={styles.marmitaHeader}>
                                            <span><b>{marmita.quantidade}x</b> Marmita {marmita.tamanho}</span>
                                            <span>R$ {Number(marmita.preco_unitario).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                        <ul className={styles.alimentosList}>
                                            {marmita.alimentos && marmita.alimentos.map((alimento, idxAli) => (
                                                <li key={idxAli}>✓ {alimento}</li>
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