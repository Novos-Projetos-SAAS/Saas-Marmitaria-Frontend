// 'use client'

// import { useState, useEffect } from "react";
// import { usePedidos } from "@/hooks/usePedidos"; 
// import { useMetodosPagamento } from "@/hooks/useMetodosPagamento"; 

// // 🚀 1. Importando o Modal que você criou
// import ModalMontarMarmita from "@/components/modals/montarMarmitaModal"; // Ajuste o caminho se necessário

// import { Save, X, ShoppingBag, User, MapPin, CreditCard } from "lucide-react";
// import toast from "react-hot-toast";
// import styles from "./pedidoPresencialForm.module.css";

// export default function FormPedidoPresencial({ voltarParaLista }) {
//     const { finalizarPedidoNoBanco, enviando } = usePedidos();
//     const { metodosPagamento, loadingMetodosPagamento } = useMetodosPagamento();

//     // 🚀 2. Estado para controlar a abertura/fechamento do Modal
//     const [modalAberto, setModalAberto] = useState(false);

//     const [formData, setFormData] = useState({
//         nome_cliente: '',
//         telefone_cliente: '',
//         endereco_cliente: '',
//         tipo_pedido: 'Presencial',
//         metodo_entrega:'Entrega',
//         metodo_pagamento_id: '',
//         observacoes: '',
//         marmitas: []
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleSalvarPedido = async (e) => {
//         e.preventDefault();

//         if (!formData.nome_cliente) {
//             return toast.error("O nome do cliente é obrigatório.");
//         }
        
//         if (!formData.metodo_pagamento_id) {
//             return toast.error("Selecione um método de pagamento.");
//         }

//         if (formData.marmitas.length === 0) {
//             return toast.error("Adicione pelo menos uma marmita ao pedido.");
//         }

//         const sucesso = await finalizarPedidoNoBanco(formData);
        
//         if (sucesso) {
//             voltarParaLista();
//         }
//     };

//     // 🚀 3. Função para remover um item do carrinho caso o Admin desista
//     const removerMarmita = (index) => {
//         const novasMarmitas = [...formData.marmitas];
//         novasMarmitas.splice(index, 1);
//         setFormData(prev => ({ ...prev, marmitas: novasMarmitas }));
//     };

//     // 🚀 Envolvemos o return em um Fragment <> </> para podermos renderizar o Modal por cima do Form
//     return (
//         <>
//             <form onSubmit={handleSalvarPedido} className={styles.cardGeral}>
//                 <div className={styles.header}>
//                     <div>
//                         <h2>Novo Pedido (PDV)</h2>
//                         <p className={styles.textHint}>Registe um pedido feito presencialmente ou por telefone.</p>
//                     </div>
//                     <button type="button" className={styles.btnFechar} onClick={voltarParaLista}>
//                         <X size={20} />
//                     </button>
//                 </div>
                
//                 <div className={styles.gridForm}>
//                     <div className={styles.coluna}>
//                         <h3 className={styles.sectionTitle}><User size={18} /> Dados do Cliente</h3>
                        
//                         <div className={styles.inputGroup}>
//                             <label>Nome do Cliente *</label>
//                             <input 
//                                 type="text" 
//                                 name="nome_cliente"
//                                 value={formData.nome_cliente}
//                                 onChange={handleChange}
//                                 placeholder="Ex: João Silva"
//                                 required
//                             />
//                         </div>

//                         <div className={styles.inputGroup}>
//                             <label>Telefone / WhatsApp</label>
//                             <input 
//                                 type="text" 
//                                 name="telefone_cliente"
//                                 value={formData.telefone_cliente}
//                                 onChange={handleChange}
//                                 placeholder="(00) 00000-0000"
//                             />
//                         </div>

//                         <h3 className={styles.sectionTitle}><MapPin size={18} /> Entrega e Pagamento</h3>

//                         <div className={styles.rowInputs}>
//                             <div className={styles.inputGroup}>
//                                 <label>Tipo de Pedido</label>
//                                 <select name="tipo_pedido" value={formData.tipo_pedido} onChange={handleChange}>
//                                     <option value="Balcão">Retirar no Balcão</option>
//                                     <option value="Entrega">Entrega (Delivery)</option>
//                                 </select>
//                             </div>
                            
//                             <div className={styles.inputGroup}>
//                                 <label>Método Pagamento *</label>
//                                 <select 
//                                     name="metodo_pagamento_id" 
//                                     value={formData.metodo_pagamento_id} 
//                                     onChange={handleChange}
//                                     required
//                                 >
//                                     <option value="" disabled>
//                                         {loadingMetodosPagamento ? 'Carregando opções...' : 'Selecione...'}
//                                     </option>
//                                     {metodosPagamento && metodosPagamento.map(metodo => (
//                                         <option key={metodo.id} value={metodo.id}>
//                                             {metodo.nome}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         {formData.tipo_pedido === 'Entrega' && (
//                             <div className={styles.inputGroup}>
//                                 <label>Endereço Completo *</label>
//                                 <input 
//                                     type="text" 
//                                     name="endereco_cliente"
//                                     value={formData.endereco_cliente}
//                                     onChange={handleChange}
//                                     placeholder="Rua, Número, Bairro"
//                                     required={formData.tipo_pedido === 'Entrega'}
//                                 />
//                             </div>
//                         )}

//                         <div className={styles.inputGroup}>
//                             <label>Observações do Pedido</label>
//                             <textarea 
//                                 name="observacoes"
//                                 value={formData.observacoes}
//                                 onChange={handleChange}
//                                 placeholder="Troco para R$50, entregar na portaria, etc."
//                                 rows="2"
//                             />
//                         </div>
//                     </div>

//                     <div className={styles.colunaItens}>
//                         <div className={styles.headerItens}>
//                             <h3 className={styles.sectionTitle}><ShoppingBag size={18} /> Itens do Pedido</h3>
//                             {/* 🚀 4. Botão agora abre o Modal */}
//                             <button type="button" className={styles.btnAddItem} onClick={() => setModalAberto(true)}>
//                                 + Adicionar Marmita
//                             </button>
//                         </div>

//                         <div className={styles.listaItens}>
//                             {formData.marmitas.length === 0 ? (
//                                 <div className={styles.emptyCart}>
//                                     <p>Nenhum item adicionado ainda.</p>
//                                 </div>
//                             ) : (
//                                 formData.marmitas.map((item, index) => (
//                                     <div key={index} className={styles.itemCart}>
//                                         <div className={styles.itemCartInfo}>
//                                             {/* 🚀 5. Lendo os dados reais que vieram do Modal */}
//                                             <strong>{item.quantidade}x Marmita {item.tamanho_nome}</strong>
//                                             <small>{item.alimentos.length} alimentos selecionados</small>
//                                             <span style={{ color: '#ea580c', fontWeight: '600', marginTop: '4px' }}>
//                                                 R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}
//                                             </span>
//                                         </div>
//                                         <button 
//                                             type="button" 
//                                             className={styles.btnRemoveItem}
//                                             onClick={() => removerMarmita(index)}
//                                         >
//                                             <X size={16} />
//                                         </button>
//                                     </div>
//                                 ))
//                             )}
//                         </div>

//                         {/* 🚀 Opcional: Mostra o Total do Pedido em baixo */}
//                         {formData.marmitas.length > 0 && (
//                             <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #e4e4e7', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
//                                 <strong>Total:</strong>
//                                 <strong style={{ color: '#ea580c' }}>
//                                     R$ {formData.marmitas.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0).toFixed(2).replace('.', ',')}
//                                 </strong>
//                             </div>
//                         )}
//                     </div>
//                 </div>
                
//                 <div className={styles.footerAcoes}>
//                     <button type="button" className={styles.btnCancelar} onClick={voltarParaLista}>
//                         Cancelar
//                     </button>
//                     <button type="submit" className={styles.btnSalvar} disabled={enviando}>
//                         {enviando ? "A registar..." : <><Save size={18} /> Confirmar Pedido</>}
//                     </button>
//                 </div>
//             </form>

//             {/* 🚀 6. O componente do Modal renderizado condicionalmente */}
//             {modalAberto && (
//                 <ModalMontarMarmita 
//                     onClose={() => setModalAberto(false)}
//                     onAdicionar={(novaMarmita) => {
//                         // Recebe o pacote do modal e adiciona ao estado
//                         setFormData(prev => ({
//                             ...prev,
//                             marmitas: [...prev.marmitas, novaMarmita]
//                         }));
//                         toast.success("Marmita adicionada ao pedido!");
//                     }}
//                 />
//             )}
//         </>
//     );
// }

'use client'

import { useState, useEffect } from "react";
import { usePedidos } from "@/hooks/usePedidos"; 
import { useMetodosPagamento } from "@/hooks/useMetodosPagamento"; 

import ModalMontarMarmita from "@/components/modals/montarMarmitaModal"; 
import TelefoneInput from "@/components/ui/inputMask";

import { Save, X, ShoppingBag, User, MapPin, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./pedidoPresencialForm.module.css";

export default function FormPedidoPresencial({ voltarParaLista }) {
    const { finalizarPedidoNoBanco, enviando } = usePedidos();
    const { metodosPagamento, loadingMetodosPagamento } = useMetodosPagamento();

    const [modalAberto, setModalAberto] = useState(false);

    // Estado atualizado com os campos de endereço separados
    const [formData, setFormData] = useState({
        nome_cliente: '',
        telefone_cliente: '',
        logradouro: '',
        numero: '',
        complemento: '',
        tipo_pedido: 'Presencial',
        metodo_entrega: 'Retirada',
        metodo_pagamento_id: '',
        observacoes: '',
        marmitas: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            
            // Limpa os campos de endereço se mudar para Retirada
            if (name === 'metodo_entrega' && value === 'Retirada') {
                newState.logradouro = '';
                newState.numero = '';
                newState.complemento = '';
            }
            return newState;
        });
    };

    const handleSalvarPedido = async (e) => {
        e.preventDefault();

        if (!formData.nome_cliente) {
            return toast.error("O nome do cliente é obrigatório.");
        }

        // Validação específica para o endereço fatiado
        let enderecoFinal = null;
        if (formData.metodo_entrega === 'Entrega') {
            if (!formData.logradouro || !formData.numero) {
                return toast.error("Preencha a Rua/Avenida e o Número para entrega.");
            }
            
            // Formata a string exatamente no padrão solicitado antes de enviar
            enderecoFinal = `${formData.logradouro}, ${formData.numero} - Centro (${formData.complemento || 'Sem complemento'})`;
        }
        
        if (!formData.metodo_pagamento_id) {
            return toast.error("Selecione um método de pagamento.");
        }

        if (formData.marmitas.length === 0) {
            return toast.error("Adicione pelo menos uma marmita ao pedido.");
        }

        // Prepara o payload final trocando as partes soltas pela string formatada
        const payloadDoBanco = {
            ...formData,
            endereco_cliente: enderecoFinal
        };

        const sucesso = await finalizarPedidoNoBanco(payloadDoBanco);
        
        if (sucesso) {
            voltarParaLista();
        }
    };

    const removerMarmita = (index) => {
        const novasMarmitas = [...formData.marmitas];
        novasMarmitas.splice(index, 1);
        setFormData(prev => ({ ...prev, marmitas: novasMarmitas }));
    };

    return (
        <>
            <form onSubmit={handleSalvarPedido} className={styles.cardGeral}>
                <div className={styles.header}>
                    <div>
                        <h2>Novo Pedido (PDV)</h2>
                        <p className={styles.textHint}>Registe um pedido feito presencialmente ou por telefone.</p>
                    </div>
                    <button type="button" className={styles.btnFechar} onClick={voltarParaLista}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className={styles.gridForm}>
                    <div className={styles.coluna}>
                        <h3 className={styles.sectionTitle}><User size={18} /> Dados do Cliente</h3>
                        
                        <div className={styles.inputGroup}>
                            <label>Nome do Cliente *</label>
                            <input 
                                type="text" 
                                name="nome_cliente"
                                value={formData.nome_cliente}
                                onChange={handleChange}
                                placeholder="Ex: João Silva"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Telefone / WhatsApp</label>
                            <TelefoneInput 
                                name="telefone_cliente" // 🚀 O nome exato que está no seu formData
                                value={formData.telefone_cliente}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                required={false} // No balcão geralmente não é obrigatório
                            />
                        </div>

                        <h3 className={styles.sectionTitle}><MapPin size={18} /> Entrega e Pagamento</h3>

                        <div className={styles.rowInputs}>
                            <div className={styles.inputGroup}>
                                <label>Origem do Pedido</label>
                                <select name="tipo_pedido" value={formData.tipo_pedido} onChange={handleChange}>
                                    <option value="Presencial">Balcão (Presencial)</option>
                                    <option value="Remoto">Telefone / WhatsApp</option>
                                </select>
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <label>Forma de Entrega</label>
                                <select name="metodo_entrega" value={formData.metodo_entrega} onChange={handleChange}>
                                    <option value="Retirada">Retirar no Balcão</option>
                                    <option value="Entrega">Entrega (Motoboy)</option>
                                </select>
                            </div>
                        </div>

                        {/* Bloco de Endereço Padronizado - Só aparece se for Entrega */}
                        {formData.metodo_entrega === 'Entrega' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div className={styles.rowInputs} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className={styles.inputGroup} style={{ flex: 3 }}>
                                        <label>Rua / Avenida *</label>
                                        <input 
                                            type="text" 
                                            name="logradouro" 
                                            required 
                                            value={formData.logradouro} 
                                            onChange={handleChange} 
                                            placeholder="Ex: Rua das Flores" 
                                        />
                                    </div>
                                    <div className={styles.inputGroup} style={{ flex: 1, minWidth: '80px' }}>
                                        <label>Nº *</label>
                                        <input 
                                            type="text" 
                                            name="numero" 
                                            required 
                                            value={formData.numero} 
                                            onChange={handleChange} 
                                            placeholder="Ex: 123" 
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Complemento (Opcional)</label>
                                    <input 
                                        type="text" 
                                        name="complemento" 
                                        value={formData.complemento} 
                                        onChange={handleChange} 
                                        placeholder="Casa, Apto 45, Bloco B..." 
                                    />
                                </div>
                            </div>
                        )}

                        {/* Pagamento movido para debaixo do endereço */}
                        <div className={styles.inputGroup}>
                            <label>Método Pagamento *</label>
                            <select 
                                name="metodo_pagamento_id" 
                                value={formData.metodo_pagamento_id} 
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    {loadingMetodosPagamento ? 'Carregando opções...' : 'Selecione...'}
                                </option>
                                {metodosPagamento && metodosPagamento.map(metodo => (
                                    <option key={metodo.id} value={metodo.id}>
                                        {metodo.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Observações do Pedido</label>
                            <textarea 
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                placeholder="Troco para R$50, entregar na portaria, etc."
                                rows="2"
                            />
                        </div>
                    </div>

                    <div className={styles.colunaItens}>
                        <div className={styles.headerItens}>
                            <h3 className={styles.sectionTitle}><ShoppingBag size={18} /> Itens do Pedido</h3>
                            <button type="button" className={styles.btnAddItem} onClick={() => setModalAberto(true)}>
                                + Adicionar Marmita
                            </button>
                        </div>

                        <div className={styles.listaItens}>
                            {formData.marmitas.length === 0 ? (
                                <div className={styles.emptyCart}>
                                    <p>Nenhum item adicionado ainda.</p>
                                </div>
                            ) : (
                                formData.marmitas.map((item, index) => (
                                    <div key={index} className={styles.itemCart}>
                                        <div className={styles.itemCartInfo}>
                                            <strong>{item.quantidade}x Marmita {item.tamanho_nome}</strong>
                                            <small>{item.alimentos.length} alimentos selecionados</small>
                                            <span style={{ color: '#ea580c', fontWeight: '600', marginTop: '4px' }}>
                                                R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                        <button 
                                            type="button" 
                                            className={styles.btnRemoveItem}
                                            onClick={() => removerMarmita(index)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {formData.marmitas.length > 0 && (
                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #e4e4e7', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                <strong>Total:</strong>
                                <strong style={{ color: '#ea580c' }}>
                                    R$ {formData.marmitas.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0).toFixed(2).replace('.', ',')}
                                </strong>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className={styles.footerAcoes}>
                    <button type="button" className={styles.btnCancelar} onClick={voltarParaLista}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.btnSalvar} disabled={enviando}>
                        {enviando ? "A registar..." : <><Save size={18} /> Confirmar Pedido</>}
                    </button>
                </div>
            </form>

            {modalAberto && (
                <ModalMontarMarmita 
                    onClose={() => setModalAberto(false)}
                    onAdicionar={(novaMarmita) => {
                        setFormData(prev => ({
                            ...prev,
                            marmitas: [...prev.marmitas, novaMarmita]
                        }));
                        toast.success("Marmita adicionada ao pedido!");
                    }}
                />
            )}
        </>
    );
}