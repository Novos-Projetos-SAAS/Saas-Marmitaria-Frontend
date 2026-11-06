'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { createCheckout, forgetPayment, providerUrl, savedPayments, savePayment } from '@/services/infinitepayService.js';

export function useCheckout() {
    const lock = useRef(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');
    async function checkout(payload) {
        if (lock.current) return null;
        lock.current = true; setEnviando(true); setError('');
        let attempt;
        try {
            const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
            const signature = Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('');
            attempt = savedPayments().find(item => item.pending);
            if (!attempt) {
                attempt = { token: crypto.randomUUID(), pending: true, signature };
                savePayment(attempt);
            }
            const order = await createCheckout(payload, attempt.token);
            savePayment({ ...attempt, pedido_id: order.pedido_id, order_nsu: order.order_nsu, pending: false });
            return { status: 'success', data: order, preserveCart: attempt.signature !== signature,
                destination: providerUrl(order.checkout_url) || `/pedido/sucesso?pedido=${encodeURIComponent(order.pedido_id)}` };
        } catch (failure) {
            const result = failure.result;
            if (['ALIMENTOS_INDISPONIVEIS', 'MARMITAS_ESPECIAIS_ALTERADAS', 'PRODUTOS_INDISPONIVEIS', 'PRODUTOS_ALTERADOS', 'LOJA_FECHADA'].includes(result?.code)) {
                forgetPayment(attempt.token);
                return result;
            }
            if (failure.status && [400, 403, 422].includes(failure.status)) {
                if (attempt) forgetPayment(attempt.token);
                setError(failure.message);
            } else {
                setError('Não foi possível concluir a consulta. Seu carrinho foi preservado. Tente confirmar novamente para recuperar a mesma tentativa de pagamento.');
            }
            toast.error('Confira a mensagem do pagamento antes de tentar novamente.');
            return null;
        } finally { lock.current = false; setEnviando(false); }
    }
    return { checkout, enviando, error };
}
