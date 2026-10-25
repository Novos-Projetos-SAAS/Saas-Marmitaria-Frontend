'use client';
import { useEffect, useRef, useState } from 'react';
import { requestCheckout } from '@/services/checkoutService.js';
import { trackingLocation } from '@/services/checkoutFlow.mjs';

export function usePaymentTracking() {
    const [state, setState] = useState({ loading: true, order: null, error: false });
    const reload = useRef(null);
    useEffect(() => {
        let stopped = false, timer, busy = false, attempts = 0;
        const abort = new AbortController(), url = new URL(window.location.href);
        const requestId = url.searchParams.get('requisicao');
        let statusRef = url.searchParams.get('ref') || new URLSearchParams(url.hash.slice(1)).get('ref');
        async function load(manual = false) {
            if (stopped || busy || document.hidden) return;
            clearTimeout(timer); if (manual) attempts = 0;
            busy = true; let finished = false;
            try {
                const order = await requestCheckout('status', undefined, undefined, requestId, { signal: abort.signal, statusRef });
                // Pin this tab to its order; shared cookies can change when another tab returns.
                if (statusRef && !stopped) window.history.replaceState(null, '', trackingLocation(order, statusRef));
                if (!stopped) setState({ loading: false, order, error: false });
                finished = order.cozinha_liberada || ['FALHOU','EXPIRADA','CANCELADA','ESTORNADA','DIVERGENTE'].includes(order.pagamento_status) || !order.pedido_id && !order.pagamento_status;
            } catch {
                if (!stopped) setState(previous => ({ ...previous, loading: false, error: true }));
            } finally {
                busy = false; attempts++;
                if (!stopped && !finished && attempts < 20) timer = setTimeout(load, Math.min(30000, 5000 + attempts * 2000));
            }
        }
        const visible = () => { if (!document.hidden && attempts < 20) void load(); };
        reload.current = () => load(true);
        document.addEventListener('visibilitychange', visible); void load();
        return () => { stopped = true; clearTimeout(timer); abort.abort(); document.removeEventListener('visibilitychange', visible); reload.current = null; };
    }, []);
    return { ...state, refresh: () => reload.current?.() };
}
