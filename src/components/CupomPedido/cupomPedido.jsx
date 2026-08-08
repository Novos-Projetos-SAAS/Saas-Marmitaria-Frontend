

// import React, { forwardRef } from 'react';
// import styles from './cupomPedido.module.css';

// const cupomStyles = {
//     cupom: {
//         width: '58mm',
//         height: 'auto',
//         margin: '0',
//         padding: '1mm 8mm',
//         boxSizing: 'border-box',
//         background: '#ffffff',
//         color: '#000000',
//         fontFamily: 'Arial, Helvetica, sans-serif',
//         fontSize: '13px',
//         fontWeight: 600, 
//         lineHeight: 1.35,
//         wordBreak: 'break-word'
//     },
//     cabecalho: { textAlign: 'center', marginBottom: '8px' },
//     nomeLoja: { margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase' },
//     infoDestaque: { margin: '2px 0', fontSize: '14px', fontWeight: 800 },
//     texto: { margin: '2px 0', fontSize: '13px' },
//     forte: { fontWeight: 800 },
//     divisor: { width: '100%', borderTop: '1px dashed #000000', margin: '8px 0' },
//     tituloSecao: { margin: '6px 0', fontSize: '14px', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase' },
//     itemCaixa: { marginBottom: '10px' },
//     itemTitulo: { display: 'block', fontSize: '14px', fontWeight: 800, marginBottom: '2px' },
//     alimentoLista: { margin: '0', padding: '0', listStyle: 'none' },
//     alimentoItem: { fontSize: '13px', margin: '2px 0' },
//     observacaoItem: { display: 'block', margin: '4px 0 0 0', padding: '4px 6px', border: '1px solid #000000', fontSize: '13px', fontWeight: 800 },
//     produtoDetalhe: { fontSize: '12px', marginTop: '2px' },
//     totalBox: { margin: '8px 0', fontSize: '16px', fontWeight: 800 },
//     trocoBox: { marginTop: '8px', padding: '6px', border: '2px solid #000000', fontSize: '15px', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase' },
//     rodape: { textAlign: 'center', marginTop: '10px', fontSize: '12px' },
//     dataAuditoria: { fontSize: '10px', color: '#333', marginTop: '4px', fontWeight: 'normal' }
// };

// function obterNomeAlimento(alimento) {
//     if (typeof alimento === 'string') return alimento;
//     return alimento?.nome || 'Alimento';
// }

// function moeda(valor) {
//     return Number(valor || 0).toFixed(2).replace('.', ',');
// }

// const CupomPedido = forwardRef(function CupomPedido({ pedido }, ref) {
//     if (!pedido) return null;

//     const marmitas = pedido.marmitas || [];
//     const produtos = pedido.produtos || [];
    
//     // Pega as datas
//     const dataCriacao = new Date(pedido.criado_em);
//     const dataImpressao = new Date();

//     return (
//         <div ref={ref} className={styles.printOnly} style={cupomStyles.cupom}>
            
//             <div style={cupomStyles.cabecalho}>
//                 <h2 style={cupomStyles.nomeLoja}>La Casa da Marmita</h2>
//                 <p style={cupomStyles.infoDestaque}>Pedido #{pedido.id}</p>
//                 <p style={cupomStyles.infoDestaque}>
//                     {pedido.tipo_pedido} - {pedido.metodo_entrega}
//                 </p>
//                 {/* 👇 AJUSTADO: Mais compacto para caber na mesma linha (Data: DD/MM/YYYY - HH:MM) */}
//                 <p style={{ ...cupomStyles.texto, marginTop: '4px' }}>
//                     <span style={cupomStyles.forte}>Data:</span> {dataCriacao.toLocaleDateString('pt-BR')} - {dataCriacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
//                 </p>
//             </div>

//             <div style={cupomStyles.divisor} />

//             <div>
//                 <p style={cupomStyles.texto}>
//                     <span style={cupomStyles.forte}>Cliente:</span> {pedido.nome_cliente}
//                 </p>
//                 <p style={cupomStyles.texto}>
//                     <span style={cupomStyles.forte}>Tel:</span> {pedido.telefone_cliente}
//                 </p>
//                 {pedido.metodo_entrega === 'Entrega' && (
//                     <p style={cupomStyles.texto}>
//                         <span style={cupomStyles.forte}>Endereço:</span> {pedido.endereco_cliente}
//                     </p>
//                 )}
//                 {pedido.observacoes && (
//                     <p style={cupomStyles.texto}>
//                         <span style={cupomStyles.forte}>Obs:</span> {pedido.observacoes}
//                     </p>
//                 )}
//             </div>

//             <div style={cupomStyles.divisor} />

//             <p style={cupomStyles.tituloSecao}>Itens do Pedido</p>
//             <div style={cupomStyles.divisor} />

//             {marmitas.map((marmita) => (
//                 <div key={marmita.id} style={cupomStyles.itemCaixa}>
//                     <span style={cupomStyles.itemTitulo}>
//                         {marmita.quantidade}x Marmita {marmita.tamanho}
//                     </span>
//                     <ul style={cupomStyles.alimentoLista}>
//                         {(marmita.alimentos || []).map((alimento) => (
//                             <li key={alimento?.id || obterNomeAlimento(alimento)} style={cupomStyles.alimentoItem}>
//                                 - {obterNomeAlimento(alimento)}
//                             </li>
//                         ))}
//                     </ul>
//                     {marmita.observacao && (
//                         <div style={cupomStyles.observacaoItem}>
//                             Obs: {marmita.observacao}
//                         </div>
//                     )}
//                 </div>
//             ))}

//             {produtos.length > 0 && (
//                 <>
//                     <div style={cupomStyles.divisor} />
//                     <p style={cupomStyles.tituloSecao}>Complementos</p>
//                     {produtos.map((produto) => (
//                         <div key={produto.id} style={cupomStyles.itemCaixa}>
//                             <span style={cupomStyles.itemTitulo}>
//                                 {produto.quantidade}x {produto.nome}
//                             </span>
//                             <div style={cupomStyles.produtoDetalhe}>
//                                 {produto.categoria_nome} | R$ {moeda(produto.subtotal)}
//                             </div>
//                         </div>
//                     ))}
//                 </>
//             )}

//             <div style={cupomStyles.divisor} />

//             <div>
//                 <p style={cupomStyles.totalBox}>
//                     Total: R$ {moeda(pedido.valor_total)}
//                 </p>
//                 <p style={cupomStyles.texto}>
//                     <span style={cupomStyles.forte}>Pagamento:</span> {pedido.metodo_pagamento_nome || 'A verificar'}
//                 </p>
//                 {pedido.precisa_troco && pedido.troco_para && (
//                     <div style={cupomStyles.trocoBox}>
//                         Levar troco para R$ {moeda(pedido.troco_para)}
//                     </div>
//                 )}
//             </div>

//             <div style={cupomStyles.divisor} />

//             <div style={cupomStyles.rodape}>
//                 <p style={cupomStyles.forte}>Bom Apetite!</p>
//                 <p style={cupomStyles.dataAuditoria}>
//                     Impresso em: {dataImpressao.toLocaleDateString('pt-BR')} {dataImpressao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
//                 </p>
//                 <div style={cupomStyles.divisor} />
//             </div>
            
//         </div>
//     );
// });

// export default CupomPedido;

import React, { forwardRef } from 'react';
import styles from './cupomPedido.module.css';

const cupomStyles = {
    cupom: {
        width: '58mm',
        height: 'auto',
        margin: '0',
        padding: '1mm 6mm',
        boxSizing: 'border-box',
        background: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        fontWeight: 600, 
        lineHeight: 1.35,
        wordBreak: 'break-word'
    },
    cabecalho: { textAlign: 'center', marginBottom: '8px' },
    nomeLoja: { margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800, textTransform: 'uppercase' },
    infoDestaque: { margin: '2px 0', fontSize: '14px', fontWeight: 800 },
    texto: { margin: '2px 0', fontSize: '13px' },
    forte: { fontWeight: 800 },
    divisor: { width: '100%', borderTop: '1px dashed #000000', margin: '8px 0' },
    tituloSecao: { margin: '6px 0', fontSize: '14px', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase' },
    
    // CAIXA DE OBSERVAÇÃO GERAL SUAVIZADA
    observacaoGeralBox: {
        marginTop: '4px',
        fontSize: '12px',
        fontStyle: 'italic'
    },

    itemCaixa: { marginBottom: '10px' },
    itemTitulo: { display: 'block', fontSize: '14px', fontWeight: 800, marginBottom: '2px' },
    alimentoLista: { margin: '0', padding: '0', listStyle: 'none' },
    alimentoItem: { fontSize: '13px', margin: '2px 0' },
    
    // CAIXA DE OBSERVAÇÃO DA MARMITA SUAVIZADA
    observacaoItem: { 
        display: 'block', 
        marginTop: '2px', 
        fontSize: '12px', 
        fontStyle: 'italic'
    },
    
    produtoDetalhe: { fontSize: '12px', marginTop: '2px' },
    totalBox: { margin: '8px 0', fontSize: '16px', fontWeight: 800 },
    trocoBox: { marginTop: '8px', padding: '6px', border: '2px solid #000000', fontSize: '15px', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase' },
    rodape: { textAlign: 'center', marginTop: '10px', fontSize: '12px' },
    dataAuditoria: { fontSize: '10px', color: '#333', marginTop: '4px', fontWeight: 'normal' }
};

function obterNomeAlimento(alimento) {
    if (typeof alimento === 'string') return alimento;
    return alimento?.nome || 'Alimento';
}

function moeda(valor) {
    return Number(valor || 0).toFixed(2).replace('.', ',');
}

const CupomPedido = forwardRef(function CupomPedido({ pedido }, ref) {
    if (!pedido) return null;

    const marmitas = pedido.marmitas || [];
    const produtos = pedido.produtos || [];
    
    // Pega as datas
    const dataCriacao = new Date(pedido.criado_em);
    const dataImpressao = new Date();

    return (
        <div ref={ref} className={styles.printOnly} style={cupomStyles.cupom}>
            
            <div style={cupomStyles.cabecalho}>
                <h2 style={cupomStyles.nomeLoja}>La Casa da Marmita</h2>
                <p style={cupomStyles.infoDestaque}>Pedido #{pedido.id}</p>
                <p style={cupomStyles.infoDestaque}>
                    {pedido.tipo_pedido} - {pedido.metodo_entrega}
                </p>
                <p style={{ ...cupomStyles.texto, marginTop: '4px' }}>
                    <span style={cupomStyles.forte}>Data:</span> {dataCriacao.toLocaleDateString('pt-BR')} - {dataCriacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            <div style={cupomStyles.divisor} />

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
                
                {/* 👇 OBSERVAÇÃO GERAL SUAVE */}
                {pedido.observacoes && (
                    <div style={cupomStyles.observacaoGeralBox}>
                        * Obs do pedido: {pedido.observacoes}
                    </div>
                )}
            </div>

            <div style={cupomStyles.divisor} />

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
                    
                    {/* 👇 OBSERVAÇÃO DA MARMITA SUAVE */}
                    {marmita.observacao && (
                        <div style={cupomStyles.observacaoItem}>
                            * Obs: {marmita.observacao}
                        </div>
                    )}
                </div>
            ))}

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

            <div style={cupomStyles.rodape}>
                <p style={cupomStyles.forte}>Bom Preparo!</p>
                <p style={cupomStyles.dataAuditoria}>
                    Impresso em: {dataImpressao.toLocaleDateString('pt-BR')} {dataImpressao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div style={cupomStyles.divisor} />
            </div>
            
        </div>
    );
});

export default CupomPedido;