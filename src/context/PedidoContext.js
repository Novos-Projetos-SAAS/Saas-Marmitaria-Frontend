// 'use client';

// import {
//     createContext,
//     useCallback,
//     useContext,
//     useMemo,
//     useState
// } from 'react';

// import toast from 'react-hot-toast';


// const PedidoContext = createContext();


// export function PedidoProvider({
//     children
// }) {

//     /**
//      * ============================================================
//      * MARMITAS
//      * ============================================================
//      *
//      * Mantemos "carrinho" exclusivamente para marmitas.
//      *
//      * Isso preserva compatibilidade com o restante do projeto.
//      */
//     const [
//         carrinho,
//         setCarrinho
//     ] = useState([]);


//     /**
//      * ============================================================
//      * PRODUTOS
//      * ============================================================
//      *
//      * Produtos vendidos separadamente:
//      *
//      * - bebidas;
//      * - sobremesas;
//      * - porções;
//      * - adicionais.
//      */
//     const [
//         produtosCarrinho,
//         setProdutosCarrinho
//     ] = useState([]);


//     /**
//      * Marmita que o cliente está montando neste momento.
//      */
//     const [
//         marmitaAtual,
//         setMarmitaAtual
//     ] = useState({

//         tamanho:
//             null,

//         itens:
//             []
//     });


//     const [
//         sucessoPedido,
//         setSucessoPedido
//     ] = useState(false);


//     const [
//         finalizando,
//         setFinalizando
//     ] = useState(false);


//     /**
//      * ============================================================
//      * INICIAR MARMITA
//      * ============================================================
//      */
//     const iniciarNovaMarmita =
//         useCallback(
//             (
//                 tamanho
//             ) => {

//                 setMarmitaAtual({

//                     tamanho,

//                     itens:
//                         []
//                 });

//             },
//             []
//         );


//     /**
//      * ============================================================
//      * SELEÇÃO DOS ALIMENTOS
//      * ============================================================
//      *
//      * Mantém a regra atual de limite por categoria.
//      */
//     const alternarAlimento =
//         useCallback(
//             (
//                 alimento,
//                 limiteRecebido
//             ) => {

//                 const limite =

//                     limiteRecebido ||

//                     alimento
//                         .limite_escolhas ||

//                     1;


//                 setMarmitaAtual(
//                     (
//                         anterior
//                     ) => {

//                         const jaSelecionado =
//                             anterior
//                                 .itens
//                                 .some(
//                                     (
//                                         item
//                                     ) =>
//                                         item.id ===
//                                         alimento.id
//                                 );


//                         /**
//                          * Se já estiver selecionado,
//                          * apenas remove.
//                          */
//                         if (
//                             jaSelecionado
//                         ) {

//                             return {

//                                 ...anterior,

//                                 itens:
//                                     anterior
//                                         .itens
//                                         .filter(
//                                             (
//                                                 item
//                                             ) =>
//                                                 item.id !==
//                                                 alimento.id
//                                         )
//                             };
//                         }


//                         /**
//                          * Quantidade já selecionada
//                          * dentro da categoria.
//                          */
//                         const qtdNestaCategoria =
//                             anterior
//                                 .itens
//                                 .filter(
//                                     (
//                                         item
//                                     ) =>
//                                         item
//                                             .categoria_nome ===
//                                         alimento
//                                             .categoria_nome
//                                 )
//                                 .length;


//                         if (
//                             qtdNestaCategoria >=
//                             limite
//                         ) {

//                             setTimeout(
//                                 () => {

//                                     toast.error(

//                                         `Limite atingido! A categoria ` +

//                                         `${alimento.categoria_nome} ` +

//                                         `permite ${limite} opção(ões).`
//                                     );

//                                 },
//                                 10
//                             );


//                             return anterior;
//                         }


//                         return {

//                             ...anterior,

//                             itens: [

//                                 ...anterior.itens,

//                                 alimento
//                             ]
//                         };
//                     }
//                 );
//             },
//             []
//         );


//     /**
//      * ============================================================
//      * ADICIONAR MARMITA AO CARRINHO
//      * ============================================================
//      */
//     const adicionarAoCarrinho =
//         useCallback(
//             (
//                 quantidade = 1
//             ) => {

//                 const quantidadeNormalizada =
//                     Number(
//                         quantidade
//                     );


//                 if (
//                     !marmitaAtual.tamanho ||

//                     marmitaAtual
//                         .itens
//                         .length === 0
//                 ) {

//                     toast.error(
//                         'Selecione os itens da sua marmita.'
//                     );

//                     return false;
//                 }


//                 if (
//                     !Number.isInteger(
//                         quantidadeNormalizada
//                     ) ||

//                     quantidadeNormalizada <=
//                     0
//                 ) {

//                     toast.error(
//                         'Informe uma quantidade válida.'
//                     );

//                     return false;
//                 }


//                 const novaMarmita = {

//                     /**
//                      * ID apenas temporário do Frontend.
//                      */
//                     id_temp:
//                         crypto.randomUUID(),

//                     tamanho:
//                         marmitaAtual.tamanho,

//                     itens:
//                         marmitaAtual.itens,

//                     quantidade:
//                         quantidadeNormalizada,

//                     subtotal:

//                         Number(
//                             marmitaAtual
//                                 .tamanho
//                                 .preco_base
//                         )

//                         *

//                         quantidadeNormalizada
//                 };


//                 setCarrinho(
//                     (
//                         anterior
//                     ) => [

//                         ...anterior,

//                         novaMarmita
//                     ]
//                 );


//                 /**
//                  * Limpa a marmita que estava
//                  * sendo montada.
//                  */
//                 setMarmitaAtual({

//                     tamanho:
//                         null,

//                     itens:
//                         []
//                 });


//                 toast.success(
//                     'Marmita adicionada ao pedido!'
//                 );


//                 return true;

//             },
//             [
//                 marmitaAtual
//             ]
//         );


//     /**
//      * ============================================================
//      * ADICIONAR PRODUTO
//      * ============================================================
//      *
//      * Produto somente pode ser adicionado quando já existir
//      * pelo menos uma marmita.
//      *
//      * O Backend também protege essa regra.
//      */
//     const adicionarProdutoAoCarrinho =
//         useCallback(
//             (
//                 produto
//             ) => {

//                 if (
//                     carrinho.length === 0
//                 ) {

//                     toast.error(
//                         'Monte pelo menos uma marmita antes de adicionar complementos.'
//                     );

//                     return false;
//                 }


//                 if (
//                     !produto?.id
//                 ) {

//                     toast.error(
//                         'Produto inválido.'
//                     );

//                     return false;
//                 }


//                 setProdutosCarrinho(
//                     (
//                         anterior
//                     ) => {

//                         /**
//                          * Verifica se o mesmo produto
//                          * já está no carrinho.
//                          */
//                         const existente =
//                             anterior.find(
//                                 (
//                                     item
//                                 ) =>
//                                     Number(
//                                         item.id
//                                     ) ===
//                                     Number(
//                                         produto.id
//                                     )
//                             );


//                         /**
//                          * Se já existe, aumenta quantidade.
//                          */
//                         if (
//                             existente
//                         ) {

//                             return anterior.map(
//                                 (
//                                     item
//                                 ) => {

//                                     if (
//                                         Number(
//                                             item.id
//                                         ) !==
//                                         Number(
//                                             produto.id
//                                         )
//                                     ) {

//                                         return item;
//                                     }


//                                     const novaQuantidade =
//                                         item.quantidade +
//                                         1;


//                                     return {

//                                         ...item,

//                                         quantidade:
//                                             novaQuantidade,

//                                         subtotal:

//                                             Number(
//                                                 item.preco
//                                             )

//                                             *

//                                             novaQuantidade
//                                     };
//                                 }
//                             );
//                         }


//                         /**
//                          * Primeiro produto dessa espécie.
//                          */
//                         return [

//                             ...anterior,

//                             {

//                                 id:
//                                     Number(
//                                         produto.id
//                                     ),

//                                 nome:
//                                     produto.nome,

//                                 descricao:
//                                     produto.descricao ||
//                                     null,

//                                 categoria_id:

//                                     produto.categoria_id ||

//                                     produto
//                                         .categoria_produto_id ||

//                                     null,

//                                 categoria_nome:
//                                     produto
//                                         .categoria_nome ||
//                                     null,

//                                 preco:
//                                     Number(
//                                         produto.preco
//                                     ),

//                                 quantidade:
//                                     1,

//                                 subtotal:
//                                     Number(
//                                         produto.preco
//                                     )
//                             }
//                         ];
//                     }
//                 );


//                 return true;

//             },
//             [
//                 carrinho.length
//             ]
//         );


//     /**
//      * ============================================================
//      * AUMENTAR PRODUTO
//      * ============================================================
//      */
//     const incrementarProduto =
//         useCallback(
//             (
//                 produtoId
//             ) => {

//                 setProdutosCarrinho(
//                     (
//                         anterior
//                     ) =>

//                         anterior.map(
//                             (
//                                 item
//                             ) => {

//                                 if (
//                                     Number(
//                                         item.id
//                                     ) !==
//                                     Number(
//                                         produtoId
//                                     )
//                                 ) {

//                                     return item;
//                                 }


//                                 const quantidade =
//                                     item.quantidade +
//                                     1;


//                                 return {

//                                     ...item,

//                                     quantidade,

//                                     subtotal:

//                                         Number(
//                                             item.preco
//                                         )

//                                         *

//                                         quantidade
//                                 };
//                             }
//                         )
//                 );

//             },
//             []
//         );


//     /**
//      * ============================================================
//      * DIMINUIR PRODUTO
//      * ============================================================
//      *
//      * Quando chegar em zero, remove.
//      */
//     const decrementarProduto =
//         useCallback(
//             (
//                 produtoId
//             ) => {

//                 setProdutosCarrinho(
//                     (
//                         anterior
//                     ) =>

//                         anterior
//                             .map(
//                                 (
//                                     item
//                                 ) => {

//                                     if (
//                                         Number(
//                                             item.id
//                                         ) !==
//                                         Number(
//                                             produtoId
//                                         )
//                                     ) {

//                                         return item;
//                                     }


//                                     const quantidade =
//                                         item.quantidade -
//                                         1;


//                                     if (
//                                         quantidade <=
//                                         0
//                                     ) {

//                                         return null;
//                                     }


//                                     return {

//                                         ...item,

//                                         quantidade,

//                                         subtotal:

//                                             Number(
//                                                 item.preco
//                                             )

//                                             *

//                                             quantidade
//                                     };
//                                 }
//                             )

//                             .filter(
//                                 Boolean
//                             )
//                 );

//             },
//             []
//         );


//     /**
//      * Remove completamente um produto.
//      */
//     const removerProdutoDoCarrinho =
//         useCallback(
//             (
//                 produtoId
//             ) => {

//                 setProdutosCarrinho(
//                     (
//                         anterior
//                     ) =>

//                         anterior.filter(
//                             (
//                                 item
//                             ) =>
//                                 Number(
//                                     item.id
//                                 ) !==
//                                 Number(
//                                     produtoId
//                                 )
//                         )
//                 );

//             },
//             []
//         );


//     /**
//      * ============================================================
//      * REMOVER MARMITA
//      * ============================================================
//      *
//      * REGRA IMPORTANTE:
//      *
//      * Se o cliente remover a última marmita,
//      * produtos complementares também precisam ser removidos.
//      *
//      * Isso impede termos:
//      *
//      * Coca-Cola
//      * Água
//      *
//      * sem nenhuma marmita.
//      */
//     const removerDoCarrinho =
//         useCallback(
//             (
//                 indexParaRemover
//             ) => {

//                 const removendoUltimaMarmita =
//                     carrinho.length ===
//                     1;


//                 setCarrinho(
//                     (
//                         anterior
//                     ) =>

//                         anterior.filter(
//                             (
//                                 _,
//                                 index
//                             ) =>
//                                 index !==
//                                 indexParaRemover
//                         )
//                 );


//                 if (
//                     removendoUltimaMarmita &&

//                     produtosCarrinho.length >
//                     0
//                 ) {

//                     setProdutosCarrinho(
//                         []
//                     );


//                     toast(
//                         'Os complementos também foram removidos, pois o pedido precisa ter uma marmita.',
//                         {
//                             icon:
//                                 'ℹ️'
//                         }
//                     );
//                 }

//             },
//             [
//                 carrinho.length,
//                 produtosCarrinho.length
//             ]
//         );


//     /**
//      * ============================================================
//      * LIMPAR PEDIDO
//      * ============================================================
//      *
//      * Agora limparCarrinho não controla mais "finalizando".
//      *
//      * Isso corrige o problema antigo em que o estado
//      * poderia permanecer true depois de um pedido.
//      */
//     const limparCarrinho =
//         useCallback(
//             () => {

//                 setCarrinho(
//                     []
//                 );


//                 setProdutosCarrinho(
//                     []
//                 );


//                 setMarmitaAtual({

//                     tamanho:
//                         null,

//                     itens:
//                         []
//                 });

//             },
//             []
//         );


//     /**
//      * ============================================================
//      * SUBTOTAL DAS MARMITAS
//      * ============================================================
//      */
//     const totalMarmitas =
//         useMemo(
//             () => {

//                 return carrinho.reduce(
//                     (
//                         total,
//                         item
//                     ) =>

//                         total +

//                         Number(
//                             item.subtotal ||
//                             0
//                         ),

//                     0
//                 );

//             },
//             [
//                 carrinho
//             ]
//         );


//     /**
//      * ============================================================
//      * SUBTOTAL DOS PRODUTOS
//      * ============================================================
//      */
//     const totalProdutos =
//         useMemo(
//             () => {

//                 return produtosCarrinho.reduce(
//                     (
//                         total,
//                         item
//                     ) =>

//                         total +

//                         Number(
//                             item.subtotal ||
//                             0
//                         ),

//                     0
//                 );

//             },
//             [
//                 produtosCarrinho
//             ]
//         );


//     /**
//      * ============================================================
//      * TOTAL VISUAL
//      * ============================================================
//      *
//      * Este total é apenas para exibição.
//      *
//      * O Backend continuará recalculando tudo
//      * no momento da compra.
//      */
//     const totalGeral =
//         useMemo(
//             () =>

//                 totalMarmitas +

//                 totalProdutos,

//             [
//                 totalMarmitas,
//                 totalProdutos
//             ]
//         );


//     /**
//      * Quantidade utilizada no badge do carrinho.
//      *
//      * Ex:
//      *
//      * 2 marmitas
//      * 3 refrigerantes
//      *
//      * badge = 5
//      */
//     const quantidadeTotalItens =
//         useMemo(
//             () => {

//                 const quantidadeMarmitas =
//                     carrinho.reduce(
//                         (
//                             total,
//                             item
//                         ) =>

//                             total +

//                             Number(
//                                 item.quantidade ||
//                                 0
//                             ),

//                         0
//                     );


//                 const quantidadeProdutos =
//                     produtosCarrinho.reduce(
//                         (
//                             total,
//                             item
//                         ) =>

//                             total +

//                             Number(
//                                 item.quantidade ||
//                                 0
//                             ),

//                         0
//                     );


//                 return (

//                     quantidadeMarmitas +

//                     quantidadeProdutos
//                 );

//             },
//             [
//                 carrinho,
//                 produtosCarrinho
//             ]
//         );


//     return (

//         <PedidoContext.Provider
//             value={{

//                 // Marmitas
//                 carrinho,

//                 marmitaAtual,

//                 iniciarNovaMarmita,

//                 alternarAlimento,

//                 adicionarAoCarrinho,

//                 removerDoCarrinho,


//                 // Produtos
//                 produtosCarrinho,

//                 adicionarProdutoAoCarrinho,

//                 incrementarProduto,

//                 decrementarProduto,

//                 removerProdutoDoCarrinho,


//                 // Totais
//                 totalMarmitas,

//                 totalProdutos,

//                 totalGeral,

//                 quantidadeTotalItens,


//                 // Fluxo
//                 limparCarrinho,

//                 sucessoPedido,

//                 setSucessoPedido,

//                 finalizando,

//                 setFinalizando
//             }}
//         >

//             {children}

//         </PedidoContext.Provider>
//     );
// }


// export const usePedido = () => {

//     const context =
//         useContext(
//             PedidoContext
//         );


//     if (!context) {

//         throw new Error(
//             'usePedido deve ser usado dentro de um PedidoProvider'
//         );
//     }


//     return context;
// };

'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const PedidoContext = createContext();

export function PedidoProvider({ children }) {
    /**
     * ============================================================
     * MARMITAS
     * ============================================================
     * Mantemos "carrinho" exclusivamente para marmitas.
     * Isso preserva compatibilidade com o restante do projeto.
     */
    const [carrinho, setCarrinho] = useState([]);

    /**
     * ============================================================
     * PRODUTOS
     * ============================================================
     * Produtos vendidos separadamente: bebidas, sobremesas, porções.
     */
    const [produtosCarrinho, setProdutosCarrinho] = useState([]);

    /**
     * Marmita que o cliente está montando neste momento.
     */
    const [marmitaAtual, setMarmitaAtual] = useState({
        tamanho: null,
        itens: []
    });

    const [sucessoPedido, setSucessoPedido] = useState(false);
    const [finalizando, setFinalizando] = useState(false);

    /**
     * ============================================================
     * INICIAR MARMITA
     * ============================================================
     */
    const iniciarNovaMarmita = useCallback((tamanho) => {
        setMarmitaAtual({
            tamanho,
            itens: []
        });
    }, []);

    /**
     * ============================================================
     * SELEÇÃO DOS ALIMENTOS
     * ============================================================
     * Mantém a regra atual de limite por categoria.
     */
    const alternarAlimento = useCallback((alimento, limiteRecebido) => {
        const limite = limiteRecebido || alimento.limite_escolhas || 1;

        setMarmitaAtual((anterior) => {
            const jaSelecionado = anterior.itens.some((item) => item.id === alimento.id);

            // Se já estiver selecionado, apenas remove.
            if (jaSelecionado) {
                return {
                    ...anterior,
                    itens: anterior.itens.filter((item) => item.id !== alimento.id)
                };
            }

            // Quantidade já selecionada dentro da categoria.
            const qtdNestaCategoria = anterior.itens.filter(
                (item) => item.categoria_nome === alimento.categoria_nome
            ).length;

            if (qtdNestaCategoria >= limite) {
                setTimeout(() => {
                    toast.error(`Limite atingido! A categoria ${alimento.categoria_nome} permite ${limite} opção(ões).`);
                }, 10);
                return anterior;
            }

            return {
                ...anterior,
                itens: [...anterior.itens, alimento]
            };
        });
    }, []);

    /**
     * ============================================================
     * ADICIONAR MARMITA AO CARRINHO
     * ============================================================
     * Agora recebe a observação enviada pelo Modal!
     */
    const adicionarAoCarrinho = useCallback((quantidade = 1, observacao = '') => {
        const quantidadeNormalizada = Number(quantidade);

        if (!marmitaAtual.tamanho || marmitaAtual.itens.length === 0) {
            toast.error('Selecione os itens da sua marmita.');
            return false;
        }

        if (!Number.isInteger(quantidadeNormalizada) || quantidadeNormalizada <= 0) {
            toast.error('Informe uma quantidade válida.');
            return false;
        }

        const novaMarmita = {
            id_temp: crypto.randomUUID(), // ID temporário do Frontend
            tamanho: marmitaAtual.tamanho,
            itens: marmitaAtual.itens,
            quantidade: quantidadeNormalizada,
            observacao, // <-- Adicionamos a observação no carrinho
            subtotal: Number(marmitaAtual.tamanho.preco_base) * quantidadeNormalizada
        };

        setCarrinho((anterior) => [...anterior, novaMarmita]);

        // Limpa a marmita que estava sendo montada.
        setMarmitaAtual({
            tamanho: null,
            itens: []
        });

        toast.success('Marmita adicionada ao pedido!');
        return true;

    }, [marmitaAtual]);

    /**
     * ============================================================
     * ADICIONAR PRODUTO
     * ============================================================
     * Produto somente pode ser adicionado quando já existir pelo menos uma marmita.
     */
    const adicionarProdutoAoCarrinho = useCallback((produto) => {
        if (carrinho.length === 0) {
            toast.error('Monte pelo menos uma marmita antes de adicionar complementos.');
            return false;
        }

        if (!produto?.id) {
            toast.error('Produto inválido.');
            return false;
        }

        setProdutosCarrinho((anterior) => {
            const existente = anterior.find((item) => Number(item.id) === Number(produto.id));

            if (existente) {
                return anterior.map((item) => {
                    if (Number(item.id) !== Number(produto.id)) return item;
                    
                    const novaQuantidade = item.quantidade + 1;
                    return {
                        ...item,
                        quantidade: novaQuantidade,
                        subtotal: Number(item.preco) * novaQuantidade
                    };
                });
            }

            return [
                ...anterior,
                {
                    id: Number(produto.id),
                    nome: produto.nome,
                    descricao: produto.descricao || null,
                    categoria_id: produto.categoria_id || produto.categoria_produto_id || null,
                    categoria_nome: produto.categoria_nome || null,
                    preco: Number(produto.preco),
                    quantidade: 1,
                    subtotal: Number(produto.preco)
                }
            ];
        });

        return true;
    }, [carrinho.length]);

    /**
     * ============================================================
     * AUMENTAR PRODUTO
     * ============================================================
     */
    const incrementarProduto = useCallback((produtoId) => {
        setProdutosCarrinho((anterior) =>
            anterior.map((item) => {
                if (Number(item.id) !== Number(produtoId)) return item;
                
                const quantidade = item.quantidade + 1;
                return {
                    ...item,
                    quantidade,
                    subtotal: Number(item.preco) * quantidade
                };
            })
        );
    }, []);

    /**
     * ============================================================
     * DIMINUIR PRODUTO
     * ============================================================
     */
    const decrementarProduto = useCallback((produtoId) => {
        setProdutosCarrinho((anterior) =>
            anterior.map((item) => {
                if (Number(item.id) !== Number(produtoId)) return item;

                const quantidade = item.quantidade - 1;
                if (quantidade <= 0) return null;

                return {
                    ...item,
                    quantidade,
                    subtotal: Number(item.preco) * quantidade
                };
            }).filter(Boolean)
        );
    }, []);

    /**
     * Remove completamente um produto.
     */
    const removerProdutoDoCarrinho = useCallback((produtoId) => {
        setProdutosCarrinho((anterior) =>
            anterior.filter((item) => Number(item.id) !== Number(produtoId))
        );
    }, []);

    /**
     * ============================================================
     * REMOVER MARMITA
     * ============================================================
     * Se o cliente remover a última marmita, produtos complementares 
     * também precisam ser removidos.
     */
    const removerDoCarrinho = useCallback((indexParaRemover) => {
        const removendoUltimaMarmita = carrinho.length === 1;

        setCarrinho((anterior) =>
            anterior.filter((_, index) => index !== indexParaRemover)
        );

        if (removendoUltimaMarmita && produtosCarrinho.length > 0) {
            setProdutosCarrinho([]);
            toast('Os complementos também foram removidos, pois o pedido precisa ter uma marmita.', {
                icon: 'ℹ️'
            });
        }
    }, [carrinho.length, produtosCarrinho.length]);

    /**
     * ============================================================
     * LIMPAR PEDIDO
     * ============================================================
     */
    const limparCarrinho = useCallback(() => {
        setCarrinho([]);
        setProdutosCarrinho([]);
        setMarmitaAtual({
            tamanho: null,
            itens: []
        });
    }, []);

    /**
     * ============================================================
     * SUBTOTAL DAS MARMITAS
     * ============================================================
     */
    const totalMarmitas = useMemo(() => {
        return carrinho.reduce((total, item) => total + Number(item.subtotal || 0), 0);
    }, [carrinho]);

    /**
     * ============================================================
     * SUBTOTAL DOS PRODUTOS
     * ============================================================
     */
    const totalProdutos = useMemo(() => {
        return produtosCarrinho.reduce((total, item) => total + Number(item.subtotal || 0), 0);
    }, [produtosCarrinho]);

    /**
     * ============================================================
     * TOTAL VISUAL
     * ============================================================
     */
    const totalGeral = useMemo(() => totalMarmitas + totalProdutos, [totalMarmitas, totalProdutos]);

    /**
     * Quantidade utilizada no badge do carrinho.
     */
    const quantidadeTotalItens = useMemo(() => {
        const quantidadeMarmitas = carrinho.reduce((total, item) => total + Number(item.quantidade || 0), 0);
        const quantidadeProdutos = produtosCarrinho.reduce((total, item) => total + Number(item.quantidade || 0), 0);
        
        return quantidadeMarmitas + quantidadeProdutos;
    }, [carrinho, produtosCarrinho]);

    return (
        <PedidoContext.Provider
            value={{
                // Marmitas
                carrinho,
                marmitaAtual,
                iniciarNovaMarmita,
                alternarAlimento,
                adicionarAoCarrinho,
                removerDoCarrinho,

                // Produtos
                produtosCarrinho,
                adicionarProdutoAoCarrinho,
                incrementarProduto,
                decrementarProduto,
                removerProdutoDoCarrinho,

                // Totais
                totalMarmitas,
                totalProdutos,
                totalGeral,
                quantidadeTotalItens,

                // Fluxo
                limparCarrinho,
                sucessoPedido,
                setSucessoPedido,
                finalizando,
                setFinalizando
            }}
        >
            {children}
        </PedidoContext.Provider>
    );
}

export const usePedido = () => {
    const context = useContext(PedidoContext);
    if (!context) {
        throw new Error('usePedido deve ser usado dentro de um PedidoProvider');
    }
    return context;
};