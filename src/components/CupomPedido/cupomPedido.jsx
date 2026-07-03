import React from 'react';
import styles from './cupomPedido.module.css';

export default function CupomPedido({ pedido }) {
    // Se não houver pedido selecionado para imprimir, não renderiza nada
    if (!pedido) return null;

    return (
        <div className={styles.printOnly}>
            {/* CABEÇALHO */}
            <div className={styles.cabecalho}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>MARMITARIA DA CRISTINA</h2>
                <p style={{ margin: 0, fontSize: '14px' }}><b>Pedido #{pedido.id}</b></p>
                <p style={{ margin: '5px 0' }}><b>{pedido.tipo_pedido} - {pedido.metodo_entrega}</b></p>
                <div className={styles.divisor}></div>
            </div>

            {/* DADOS DO CLIENTE */}
            <div>
                <p style={{ margin: '3px 0' }}><b>Cliente:</b> {pedido.nome_cliente}</p>
                <p style={{ margin: '3px 0' }}><b>Tel:</b> {pedido.telefone_cliente}</p>

                {pedido.metodo_entrega === 'Entrega' && (
                    <p style={{ margin: '3px 0' }}><b>Endereço:</b> {pedido.endereco_cliente}</p>
                )}

                {pedido.observacoes && (
                    <p style={{ margin: '3px 0', marginTop: '8px' }}>
                        <b>Obs:</b> {pedido.observacoes}
                    </p>
                )}
            </div>

            <div className={styles.divisor}></div>
            <p style={{ margin: '3px 0', textAlign: 'center' }}><b>ITENS PARA PREPARO</b></p>
            <div className={styles.divisor}></div>

            {/* LISTA DE MARMITAS */}
            {/* {pedido.marmitas?.map((marmita, index) => (
                <div key={index} className={styles.itemCaixa}>
                    <b>{marmita.quantidade}x Marmita {marmita.tamanho}</b>
                    <ul className={styles.alimentoLista}>
                        {marmita.alimentos?.map((alimento, i) => (
                            <li key={i}>[ ] {alimento}</li>
                        ))}
                    </ul>
                </div>
            ))} */}

            {pedido.marmitas?.map((marmita, index) => (
                <div key={index} className={styles.itemCaixa}>
                    <b>{marmita.quantidade}x Marmita {marmita.tamanho}</b>
                    <ul className={styles.alimentoLista}>
                        {marmita.alimentos?.map((alimento, i) => (
                            <li key={i}>- {alimento}</li>
                        ))}
                    </ul>
                </div>
            ))}

            <div className={styles.divisor}></div>

            {/* FINANCEIRO */}
            <div>
                <p style={{ margin: '3px 0', fontSize: '14px' }}>
                    <b>Total:</b> R$ {Number(pedido.valor_total).toFixed(2).replace('.', ',')}
                </p>
                <p style={{ margin: '3px 0' }}>
                    <b>Pagamento:</b> {pedido.metodo_pagamento_nome || 'A verificar'}
                </p>
            </div>

            <div className={styles.divisor}></div>

            {/* RODAPÉ */}
            <div className={styles.rodape}>
                <p style={{ margin: '3px 0' }}>Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                <p style={{ margin: '10px 0 0 0' }}><b>Bom preparo!</b></p>
            </div>
        </div>
    );
}