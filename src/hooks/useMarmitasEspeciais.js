'use client';

import { useCallback, useEffect, useState } from "react";
import { buscarMarmitasEspeciaisAdmin } from "@/services/marmitasEspeciaisService.js";

export function useMarmitasEspeciais() {
    const [marmitas, setMarmitas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilterState] = useState("todos");
    const [sortColumn, setSortColumn] = useState("id");
    const [sortDirection, setSortDirection] = useState("DESC");
    const [search, setSearchState] = useState("");

    const carregarMarmitas = useCallback(async () => {
        setLoading(true);

        try {
            const response = await buscarMarmitasEspeciaisAdmin(
                search,
                page,
                statusFilter,
                sortColumn,
                sortDirection
            );

            setMarmitas(response?.data || []);
            setTotalPages(response?.pagination?.lastPage || 1);
            setPage(response?.pagination?.page || 1);
        } catch {
            setMarmitas([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [search, page, statusFilter, sortColumn, sortDirection]);

    useEffect(() => {
        carregarMarmitas();
    }, [carregarMarmitas]);

    const handleSort = (column) => {
        const isSameColumn = sortColumn === column;
        const newDirection = isSameColumn && sortDirection === "ASC"
            ? "DESC"
            : "ASC";

        setSortColumn(column);
        setSortDirection(newDirection);
        setPage(1);
    };

    const setSearch = (valor) => {
        setSearchState(valor);
        setPage(1);
    };

    const setStatusFilter = (valor) => {
        setStatusFilterState(valor);
        setPage(1);
    };

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
