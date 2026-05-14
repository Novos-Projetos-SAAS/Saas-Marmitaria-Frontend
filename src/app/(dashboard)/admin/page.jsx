// src/app/admin/page.js
'use client'

import styles from './page.module.css';
import { Package, ChefHat, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Resumo do Dia</h1>
                    <p>Acompanhe o movimento da sua cozinha hoje.</p>
                </div>
            </header>

            {/* 👇 Cartões de resumo (Mocks temporários) */}
            <div className={styles.gridCards}>
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                        <Package size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <span>Pedidos Hoje</span>
                        <strong>14</strong>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ backgroundColor: '#fef08a', color: '#854d0e' }}>
                        <ChefHat size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <span>Em Preparo</span>
                        <strong>5</strong>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.cardInfo}>
                        <span>Faturamento</span>
                        <strong>R$ 485,50</strong>
                    </div>
                </div>
            </div>

            <section className={styles.content}>
                {/* Aqui entrarão os gráficos ou a lista de últimos pedidos no futuro */}
                <div className={styles.placeholderBox}>
                    <TrendingUp size={48} color="#ccc" />
                    <p>Os gráficos e listagens aparecerão aqui</p>
                </div>
            </section>
        </main>
    );
}