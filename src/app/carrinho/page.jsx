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

'use client';

import {
    useRouter
} from 'next/navigation';

import {
    useState
} from 'react';

import {
    PackagePlus,
    Trash2
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
    useMetodosPagamento
} from '@/hooks/useMetodosPagamento.js';

import {
    usePedidos
} from '@/hooks/usePedidos.js';

import {
    usePedido
} from '@/context/PedidoContext.js';

import TelefoneInput from '@/components/ui/inputMask/index.jsx';

import styles from './page.module.css';


function formatarMoeda(
    valor
) {

    return Number(
        valor || 0
    ).toLocaleString(
        'pt-BR',
        {

            style:
                'currency',

            currency:
                'BRL'
        }
    );
}


export default function Carrinho() {

    const router =
        useRouter();


    const {

        carrinho,

        produtosCarrinho,

        totalMarmitas,

        totalProdutos,

        totalGeral,

        limparCarrinho,

        setSucessoPedido,

        removerDoCarrinho,

        removerProdutoDoCarrinho,

        finalizando,

        setFinalizando

    } = usePedido();


    const {

        metodosPagamento,

        loadingMetodosPagamento

    } = useMetodosPagamento();


    const {

        finalizarPedidoNoBanco,

        enviando

    } = usePedidos();


    const [
        form,
        setForm
    ] = useState({

        nome:
            '',

        telefone:
            '',

        metodo_entrega:
            'Entrega',

        logradouro:
            '',

        numero:
            '',

        complemento:
            '',

        metodo_pagamento_id:
            '',

        tipo_pedido:
            'Remoto',

        observacoes:
            ''
    });


    const handleChange =
        (
            event
        ) => {

            const {
                name,
                value
            } = event.target;


            setForm(
                (
                    anterior
                ) => {

                    const novoEstado = {

                        ...anterior,

                        [name]:
                            value
                    };


                    /**
                     * Retirada não necessita endereço.
                     */
                    if (
                        name ===
                        'metodo_entrega'

                        &&

                        value ===
                        'Retirada'
                    ) {

                        novoEstado.logradouro =
                            '';

                        novoEstado.numero =
                            '';

                        novoEstado.complemento =
                            '';
                    }


                    return novoEstado;
                }
            );
        };


    /**
     * ============================================================
     * FINALIZAR
     * ============================================================
     */
    const finalizarPedido =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                enviando
            ) {

                return;
            }


            /**
             * REGRA PRINCIPAL.
             *
             * Produtos não contam para esta validação.
             */
            if (
                carrinho.length === 0
            ) {

                return toast.error(
                    'Adicione pelo menos uma marmita com alimentos para finalizar o pedido.'
                );
            }


            if (
                !form
                    .metodo_pagamento_id
            ) {

                return toast.error(
                    'Por favor, selecione a forma de pagamento.'
                );
            }


            const telefoneLimpo =
                String(form.telefone || '')
                    .replace(/\D/g, '');

            if (
                telefoneLimpo.length < 10 ||
                telefoneLimpo.length > 11
            ) {
                return toast.error(
                    'Informe um telefone válido com DDD.'
                );
            }


            let enderecoFormatado =
                null;


            if (
                form.metodo_entrega ===
                'Entrega'
            ) {

                if (
                    !form.logradouro ||
                    !form.numero
                ) {

                    return toast.error(
                        'Para entrega, preencha a Rua/Avenida e o Número.'
                    );
                }


                enderecoFormatado =

                    `${form.logradouro}, ` +

                    `${form.numero} - Centro ` +

                    `(${form.complemento || 'Sem complemento'})`;
            }


            /**
             * =====================================================
             * PAYLOAD
             * =====================================================
             *
             * NÃO enviamos:
             *
             * preco
             * subtotal
             * valor_total
             *
             * Backend é responsável por isso.
             */
            const payload = {

                nome_cliente:
                    form.nome,

                telefone_cliente:
                    telefoneLimpo,

                endereco_cliente:
                    enderecoFormatado,

                metodo_entrega:
                    form.metodo_entrega,

                metodo_pagamento_id:
                    Number(
                        form
                            .metodo_pagamento_id
                    ),

                tipo_pedido:
                    form.tipo_pedido,

                observacoes:
                    form.observacoes,


                /**
                 * Marmitas.
                 */
                marmitas:
                    carrinho.map(
                        (
                            item
                        ) => ({

                            tamanho_id:
                                Number(
                                    item
                                        .tamanho
                                        .id
                                ),

                            quantidade:
                                Number(
                                    item.quantidade
                                ),

                            alimentos:
                                item
                                    .itens
                                    .map(
                                        (
                                            alimento
                                        ) =>
                                            Number(
                                                alimento.id
                                            )
                                    )
                        })
                    ),


                /**
                 * Produtos.
                 */
                produtos:
                    produtosCarrinho.map(
                        (
                            produto
                        ) => ({

                            produto_id:
                                Number(
                                    produto.id
                                ),

                            quantidade:
                                Number(
                                    produto.quantidade
                                )
                        })
                    )
            };


            const resposta =
                await finalizarPedidoNoBanco(
                    payload
                );


            if (
                !resposta
            ) {

                return;
            }


            /**
             * Evita piscar a página vazia durante
             * o redirecionamento.
             */
            setFinalizando(
                true
            );


            limparCarrinho();


            setSucessoPedido(
                true
            );


            localStorage.setItem(
                'marmitaria_telefone_cliente',
                telefoneLimpo
            );


            router.push(
                '/pedido/sucesso'
            );
        };


    /**
     * ============================================================
     * CARRINHO SEM MARMITA
     * ============================================================
     */
    if (
        carrinho.length === 0
    ) {

        if (
            finalizando
        ) {

            return (

                <main
                    className={
                        styles.containerVazio
                    }
                >

                    <div
                        className={
                            styles.loader
                        }
                    >
                        Finalizando seu pedido...
                    </div>

                </main>
            );
        }


        return (

            <main
                className={
                    styles.containerVazio
                }
            >

                <h2>
                    Seu carrinho ainda não possui uma marmita 😕
                </h2>


                <p
                    className={
                        styles.mensagemVazio
                    }
                >
                    Para realizar um pedido, escolha um tamanho e monte
                    pelo menos uma marmita com alimentos.
                </p>


                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            '/pedido'
                        )
                    }
                    className={
                        styles.btnVoltar
                    }
                >
                    Montar Marmita
                </button>

            </main>
        );
    }


    return (

        <main
            className={
                styles.container
            }
        >

            <header
                className={
                    styles.header
                }
            >

                <button
                    type="button"
                    className={
                        styles.btnLink
                    }
                    onClick={() =>
                        router.push(
                            '/pedido'
                        )
                    }
                >
                    ← Continuar Comprando
                </button>


                <h1>
                    Finalizar Pedido
                </h1>

            </header>


            <section
                className={
                    styles.resumo
                }
            >

                {/* =================================================
                    MARMITAS
                   ================================================= */}

                <h2
                    className={
                        styles.secaoTitulo
                    }
                >
                    Marmitas
                </h2>


                {carrinho.map(
                    (
                        item,
                        index
                    ) => (

                        <div
                            key={
                                item.id_temp
                            }
                            className={
                                styles.itemCarrinho
                            }
                        >

                            <div
                                className={
                                    styles.itemInfo
                                }
                            >

                                <span
                                    className={
                                        styles.itemQuantidade
                                    }
                                >
                                    {item.quantidade}x
                                </span>


                                <div>

                                    <h3>
                                        Marmita {item.tamanho.nome}
                                    </h3>


                                    <p
                                        className={
                                            styles.itemDetalhes
                                        }
                                    >

                                        {item
                                            .itens
                                            .map(
                                                (
                                                    alimento
                                                ) =>
                                                    alimento.nome
                                            )
                                            .join(
                                                ', '
                                            )}

                                    </p>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.itemAcoes
                                }
                            >

                                <span
                                    className={
                                        styles.itemPreco
                                    }
                                >
                                    {formatarMoeda(
                                        item.subtotal
                                    )}
                                </span>


                                <button
                                    type="button"
                                    onClick={() =>
                                        removerDoCarrinho(
                                            index
                                        )
                                    }
                                    className={
                                        styles.btnRemover
                                    }
                                    title="Remover marmita"
                                >

                                    <Trash2
                                        size={20}
                                    />

                                </button>

                            </div>

                        </div>
                    )
                )}


                <div
                    className={
                        styles.subtotalLinha
                    }
                >

                    <span>
                        Subtotal das marmitas
                    </span>


                    <strong>
                        {formatarMoeda(
                            totalMarmitas
                        )}
                    </strong>

                </div>


                <div
                    className={
                        styles.divisorSecao
                    }
                />


                {/* =================================================
                    PRODUTOS
                   ================================================= */}

                <div
                    className={
                        styles.cabecalhoComplementos
                    }
                >

                    <h2
                        className={
                            styles.secaoTitulo
                        }
                    >
                        Complementos
                    </h2>


                    <button
                        type="button"
                        className={
                            styles.btnAdicionarComplemento
                        }
                        onClick={() =>
                            router.push(
                                '/pedido/complementos'
                            )
                        }
                    >

                        <PackagePlus
                            size={16}
                        />

                        Adicionar

                    </button>

                </div>


                {produtosCarrinho.length ===
                    0 ? (

                    <p
                        className={
                            styles.semComplementos
                        }
                    >
                        Nenhum complemento adicionado.
                    </p>

                ) : (

                    produtosCarrinho.map(
                        (
                            produto
                        ) => (

                            <div
                                key={
                                    produto.id
                                }
                                className={
                                    styles.itemCarrinho
                                }
                            >

                                <div
                                    className={
                                        styles.itemInfo
                                    }
                                >

                                    <span
                                        className={
                                            styles.itemQuantidade
                                        }
                                    >
                                        {produto.quantidade}x
                                    </span>


                                    <div>

                                        <h3>
                                            {produto.nome}
                                        </h3>


                                        <p
                                            className={
                                                styles.itemDetalhes
                                            }
                                        >

                                            {produto
                                                .categoria_nome ||

                                                'Produto complementar'}

                                        </p>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.itemAcoes
                                    }
                                >

                                    <span
                                        className={
                                            styles.itemPreco
                                        }
                                    >
                                        {formatarMoeda(
                                            produto.subtotal
                                        )}
                                    </span>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            removerProdutoDoCarrinho(
                                                produto.id
                                            )
                                        }
                                        className={
                                            styles.btnRemover
                                        }
                                        title={`Remover ${produto.nome}`}
                                    >

                                        <Trash2
                                            size={20}
                                        />

                                    </button>

                                </div>

                            </div>
                        )
                    )
                )}


                {produtosCarrinho.length >
                    0 && (

                        <div
                            className={
                                styles.subtotalLinha
                            }
                        >

                            <span>
                                Subtotal dos complementos
                            </span>


                            <strong>
                                {formatarMoeda(
                                    totalProdutos
                                )}
                            </strong>

                        </div>
                    )}


                <div
                    className={
                        styles.totalBox
                    }
                >

                    <span>
                        Total do Pedido
                    </span>


                    <strong>
                        {formatarMoeda(
                            totalGeral
                        )}
                    </strong>

                </div>

            </section>


            {/* =====================================================
                CHECKOUT
               ===================================================== */}

            <form
                className={
                    styles.form
                }
                onSubmit={
                    finalizarPedido
                }
            >

                <h2
                    className={
                        styles.secaoTitulo
                    }
                >
                    Entrega e Pagamento
                </h2>


                <div
                    className={
                        styles.inputGroup
                    }
                >

                    <label>
                        Seu Nome *
                    </label>


                    <input
                        type="text"
                        name="nome"
                        required
                        value={
                            form.nome
                        }
                        onChange={
                            handleChange
                        }
                        placeholder="Como te chamamos?"
                    />

                </div>


                <div
                    className={
                        styles.inputGroup
                    }
                >

                    <label>
                        Telefone / WhatsApp *
                    </label>


                    <TelefoneInput
                        name="telefone"
                        value={
                            form.telefone
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            styles.inputCustom
                        }
                        placeholder="(00) 00000-0000"
                        required={
                            true
                        }
                    />

                </div>


                <div
                    className={
                        styles.inputGroup
                    }
                >

                    <label>
                        Como deseja receber? *
                    </label>


                    <select
                        name="metodo_entrega"
                        value={
                            form.metodo_entrega
                        }
                        onChange={
                            handleChange
                        }
                        required
                    >

                        <option value="Entrega">
                            Entrega no meu endereço (Delivery)
                        </option>

                        <option value="Retirada">
                            Vou retirar no balcão
                        </option>

                    </select>

                </div>


                {form.metodo_entrega ===
                    'Entrega' && (

                        <div
                            className={
                                styles.enderecoBox
                            }
                        >

                            <div
                                className={
                                    styles.row
                                }
                            >

                                <div
                                    className={
                                        styles.inputGroup
                                    }
                                    style={{
                                        flex:
                                            3,

                                        minWidth:
                                            0
                                    }}
                                >

                                    <label>
                                        Rua / Avenida *
                                    </label>


                                    <input
                                        type="text"
                                        name="logradouro"
                                        required
                                        value={
                                            form.logradouro
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ex: Rua das Flores"
                                    />

                                </div>


                                <div
                                    className={
                                        styles.inputGroup
                                    }
                                    style={{
                                        flex:
                                            1,

                                        minWidth:
                                            '70px'
                                    }}
                                >

                                    <label>
                                        Nº *
                                    </label>


                                    <input
                                        type="text"
                                        name="numero"
                                        required
                                        value={
                                            form.numero
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ex: 123"
                                    />

                                </div>

                            </div>


                            <div
                                className={
                                    styles.complementoEndereco
                                }
                            >

                                <div
                                    className={
                                        styles.inputGroup
                                    }
                                >

                                    <label>
                                        Complemento (Opcional)
                                    </label>


                                    <input
                                        type="text"
                                        name="complemento"
                                        value={
                                            form.complemento
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Casa, Apto 45, Bloco B..."
                                    />

                                </div>

                            </div>

                        </div>
                    )}


                <div
                    className={
                        styles.inputGroup
                    }
                >

                    <label>
                        Forma de Pagamento *
                    </label>


                    <select
                        name="metodo_pagamento_id"
                        value={
                            form.metodo_pagamento_id
                        }
                        onChange={
                            handleChange
                        }
                        disabled={
                            loadingMetodosPagamento
                        }
                        required
                    >

                        <option
                            value=""
                            disabled
                        >

                            {loadingMetodosPagamento
                                ? 'Carregando opções...'
                                : 'Selecione uma opção...'}

                        </option>


                        {!loadingMetodosPagamento &&
                            metodosPagamento.length ===
                            0 && (

                                <option
                                    value=""
                                    disabled
                                >
                                    Nenhum método disponível
                                </option>
                            )}


                        {!loadingMetodosPagamento &&

                            metodosPagamento.map(
                                (
                                    metodo
                                ) => (

                                    <option
                                        key={
                                            metodo.id
                                        }
                                        value={
                                            metodo.id
                                        }
                                    >
                                        {metodo.nome}
                                    </option>
                                )
                            )}

                    </select>

                </div>


                <div
                    className={
                        styles.inputGroup
                    }
                >

                    <label>
                        Observações do Pedido (Opcional)
                    </label>


                    <textarea
                        name="observacoes"
                        value={
                            form.observacoes
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            styles.textarea
                        }
                        placeholder="Ex: Tirar cebola, troco para R$ 50..."
                        rows="2"
                    />

                </div>


                <button
                    type="submit"
                    className={
                        styles.btnFinalizar
                    }
                    disabled={

                        enviando ||

                        loadingMetodosPagamento
                    }
                >

                    {enviando

                        ? 'Processando...'

                        : `Confirmar Pedido • ${formatarMoeda(
                            totalGeral
                        )}`}

                </button>

            </form>

        </main>
    );
}