'use client'

import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

import { usePedido } from '@/context/PedidoContext';

import { CheckCircle, Clock, Home, ShoppingBag, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePaymentTracking } from '@/hooks/usePaymentTracking.js';
import { paymentPresentation, checkoutDestination } from '@/services/checkoutFlow.mjs';
import { requestCheckout, startAnotherOrder } from '@/services/checkoutService.js';

import styles from './page.module.css';

export default function PedidoSucesso() {
    const router = useRouter();
    const { setSucessoPedido, setFinalizando } = usePedido();
    const { loading, order, error, refresh } = usePaymentTracking();
    const presentation = paymentPresentation(order, error);

    useEffect(() => {
        setFinalizando(false);
    }, [setFinalizando]);

    const finalizarEIrPara = async (rota) => {
        if (rota === '/pedido') {
            try { await startAnotherOrder(); }
            catch { toast.error('Consulte a marmitaria antes de iniciar outro pedido.'); return; }
        }
        router.push(rota);
        setTimeout(() => {
            setSucessoPedido(false);
        }, 300);
        // 2. Depois navegamos para onde o usuário quer ir
    };

    async function abrirPagamento() {
        try {
            const session = await requestCheckout('sessao', {});
            const result = await requestCheckout('retomar', { client_request_id: order.client_request_id }, session.csrf_token);
            if (result.checkout_url) window.location.assign(checkoutDestination(result)); else refresh();
        } catch { toast.error('Não foi possível recuperar o link. Nenhuma nova cobrança foi solicitada.'); refresh(); }
    }

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}>
                    {order?.cozinha_liberada ? <CheckCircle size={80} strokeWidth={1.5} className={styles.icon} /> : <Clock size={80} strokeWidth={1.5} className={styles.pending} />}
                </div>

                <h1 className={styles.title} aria-live="polite">{loading ? 'Consultando pedido...' : presentation.title}</h1>
                <p
                    className={
                        styles.message
                    }
                >
                    {loading ? 'Conferindo o estado registrado pela marmitaria.' : presentation.message}
                </p>
                {order?.pedido_id && <p>Pedido #{order.pedido_id}</p>}
                {order?.checkout_url && !error && order.pagamento_status === 'AGUARDANDO' && <button type="button" onClick={abrirPagamento} className={styles.btnHome}>Abrir pagamento existente</button>}
                {order?.receipt_url && !error && order.cozinha_liberada && <a href={order.receipt_url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={styles.btnSecondary}>Ver comprovante</a>}

                <div className={styles.divider} />

                <div className={styles.actions}>
                    <button type="button" onClick={refresh} className={styles.btnSecondary}><RefreshCw size={20} /> Atualizar verificação</button>
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
