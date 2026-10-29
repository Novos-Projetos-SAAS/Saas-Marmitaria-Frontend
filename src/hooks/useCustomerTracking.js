'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useAsyncLoad } from '@/hooks/useAsyncLoad.js';
import { listarPedidoPorTelefoneUsuario } from '@/services/pedidosService.js';
import { requestCheckout, requestOwnedOrder } from '@/services/checkoutService.js';
import { loadCustomerTracking, loadCurrentOwnedOrder, mergeCurrentOwnedOrder } from '@/services/customerTracking.mjs';

function subscribePhone(onChange) {
    window.addEventListener('storage', onChange);
    return () => window.removeEventListener('storage', onChange);
}
function readPhone() {
    try { return localStorage.getItem('marmitaria_telefone_cliente') || ''; } catch { return ''; }
}
const serverPhone = () => '';
const readCurrentOrder = options => requestCheckout('status', undefined, undefined, undefined, { ...options, ownerOnly: true });

export function useCustomerTracking() {
    const savedPhone = useSyncExternalStore(subscribePhone, readPhone, serverPhone);
    const [editedPhone, setTelefone] = useState(null);
    const [submittedPhone, setSubmittedPhone] = useState(null);
    const [result, setResult] = useState(null);
    const telefone = editedPhone ?? savedPhone;
    const query = submittedPhone ?? savedPhone;
    const consultar = useCallback(async ({ signal } = {}) => {
        const publicLookup = query || submittedPhone !== null
            ? loadCustomerTracking(query, listarPedidoPorTelefoneUsuario, requestOwnedOrder, signal)
                .catch(() => ({ pedidos: [], erro: 'Não foi possível consultar os pedidos. Tente novamente.' }))
            : Promise.resolve({ pedidos: [], erro: '' });
        const [response, current] = await Promise.all([
            publicLookup, loadCurrentOwnedOrder(readCurrentOrder, requestOwnedOrder, signal)
        ]);
        if (!response || signal?.aborted) return;
        const pedidos = mergeCurrentOwnedOrder(response.pedidos, current);
        const erro = pedidos.length && response.erro === 'Nenhum pedido encontrado para este telefone.' ? '' : response.erro;
        setResult({ query, pedidos, erro });
    }, [query, submittedPhone]);
    const { loading, refresh } = useAsyncLoad(consultar);

    function buscar(event) {
        event.preventDefault();
        if (telefone === query && submittedPhone !== null) void refresh();
        else setSubmittedPhone(telefone);
    }

    return { telefone, setTelefone, buscar,
        buscando: loading,
        pedidos: result?.query === query ? result.pedidos : [],
        erro: result?.query === query ? result.erro : '' };
}
