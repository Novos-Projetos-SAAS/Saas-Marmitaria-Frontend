

'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { alterarStatusPedidoAPI, listarPedidosAdmin } from '@/services/pedidosService.js';

export function usePedidosAdmin() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const carregarPedidos = useCallback(async (options = {}) => {
        const silencioso = options?.silencioso === true;

        if (!silencioso) setLoading(true);

        try {
            const response = await listarPedidosAdmin({
                page,
                search,
                status: statusFilter
            });

            setPedidos(response.data || []);
            setTotalPages(response?.pagination?.totalPages || 1);
        } catch (error) {
            if (!silencioso) {
                toast.error('Não foi possível carregar os pedidos.');
            }
        } finally {
            if (!silencioso) setLoading(false);
        }
    }, [page, search, statusFilter]);

    // Busca inicial e ao mudar dependências
    useEffect(() => {
        carregarPedidos();
    }, [carregarPedidos]);

    // Listener para o Socket
    useEffect(() => {
        const atualizar = () => {
            carregarPedidos({ silencioso: true });
        };

        window.addEventListener('marmitaria:pedidos-atualizados', atualizar);
        return () => window.removeEventListener('marmitaria:pedidos-atualizados', atualizar);
    }, [carregarPedidos]);

    // Alteração Otimista
    const atualizarStatus = async (id, novoStatus) => {
        const pedidosAnteriores = pedidos;

        setPedidos(anteriores =>
            anteriores.map(pedido =>
                pedido.id === id ? { ...pedido, status: novoStatus } : pedido
            )
        );

        try {
            await alterarStatusPedidoAPI(id, novoStatus);
            toast.success(`Status atualizado para: ${novoStatus}`);
        } catch (error) {
            setPedidos(pedidosAnteriores);
            toast.error(
                error?.response?.data?.message || 'Falha ao atualizar o status.'
            );
        }
    };

    return {
        pedidos,
        loading,
        carregarPedidos,
        atualizarStatus,
        page,
        setPage,
        totalPages,
        search,
        setSearch,
        statusFilter,
        setStatusFilter
    };
}