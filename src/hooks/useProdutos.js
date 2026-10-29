"use client";

import { useAsyncLoad } from '@/hooks/useAsyncLoad.js';

import { useState, useCallback } from "react";
import { buscarProdutosAdmin } from "@/services/produtosService.js";

export function useProdutos() {
    const [produtos, setProdutos] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [categoriaFilter, setCategoriaFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("ativo");
    const [disponibilidadeFilter, setDisponibilidadeFilter] = useState("todos");
    const [sortColumn, setSortColumn] = useState("ordem_exibicao");
    const [sortDirection, setSortDirection] = useState("ASC");

    const consultarLista = useCallback(async ({ signal } = {}) => {

        try {
            const response = await buscarProdutosAdmin({
                search,
                page,
                categoriaId: categoriaFilter,
                statusFilter,
                disponibilidade: disponibilidadeFilter,
                sort: sortColumn,
                order: sortDirection
            });
            if (signal?.aborted) return;

            setProdutos(response?.data || []);
            setTotalPages(response?.pagination?.last_page || 1);
            setPage(response?.pagination?.page || 1);
        } catch {
            if (signal?.aborted) return;
            setProdutos([]);
            setTotalPages(1);
        }
    }, [
        search,
        page,
        categoriaFilter,
        statusFilter,
        disponibilidadeFilter,
        sortColumn,
        sortDirection
    ]);

    const { loading, refresh: carregarLista } = useAsyncLoad(consultarLista);

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

    const alterarCategoria = (categoriaId) => {
        setCategoriaFilter(categoriaId);
        setPage(1);
    };

    const alterarStatus = (status) => {
        setStatusFilter(status);
        setPage(1);
    };

    const alterarDisponibilidade = (disponibilidade) => {
        setDisponibilidadeFilter(disponibilidade);
        setPage(1);
    };

    return {
        produtos,
        loading,
        page,
        setPage,
        totalPages,
        search,
        setSearch: alterarBusca,
        categoriaFilter,
        setCategoriaFilter: alterarCategoria,
        statusFilter,
        setStatusFilter: alterarStatus,
        disponibilidadeFilter,
        setDisponibilidadeFilter: alterarDisponibilidade,
        sortColumn,
        sortDirection,
        handleSort,
        refrescarLista: carregarLista
    };
}