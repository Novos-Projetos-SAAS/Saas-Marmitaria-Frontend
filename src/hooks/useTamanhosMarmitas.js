'use client';

import { useState, useEffect, useCallback } from "react";
import { buscarTamanhosMarmitasAdmin } from "../services/tamanhosMarmitasService.js";

export function useTamanhosMarmitas() {
    const [tamanhos, setTamanhos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("false");
    const [sortColumn, setSortColumn] = useState('preco_base');
    const [sortDirection, setSortDirection] = useState('ASC');
    const [search, setSearch] = useState("");

    const carregarTamanhos = useCallback(async () => {
        setLoading(true);

        try {
            const response = await buscarTamanhosMarmitasAdmin(
                search,
                page,
                statusFilter,
                sortColumn,
                sortDirection
            );

            setTamanhos(response?.data || []);
            setTotalPages(response?.pagination?.lastPage || 1);
            setPage(response?.pagination?.page || 1);
        } catch {
            setTamanhos([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [
        search,
        page,
        statusFilter,
        sortColumn,
        sortDirection
    ]);

    useEffect(() => {
        carregarTamanhos();
    }, [carregarTamanhos]);

    const handleSort = (column) => {
        const isSameColumn = sortColumn === column;
        const newDirection = isSameColumn && sortDirection === "ASC"
            ? "DESC"
            : "ASC";

        setSortColumn(column);
        setSortDirection(newDirection);
        setPage(1);
    };

    const alterarBusca = (valor) => {
        setSearch(valor);
        setPage(1);
    };

    const alterarStatus = (status) => {
        setStatusFilter(status);
        setPage(1);
    };

    return {
        tamanhos,
        loading,
        page,
        setPage,
        totalPages,
        sortColumn,
        sortDirection,
        statusFilter,
        setStatusFilter: alterarStatus,
        search,
        setSearch: alterarBusca,
        handleSort,
        refrescarLista: carregarTamanhos
    };
}