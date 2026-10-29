'use client';

import { useAsyncLoad } from '@/hooks/useAsyncLoad.js';

import { useCallback, useState } from "react";
import { buscarMarmitasEspeciaisAdmin } from "@/services/marmitasEspeciaisService.js";

export function useMarmitasEspeciais() {
    const [marmitas, setMarmitas] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilterState] = useState("todos");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortDirection, setSortDirection] = useState("DESC");
    const [search, setSearchState] = useState("");

    const consultarMarmitas = useCallback(async ({ signal } = {}) => {

        try {
            const response = await buscarMarmitasEspeciaisAdmin(
                search,
                page,
                statusFilter,
                sortColumn,
                sortDirection
            );
            if (signal?.aborted) return;

            setMarmitas(response?.data || []);
            setTotalPages(response?.pagination?.lastPage || 1);
            setPage(response?.pagination?.page || 1);
        } catch {
            if (signal?.aborted) return;
            setMarmitas([]);
            setTotalPages(1);
        }
    }, [search, page, statusFilter, sortColumn, sortDirection]);

    const { loading, refresh: carregarMarmitas } = useAsyncLoad(consultarMarmitas);

    const handleSort = (column) => {
        const isSameColumn = sortColumn === column;
        const newDirection = isSameColumn && sortDirection === "ASC"
            ? "DESC"
            : "ASC";

        setSortColumn(column);
        setSortDirection(newDirection);
        setPage(1);
    };

    const setSearch = useCallback((valor) => {
        setSearchState(valor);
        setPage(1);
    }, []);

    const setStatusFilter = useCallback((valor) => {
        setStatusFilterState(valor);
        setPage(1);
    }, []);

    return {
        marmitas,
        loading,
        page,
        setPage,
        totalPages,
        statusFilter,
        setStatusFilter,
        sortColumn,
        sortDirection,
        search,
        setSearch,
        handleSort,
        refrescarLista: carregarMarmitas
    };
}
