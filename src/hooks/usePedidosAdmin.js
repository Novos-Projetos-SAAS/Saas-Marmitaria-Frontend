'use client'

import { useState, useEffect } from "react";
import { listarPedidosAdmin, alterarStatusPedidoAPI } from "@/services/pedidosService.js";
import toast from "react-hot-toast";

export function usePedidosAdmin() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🚀 1. O EFEITO DE MONTAGEM (À prova do linter)
    useEffect(() => {
        let isMounted = true;

        async function fetchInicial() {
            try {
                const response = await listarPedidosAdmin();
                if (isMounted) setPedidos(response.data || []);
            } catch (error) {
                if (isMounted) toast.error("Não foi possível carregar a lista de pedidos.");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchInicial();

        return () => { isMounted = false; };
    }, []);

    // 🚀 2. FUNÇÃO MANUAL (Para ser usada no botão "Atualizar" da tela)
    const carregarPedidos = async () => {
        setLoading(true);
        try {
            const response = await listarPedidosAdmin();
            setPedidos(response.data || []);
        } catch (error) {
            toast.error("Não foi possível atualizar a lista de pedidos.");
        } finally {
            setLoading(false);
        }
    };

    // 🚀 3. ATUALIZAÇÃO DE STATUS
    const atualizarStatus = async (id, novoStatus) => {
        const pedidosAntigos = [...pedidos];
        
        // Atualização Otimista na tela
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

    return { pedidos, loading, carregarPedidos, atualizarStatus };
}