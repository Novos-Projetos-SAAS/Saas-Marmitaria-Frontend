'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { criarPedido } from '@/services/pedidosService.js';
import { forgetPayment, providerUrl, savedPayments, savePayment } from '@/services/infinitepayService.js';

export function useCheckout() {
    const lock = useRef(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    async function checkout(payload) {
        if (lock.current) return null;
        lock.current = true;
        setEnviando(true);
        setError('');
        let attempt;
        try {
            const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
            const signature = Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('');
            attempt = savedPayments().find(item => item.pending);
            if (!attempt) {
                attempt = { token: crypto.randomUUID(), pending: true, signature };
                savePayment(attempt);
            }

            const result = await criarPedido({ ...payload, client_request_id: attempt.token });
            const order = result?.data;
            if (result?.status !== 'success' || !order?.pedido_id) throw new Error('Resposta de pedido inválida.');

            const recovered = order.reused === true && attempt.signature !== signature;
            if (order.fluxo_pagamento === 'POSTERIOR') {
                forgetPayment(attempt.token);
                toast.success('Pedido registrado com sucesso!');
                return { ...result, preserveCart: recovered, destination: '/pedido/sucesso?tradicional=1' };
            }
            if (order.fluxo_pagamento !== 'INFINITEPAY') throw new Error('Fluxo de pagamento inválido.');

            const awaiting = order.pagamento_status === 'PENDENTE';
            const url = awaiting ? providerUrl(order.checkout_url) : null;
            const missingLink = awaiting && !url;
            savePayment({ ...attempt, signature: recovered ? attempt.signature : signature,
                pedido_id: order.pedido_id, order_nsu: order.order_nsu, pending: missingLink });
            if (missingLink) {
                setError(order.checkout_error || 'O link de pagamento ainda não está disponível. Consulte o pedido ou tente novamente.');
            }
            return { ...result, preserveCart: recovered || missingLink,
                destination: url || '/pedido/sucesso?pedido=' + encodeURIComponent(order.pedido_id) };
        } catch (failure) {
            const result = failure.response?.data;
            const status = failure.response?.status;
            if (['ALIMENTOS_INDISPONIVEIS', 'MARMITAS_ESPECIAIS_ALTERADAS', 'PRODUTOS_INDISPONIVEIS', 'PRODUTOS_ALTERADOS', 'LOJA_FECHADA'].includes(result?.code)) {
                if (attempt) forgetPayment(attempt.token);
                return result;
            }
            if ([400, 403, 422].includes(status)) {
                if (attempt) forgetPayment(attempt.token);
                setError(result?.message || 'Confira os dados do pedido e tente novamente.');
            } else {
                setError(result?.message || 'Não foi possível finalizar. Seu carrinho foi preservado. Tente novamente para recuperar a mesma tentativa.');
            }
            toast.error('Confira a mensagem do pedido antes de tentar novamente.');
            return null;
        } finally {
            lock.current = false;
            setEnviando(false);
        }
    }

    return { checkout, enviando, error };
}
