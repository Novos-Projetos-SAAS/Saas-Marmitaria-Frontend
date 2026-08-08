// import React, { forwardRef } from 'react';

// import styles from './cupomPedido.module.css';

// /**
//  * Os estilos importantes ficam inline para que sejam enviados
//  * junto com o HTML quando o cupom for impresso pelo QZ Tray.
//  */
// const cupomStyles = {
//     cupom: {
//         width: '58mm',
//         height: 'auto',
//         margin: '0',
//         padding: '1mm 8mm',
//         boxSizing: 'border-box',
//         overflow: 'visible',
//         background: '#ffffff',
//         color: '#000000',
//         fontFamily: 'Arial, Helvetica, sans-serif',
//         fontSize: '13px',
//         fontWeight: 600,
//         lineHeight: 1.3,
//         overflowWrap: 'anywhere',
//         wordBreak: 'break-word'
//     },

//     cabecalho: {
//         width: '100%',
//         textAlign: 'center',
//         margin: '0 0 7px 0',
//         padding: '0'
//     },

//     nomeLoja: {
//         margin: '0 0 6px 0',
//         fontFamily: 'Arial, Helvetica, sans-serif',
//         fontSize: '18px',
//         fontWeight: 900,
//         lineHeight: 1.15,
//         textAlign: 'center',
//         textTransform: 'uppercase',
//         letterSpacing: '0.3px'
//     },

//     cabecalhoTexto: {
//         margin: '3px 0',
//         fontSize: '13.5px',
//         fontWeight: 700,
//         lineHeight: 1.25
//     },

//     texto: {
//         margin: '3px 0',
//         fontSize: '13.5px',
//         fontWeight: 600,
//         lineHeight: 1.3,
//         maxWidth: '100%',
//         overflowWrap: 'anywhere',
//         wordBreak: 'break-word'
//     },

//     forte: {
//         fontWeight: 900
//     },

//     divisor: {
//         width: '100%',
//         height: '0',
//         margin: '6px 0',
//         padding: '0',
//         border: '0',
//         borderTop: '2px dashed #000000'
//     },

//     tituloSecao: {
//         margin: '5px 0',
//         fontSize: '14px',
//         fontWeight: 900,
//         lineHeight: 1.25,
//         textAlign: 'center',
//         textTransform: 'uppercase'
//     },

//     itemCaixa: {
//         width: '100%',
//         margin: '0 0 8px 0',
//         padding: '0',
//         pageBreakInside: 'avoid',
//         breakInside: 'avoid',
//         maxWidth: '100%',
//         overflowWrap: 'anywhere',
//         wordBreak: 'break-word'
//     },

//     itemTitulo: {
//         display: 'block',
//         marginBottom: '3px',
//         fontSize: '14px',
//         fontWeight: 900,
//         lineHeight: 1.25
//     },

//     alimentoLista: {
//         margin: '3px 0 0 0',
//         padding: '0',
//         listStyle: 'none'
//     },

//     alimentoItem: {
//         margin: '2px 0',
//         padding: '0',
//         fontSize: '13.5px',
//         fontWeight: 700,
//         lineHeight: 1.25,
//         maxWidth: '100%',
//         overflowWrap: 'anywhere',
//         wordBreak: 'break-word'
//     },

//     observacaoItem: {
//         display: 'block',
//         margin: '5px 0 3px 0',
//         padding: '4px',
//         border: '2px solid #000000',
//         boxSizing: 'border-box',
//         fontSize: '13.5px',
//         fontWeight: 900,
//         lineHeight: 1.25,
//         textTransform: 'uppercase',
//         maxWidth: '100%',
//         overflowWrap: 'anywhere',
//         wordBreak: 'break-word'
//     },

//     produtoDetalhe: {
//         marginTop: '3px',
//         fontSize: '11px',
//         fontWeight: 600,
//         lineHeight: 1.25,
//         overflowWrap: 'anywhere'
//     },

//     totalPedido: {
//         display: 'block',
//         margin: '7px 0 4px 0',
//         fontSize: '16px',
//         fontWeight: 900,
//         lineHeight: 1.2,
//         textAlign: 'left'
//     },

//     rodape: {
//         width: '100%',
//         marginTop: '7px',
//         textAlign: 'center'
//     },

//     rodapeTexto: {
//         margin: '3px 0',
//         fontSize: '12.5px',
//         fontWeight: 700,
//         lineHeight: 1.3
//     }
// };

// function obterNomeAlimento(alimento) {
//     if (typeof alimento === 'string') {
//         return alimento;
//     }

//     return alimento?.nome || 'Alimento';
// }

// function moeda(valor) {
//     return Number(valor || 0).toFixed(2).replace('.', ',');
// }

// const CupomPedido = forwardRef(function CupomPedido({ pedido }, ref) {
//     if (!pedido) {
//         return null;
//     }

//     const marmitas = pedido.marmitas || [];
//     const produtos = pedido.produtos || [];
//     const agora = new Date();

//     return (
//         <div ref={ref} className={styles.printOnly} style={cupomStyles.cupom}>
//             <div className={styles.cabecalho} style={cupomStyles.cabecalho}>
//                 <h2 className={styles.nomeLoja} style={cupomStyles.nomeLoja}>
//                     LA CASA DA MARMITA
//                 </h2>

//                 <p style={cupomStyles.cabecalhoTexto}>
//                     <b style={cupomStyles.forte}>Pedido #{pedido.id}</b>
//                 </p>

//                 <p style={cupomStyles.cabecalhoTexto}>
//                     <b style={cupomStyles.forte}>
//                         {pedido.tipo_pedido} - {pedido.metodo_entrega}
//                     </b>
//                 </p>
//             </div>

//             <div className={styles.divisor} style={cupomStyles.divisor} />

//             <div>
//                 <p style={cupomStyles.texto}>
//                     <b style={cupomStyles.forte}>Cliente:</b> {pedido.nome_cliente}
//                 </p>

//                 <p style={cupomStyles.texto}>
//                     <b style={cupomStyles.forte}>Tel:</b> {pedido.telefone_cliente}
//                 </p>

//                 {pedido.metodo_entrega === 'Entrega' && (
//                     <p style={cupomStyles.texto}>
//                         <b style={cupomStyles.forte}>Endereço:</b> {pedido.endereco_cliente}
//                     </p>
//                 )}

//                 {pedido.observacoes && (
//                     <p style={cupomStyles.texto}>
//                         <b style={cupomStyles.forte}>Obs:</b> {pedido.observacoes}
//                     </p>
//                 )}
//             </div>

//             <div className={styles.divisor} style={cupomStyles.divisor} />

//             <p className={styles.tituloSecao} style={cupomStyles.tituloSecao}>
//                 ITENS DO PEDIDO
//             </p>

//             <div className={styles.divisor} style={cupomStyles.divisor} />

//             {marmitas.map((marmita) => (
//                 <div key={marmita.id} className={styles.itemCaixa} style={cupomStyles.itemCaixa}>
//                     <b style={cupomStyles.itemTitulo}>
//                         {marmita.quantidade}x Marmita {marmita.tamanho}
//                     </b>

//                     <ul className={styles.alimentoLista} style={cupomStyles.alimentoLista}>
//                         {(marmita.alimentos || []).map((alimento) => (
//                             <li
//                                 key={alimento?.id || obterNomeAlimento(alimento)}
//                                 style={cupomStyles.alimentoItem}
//                             >
//                                 - {obterNomeAlimento(alimento)}
//                             </li>
//                         ))}
//                     </ul>

//                     {marmita.observacao && (
//                         <div className={styles.observacaoItem} style={cupomStyles.observacaoItem}>
//                             *** OBS: {marmita.observacao} ***
//                         </div>
//                     )}
//                 </div>
//             ))}

//             {produtos.length > 0 && (
//                 <>
//                     <div className={styles.divisor} style={cupomStyles.divisor} />

//                     <p className={styles.tituloSecao} style={cupomStyles.tituloSecao}>
//                         COMPLEMENTOS
//                     </p>

//                     {produtos.map((produto) => (
//                         <div key={produto.id} className={styles.itemCaixa} style={cupomStyles.itemCaixa}>
//                             <b style={cupomStyles.itemTitulo}>
//                                 {produto.quantidade}x {produto.nome}
//                             </b>

//                             <div style={cupomStyles.produtoDetalhe}>
//                                 {produto.categoria_nome} | R$ {moeda(produto.subtotal)}
//                             </div>
//                         </div>
//                     ))}
//                 </>
//             )}

//             <div className={styles.divisor} style={cupomStyles.divisor} />

//             <div>
//                 <p className={styles.totalPedido} style={cupomStyles.totalPedido}>
//                     TOTAL: R$ {moeda(pedido.valor_total)}
//                 </p>

//                 <p style={cupomStyles.texto}>
//                     <b style={cupomStyles.forte}>Pagamento:</b> {pedido.metodo_pagamento_nome || 'A verificar'}
//                 </p>
//             </div>

//             <div className={styles.divisor} style={cupomStyles.divisor} />

//             <div className={styles.rodape} style={cupomStyles.rodape}>
//                 <p style={cupomStyles.rodapeTexto}>
//                     Emissão: {agora.toLocaleDateString('pt-BR')} às {agora.toLocaleTimeString('pt-BR')}
//                 </p>

//                 <p style={cupomStyles.rodapeTexto}>
//                     <b style={cupomStyles.forte}>Bom preparo!</b>
//                 </p>

//                 <div className={styles.divisor} style={cupomStyles.divisor} />
//             </div>
//         </div>
//     );
// });

// export default CupomPedido;



import React, { forwardRef } from 'react';

import styles from './cupomPedido.module.css';

/**
 * Estilos otimizados para Impressora Térmica 58mm.
 * Usamos fontWeight 600 como base (para queimar bem o papel sem borrar) 
 * e 800 para destaques padronizados.
 */
const cupomStyles = {
    cupom: {
        width: '58mm',
        height: 'auto',
        margin: '0',
        padding: '1mm 8mm',
        boxSizing: 'border-box',
        background: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        fontWeight: 600, // Base mais grossa para térmica
        lineHeight: 1.35,
        wordBreak: 'break-word'
    },

    cabecalho: {
        textAlign: 'center',
        marginBottom: '8px'
    },

    nomeLoja: {
        margin: '0 0 4px 0',
        fontSize: '16px',
        fontWeight: 800,
        textTransform: 'uppercase'
    },

    infoDestaque: {
        margin: '2px 0',
        fontSize: '14px',
        fontWeight: 800
    },

    texto: {
        margin: '2px 0',
        fontSize: '13px'
    },

    forte: {
        fontWeight: 800
    },

    divisor: {
        width: '100%',
        borderTop: '1px dashed #000000',
        margin: '8px 0'
    },

    tituloSecao: {
        margin: '6px 0',
        fontSize: '14px',
        fontWeight: 800,
        textAlign: 'center',
        textTransform: 'uppercase'
    },

    itemCaixa: {
        marginBottom: '10px'
    },

    itemTitulo: {
        display: 'block',
        fontSize: '14px',
        fontWeight: 800,
        marginBottom: '2px'
    },

    alimentoLista: {
        margin: '0',
        padding: '0',
        listStyle: 'none'
    },

    alimentoItem: {
        fontSize: '13px',
        margin: '2px 0'
    },

    observacaoItem: {
        display: 'block',
        margin: '4px 0 0 0',
        padding: '4px 6px',
        border: '1px solid #000000',
        fontSize: '13px',
        fontWeight: 800
    },

    produtoDetalhe: {
        fontSize: '12px',
        marginTop: '2px'
    },

    totalBox: {
        margin: '8px 0',
        fontSize: '16px',
        fontWeight: 800
    },

    trocoBox: {
        marginTop: '8px',
        padding: '6px',
        border: '2px solid #000000',
        fontSize: '15px',
        fontWeight: 800,
        textAlign: 'center',
        textTransform: 'uppercase'
    },

    rodape: {
        textAlign: 'center',
        marginTop: '10px',
        fontSize: '12px'
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
            
            {/* CABEÇALHO */}
            <div style={cupomStyles.cabecalho}>
                <h2 style={cupomStyles.nomeLoja}>La Casa da Marmita</h2>
                <p style={cupomStyles.infoDestaque}>Pedido #{pedido.id}</p>
                <p style={cupomStyles.infoDestaque}>
                    {pedido.tipo_pedido} - {pedido.metodo_entrega}
                </p>
            </div>

            <div style={cupomStyles.divisor} />

            {/* DADOS DO CLIENTE */}
            <div>
                <p style={cupomStyles.texto}>
                    <span style={cupomStyles.forte}>Cliente:</span> {pedido.nome_cliente}
                </p>
                <p style={cupomStyles.texto}>
                    <span style={cupomStyles.forte}>Tel:</span> {pedido.telefone_cliente}
                </p>
                
                {pedido.metodo_entrega === 'Entrega' && (
                    <p style={cupomStyles.texto}>
                        <span style={cupomStyles.forte}>Endereço:</span> {pedido.endereco_cliente}
                    </p>
                )}

                {pedido.observacoes && (
                    <p style={cupomStyles.texto}>
                        <span style={cupomStyles.forte}>Obs:</span> {pedido.observacoes}
                    </p>
                )}
            </div>

            <div style={cupomStyles.divisor} />

            {/* MARMITAS */}
            <p style={cupomStyles.tituloSecao}>Itens do Pedido</p>
            <div style={cupomStyles.divisor} />

            {marmitas.map((marmita) => (
                <div key={marmita.id} style={cupomStyles.itemCaixa}>
                    <span style={cupomStyles.itemTitulo}>
                        {marmita.quantidade}x Marmita {marmita.tamanho}
                    </span>

                    <ul style={cupomStyles.alimentoLista}>
                        {(marmita.alimentos || []).map((alimento) => (
                            <li key={alimento?.id || obterNomeAlimento(alimento)} style={cupomStyles.alimentoItem}>
                                - {obterNomeAlimento(alimento)}
                            </li>
                        ))}
                    </ul>

                    {marmita.observacao && (
                        <div style={cupomStyles.observacaoItem}>
                            Obs: {marmita.observacao}
                        </div>
                    )}
                </div>
            ))}

            {/* COMPLEMENTOS */}
            {produtos.length > 0 && (
                <>
                    <div style={cupomStyles.divisor} />
                    <p style={cupomStyles.tituloSecao}>Complementos</p>
                    
                    {produtos.map((produto) => (
                        <div key={produto.id} style={cupomStyles.itemCaixa}>
                            <span style={cupomStyles.itemTitulo}>
                                {produto.quantidade}x {produto.nome}
                            </span>
                            <div style={cupomStyles.produtoDetalhe}>
                                {produto.categoria_nome} | R$ {moeda(produto.subtotal)}
                            </div>
                        </div>
                    ))}
                </>
            )}

            <div style={cupomStyles.divisor} />

            {/* TOTAIS E PAGAMENTO */}
            <div>
                <p style={cupomStyles.totalBox}>
                    Total: R$ {moeda(pedido.valor_total)}
                </p>

                <p style={cupomStyles.texto}>
                    <span style={cupomStyles.forte}>Pagamento:</span> {pedido.metodo_pagamento_nome || 'A verificar'}
                </p>

                {pedido.precisa_troco && pedido.troco_para && (
                    <div style={cupomStyles.trocoBox}>
                        Levar troco para R$ {moeda(pedido.troco_para)}
                    </div>
                )}
            </div>

            <div style={cupomStyles.divisor} />

            {/* RODAPÉ */}
            <div style={cupomStyles.rodape}>
                <p style={cupomStyles.texto}>
                    Emissão: {agora.toLocaleDateString('pt-BR')} às {agora.toLocaleTimeString('pt-BR')}
                </p>
                <p style={cupomStyles.forte}>Bom Apetite!</p>
            </div>
            
        </div>
    );
});

export default CupomPedido;