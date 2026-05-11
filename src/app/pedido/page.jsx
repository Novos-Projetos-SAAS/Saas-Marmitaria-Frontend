'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useCardapio } from '@/hooks/useCardapio.js';
import { usePedido } from '@/context/PedidoContext';

import styles from './page.module.css';



export default function Pedido() {

    const router = useRouter();

    const { tamanhos, loading, carregarCardapio } = useCardapio();

    const { iniciarNovaMarmita } = usePedido()


    useEffect(() => {
        carregarCardapio()
    }, [])

    const selecionarTamanho = (tamanho) => {
        iniciarNovaMarmita(tamanho)
        router.push('/pedido/montagem');
    }

    if (loading) {
        return <div className={styles.containerCentral}>Carregando cardápio...</div>;
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
        </main>
    );
}