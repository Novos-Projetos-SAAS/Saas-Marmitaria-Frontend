'use client';

import { useAsyncLoad } from '@/hooks/useAsyncLoad.js';

import { useState, useCallback } from "react";
import { buscarAlimentosAdmin } from "@/services/alimentosService.js";

export function useAlimentos() {
    const [alimentos, setAlimentos] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("false");
    const [sortColumn, setSortColumn] = useState('id');
    const [sortDirection, setSortDirection] = useState('ASC');
    const [search, setSearch] = useState("");

    const consultarLista = useCallback(async ({ signal } = {}) => {

        try {
            const response = await buscarAlimentosAdmin(search, page, statusFilter, sortColumn, sortDirection);
            if (signal?.aborted) return;

            setAlimentos(response?.data || []);
            setTotalPages(response?.pagination?.last_page || 1);
            setPage(response?.pagination?.page || 1);
        } catch (error) {
            if (signal?.aborted) return;
            if (!error.response || error.response.status >= 500) {
                console.error("Erro no hook useAlimentos:", error);
            }
        }
    }, [search, page, statusFilter, sortColumn, sortDirection]);

    const { loading, refresh: carregarLista } = useAsyncLoad(consultarLista);

    const handleSort = (column) => {
        const isSameColumn = sortColumn === column;
        const newDirection = isSameColumn && sortDirection === "ASC" ? "DESC" : "ASC";

        setSortColumn(column);
        setSortDirection(newDirection);
        setPage(1);
    };

    return {
        alimentos,
        loading,
        page,
        setPage,
        totalPages,
        sortColumn,
        sortDirection,
        statusFilter,
        setStatusFilter,
        setSearch,
        handleSort,
        refrescarLista: carregarLista
    };
}