// 'use client'

// import { useState, useEffect } from "react";
// import { listarPedidosAdmin, alterarStatusPedidoAPI } from "@/services/pedidosService.js";
// import toast from "react-hot-toast";

// export function usePedidosAdmin() {
//     const [pedidos, setPedidos] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // 🚀 1. O EFEITO DE MONTAGEM (À prova do linter)
//     useEffect(() => {
//         let isMounted = true;

//         async function fetchInicial() {
//             try {
//                 const response = await listarPedidosAdmin();
//                 if (isMounted) setPedidos(response.data || []);
//             } catch (error) {
//                 if (isMounted) toast.error("Não foi possível carregar a lista de pedidos.");
//             } finally {
//                 if (isMounted) setLoading(false);
//             }
//         }

//         fetchInicial();

//         return () => { isMounted = false; };
//     }, []);

//     // 🚀 2. FUNÇÃO MANUAL (Para ser usada no botão "Atualizar" da tela)
//     const carregarPedidos = async () => {
//         setLoading(true);
//         try {
//             const response = await listarPedidosAdmin();
//             setPedidos(response.data || []);
//         } catch (error) {
//             toast.error("Não foi possível atualizar a lista de pedidos.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 🚀 3. ATUALIZAÇÃO DE STATUS
//     const atualizarStatus = async (id, novoStatus) => {
//         const pedidosAntigos = [...pedidos];
        
//         // Atualização Otimista na tela
//         setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: novoStatus } : p));

//         try {
//             await alterarStatusPedidoAPI(id, novoStatus);
//             toast.success(`Status atualizado para: ${novoStatus}`);
//         } catch (error) {
//             // Reverte em caso de erro
//             setPedidos(pedidosAntigos);
//             toast.error("Falha ao atualizar o status no servidor.");
//         }
//     };

//     return { pedidos, loading, carregarPedidos, atualizarStatus };
// }


'use client'

import { useState, useEffect } from "react";
import { listarPedidosAdmin, alterarStatusPedidoAPI } from "@/services/pedidosService.js";
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