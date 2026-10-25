'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createCheckoutFlow } from '@/services/checkoutFlow.mjs';
import { requestCheckout, withCheckoutLock } from '@/services/checkoutService.js';

export function useCheckout() {
    const router = useRouter(), target = useRef(null), flow = useRef(null);
    const [state, setState] = useState({ phase: 'PRONTO' });
    async function finalizarPedidoNoBanco(payload) {
        if (!flow.current) flow.current = createCheckoutFlow({ api: requestCheckout, onState: setState,
            withLock: withCheckoutLock, navigate: url => { target.current = url; } });
        try { return { status: 'success', data: await flow.current.submit(payload) }; }
        catch (error) {
            if (error.conflict) return error.result;
            toast.error(error.message || 'Consulte seu pedido antes de tentar novamente.'); return null;
        }
    }
    function prosseguir() {
        if (!target.current) return;
        const url = target.current; target.current = null;
        if (url.startsWith('/')) router.push(url); else window.location.assign(url);
    }
    return { finalizarPedidoNoBanco, prosseguir, state,
        enviando: ['PREPARANDO_ACESSO','CRIANDO_PEDIDO','REDIRECIONANDO'].includes(state.phase) };
}
