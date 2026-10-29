"use client";

import { useAsyncLoad } from '@/hooks/useAsyncLoad.js';

import {
    useState,
    useCallback
} from "react";

import {
    buscarCategoriasProdutosAdmin
} from "@/services/categoriasProdutosService.js";


export function useCategoriasProdutos() {

    const [
        categorias,
        setCategorias
    ] = useState([]);




    const [
        page,
        setPage
    ] = useState(1);


    const [
        totalPages,
        setTotalPages
    ] = useState(1);


    const [
        search,
        setSearch
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter
    ] = useState(
        "ativo"
    );


    const [
        sortColumn,
        setSortColumn
    ] = useState(
        "ordem_exibicao"
    );


    const [
        sortDirection,
        setSortDirection
    ] = useState(
        "ASC"
    );


    const consultarLista = useCallback(
            async ({ signal } = {}) => {


                try {

                    const response =
                        await buscarCategoriasProdutosAdmin({

                            search,

                            page,

                            statusFilter,

                            sort:
                                sortColumn,

                            order:
                                sortDirection
                        });
                    if (signal?.aborted) return;


                    setCategorias(
                        response?.data ||
                        []
                    );


                    setTotalPages(
                        response
                            ?.pagination
                            ?.last_page ||
                        1
                    );


                    setPage(
                        response
                            ?.pagination
                            ?.page ||
                        1
                    );

                } catch (error) {
                    if (signal?.aborted) return;

                    console.error(
                        "Erro ao carregar categorias de produtos:",
                        error
                    );

                }

            },
            [
                search,
                page,
                statusFilter,
                sortColumn,
                sortDirection
            ]
        );


    const { loading, refresh: carregarLista } = useAsyncLoad(consultarLista);


    const handleSort = (
        column
    ) => {

        const sameColumn =
            sortColumn ===
            column;


        setSortDirection(

            sameColumn &&
            sortDirection === "ASC"

                ? "DESC"

                : "ASC"
        );


        setSortColumn(
            column
        );


        setPage(1);
    };


    return {

        categorias,

        loading,

        page,

        setPage,

        totalPages,

        setSearch,

        statusFilter,

        setStatusFilter,

        sortColumn,

        sortDirection,

        handleSort,

        refrescarLista:
            carregarLista
    };
}