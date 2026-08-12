'use client';

import { useState, useEffect, useCallback } from "react";
import { buscarCategoriasDeAlimentosAdmin } from "@/services/categoriasAlimentosService.js";

export function useCategoriasAlimentos() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("false");
    const [sortColumn, setSortColumn] = useState('id');
    const [sortDirection, setSortDirection] = useState('ASC');
    const [search, setSearch] = useState("");

    const carregarLista = useCallback(async () => {
        setLoading(true);

        try {
            const response = await buscarCategoriasDeAlimentosAdmin(
                search,
                page,
                statusFilter,
                sortColumn,
                sortDirection
            );

            setCategorias(response?.data || []);
            setTotalPages(response?.pagination?.last_page || 1);
            setPage(response?.pagination?.page || 1);
        } catch {
            setCategorias([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [search, page, statusFilter, sortColumn, sortDirection]);

    useEffect(() => {
        let isMounted = true;

        const iniciarBusca = async () => {
            await Promise.resolve();

            if (isMounted) {
                carregarLista();
            }
        };

        iniciarBusca();

        return () => {
            isMounted = false;
        };
    }, [carregarLista]);

    const handleSort = (column) => {
        const isSameColumn = sortColumn === column;
        const newDirection = isSameColumn && sortDirection === "ASC" ? "DESC" : "ASC";

        setSortColumn(column);
        setSortDirection(newDirection);
        setPage(1);
    };

    return {
        categorias,
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