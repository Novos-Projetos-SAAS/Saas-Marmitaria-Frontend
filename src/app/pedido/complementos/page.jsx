'use client';

import {
    useEffect
} from 'react';

import {
    useRouter
} from 'next/navigation';

import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingBag,
    Utensils
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
    useLoja
} from '@/hooks/useLoja.js';

import {
    useProdutosCardapio
} from '@/hooks/useProdutosCardapio.js';

import {
    usePedido
} from '@/context/PedidoContext.js';

import styles from './page.module.css';


/**
 * Formatação monetária padrão brasileira.
 */
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


export default function ComplementosPedido() {

    const router =
        useRouter();


    const {

        statusLoja,

        loading:
        loadingLoja

    } = useLoja();


    const {

        categoriasProdutos,

        loading:
        loadingProdutos

    } = useProdutosCardapio();


    const {

        carrinho,

        produtosCarrinho,

        adicionarProdutoAoCarrinho,

        incrementarProduto,

        decrementarProduto,

        totalGeral,

        quantidadeTotalItens

    } = usePedido();


    /**
     * ============================================================
     * PROTEÇÃO DA ROTA
     * ============================================================
     *
     * O cliente não pode abrir:
     *
     * /pedido/complementos
     *
     * diretamente e começar comprando refrigerante.
     */
    useEffect(() => {

        if (
            !loadingLoja &&
            statusLoja === false
        ) {

            router.replace(
                '/'
            );

            return;
        }


        if (
            carrinho.length === 0
        ) {

            toast.error(
                'Monte uma marmita antes de escolher os complementos.'
            );


            router.replace(
                '/pedido'
            );
        }

    }, [
        carrinho.length,
        loadingLoja,
        router,
        statusLoja
    ]);


    if (
        loadingLoja ||
        loadingProdutos
    ) {

        return (

            <main
                className={
                    styles.loadingContainer
                }
            >

                <span>
                    Carregando complementos...
                </span>

            </main>
        );
    }


    if (
        statusLoja !== true ||
        carrinho.length === 0
    ) {

        return null;
    }


    /**
     * Retorna a quantidade daquele produto
     * que já existe no carrinho.
     */
    const quantidadeProduto =
        (
            produtoId
        ) => {

            return (

                produtosCarrinho
                    .find(
                        (
                            item
                        ) =>
                            Number(
                                item.id
                            ) ===
                            Number(
                                produtoId
                            )
                    )
                    ?.quantidade ||

                0
            );
        };


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
                        styles.btnVoltar
                    }
                    onClick={() =>
                        router.push(
                            '/pedido'
                        )
                    }
                >

                    <ArrowLeft
                        size={18}
                    />

                    Voltar

                </button>




                <h1>
                    Quer adicionar algo ao pedido?
                </h1>


                <p>
                    Escolha outros produtos.
                    Você pode pular esta etapa se quiser.
                </p>

            </header>


            {categoriasProdutos.length ===
                0 ? (

                <section
                    className={
                        styles.estadoVazio
                    }
                >

                    <ShoppingBag
                        size={30}
                    />


                    <h2>
                        Nenhum complemento disponível hoje
                    </h2>


                    <p>
                        Sua marmita já está no carrinho e você
                        pode continuar normalmente.
                    </p>

                </section>

            ) : (

                <section
                    className={
                        styles.listaCategorias
                    }
                >

                    {categoriasProdutos.map(
                        (
                            categoria
                        ) => (

                            <div
                                key={
                                    categoria.id
                                }
                                className={
                                    styles.blocoCategoria
                                }
                            >

                                <div
                                    className={
                                        styles.cabecalhoCategoria
                                    }
                                >

                                    <div>

                                        <h2>
                                            {categoria.nome}
                                        </h2>


                                        {categoria.descricao && (

                                            <p>
                                                {categoria.descricao}
                                            </p>
                                        )}

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.listaProdutos
                                    }
                                >

                                    {categoria
                                        .produtos
                                        .map(
                                            (
                                                produto
                                            ) => {

                                                const quantidade =
                                                    quantidadeProduto(
                                                        produto.id
                                                    );


                                                return (

                                                    <article
                                                        key={
                                                            produto.id
                                                        }
                                                        className={
                                                            styles.cardProduto
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.produtoInfo
                                                            }
                                                        >

                                                            <h3>
                                                                {produto.nome}
                                                            </h3>


                                                            {produto.descricao && (

                                                                <p>
                                                                    {produto.descricao}
                                                                </p>
                                                            )}


                                                            <strong>
                                                                {formatarMoeda(
                                                                    produto.preco
                                                                )}
                                                            </strong>

                                                        </div>


                                                        {quantidade ===
                                                            0 ? (

                                                            <button
                                                                type="button"
                                                                className={
                                                                    styles.btnAdicionar
                                                                }
                                                                onClick={() =>
                                                                    adicionarProdutoAoCarrinho({

                                                                        ...produto,

                                                                        categoria_id:
                                                                            categoria.id,

                                                                        categoria_nome:
                                                                            categoria.nome
                                                                    })
                                                                }
                                                            >

                                                                <Plus
                                                                    size={17}
                                                                />

                                                                Adicionar

                                                            </button>

                                                        ) : (

                                                            <div
                                                                className={
                                                                    styles.controleQuantidade
                                                                }
                                                            >

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        decrementarProduto(
                                                                            produto.id
                                                                        )
                                                                    }
                                                                >

                                                                    <Minus
                                                                        size={16}
                                                                    />

                                                                </button>


                                                                <span>
                                                                    {quantidade}
                                                                </span>


                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        incrementarProduto(
                                                                            produto.id
                                                                        )
                                                                    }
                                                                >

                                                                    <Plus
                                                                        size={16}
                                                                    />

                                                                </button>

                                                            </div>
                                                        )}

                                                    </article>
                                                );
                                            }
                                        )}

                                </div>

                            </div>
                        )
                    )}

                </section>
            )}


            <footer
                className={
                    styles.barraFixa
                }
            >

                <div
                    className={
                        styles.conteudoBarra
                    }
                >

                    {/*                     
                    O cliente pode voltar ao começo
                    e montar outra marmita. */}

                    <button
                        type="button"
                        className={
                            styles.btnOutraMarmita
                        }
                        onClick={() =>
                            router.push(
                                '/pedido'
                            )
                        }
                    >

                        <Utensils
                            size={18}
                        />

                        Outra marmita

                    </button>


                    <button
                        type="button"
                        className={
                            styles.btnCarrinho
                        }
                        onClick={() =>
                            router.push(
                                '/carrinho'
                            )
                        }
                    >

                        <span
                            className={
                                styles.carrinhoTexto
                            }
                        >

                            <span
                                className={
                                    styles.badgeQuantidade
                                }
                            >
                                {quantidadeTotalItens}
                            </span>

                            Ir ao carrinho

                        </span>


                        <strong>
                            {formatarMoeda(
                                totalGeral
                            )}
                        </strong>

                    </button>

                </div>

            </footer>

        </main>
    );
}