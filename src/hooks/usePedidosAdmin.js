'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { alterarStatusPedidoAPI, listarPedidosAdmin } from '@/services/pedidosService.js';

export function usePedidosAdmin() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const carregandoSilenciosoRef = useRef(false);
    const timeoutAtualizacaoRef = useRef(null);
    const statusEmAtualizacaoRef = useRef(new Set());

    /**
     * Carrega os pedidos do painel.
     *
     * Consultas silenciosas disparadas pelo Socket não podem executar
     * simultaneamente, evitando requisições duplicadas.
     */
    const carregarPedidos = useCallback(async (options = {}) => {
        const silencioso = options?.silencioso === true;

        if (silencioso && carregandoSilenciosoRef.current) return;

        if (silencioso) {
            carregandoSilenciosoRef.current = true;
        } else {
            setLoading(true);
        }

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
                if (error?.response?.status === 429) {
                    toast.error(error?.response?.data?.message || 'Muitas solicitações foram realizadas. Aguarde alguns instantes.');
                } else {
                    toast.error('Não foi possível carregar os pedidos.');
                }
            }
        } finally {
            if (silencioso) {
                carregandoSilenciosoRef.current = false;
            } else {
                setLoading(false);
            }
        }
    }, [page, search, statusFilter]);

    /**
     * Busca inicial e atualização quando página, pesquisa
     * ou filtro forem modificados.
     */
    useEffect(() => {
        carregarPedidos();
    }, [carregarPedidos]);

    /**
     * Atualizações recebidas pelo Socket são agrupadas por alguns
     * milissegundos para evitar múltiplos GETs praticamente juntos.
     */
    useEffect(() => {
        const atualizar = () => {
            if (timeoutAtualizacaoRef.current) {
                window.clearTimeout(timeoutAtualizacaoRef.current);
            }

            timeoutAtualizacaoRef.current = window.setTimeout(() => {
                carregarPedidos({ silencioso: true });
            }, 300);
        };

        window.addEventListener('marmitaria:pedidos-atualizados', atualizar);

        return () => {
            window.removeEventListener('marmitaria:pedidos-atualizados', atualizar);

            if (timeoutAtualizacaoRef.current) {
                window.clearTimeout(timeoutAtualizacaoRef.current);
            }
        };
    }, [carregarPedidos]);

    /**
     * Atualização otimista do status.
     *
     * O mesmo pedido não pode receber duas alterações simultaneamente.
     */
    const atualizarStatus = async (id, novoStatus) => {
        const pedidoId = Number(id);

        if (statusEmAtualizacaoRef.current.has(pedidoId)) {
            return false;
        }

        statusEmAtualizacaoRef.current.add(pedidoId);

        const pedidosAnteriores = pedidos;

        setPedidos((anteriores) =>
            anteriores.map((pedido) =>
                Number(pedido.id) === pedidoId
                    ? { ...pedido, status: novoStatus }
                    : pedido
            )
        );

        try {
            await alterarStatusPedidoAPI(pedidoId, novoStatus);

            toast.success(`Status atualizado para: ${novoStatus}`);

            return true;
        } catch (error) {
            setPedidos(pedidosAnteriores);

            if (error?.response?.status === 429) {
                toast.error(
                    error?.response?.data?.message ||
                    'Muitas solicitações foram realizadas. Aguarde alguns instantes e tente novamente.'
                );

                return false;
            }

            toast.error(
                error?.response?.data?.message ||
                'Falha ao atualizar o status.'
            );

            return false;
        } finally {
            statusEmAtualizacaoRef.current.delete(pedidoId);
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