"use client";

import { useState, useEffect, useCallback } from "react";
import { buscarProdutosAdmin } from "@/services/produtosService.js";

export function useProdutos() {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [categoriaFilter, setCategoriaFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("ativo");
    const [disponibilidadeFilter, setDisponibilidadeFilter] = useState("todos");
    const [sortColumn, setSortColumn] = useState("ordem_exibicao");
    const [sortDirection, setSortDirection] = useState("ASC");

    const carregarLista = useCallback(async () => {
        setLoading(true);

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

            setProdutos(response?.data || []);
            setTotalPages(response?.pagination?.last_page || 1);
            setPage(response?.pagination?.page || 1);
        } catch {
            setProdutos([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        carregarLista();
    }, [carregarLista]);

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