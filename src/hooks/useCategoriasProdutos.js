"use client";

import {
    useState,
    useEffect,
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
        loading,
        setLoading
    ] = useState(true);


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


    const carregarLista =
        useCallback(
            async () => {

                setLoading(true);


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

                    console.error(
                        "Erro ao carregar categorias de produtos:",
                        error
                    );

                } finally {

                    setLoading(false);
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


    useEffect(() => {

        carregarLista();

    }, [
        carregarLista
    ]);


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