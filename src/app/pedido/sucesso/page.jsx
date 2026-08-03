'use client'

import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

import { usePedido } from '@/context/PedidoContext';

import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

import styles from './page.module.css';

export default function PedidoSucesso() {
    const router = useRouter();
    const { sucessoPedido, setSucessoPedido, setFinalizando } = usePedido();

    // Mantemos o useEffect APENAS para o redirecionamento (efeito colateral real)
    useEffect(() => {
        if (!sucessoPedido) {
            router.replace('/');
        }
    }, [sucessoPedido, router]);

    useEffect(() => {
        setFinalizando(false);
    }, [setFinalizando]);

    // Funções de saída que limpam o estado
    const finalizarEIrPara = (rota) => {
        // 1. Primeiro resetamos a permissão de ver a tela de sucesso
        router.push(rota);
        setTimeout(() => {
            setSucessoPedido(false);
        }, 300);
        // 2. Depois navegamos para onde o usuário quer ir
    };

    // 💡 Em vez de um estado 'podeExibir', apenas checamos a variável do contexto
    if (!sucessoPedido) return null;

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    <CheckCircle size={80} strokeWidth={1.5} className={styles.icon} />
                </div>

                <h1 className={styles.title}>Pedido Confirmado!</h1>
                <p
                    className={
                        styles.message
                    }
                >
                    Seu pedido já está na fila de produção e logo seguirá para entrega ou retirada.
                </p>

                <div className={styles.divider} />

                <div className={styles.actions}>
                    <button
                        onClick={() => finalizarEIrPara('/')}
                        className={styles.btnHome}
                    >
                        <Home size={20} />
                        Voltar para o Início
                    </button>

                    <button
                        onClick={() => finalizarEIrPara('/pedido')}
                        className={styles.btnSecondary}
                    >
                        <ShoppingBag size={20} />
                        Fazer outro Pedido
                    </button>
                </div>
            </div>
        </main>
    );
}