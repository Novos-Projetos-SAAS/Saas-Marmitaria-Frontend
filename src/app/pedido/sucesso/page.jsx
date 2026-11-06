'use client'

import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

import { usePedido } from '@/context/PedidoContext';

import { CheckCircle, Clock, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePaymentTracking } from '@/hooks/usePaymentTracking.js';
import { providerUrl } from '@/services/infinitepayService.js';

import styles from './page.module.css';

export default function PedidoSucesso() {
    const router = useRouter();
    const { sucessoPedido, setSucessoPedido, setFinalizando } = usePedido();
    const { loading, online, order, error, refresh } = usePaymentTracking();
    const paid = order?.pagamento_status === 'PAGO';
    const canceled = String(order?.status || '').toLowerCase() === 'cancelado';
    const failed = ['FALHOU', 'CANCELADO'].includes(order?.pagamento_status);
    const checkoutUrl = providerUrl(order?.checkout_url);
    const receiptUrl = providerUrl(order?.receipt_url, 'receipt');

    // Mantemos o useEffect APENAS para o redirecionamento (efeito colateral real)
    useEffect(() => {
        if (!loading && !online && !sucessoPedido) {
            router.replace('/');
        }
    }, [sucessoPedido, loading, online, router]);

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
    if (!loading && !online && !sucessoPedido) return null;

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    {loading || (online && !paid) ? <Clock size={80} strokeWidth={1.5} className={styles.pending} aria-hidden="true" /> : <CheckCircle size={80} strokeWidth={1.5} className={styles.icon} aria-hidden="true" />}
                </div>

                <h1 className={styles.title} aria-live="polite">{loading ? 'Consultando pagamento…' : online
                    ? error ? 'Consulta indisponível' : paid && canceled ? 'Pagamento recebido, pedido cancelado' : paid ? 'Pagamento confirmado!' : failed ? 'Pagamento não concluído' : 'Aguardando pagamento'
                    : 'Pedido Confirmado!'}</h1>
                <p
                    className={
                        styles.message
                    }
                >
                    {loading ? 'Conferindo a situação registrada pela marmitaria.' : online
                        ? error || (paid && canceled ? 'A InfinitePay confirmou o pagamento, mas o pedido está cancelado. Entre em contato com a marmitaria para resolver o atendimento.'
                            : paid ? 'Pagamento confirmado pela InfinitePay. Seu pedido foi liberado para a cozinha.'
                            : failed ? 'Entre em contato com a marmitaria para consultar este pedido.'
                            : 'O pedido será liberado para a cozinha após a confirmação do pagamento. Se você já pagou, atualize a verificação.')
                        : 'Seu pedido já está na fila de produção e logo seguirá para entrega ou retirada.'}
                </p>

                {online && order?.pedido_id && <p>Pedido #{order.pedido_id}</p>}
                {online && <div className={styles.actions}>
                    <button type="button" onClick={refresh} disabled={loading} className={styles.btnSecondary}>{loading ? 'Consultando…' : 'Atualizar verificação'}</button>
                    {!error && !paid && !failed && checkoutUrl && <a href={checkoutUrl} className={styles.btnHome} referrerPolicy="no-referrer">Abrir pagamento existente</a>}
                    {!error && paid && receiptUrl && <a href={receiptUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={styles.btnSecondary}>Ver comprovante</a>}
                </div>}
                <div className={styles.divider} />

                <div className={styles.actions}>
                    <Link href="/" className={styles.btnHome}>
                        <Home size={20} />
                        Voltar para o Início
                    </Link>

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
