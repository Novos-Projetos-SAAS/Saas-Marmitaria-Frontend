'use client'

import { useState } from "react"

import { useRouter } from "next/navigation"

import { usePedido } from "@/context/PedidoContext.js"

import { useMetodosPagamento } from "@/hooks/useMetodosPagamento.js"
import { usePedidos } from "@/hooks/usePedidos.js"

import { TelefoneInput } from "@/components/InputMask.jsx"

import toast from "react-hot-toast"

import styles from './page.module.css'

export default function Carrinho() {

    const router = useRouter();

    const { carrinho, totalGeral, limparCarrinho, setSucessoPedido } = usePedido();

    const { metodosPagamento, loadingMetodosPagamento } = useMetodosPagamento();

    const { finalizarPedidoNoBanco, enviando } = usePedidos();

    const [loading, setLoading] = useState(false);


    const [form, setForm] = useState({
        nome: '',
        telefone: '',
        // endereco: '',
        logradouro: '',
        numero: '',
        complemento: '',
        metodo_pagamento_id: '',
        tipo_pedido: 'Remoto',
        observacoes: ''
    })

    // useEffect(() => {
    //     if (metodosPagamento.length > 0 && !form.metodo_pagamento_id) {
    //         setForm(prev => ({ ...prev, metodo_pagamento_id: metodosPagamento[0].id }));
    //     }
    // }, [metodosPagamento]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const finalizarPedido = async (e) => {
        e.preventDefault();

        if (enviando) return;

        if (carrinho.length === 0) {
            return toast.error("Seu carrinho está vazio.");
        }

        // Pegamos o ID garantindo que ele não seja undefined
        const pagamentoId = form.metodo_pagamento_id;

        if (!pagamentoId) {
            return toast.error("Por favor, selecione a forma de pagamento.");
        }

        const telefoneLimpo = form.telefone.replace(/\D/g, '');

        // 2. VALIDAÇÃO: Um celular com DDD no Brasil tem exatamente 11 números.
        if (telefoneLimpo.length < 11) {
            return toast.error("Por favor, digite um telefone válido com DDD.");
        }

        try {

            const enderecoFormatado = `${form.logradouro}, ${form.numero} - Centro (${form.complemento || 'Sem complemento'})`;

            // MONTANDO O PAYLOAD EXATO PARA O BACKEND
            const payload = {
                nome_cliente: form.nome,
                telefone_cliente: telefoneLimpo,
                endereco_cliente: enderecoFormatado,
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

                // Depois ativamos a permissão para a tela de sucesso
                setSucessoPedido(true);

                localStorage.setItem('marmitaria_telefone_cliente', telefoneLimpo);

                // Por fim, navegamos
                router.push('/pedido/sucesso');
            }

        } catch (error) {
            console.error("💥 Erro 400 - Verifique o terminal do Node.js:", error);
            toast.error("O servidor rejeitou o pedido (Erro 400).");
        }
    };

    if (carrinho.length === 0) {
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
                {carrinho.map((item) => (
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
                        <span className={styles.itemPreco}>
                            R$ {item.subtotal.toFixed(2).replace('.', ',')}
                        </span>
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
                    <label>Seu Nome</label>
                    <input type="text" name="nome" required value={form.nome} onChange={handleChange} placeholder="Como te chamamos?" />
                </div>

                <div className={styles.inputGroup}>
                    <label>Telefone / WhatsApp</label>
                    <TelefoneInput
                        value={form.telefone}
                        onChange={handleChange}
                        className={styles.inputCustom}
                        placeholder="(00) 00000-0000"
                    />
                </div>

                {/* <div className={styles.inputGroup}>
                    <label>Endereço Completo</label>
                    <textarea name="endereco" required value={form.endereco} onChange={handleChange} placeholder="Rua, número, bairro e referência" />
                </div> */}

                <div className={styles.row}>
                    <div className={styles.inputGroup} style={{ flex: 3 }}>
                        <label>Rua / Avenida</label>
                        <input type="text" name="logradouro" required value={form.logradouro} onChange={handleChange} placeholder="Ex: Rua das Flores" />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: 1, minWidth: '80px' }}>
                        <label>Nº</label>
                        <input type="text" name="numero" required value={form.numero} onChange={handleChange} placeholder="Ex: 123" />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <label>Complemento (Opcional)</label>
                    <input type="text" name="complemento" value={form.complemento} onChange={handleChange} placeholder="Casa, Apto 45, Bloco B..." />
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

                <div className={styles.inputGroup}>
                    <label>Forma de Pagamento</label>
                    <select
                        name="metodo_pagamento_id"
                        value={form.metodo_pagamento_id}
                        onChange={handleChange}
                        disabled={loadingMetodosPagamento} // Trava enquanto carrega do banco
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

                <button type="submit" className={styles.btnFinalizar} disabled={enviando || loadingMetodosPagamento}>
                    {loading ? 'Processando...' : 'Confirmar e Enviar Pedido'}
                </button>
            </form>
        </main>
    );


}