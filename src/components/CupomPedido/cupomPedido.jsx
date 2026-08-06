import React from 'react';

import styles from './cupomPedido.module.css';


/**
 * Os alimentos podem chegar como:
 *
 * "Arroz"
 *
 * ou
 *
 * {
 *   id: 1,
 *   nome: "Arroz"
 * }
 */
function obterNomeAlimento(
    alimento
) {

    if (typeof alimento === 'string') {
        return alimento;
    }


    return (
        alimento?.nome ||
        'Alimento'
    );
}


function moeda(
    valor
) {

    return Number(valor || 0)
        .toFixed(2)
        .replace(
            '.',
            ','
        );
}


export default function CupomPedido({
    pedido
}) {

    if (!pedido) {
        return null;
    }


    const marmitas =
        pedido.marmitas ||
        [];


    const produtos =
        pedido.produtos ||
        [];


    return (

        <div
            className={
                styles.printOnly
            }
        >

            {/* =================================================
                CABEÇALHO
               ================================================= */}

            <div className={styles.cabecalho}>

                <h2 className={styles.nomeLoja}>
                    LA CASA DA MARMITA
                    {/* CRIE UM JEITO DE TRAZER O NOME DA LOJA */}
                </h2>


                <p>
                    <b>
                        Pedido #{pedido.id}
                    </b>
                </p>


                <p>
                    <b>
                        {pedido.tipo_pedido}
                        {' - '}
                        {pedido.metodo_entrega}
                    </b>
                </p>

            </div>


            <div
                className={
                    styles.divisor
                }
            />


            {/* =================================================
                CLIENTE
               ================================================= */}

            <div>

                <p>
                    <b>Cliente:</b>{' '}
                    {pedido.nome_cliente}
                </p>


                <p>
                    <b>Tel:</b>{' '}
                    {pedido.telefone_cliente}
                </p>


                {pedido.metodo_entrega ===
                    'Entrega' && (

                        <p>

                            <b>
                                Endereço:
                            </b>{' '}

                            {pedido.endereco_cliente}

                        </p>
                    )}


                {pedido.observacoes && (

                    <p>

                        <b>
                            Obs:
                        </b>{' '}

                        {pedido.observacoes}

                    </p>
                )}

            </div>


            <div
                className={
                    styles.divisor
                }
            />


            <p className={styles.tituloSecao}>
                ITENS DO PEDIDO
            </p>


            <div
                className={
                    styles.divisor
                }
            />


            {/* =================================================
                MARMITAS
               ================================================= */}

            {marmitas.map(
                marmita => (

                    <div
                        key={marmita.id}
                        className={styles.itemCaixa}
                    >

                        <b>
                            {marmita.quantidade}x{' '}
                            Marmita {marmita.tamanho}
                        </b>


                        <ul className={styles.alimentoLista}>

                            {(marmita.alimentos || []).map(
                                alimento => (

                                    <li
                                        key={
                                            alimento?.id ||
                                            obterNomeAlimento(alimento)
                                        }
                                    >
                                        - {obterNomeAlimento(
                                            alimento
                                        )}
                                    </li>
                                )
                            )}

                        </ul>


                        {marmita.observacao && (

                            <div
                                className={
                                    styles.observacaoItem
                                }
                            >

                                *** OBS: {
                                    marmita.observacao
                                } ***

                            </div>
                        )}

                    </div>
                )
            )}


            {/* =================================================
                PRODUTOS
               ================================================= */}

            {produtos.length > 0 && (

                <>

                    <div
                        className={
                            styles.divisor
                        }
                    />


                    <p className={styles.tituloSecao}>
                        COMPLEMENTOS
                    </p>


                    {produtos.map(
                        produto => (

                            <div
                                key={
                                    produto.id
                                }
                                className={
                                    styles.itemCaixa
                                }
                            >

                                <b>

                                    {produto.quantidade}x{' '}

                                    {produto.nome}

                                </b>


                                <div
                                    style={{
                                        fontSize:
                                            '11px',

                                        marginTop:
                                            '3px'
                                    }}
                                >

                                    {produto.categoria_nome}

                                    {' | '}

                                    R$ {moeda(
                                        produto.subtotal
                                    )}

                                </div>

                            </div>
                        )
                    )}

                </>
            )}


            <div
                className={
                    styles.divisor
                }
            />


            {/* =================================================
                FINANCEIRO
               ================================================= */}

            <div>

                <p className={styles.totalPedido}>
                    TOTAL: R$ {moeda(
                        pedido.valor_total
                    )}
                </p>


                <p>

                    <b>Pagamento:</b>{' '}

                    {pedido.metodo_pagamento_nome ||
                        'A verificar'}

                </p>

            </div>


            <div
                className={
                    styles.divisor
                }
            />


            <div
                className={
                    styles.rodape
                }
            >

                <p>

                    Emissão:{' '}

                    {new Date()
                        .toLocaleDateString(
                            'pt-BR'
                        )}

                    {' às '}

                    {new Date()
                        .toLocaleTimeString(
                            'pt-BR'
                        )}

                </p>


                <p>
                    <b>Bom preparo!</b>
                </p>
                <div
                    className={
                        styles.divisor
                    }
                />

            </div>

        </div>
    );
}