'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readFinancialOrders, reconcilePayment } from '@/services/infinitepayService.js';

export function useFinancialOrders() {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [pendingId, setPendingId] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const csrf = useRef('');
    const lock = useRef(false);
    const refresh = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const result = await readFinancialOrders(page);
            setOrders(result.data || []); csrf.current = result.csrf_token;
        } catch { setError('Não foi possível consultar os pagamentos. Atualize a lista para tentar novamente.'); }
        finally { setLoading(false); }
    }, [page]);
    useEffect(() => {
        let active = true;
        readFinancialOrders(page).then(result => {
            if (active) { setOrders(result.data || []); setError(''); csrf.current = result.csrf_token; }
        }).catch(() => { if (active) setError('Não foi possível consultar os pagamentos. Atualize a lista para tentar novamente.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [page]);
    function changePage(next) {
        setLoading(true); setOrders([]); setError(''); setNotice(''); setPage(Math.max(1, next));
    }
    async function reconcile(id, identifiers) {
        if (lock.current) return;
        lock.current = true; setPendingId(id); setError(''); setNotice('');
        try {
            await reconcilePayment(id, identifiers, csrf.current);
            await refresh(); setNotice(`Verificação do pedido #${id} concluída. Consulte o estado atualizado na lista.`);
        } catch (failure) {
            setError(failure.response?.data?.message || 'Não foi possível confirmar o pagamento. Confira os identificadores e tente novamente.');
        } finally { lock.current = false; setPendingId(null); }
    }
    return { orders, page, changePage, loading, pendingId, error, notice, refresh, reconcile };
}
