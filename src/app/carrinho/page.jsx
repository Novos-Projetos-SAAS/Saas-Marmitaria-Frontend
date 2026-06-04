// 'use client'

// import { useRouter } from "next/navigation"

// import { useState } from "react"

// import { useMetodosPagamento } from "@/hooks/useMetodosPagamento.js"
// import { usePedidos } from "@/hooks/usePedidos.js"

// import { usePedido } from "@/context/PedidoContext.js"

// import TelefoneInput  from "@/components/ui/inputMask/index.jsx"

// import toast from "react-hot-toast"
// import { Trash2 } from "lucide-react"

// import styles from './page.module.css'

// export default function Carrinho() {

//     const router = useRouter();

//     const { carrinho, totalGeral, limparCarrinho, setSucessoPedido, removerDoCarrinho, finalizando } = usePedido();

//     const { metodosPagamento, loadingMetodosPagamento } = useMetodosPagamento();

//     const { finalizarPedidoNoBanco, enviando } = usePedidos();

//     const [loading, setLoading] = useState(false);


//     const [form, setForm] = useState({
//         nome: '',
//         telefone: '',
//         // endereco: '',
//         logradouro: '',
//         numero: '',
//         complemento: '',
//         metodo_pagamento_id: '',
//         tipo_pedido: 'Remoto',
//         observacoes: ''
//     })

//     // useEffect(() => {
//     //     if (metodosPagamento.length > 0 && !form.metodo_pagamento_id) {
//     //         setForm(prev => ({ ...prev, metodo_pagamento_id: metodosPagamento[0].id }));
//     //     }
//     // }, [metodosPagamento]);

//     const handleChange = (e) => {
//         setForm({ ...form, [e.target.name]: e.target.value });
//     };

//     const finalizarPedido = async (e) => {
//         e.preventDefault();

//         if (enviando) return;

//         if (carrinho.length === 0) {
//             return toast.error("Seu carrinho está vazio.");
//         }

//         // Pegamos o ID garantindo que ele não seja undefined
//         const pagamentoId = form.metodo_pagamento_id;

//         if (!pagamentoId) {
//             return toast.error("Por favor, selecione a forma de pagamento.");
//         }

//         const telefoneLimpo = form.telefone.replace(/\D/g, '');

//         // 2. VALIDAÇÃO: Um celular com DDD no Brasil tem exatamente 11 números.
//         if (telefoneLimpo.length < 11) {
//             return toast.error("Por favor, digite um telefone válido com DDD.");
//         }

//         try {

//             const enderecoFormatado = `${form.logradouro}, ${form.numero} - Centro (${form.complemento || 'Sem complemento'})`;

//             // MONTANDO O PAYLOAD EXATO PARA O BACKEND
//             const payload = {
//                 nome_cliente: form.nome,
//                 telefone_cliente: telefoneLimpo,
//                 endereco_cliente: enderecoFormatado,
//                 metodo_pagamento_id: Number(form.metodo_pagamento_id),
//                 tipo_pedido: form.tipo_pedido,
//                 observacoes: form.observacoes,
//                 marmitas: carrinho.map(item => ({
//                     tamanho_id: Number(item.tamanho.id),
//                     quantidade: Number(item.quantidade),
//                     alimentos: item.itens.map(i => Number(i.id))
//                 })),

//                 total: Number(totalGeral)
//             };

//             const sucesso = await finalizarPedidoNoBanco(payload);

//             if (sucesso) {
//                 limparCarrinho();

//                 // Depois ativamos a permissão para a tela de sucesso
//                 setSucessoPedido(true);

//                 localStorage.setItem('marmitaria_telefone_cliente', telefoneLimpo);

//                 // Por fim, navegamos
//                 router.push('/pedido/sucesso');
//             }

//         } catch (error) {
//             console.error("💥 Erro 400 - Verifique o terminal do Node.js:", error);
//             toast.error("O servidor rejeitou o pedido (Erro 400).");
//         }
//     };

//     if (carrinho.length === 0) {
//         if (finalizando) {
//             return (
//                 <main className={styles.containerVazio}>
//                     <div className={styles.loader}>Finalizando seu pedido...</div>
//                 </main>
//             );
//         }

//         return (
//             <main className={styles.containerVazio}>
//                 <h2>Seu carrinho está vazio 😕</h2>
//                 <button onClick={() => router.push('/pedido')} className={styles.btnVoltar}>
//                     Voltar ao Cardápio
//                 </button>
//             </main>
//         );
//     }

//     return (
//         <main className={styles.container}>
//             <header className={styles.header}>
//                 <button className={styles.btnLink} onClick={() => router.back()}>← Continuar Comprando</button>
//                 <h1>Finalizar Pedido</h1>
//             </header>

//             <section className={styles.resumo}>
//                 <h2 className={styles.secaoTitulo}>Sua Escolha</h2>
//                 {carrinho.map((item, index) => (
//                     <div key={item.id_temp} className={styles.itemCarrinho}>
//                         <div className={styles.itemInfo}>
//                             <span className={styles.itemQuantidade}>{item.quantidade}x</span>
//                             <div>
//                                 <h3>Marmita {item.tamanho.nome}</h3>
//                                 <p className={styles.itemDetalhes}>
//                                     {item.itens.map(i => i.nome).join(', ')}
//                                 </p>
//                             </div>
//                         </div>

//                         <div className={styles.itemAcoes}>
//                             <span className={styles.itemPreco}>
//                                 R$ {item.subtotal.toFixed(2).replace('.', ',')}
//                             </span>

//                             {/* O botão chamando a função passando a posição (index) do item */}
//                             <button
//                                 type="button"
//                                 onClick={() => removerDoCarrinho(index)}
//                                 className={styles.btnRemover}
//                                 title="Remover marmita"
//                             >
//                                 <Trash2 size={20} />
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//                 <div className={styles.totalBox}>
//                     <span>Total do Pedido</span>
//                     <strong>R$ {totalGeral.toFixed(2).replace('.', ',')}</strong>
//                 </div>
//             </section>

//             <form className={styles.form} onSubmit={finalizarPedido}>
//                 <h2 className={styles.secaoTitulo}>Entrega e Pagamento</h2>

//                 <div className={styles.inputGroup}>
//                     <label>Seu Nome</label>
//                     <input type="text" name="nome" required value={form.nome} onChange={handleChange} placeholder="Como te chamamos?" />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Telefone / WhatsApp</label>
//                     <TelefoneInput
//                         value={form.telefone}
//                         onChange={handleChange}
//                         className={styles.inputCustom}
//                         placeholder="(00) 00000-0000"
//                     />
//                 </div>

//                 {/* <div className={styles.inputGroup}>
//                     <label>Endereço Completo</label>
//                     <textarea name="endereco" required value={form.endereco} onChange={handleChange} placeholder="Rua, número, bairro e referência" />
//                 </div> */}

//                 <div className={styles.row}>
//                     <div className={styles.inputGroup} style={{ flex: 3 }}>
//                         <label>Rua / Avenida</label>
//                         <input type="text" name="logradouro" required value={form.logradouro} onChange={handleChange} placeholder="Ex: Rua das Flores" />
//                     </div>
//                     <div className={styles.inputGroup} style={{ flex: 1, minWidth: '80px' }}>
//                         <label>Nº</label>
//                         <input type="text" name="numero" required value={form.numero} onChange={handleChange} placeholder="Ex: 123" />
//                     </div>
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Complemento (Opcional)</label>
//                     <input type="text" name="complemento" value={form.complemento} onChange={handleChange} placeholder="Casa, Apto 45, Bloco B..." />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Observações do Pedido (Opcional)</label>
//                     <textarea
//                         name="observacoes"
//                         value={form.observacoes}
//                         onChange={handleChange}
//                         className={styles.textarea}
//                         placeholder="Ex: Tirar cebola, alergia a amendoim, troco para R$ 50..."
//                         rows="2"
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Forma de Pagamento</label>
//                     <select
//                         name="metodo_pagamento_id"
//                         value={form.metodo_pagamento_id}
//                         onChange={handleChange}
//                         disabled={loadingMetodosPagamento} // Trava enquanto carrega do banco
//                         required
//                     >
//                         <option value="" disabled>
//                             {loadingMetodosPagamento ? "Carregando opções..." : "Selecione uma opção..."}
//                         </option>

//                         {!loadingMetodosPagamento && metodosPagamento.length === 0 && (
//                             <option value="" disabled>Nenhum método disponível</option>
//                         )}

//                         {!loadingMetodosPagamento && metodosPagamento.map((metodo) => (
//                             <option key={metodo.id} value={metodo.id}>
//                                 {metodo.nome}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <button type="submit" className={styles.btnFinalizar} disabled={enviando || loadingMetodosPagamento}>
//                     {loading ? 'Processando...' : 'Confirmar e Enviar Pedido'}
//                 </button>
//             </form>
//         </main>
//     );


// }

'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"

import { useMetodosPagamento } from "@/hooks/useMetodosPagamento.js"
import { usePedidos } from "@/hooks/usePedidos.js"
import { usePedido } from "@/context/PedidoContext.js"

import TelefoneInput  from "@/components/ui/inputMask/index.jsx"

import toast from "react-hot-toast"
import { Trash2 } from "lucide-react"

import styles from './page.module.css'

export default function Carrinho() {
    const router = useRouter();

    const { carrinho, totalGeral, limparCarrinho, setSucessoPedido, removerDoCarrinho, finalizando } = usePedido();
    const { metodosPagamento, loadingMetodosPagamento } = useMetodosPagamento();
    const { finalizarPedidoNoBanco, enviando } = usePedidos();

    const [loading, setLoading] = useState(false);

    // 🚀 1. Estado atualizado com metodo_entrega
    const [form, setForm] = useState({
        nome: '',
        telefone: '',
        metodo_entrega: 'Entrega', // Padrão é entrega
        logradouro: '',
        numero: '',
        complemento: '',
        metodo_pagamento_id: '',
        tipo_pedido: 'Remoto',
        observacoes: ''
    })

    // 🚀 2. HandleChange inteligente que limpa a morada se escolher "Retirada"
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const newState = { ...prev, [name]: value };
            
            if (name === 'metodo_entrega' && value === 'Retirada') {
                newState.logradouro = '';
                newState.numero = '';
                newState.complemento = '';
            }
            return newState;
        });
    };

    const finalizarPedido = async (e) => {
        e.preventDefault();

        if (enviando) return;

        if (carrinho.length === 0) {
            return toast.error("Seu carrinho está vazio.");
        }

        const pagamentoId = form.metodo_pagamento_id;

        if (!pagamentoId) {
            return toast.error("Por favor, selecione a forma de pagamento.");
        }

        const telefoneLimpo = form.telefone.replace(/\D/g, '');

        if (telefoneLimpo.length < 11) {
            return toast.error("Por favor, digite um telefone válido com DDD.");
        }

        // 🚀 3. Validação condicional do endereço
        let enderecoFormatado = null;
        if (form.metodo_entrega === 'Entrega') {
            if (!form.logradouro || !form.numero) {
                return toast.error("Para entrega, preencha a Rua/Avenida e o Número.");
            }
            enderecoFormatado = `${form.logradouro}, ${form.numero} - Centro (${form.complemento || 'Sem complemento'})`;
        }

        try {
            // 🚀 4. Adicionado metodo_entrega ao payload
            const payload = {
                nome_cliente: form.nome,
                telefone_cliente: telefoneLimpo,
                endereco_cliente: enderecoFormatado,
                metodo_entrega: form.metodo_entrega,
                metodo_pagamento_id: Number(form.metodo_pagamento_id),
                tipo_pedido: form.tipo_pedido,
                observacoes: form.observacoes,
                marmitas: carrinho.map(item => ({
                    tamanho_id: Number(item.tamanho.id),
                    quantidade: Number(item.quantidade),
                    alimentos: item.itens.map(i => Number(i.id))
                })),
                total: Number(totalGeral)
            };

            const sucesso = await finalizarPedidoNoBanco(payload);

            if (sucesso) {
                limparCarrinho();
                setSucessoPedido(true);
                localStorage.setItem('marmitaria_telefone_cliente', telefoneLimpo);
                router.push('/pedido/sucesso');
            }

        } catch (error) {
            console.error("💥 Erro 400 - Verifique o terminal do Node.js:", error);
            toast.error("O servidor rejeitou o pedido (Erro 400).");
        }
    };

    if (carrinho.length === 0) {
        if (finalizando) {
            return (
                <main className={styles.containerVazio}>
                    <div className={styles.loader}>Finalizando seu pedido...</div>
                </main>
            );
        }

        return (
            <main className={styles.containerVazio}>
                <h2>Seu carrinho está vazio 😕</h2>
                <button onClick={() => router.push('/pedido')} className={styles.btnVoltar}>
                    Voltar ao Cardápio
                </button>
            </main>
        );
    }

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button className={styles.btnLink} onClick={() => router.back()}>← Continuar Comprando</button>
                <h1>Finalizar Pedido</h1>
            </header>

            <section className={styles.resumo}>
                <h2 className={styles.secaoTitulo}>Sua Escolha</h2>
                {carrinho.map((item, index) => (
                    <div key={item.id_temp} className={styles.itemCarrinho}>
                        <div className={styles.itemInfo}>
                            <span className={styles.itemQuantidade}>{item.quantidade}x</span>
                            <div>
                                <h3>Marmita {item.tamanho.nome}</h3>
                                <p className={styles.itemDetalhes}>
                                    {item.itens.map(i => i.nome).join(', ')}
                                </p>
                            </div>
                        </div>

                        <div className={styles.itemAcoes}>
                            <span className={styles.itemPreco}>
                                R$ {item.subtotal.toFixed(2).replace('.', ',')}
                            </span>
                            <button
                                type="button"
                                onClick={() => removerDoCarrinho(index)}
                                className={styles.btnRemover}
                                title="Remover marmita"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
                <div className={styles.totalBox}>
                    <span>Total do Pedido</span>
                    <strong>R$ {totalGeral.toFixed(2).replace('.', ',')}</strong>
                </div>
            </section>

            <form className={styles.form} onSubmit={finalizarPedido}>
                <h2 className={styles.secaoTitulo}>Entrega e Pagamento</h2>

                <div className={styles.inputGroup}>
                    <label>Seu Nome *</label>
                    <input type="text" name="nome" required value={form.nome} onChange={handleChange} placeholder="Como te chamamos?" />
                </div>

                <div className={styles.inputGroup}>
                    <label>Telefone / WhatsApp *</label>
                    <TelefoneInput
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className={styles.inputCustom}
                        placeholder="(00) 00000-0000"
                        required={true}
                    />
                </div>

                {/* 🚀 5. Campo para selecionar se quer Entrega ou Retirada */}
                <div className={styles.inputGroup}>
                    <label>Como deseja receber? *</label>
                    <select name="metodo_entrega" value={form.metodo_entrega} onChange={handleChange} required>
                        <option value="Entrega">Entrega no meu endereço (Delivery)</option>
                        <option value="Retirada">Vou retirar no balcão</option>
                    </select>
                </div>

                {/* 🚀 6. Os campos de morada só aparecem se for Entrega */}
                {form.metodo_entrega === 'Entrega' && (
                    <div style={{ padding: '15px', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e4e4e7', marginBottom: '1rem' }}>
                        <div className={styles.row}>
                            <div className={styles.inputGroup} style={{ flex: 3 }}>
                                <label>Rua / Avenida *</label>
                                <input type="text" name="logradouro" required={form.metodo_entrega === 'Entrega'} value={form.logradouro} onChange={handleChange} placeholder="Ex: Rua das Flores" />
                            </div>
                            <div className={styles.inputGroup} style={{ flex: 1, minWidth: '80px' }}>
                                <label>Nº *</label>
                                <input type="text" name="numero" required={form.metodo_entrega === 'Entrega'} value={form.numero} onChange={handleChange} placeholder="Ex: 123" />
                            </div>
                        </div>

                        {/* 👇 Aqui adicionamos o marginTop: '12px' para dar o espaçamento correto! */}
                        <div className={styles.inputGroup} style={{ marginTop: '12px', marginBottom: 0 }}>
                            <label>Complemento (Opcional)</label>
                            <input type="text" name="complemento" value={form.complemento} onChange={handleChange} placeholder="Casa, Apto 45, Bloco B..." />
                        </div>
                    </div>
                )}

                <div className={styles.inputGroup}>
                    <label>Forma de Pagamento *</label>
                    <select
                        name="metodo_pagamento_id"
                        value={form.metodo_pagamento_id}
                        onChange={handleChange}
                        disabled={loadingMetodosPagamento}
                        required
                    >
                        <option value="" disabled>
                            {loadingMetodosPagamento ? "Carregando opções..." : "Selecione uma opção..."}
                        </option>

                        {!loadingMetodosPagamento && metodosPagamento.length === 0 && (
                            <option value="" disabled>Nenhum método disponível</option>
                        )}

                        {!loadingMetodosPagamento && metodosPagamento.map((metodo) => (
                            <option key={metodo.id} value={metodo.id}>
                                {metodo.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label>Observações do Pedido (Opcional)</label>
                    <textarea
                        name="observacoes"
                        value={form.observacoes}
                        onChange={handleChange}
                        className={styles.textarea}
                        placeholder="Ex: Tirar cebola, alergia a amendoim, troco para R$ 50..."
                        rows="2"
                    />
                </div>

                <button type="submit" className={styles.btnFinalizar} disabled={enviando || loadingMetodosPagamento}>
                    {loading ? 'Processando...' : 'Confirmar e Enviar Pedido'}
                </button>
            </form>
        </main>
    );
}