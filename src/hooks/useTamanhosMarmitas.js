'use client'

import { useState, useEffect, useCallback } from "react";

import {
    buscarTamanhosMarmitasAdmin
} from "../services/tamanhosMarmitasService.js";

import Swal from "sweetalert2";

export function useTamanhosMarmitas() {
    const [tamanhos, setTamanhos] = useState([]);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("false"); // "false" = apenas ativos por padrão
    const [sortColumn, setSortColumn] = useState('preco_base'); // Ordena por preço por padrão
    const [sortDirection, setSortDirection] = useState('ASC');
    const [search, setSearch] = useState("");

    const carregarTamanhos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await buscarTamanhosMarmitasAdmin(search, page, statusFilter, sortColumn, sortDirection);
            setTamanhos(response.data || []);

            setTotalPages(response?.pagination?.lastPage || 1);
            setPage(response?.pagination?.page || 1);


        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: extrairMensagemErro(error, 'Não foi possível carregar os tamanhos.'),
                confirmButtonColor: '#ea580c'
            });
        } finally {
            setLoading(false);
        }
    }, [search, page, statusFilter, sortColumn, sortDirection]);

    useEffect(() => {
        let isMounted = true;

        const iniciarBusca = async () => {
            // Microtask para permitir que o React termine de renderizar a tela antes de travar no loading
            await Promise.resolve();

            if (isMounted) {
                carregarTamanhos();
            }
        };

        iniciarBusca();

        return () => {
            isMounted = false;
        };
    }, [carregarTamanhos]);

    const handleSort = (column) => {
        const isSameColumn = sortColumn === column;
        const newDirection = isSameColumn && sortDirection === "ASC" ? "DESC" : "ASC";
        setSortColumn(column);
        setSortDirection(newDirection);
        setPage(1); // Reseta para a primeira página ao ordenar
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
        setStatusFilter,
        setSearch, // Expõe para a barra de pesquisa do Client
        handleSort,
        refrescarLista: carregarTamanhos
    };
}