'use client';

import { useRouter } from 'next/navigation';

import { useLoja } from '@/hooks/useLoja';

import { usePedido } from '@/context/PedidoContext.js';

import styles from './page.module.css';

export default function Home() {

    const { statusLoja, loading } = useLoja();

    const { carrinho, totalGeral } = usePedido();

    const router = useRouter();

    // console.log("Status da loja no Home:", statusLoja);

    if (loading) {
        return (
            <main className={styles.mainContainer}>
                <div className={styles.appCard} style={{ textAlign: 'center', color: '#e65100' }}>
                    <h2>Carregando...</h2>
                </div>
            </main>
        );
    }

    const quantidadeTotalItens = carrinho.reduce((acc, item) =>
        acc + item.quantidade, 0
    )

    return (
        <main className={styles.mainContainer}>
            <div className={styles.appCard}>

                <header className={styles.header}>
                    <div className={styles.logoBox}>🍲</div>

                    <div className={`${styles.statusBadge} ${statusLoja ? styles.aberto : styles.fechado}`}>
                        <span className={styles.bolaPulsante}></span>
                        {statusLoja ? 'Estamos Abertos!' : 'Fechado no momento'}
                    </div>

                    <h1 className={styles.titulo}>Marmitaria Delivery</h1>
                    <p className={styles.subtitulo}>Comida caseira com gostinho de roça</p>
                </header>

                <section className={styles.actionArea}>
                    {statusLoja ? (
                        <button
                            className={styles.btnPrimary}
                            onClick={() => router.push('/pedido')}
                        >
                            Fazer Pedido 🚀
                        </button>
                    ) : (
                        <div className={styles.boxFechado}>
                            <p><strong>Poxa, já encerramos hoje!</strong></p>
                            <p>Nosso horário de entrega é das 10h às 14h.</p>
                        </div>
                    )}

                    <button
                        className={styles.btnSecondary}
                        onClick={() => router.push('/acompanhar')}
                    >
                        Consultar Pedido 📋
                    </button>
                </section>

            </div>

            {/* 👇 BARRA FLUTUANTE DO CARRINHO */}
            {carrinho.length > 0 && (
                <div className={styles.barraCarrinho}>
                    <button
                        className={styles.btnCarrinho}
                        onClick={() => router.push('/carrinho')}
                    >
                        <div className={styles.infoCarrinho}>
                            <span className={styles.qtdBadge}>{quantidadeTotalItens}</span>
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