'use client';

import { useEffect, useRef, useState } from 'react';
import { confirmPayment, readPayment, savedPayments } from '@/services/infinitepayService.js';

export function usePaymentTracking() {
    const [state, setState] = useState({ loading: true, order: null, error: '', online: false });
    const reload = useRef(null);
    useEffect(() => {
        let stopped = false, busy = false, timer, attempts = 0;
        const url = new URL(window.location.href);
        const identifiers = { order_nsu: url.searchParams.get('order_nsu'),
            transaction_nsu: url.searchParams.get('transaction_nsu'),
            slug: url.searchParams.get('slug') || url.searchParams.get('invoice_slug') };
        const hasReturn = Boolean(identifiers.order_nsu || identifiers.transaction_nsu || identifiers.slug);
        if (hasReturn) window.history.replaceState(null, '', url.pathname);
        if (url.searchParams.get('tradicional') === '1') {
            // Browser URL and saved access are unavailable during server rendering.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState({ loading: false, order: null, online: false, error: '' });
            return;
        }
        const payments = savedPayments();
        const requestedId = url.searchParams.get('pedido');
        const payment = identifiers.order_nsu
            ? payments.find(item => item.order_nsu === identifiers.order_nsu)
            : requestedId ? payments.find(item => String(item.pedido_id) === requestedId)
            : payments.filter(item => item.pedido_id).at(-1);
        if (payment?.pedido_id) window.history.replaceState(null, '', `${url.pathname}?pedido=${encodeURIComponent(payment.pedido_id)}`);
        const controller = new AbortController();
        let triedConfirmation = false;
        async function load(manual = false) {
            if (stopped || busy || document.hidden) return;
            clearTimeout(timer);
            if (!payment?.pedido_id) {
                setState({ loading: false, order: null, online: hasReturn || Boolean(requestedId), error: hasReturn || requestedId
                    ? 'O acesso a este pagamento não está salvo neste navegador. Entre em contato com a marmitaria para consultar seu pedido.' : '' });
                return;
            }
            busy = true;
            setState(previous => ({ ...previous, loading: manual || !previous.order, online: true, error: '' }));
            try {
                // Callback identifiers only request a backend check; they never establish payment.
                if (!triedConfirmation) {
                    triedConfirmation = true;
                    await confirmPayment(payment, Object.fromEntries(Object.entries(identifiers).filter(([, value]) => value))).catch(() => {});
                }
                const order = await readPayment(payment, controller.signal);
                if (!stopped) setState({ loading: false, online: true, order, error: '' });
                if (!stopped && !['PAGO', 'FALHOU', 'CANCELADO'].includes(order.pagamento_status) && ++attempts < 12) {
                    timer = setTimeout(load, 5000);
                }
            } catch {
                if (!stopped) setState(previous => ({ ...previous, loading: false, online: true,
                    error: 'Não foi possível consultar o pagamento. Atualize a verificação ou entre em contato com a marmitaria.' }));
            } finally { busy = false; }
        }
        reload.current = () => { triedConfirmation = false; attempts = 0; void load(true); };
        const visible = () => { if (!document.hidden && attempts < 12) void load(); };
        document.addEventListener('visibilitychange', visible);
        void load();
        return () => {
            stopped = true; clearTimeout(timer); controller.abort(); reload.current = null;
            document.removeEventListener('visibilitychange', visible);
        };
    }, []);
    return { ...state, refresh: () => reload.current?.() };
}

export function useSavedPaymentOrders() {
    const [orders, setOrders] = useState([]);
    useEffect(() => {
        const load = () => setOrders(savedPayments().filter(item => item.pedido_id).map(item => item.pedido_id).reverse());
        load();
        window.addEventListener('storage', load);
        return () => window.removeEventListener('storage', load);
    }, []);
    return orders;
}
