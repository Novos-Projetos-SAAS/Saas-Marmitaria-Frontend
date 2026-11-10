'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { readFinancialOrders, reconcilePayment } from '@/services/infinitepayService.js';

const timeZone = 'America/Sao_Paulo';
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
const dayLabel = new Intl.DateTimeFormat('pt-BR', { timeZone, day: 'numeric', month: 'long', year: 'numeric' });
const timeLabel = new Intl.DateTimeFormat('pt-BR', { timeZone, hour: '2-digit', minute: '2-digit' });
const statusLabels = {
    PAGO: 'Confirmado', PAGA: 'Confirmado', LIQUIDADA: 'Confirmado', ESTORNADA: 'Estornado',
    PENDENTE: 'Aguardando pagamento', CRIANDO: 'Aguardando pagamento', AGUARDANDO: 'Aguardando pagamento',
    INCERTA: 'Aguardando confirmação', DIVERGENTE: 'Em análise', FALHOU: 'Falhou',
    CANCELADO: 'Cancelado', CANCELADA: 'Cancelado', EXPIRADA: 'Expirado',
};

export function groupPayments(orders) {
    const groups = new Map();
    const seen = new Set();
    for (const order of orders) {
        const key = order.pagamento_id ?? order.order_nsu;
        if (key != null && seen.has(key)) continue;
        if (key != null) seen.add(key);
        const status = order.status_financeiro || order.pagamento_status;
        const paid = ['PAGO', 'PAGA', 'LIQUIDADA'].includes(status);
        const refunded = status === 'ESTORNADA';
        const timestamp = paid || refunded ? order.pago_em : order.pagamento_criado_em || order.criado_em;
        const date = timestamp ? new Date(timestamp) : null;
        const validDate = date && Number.isFinite(date.getTime());
        const day = validDate ? dayKey.format(date) : 'sem-data';
        if (!groups.has(day)) groups.set(day, {
            key: day, label: validDate ? dayLabel.format(date) : 'Data não informada',
            totalCents: 0, completeTotal: false, orders: [],
        });
        const group = groups.get(day);
        const amountCents = order.valor_centavos != null ? Number(order.valor_centavos)
            : order.valor_total != null ? Math.round(Number(order.valor_total) * 100) : null;
        if (validDate && Number.isSafeInteger(order.total_dia_centavos)) {
            group.totalCents = order.total_dia_centavos;
            group.completeTotal = true;
        } else if (!group.completeTotal && paid && Number.isSafeInteger(amountCents)) {
            group.totalCents += amountCents;
        }
        const method = order.capture_method || order.metodo_pagamento_nome || '';
        group.orders.push({
            ...order, key: key ?? order.pedido_id, amountCents, paid, refunded,
            statusLabel: statusLabels[status] || 'Status não informado',
            methodIcon: /pix/i.test(method) ? 'pix' : /credit_card|cart[aã]o|cr[eé]dito|d[eé]bito/i.test(method) ? 'card' : 'unknown',
            methodLabel: order.capture_method === 'pix' ? 'Pix' : order.capture_method === 'credit_card'
                ? 'Cartão de crédito' : order.metodo_pagamento_nome || 'Forma não informada',
            time: validDate ? timeLabel.format(date) : 'Horário não informado',
            dateTime: validDate ? date.toISOString() : undefined,
        });
    }
    return [...groups.values()].sort((a, b) => a.key === 'sem-data' ? 1 : b.key === 'sem-data' ? -1 : b.key.localeCompare(a.key))
        .map(group => ({ ...group, orders: group.orders.sort((a, b) => (b.dateTime || '').localeCompare(a.dateTime || '')) }));
}

export function useFinancialOrders() {
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [period, setPeriod] = useState({ data_inicio: '', data_fim: '' });
    const [loading, setLoading] = useState(true);
    const [pendingId, setPendingId] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const csrf = useRef('');
    const lock = useRef(false);
    const refresh = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const result = await readFinancialOrders(page, period);
            setOrders(result.data || []); csrf.current = result.csrf_token;
        } catch { setError('Não foi possível consultar os pagamentos. Atualize a lista para tentar novamente.'); }
        finally { setLoading(false); }
    }, [page, period]);
    useEffect(() => {
        let active = true;
        readFinancialOrders(page, period).then(result => {
            if (active) { setOrders(result.data || []); setError(''); csrf.current = result.csrf_token; }
        }).catch(() => { if (active) setError('Não foi possível consultar os pagamentos. Atualize a lista para tentar novamente.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [page, period]);
    function changePage(next) {
        setLoading(true); setOrders([]); setError(''); setNotice(''); setPage(Math.max(1, next));
    }
    function applyPeriod(next) {
        if (next.data_inicio && next.data_fim && next.data_inicio > next.data_fim) {
            setError('A data inicial deve ser anterior à data final.');
            return;
        }
        setLoading(true); setOrders([]); setError(''); setNotice(''); setPage(1); setPeriod(next);
    }
    const groups = useMemo(() => groupPayments(orders), [orders]);
    const total = orders[0]?.total_registros;
    const hasNextPage = total == null ? orders.length === 20 : page * 20 < Number(total);
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
    return { orders, groups, page, changePage, hasNextPage, applyPeriod, loading, pendingId, error, notice, refresh, reconcile };
}
