'use client'

import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

import { useCardapioClient } from '@/hooks/useCardapioClient';
import { useLoja } from '@/hooks/useLoja.js';

import { usePedido } from '@/context/PedidoContext.js';

import styles from './page.module.css';

export default function Pedido() {

    const router = useRouter();

    const { statusLoja, loading: loadingLoja } = useLoja();
    const { tamanhos, loading: loadingCardapio } = useCardapioClient();

    const { iniciarNovaMarmita, carrinho, totalGeral } = usePedido();

    const qtdTotalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    useEffect(() => {
        if (!loadingLoja && statusLoja === false) {
            router.replace('/')
        }
    }, [statusLoja, loadingLoja, router]);

    // useEffect(() => {
    //     carregarCardapio()
    // }, [carregarCardapio])

    const selecionarTamanho = (tamanho) => {
        iniciarNovaMarmita(tamanho)
        router.push('/pedido/montagem');
    }

    // Enquanto verifica o status ou o cardápio, exibe um estado neutro
    if (loadingLoja || loadingCardapio) {
        return <div className={styles.containerCentral}>Sincronizando com a cozinha...</div>;
    }

    // Se o status for falso, retorna null para não "piscar" o conteúdo antes do redirecionamento
    if (statusLoja !== true) {
        return null; 
    }

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button className={styles.btnVoltar} onClick={() => router.push('/')}>
                    ← Voltar
                </button>
                <h1>Qual o tamanho da sua fome?</h1>
                <p>Selecione uma opção para começar a montar</p>
            </header>

            <section className={styles.listaTamanhos}>
                {tamanhos.map((t) => (
                    <div
                        key={t.id}
                        className={styles.cardTamanho}
                        onClick={() => selecionarTamanho(t)}
                    >
                        <div className={styles.infoTamanho}>
                            <h2>Marmita {t.nome}</h2>
                            <span className={styles.preco}>
                                A partir de R$ {Number(t.preco_base).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        <div className={styles.iconeSeta}>➔</div>
                    </div>
                ))}
            </section>
            {/* 👇 BARRA FLUTUANTE ADICIONADA AQUI */}
            {carrinho.length > 0 && (
                <div className={styles.barraCarrinho}>
                    <button 
                        className={styles.btnCarrinho}
                        onClick={() => router.push('/carrinho')}
                    >
                        <div className={styles.infoCarrinho}>
                            <span className={styles.qtdBadge}>{qtdTotalItens}</span>
                            <span>Ver carrinho</span>
                        </div>
                        <span className={styles.totalCarrinho}>
                            R$ {totalGeral.toFixed(2).replace('.', ',')}
                        </span>
                    </button>
                </div>
            )}
        </main>
    );
}