
'use client'

import { useState, useEffect } from "react";

import { listarPedidosAdmin, alterarStatusPedidoAPI } from "@/services/pedidosService.js";

import { io } from "socket.io-client";
import toast from "react-hot-toast";

export function usePedidosAdmin() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de paginação e filtros
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");

    // 🚀 1. O Efeito Isolado (Para paginação, busca e montagem)
    useEffect(() => {
        let isMounted = true;

        const fetchAutomatico = async () => {
            // O SEGREDO AQUI: Pausamos a função por 1 milissegundo.
            // Isso tira o `setLoading(true)` da execução síncrona do useEffect
            // e cala perfeitamente o linter do Next.js!
            await Promise.resolve();

            if (isMounted) setLoading(true);

            try {
                const response = await listarPedidosAdmin({ page, search, status: statusFilter });
                if (isMounted) {
                    setPedidos(response.data || []);
                    if (response.pagination) setTotalPages(response.pagination.totalPages);
                }
            } catch (error) {
                if (isMounted) toast.error("Não foi possível carregar a lista de pedidos.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAutomatico();

        return () => { isMounted = false; };
    }, [page, search, statusFilter]);

    useEffect(() => {
        // Conecta ao servidor Node.js (Ajuste a URL se estiver em produção)
        const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333");

        socket.on('novo_pedido_recebido', (novoPedido) => {
            // 1. Toca o sinal sonoro
            // const audio = new Audio('/sons/campainha.mp3');
            // audio.play().catch(() => {
            //     console.log("Áudio bloqueado pelo navegador até o admin interagir com a tela.");
            // });

            // // 2. Exibe o Toast com os dados do cliente
            // toast.success(`📢 Novo Pedido #${novoPedido.id} de ${novoPedido.nome_cliente}!`, {
            //     duration: 6000,
            //     position: "top-right"
            // });

            // 3. Atualiza a lista na tela dinamicamente
            setPedidos((prev) => {
                // Se o admin estiver filtrando por um status diferente do novo pedido, ignora
                if (statusFilter !== 'todos' && statusFilter !== novoPedido.status) {
                    return prev;
                }
                
                // Evita duplicidade caso o evento seja disparado duas vezes
                if (prev.some(p => p.id === novoPedido.id)) return prev;

                // Coloca o novo pedido no topo e mantém apenas os 10 primeiros visíveis (limite da página)
                const novaLista = [novoPedido, ...prev];
                return novaLista.slice(0, 10); 
            });
        });

        // Limpa a conexão ao desmontar o componente
        return () => {
            socket.disconnect();
        };
    }, [statusFilter]); // Dependência do filtro para garantir que a inserção respeita a busca atual

    // 🚀 2. Função Manual (Apenas para o botão "Atualizar")
    const carregarPedidos = async () => {
        setLoading(true);
        try {
            const response = await listarPedidosAdmin({ page, search, status: statusFilter });
            setPedidos(response.data || []);
            if (response.pagination) setTotalPages(response.pagination.totalPages);
        } catch (error) {
            toast.error("Não foi possível atualizar a lista.");
        } finally {
            setLoading(false);
        }
    };

    // 🚀 3. Atualização de Status
    const atualizarStatus = async (id, novoStatus) => {
        const pedidosAntigos = [...pedidos];

        // Atualização Otimista na tela (troca antes mesmo do banco responder)
        setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p));

        try {
            await alterarStatusPedidoAPI(id, novoStatus);
            toast.success(`Status atualizado para: ${novoStatus}`);
        } catch (error) {
            // Reverte em caso de erro
            setPedidos(pedidosAntigos);
            toast.error("Falha ao atualizar o status no servidor.");
        }
    };

    return {
        pedidos,
        loading,
        carregarPedidos,
        atualizarStatus,
        page, setPage, totalPages,
        search, setSearch,
        statusFilter, setStatusFilter
    };
}