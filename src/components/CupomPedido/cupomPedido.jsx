import React, { forwardRef } from 'react';

import styles from './cupomPedido.module.css';

/**
 * Os estilos importantes ficam inline para que sejam enviados
 * junto com o HTML quando o cupom for impresso pelo QZ Tray.
 */
const cupomStyles = {
    cupom: {
        width: '58mm',
        height: 'auto',
        margin: '0',
        padding: '1mm 8mm',
        boxSizing: 'border-box',
        overflow: 'visible',
        background: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: 1.3,
        overflowWrap: 'anywhere',
        wordBreak: 'break-word'
    },

    cabecalho: {
        width: '100%',
        textAlign: 'center',
        margin: '0 0 7px 0',
        padding: '0'
    },

    nomeLoja: {
        margin: '0 0 6px 0',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        fontWeight: 900,
        lineHeight: 1.15,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.3px'
    },

    cabecalhoTexto: {
        margin: '3px 0',
        fontSize: '13.5px',
        fontWeight: 700,
        lineHeight: 1.25
    },

    texto: {
        margin: '3px 0',
        fontSize: '13.5px',
        fontWeight: 600,
        lineHeight: 1.3,
        maxWidth: '100%',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word'
    },

    forte: {
        fontWeight: 900
    },

    divisor: {
        width: '100%',
        height: '0',
        margin: '6px 0',
        padding: '0',
        border: '0',
        borderTop: '2px dashed #000000'
    },

    tituloSecao: {
        margin: '5px 0',
        fontSize: '14px',
        fontWeight: 900,
        lineHeight: 1.25,
        textAlign: 'center',
        textTransform: 'uppercase'
    },

    itemCaixa: {
        width: '100%',
        margin: '0 0 8px 0',
        padding: '0',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        maxWidth: '100%',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word'
    },

    itemTitulo: {
        display: 'block',
        marginBottom: '3px',
        fontSize: '14px',
        fontWeight: 900,
        lineHeight: 1.25
    },

    alimentoLista: {
        margin: '3px 0 0 0',
        padding: '0',
        listStyle: 'none'
    },

    alimentoItem: {
        margin: '2px 0',
        padding: '0',
        fontSize: '13.5px',
        fontWeight: 700,
        lineHeight: 1.25,
        maxWidth: '100%',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word'
    },

    observacaoItem: {
        display: 'block',
        margin: '5px 0 3px 0',
        padding: '4px',
        border: '2px solid #000000',
        boxSizing: 'border-box',
        fontSize: '13.5px',
        fontWeight: 900,
        lineHeight: 1.25,
        textTransform: 'uppercase',
        maxWidth: '100%',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word'
    },

    produtoDetalhe: {
        marginTop: '3px',
        fontSize: '11px',
        fontWeight: 600,
        lineHeight: 1.25,
        overflowWrap: 'anywhere'
    },

    totalPedido: {
        display: 'block',
        margin: '7px 0 4px 0',
        fontSize: '16px',
        fontWeight: 900,
        lineHeight: 1.2,
        textAlign: 'left'
    },

    rodape: {
        width: '100%',
        marginTop: '7px',
        textAlign: 'center'
    },

    rodapeTexto: {
        margin: '3px 0',
        fontSize: '12.5px',
        fontWeight: 700,
        lineHeight: 1.3
    }
};

function obterNomeAlimento(alimento) {
    if (typeof alimento === 'string') {
        return alimento;
    }

    return alimento?.nome || 'Alimento';
}

function moeda(valor) {
    return Number(valor || 0).toFixed(2).replace('.', ',');
}

const CupomPedido = forwardRef(function CupomPedido({ pedido }, ref) {
    if (!pedido) {
        return null;
    }

    const marmitas = pedido.marmitas || [];
    const produtos = pedido.produtos || [];
    const agora = new Date();

    return (
        <div ref={ref} className={styles.printOnly} style={cupomStyles.cupom}>
            <div className={styles.cabecalho} style={cupomStyles.cabecalho}>
                <h2 className={styles.nomeLoja} style={cupomStyles.nomeLoja}>
                    LA CASA DA MARMITA
                </h2>

                <p style={cupomStyles.cabecalhoTexto}>
                    <b style={cupomStyles.forte}>Pedido #{pedido.id}</b>
                </p>

                <p style={cupomStyles.cabecalhoTexto}>
                    <b style={cupomStyles.forte}>
                        {pedido.tipo_pedido} - {pedido.metodo_entrega}
                    </b>
                </p>
            </div>

            <div className={styles.divisor} style={cupomStyles.divisor} />

            <div>
                <p style={cupomStyles.texto}>
                    <b style={cupomStyles.forte}>Cliente:</b> {pedido.nome_cliente}
                </p>

                <p style={cupomStyles.texto}>
                    <b style={cupomStyles.forte}>Tel:</b> {pedido.telefone_cliente}
                </p>

                {pedido.metodo_entrega === 'Entrega' && (
                    <p style={cupomStyles.texto}>
                        <b style={cupomStyles.forte}>Endereço:</b> {pedido.endereco_cliente}
                    </p>
                )}

                {pedido.observacoes && (
                    <p style={cupomStyles.texto}>
                        <b style={cupomStyles.forte}>Obs:</b> {pedido.observacoes}
                    </p>
                )}
            </div>

            <div className={styles.divisor} style={cupomStyles.divisor} />

            <p className={styles.tituloSecao} style={cupomStyles.tituloSecao}>
                ITENS DO PEDIDO
            </p>

            <div className={styles.divisor} style={cupomStyles.divisor} />

            {marmitas.map((marmita) => (
                <div key={marmita.id} className={styles.itemCaixa} style={cupomStyles.itemCaixa}>
                    <b style={cupomStyles.itemTitulo}>
                        {marmita.quantidade}x Marmita {marmita.tamanho}
                    </b>

                    <ul className={styles.alimentoLista} style={cupomStyles.alimentoLista}>
                        {(marmita.alimentos || []).map((alimento) => (
                            <li
                                key={alimento?.id || obterNomeAlimento(alimento)}
                                style={cupomStyles.alimentoItem}
                            >
                                - {obterNomeAlimento(alimento)}
                            </li>
                        ))}
                    </ul>

                    {marmita.observacao && (
                        <div className={styles.observacaoItem} style={cupomStyles.observacaoItem}>
                            *** OBS: {marmita.observacao} ***
                        </div>
                    )}
                </div>
            ))}

            {produtos.length > 0 && (
                <>
                    <div className={styles.divisor} style={cupomStyles.divisor} />

                    <p className={styles.tituloSecao} style={cupomStyles.tituloSecao}>
                        COMPLEMENTOS
                    </p>

                    {produtos.map((produto) => (
                        <div key={produto.id} className={styles.itemCaixa} style={cupomStyles.itemCaixa}>
                            <b style={cupomStyles.itemTitulo}>
                                {produto.quantidade}x {produto.nome}
                            </b>

                            <div style={cupomStyles.produtoDetalhe}>
                                {produto.categoria_nome} | R$ {moeda(produto.subtotal)}
                            </div>
                        </div>
                    ))}
                </>
            )}

            <div className={styles.divisor} style={cupomStyles.divisor} />

            <div>
                <p className={styles.totalPedido} style={cupomStyles.totalPedido}>
                    TOTAL: R$ {moeda(pedido.valor_total)}
                </p>

                <p style={cupomStyles.texto}>
                    <b style={cupomStyles.forte}>Pagamento:</b> {pedido.metodo_pagamento_nome || 'A verificar'}
                </p>
            </div>

            <div className={styles.divisor} style={cupomStyles.divisor} />

            <div className={styles.rodape} style={cupomStyles.rodape}>
                <p style={cupomStyles.rodapeTexto}>
                    Emissão: {agora.toLocaleDateString('pt-BR')} às {agora.toLocaleTimeString('pt-BR')}
                </p>

                <p style={cupomStyles.rodapeTexto}>
                    <b style={cupomStyles.forte}>Bom preparo!</b>
                </p>

                <div className={styles.divisor} style={cupomStyles.divisor} />
            </div>
        </div>
    );
});

export default CupomPedido;