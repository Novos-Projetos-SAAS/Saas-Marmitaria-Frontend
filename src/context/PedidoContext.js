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

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

import { buscarStatusLoja } from '@/services/lojaService.js';

const PedidoContext = createContext();

export function PedidoProvider({ children }) {
    const pathname = usePathname();
    const areaAdministrativa = pathname?.startsWith('/admin') === true;

    const [carrinho, setCarrinho] = useState([]);
    const [produtosCarrinho, setProdutosCarrinho] = useState([]);
    const [marmitaAtual, setMarmitaAtual] = useState({ tamanho: null, itens: [] });
    const [sucessoPedido, setSucessoPedido] = useState(false);
    const [finalizando, setFinalizando] = useState(false);
    const [lojaAbertaPedido, setLojaAbertaPedido] = useState(null);
    const [verificandoLojaPedido, setVerificandoLojaPedido] = useState(true);
    const fechamentoNotificadoRef = useRef(false);
    const pedidoEmAndamentoRef = useRef(false);

    useEffect(() => {
        pedidoEmAndamentoRef.current = carrinho.length > 0 || produtosCarrinho.length > 0 || Boolean(marmitaAtual?.tamanho);
    }, [carrinho.length, produtosCarrinho.length, marmitaAtual]);

    /**
     * Aplica o status confirmado pelo Backend.
     * Quando a loja fecha, qualquer pedido em andamento é descartado.
     */
    const aplicarStatusLojaLocal = useCallback((estaAberta, options = {}) => {
        const { notificarFechamento = true } = options;

        if (typeof estaAberta !== 'boolean') return;

        setLojaAbertaPedido(estaAberta);

        if (estaAberta) {
            fechamentoNotificadoRef.current = false;
            return;
        }

        setCarrinho([]);
        setProdutosCarrinho([]);
        setMarmitaAtual({ tamanho: null, itens: [] });
        setFinalizando(false);

        if (!areaAdministrativa && notificarFechamento && !fechamentoNotificadoRef.current) {
            toast.error(pedidoEmAndamentoRef.current
                ? 'A loja fechou e não está recebendo novos pedidos. O carrinho foi limpo.'
                : 'A loja fechou e não está recebendo novos pedidos.');
        }

        fechamentoNotificadoRef.current = true;
    }, [areaAdministrativa]);

    /**
     * Consulta o status real da loja.
     * Falha de conexão não é tratada como loja fechada.
     */
    const verificarLojaAgora = useCallback(async (options = {}) => {
        const { silencioso = true, notificarFechamento = true } = options;

        try {
            if (!silencioso) setVerificandoLojaPedido(true);

            const statusAtual = await buscarStatusLoja();

            if (typeof statusAtual === 'boolean') {
                aplicarStatusLojaLocal(statusAtual, { notificarFechamento });
            }

            return statusAtual;
        } catch {
            return null;
        } finally {
            if (!silencioso) setVerificandoLojaPedido(false);
        }
    }, [aplicarStatusLojaLocal]);

    /**
     * Validação HTTP utilizada antes das ações críticas do pedido.
     */
    const validarLojaParaAcao = useCallback(async () => {
        const statusAtual = await verificarLojaAgora({ silencioso: true, notificarFechamento: false });

        if (statusAtual === true) return true;

        if (statusAtual === false) {
            toast.error('A loja está fechada no momento e não está recebendo novos pedidos.');
        } else {
            toast.error('Não foi possível confirmar se a loja está aberta. Tente novamente.');
        }

        return false;
    }, [verificarLojaAgora]);

    /**
     * Socket.IO realiza a atualização imediata.
     * O polling de 60 segundos funciona somente como fallback.
     */
    useEffect(() => {
        if (areaAdministrativa) {
            setVerificandoLojaPedido(false);
            return;
        }

        verificarLojaAgora({ silencioso: false, notificarFechamento: false });

        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333').replace(/\/$/, '');
        const socket = io(`${apiUrl}/publico`, { withCredentials: true });

        const handleStatusLojaAlterado = (dados) => {
            aplicarStatusLojaLocal(dados?.esta_aberta, { notificarFechamento: true });
        };

        const handleConnect = () => {
            verificarLojaAgora({ silencioso: true, notificarFechamento: true });
        };

        const handleFocus = () => {
            verificarLojaAgora({ silencioso: true, notificarFechamento: true });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                verificarLojaAgora({ silencioso: true, notificarFechamento: true });
            }
        };

        const handleStatusLocal = (event) => {
            aplicarStatusLojaLocal(event?.detail?.esta_aberta, { notificarFechamento: false });
        };

        socket.on('status_loja_alterado', handleStatusLojaAlterado);
        socket.on('connect', handleConnect);

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                verificarLojaAgora({ silencioso: true, notificarFechamento: true });
            }
        }, 60000);

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('marmitaria:status-loja-alterado', handleStatusLocal);

        return () => {
            socket.off('status_loja_alterado', handleStatusLojaAlterado);
            socket.off('connect', handleConnect);
            socket.disconnect();
            window.clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('marmitaria:status-loja-alterado', handleStatusLocal);
        };
    }, [areaAdministrativa, aplicarStatusLojaLocal, verificarLojaAgora]);

    /**
     * Inicia uma nova marmita somente quando a loja estiver aberta.
     */
    const iniciarNovaMarmita = useCallback((tamanho) => {
        if (lojaAbertaPedido !== true) return false;

        setMarmitaAtual({ tamanho, itens: [] });

        return true;
    }, [lojaAbertaPedido]);

    /**
     * Adiciona ou remove alimentos da marmita em montagem.
     */
    const alternarAlimento = useCallback((alimento, limiteRecebido) => {
        if (lojaAbertaPedido !== true) return;

        const limite = Number(limiteRecebido || alimento.limite_escolhas || 1);
        const jaSelecionado = marmitaAtual.itens.some((item) => Number(item.id) === Number(alimento.id));

        if (jaSelecionado) {
            setMarmitaAtual((anterior) => ({
                ...anterior,
                itens: anterior.itens.filter((item) => Number(item.id) !== Number(alimento.id))
            }));

            return;
        }

        const qtdNestaCategoria = marmitaAtual.itens.filter((item) => item.categoria_nome === alimento.categoria_nome).length;

        if (qtdNestaCategoria >= limite) {
            toast.error(`Limite atingido! A categoria ${alimento.categoria_nome} permite ${limite} opção(ões).`);
            return;
        }

        setMarmitaAtual((anterior) => ({
            ...anterior,
            itens: [...anterior.itens, alimento]
        }));
    }, [lojaAbertaPedido, marmitaAtual.itens]);

    /**
     * Adiciona a marmita atual ao carrinho.
     */
    const adicionarAoCarrinho = useCallback((quantidade = 1, observacao = '') => {
        if (lojaAbertaPedido !== true) return false;

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
            id_temp: crypto.randomUUID(),
            tamanho: marmitaAtual.tamanho,
            itens: marmitaAtual.itens,
            quantidade: quantidadeNormalizada,
            observacao,
            subtotal: Number(marmitaAtual.tamanho.preco_base) * quantidadeNormalizada
        };

        setCarrinho((anterior) => [...anterior, novaMarmita]);
        setMarmitaAtual({ tamanho: null, itens: [] });

        toast.success('Marmita adicionada ao pedido!');

        return true;
    }, [lojaAbertaPedido, marmitaAtual]);

    /**
     * Adiciona produtos complementares ao carrinho.
     */
    const adicionarProdutoAoCarrinho = useCallback((produto) => {
        if (lojaAbertaPedido !== true) return false;

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
    }, [carrinho.length, lojaAbertaPedido]);

    /**
     * Aumenta a quantidade de um produto.
     */
    const incrementarProduto = useCallback((produtoId) => {
        if (lojaAbertaPedido !== true) return;

        setProdutosCarrinho((anterior) => anterior.map((item) => {
            if (Number(item.id) !== Number(produtoId)) return item;

            const quantidade = item.quantidade + 1;

            return {
                ...item,
                quantidade,
                subtotal: Number(item.preco) * quantidade
            };
        }));
    }, [lojaAbertaPedido]);

    /**
     * Diminui a quantidade de um produto.
     */
    const decrementarProduto = useCallback((produtoId) => {
        if (lojaAbertaPedido !== true) return;

        setProdutosCarrinho((anterior) => anterior.map((item) => {
            if (Number(item.id) !== Number(produtoId)) return item;

            const quantidade = item.quantidade - 1;

            if (quantidade <= 0) return null;

            return {
                ...item,
                quantidade,
                subtotal: Number(item.preco) * quantidade
            };
        }).filter(Boolean));
    }, [lojaAbertaPedido]);

    /**
     * Remove completamente um produto do carrinho.
     */
    const removerProdutoDoCarrinho = useCallback((produtoId) => {
        setProdutosCarrinho((anterior) => anterior.filter((item) => Number(item.id) !== Number(produtoId)));
    }, []);

    /**
     * Atualiza produtos que sofreram alguma alteração enquanto permaneciam no carrinho.
     *
     * INDISPONIVEL:
     * remove o produto.
     *
     * PRECO_ALTERADO:
     * mantém o produto e substitui o preço antigo pelo preço atual confirmado pelo Backend.
     */
    const atualizarProdutosAlterados = useCallback((produtosAlterados = []) => {
        if (!Array.isArray(produtosAlterados) || produtosAlterados.length === 0) {
            return { removidos: 0, precosAtualizados: 0 };
        }

        const alteracoesNormalizadas = produtosAlterados.map((alteracao) => ({
            ...alteracao,
            id: Number(alteracao.id),
            tipo: alteracao.tipo === 'PRECO_ALTERADO' ? 'PRECO_ALTERADO' : 'INDISPONIVEL'
        }));

        const alteracoesPorId = new Map(alteracoesNormalizadas.map((alteracao) => [alteracao.id, alteracao]));
        const idsProdutosCarrinho = new Set(produtosCarrinho.map((produto) => Number(produto.id)));
        const removidos = alteracoesNormalizadas.filter((alteracao) => idsProdutosCarrinho.has(alteracao.id) && alteracao.tipo === 'INDISPONIVEL').length;
        const precosAtualizados = alteracoesNormalizadas.filter((alteracao) => idsProdutosCarrinho.has(alteracao.id) && alteracao.tipo === 'PRECO_ALTERADO' && Number.isFinite(Number(alteracao.preco_atual)) && Number(alteracao.preco_atual) >= 0).length;

        setProdutosCarrinho((anterior) => anterior.map((produto) => {
            const alteracao = alteracoesPorId.get(Number(produto.id));

            if (!alteracao) return produto;

            if (alteracao.tipo === 'INDISPONIVEL') {
                return null;
            }

            const precoAtual = Number(alteracao.preco_atual);

            if (!Number.isFinite(precoAtual) || precoAtual < 0) {
                return produto;
            }

            return {
                ...produto,
                preco: precoAtual,
                subtotal: Number((precoAtual * Number(produto.quantidade)).toFixed(2))
            };
        }).filter(Boolean));

        return {
            removidos,
            precosAtualizados
        };
    }, [produtosCarrinho]);

    /**
     * Mantém compatibilidade com o fluxo anterior.
     * Produtos recebidos aqui são tratados como indisponíveis.
     */
    const atualizarProdutosIndisponiveis = useCallback((produtosIndisponiveis = []) => {
        const produtosNormalizados = Array.isArray(produtosIndisponiveis)
            ? produtosIndisponiveis.map((produto) => ({
                ...produto,
                tipo: produto.tipo || 'INDISPONIVEL'
            }))
            : [];

        return atualizarProdutosAlterados(produtosNormalizados);
    }, [atualizarProdutosAlterados]);

    /**
     * Remove uma marmita do carrinho.
     * Se for a última marmita, os complementos também são removidos.
     */
    const removerDoCarrinho = useCallback((indexParaRemover) => {
        const removendoUltimaMarmita = carrinho.length === 1;

        setCarrinho((anterior) => anterior.filter((_, index) => index !== indexParaRemover));

        if (removendoUltimaMarmita && produtosCarrinho.length > 0) {
            setProdutosCarrinho([]);

            toast('Os complementos também foram removidos, pois o pedido precisa ter uma marmita.', {
                icon: 'ℹ️'
            });
        }
    }, [carrinho.length, produtosCarrinho.length]);

    /**
     * Remove somente os alimentos que o Backend confirmou como indisponíveis.
     * Se todos os alimentos forem removidos, exclui também a marmita.
     */
    const atualizarMarmitasIndisponiveis = useCallback((marmitasComProblema = []) => {
        if (!Array.isArray(marmitasComProblema) || marmitasComProblema.length === 0) {
            return { atualizadas: 0, removidas: 0 };
        }

        let atualizadas = 0;
        let removidas = 0;

        const novoCarrinho = carrinho.map((marmita, index) => {
            const conflito = marmitasComProblema.find((item) => item.id_temp ? item.id_temp === marmita.id_temp : Number(item.marmita_index) === index);

            if (!conflito) return marmita;

            const idsIndisponiveis = new Set((conflito.alimentos || []).map((alimento) => Number(alimento.id)));
            const itensAtualizados = marmita.itens.filter((alimento) => !idsIndisponiveis.has(Number(alimento.id)));

            if (itensAtualizados.length === 0) {
                removidas += 1;
                return null;
            }

            if (itensAtualizados.length !== marmita.itens.length) {
                atualizadas += 1;
            }

            return {
                ...marmita,
                itens: itensAtualizados
            };
        }).filter(Boolean);

        setCarrinho(novoCarrinho);

        if (novoCarrinho.length === 0 && produtosCarrinho.length > 0) {
            setProdutosCarrinho([]);
        }

        return {
            atualizadas,
            removidas
        };
    }, [carrinho, produtosCarrinho.length]);

    /**
     * Limpa completamente o pedido.
     */
    const limparCarrinho = useCallback(() => {
        setCarrinho([]);
        setProdutosCarrinho([]);
        setMarmitaAtual({ tamanho: null, itens: [] });
    }, []);

    const totalMarmitas = useMemo(() => {
        return carrinho.reduce((total, item) => total + Number(item.subtotal || 0), 0);
    }, [carrinho]);

    const totalProdutos = useMemo(() => {
        return produtosCarrinho.reduce((total, item) => total + Number(item.subtotal || 0), 0);
    }, [produtosCarrinho]);

    const totalGeral = useMemo(() => {
        return totalMarmitas + totalProdutos;
    }, [totalMarmitas, totalProdutos]);

    const quantidadeTotalItens = useMemo(() => {
        const quantidadeMarmitas = carrinho.reduce((total, item) => total + Number(item.quantidade || 0), 0);
        const quantidadeProdutos = produtosCarrinho.reduce((total, item) => total + Number(item.quantidade || 0), 0);

        return quantidadeMarmitas + quantidadeProdutos;
    }, [carrinho, produtosCarrinho]);

    return (
        <PedidoContext.Provider
            value={{
                carrinho,
                marmitaAtual,
                iniciarNovaMarmita,
                alternarAlimento,
                adicionarAoCarrinho,
                removerDoCarrinho,
                atualizarMarmitasIndisponiveis,
                produtosCarrinho,
                adicionarProdutoAoCarrinho,
                incrementarProduto,
                decrementarProduto,
                removerProdutoDoCarrinho,
                atualizarProdutosAlterados,
                atualizarProdutosIndisponiveis,
                totalMarmitas,
                totalProdutos,
                totalGeral,
                quantidadeTotalItens,
                limparCarrinho,
                sucessoPedido,
                setSucessoPedido,
                finalizando,
                setFinalizando,
                lojaAbertaPedido,
                verificandoLojaPedido,
                verificarLojaAgora,
                validarLojaParaAcao,
                aplicarStatusLojaLocal
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