import { useState, useEffect, useCallback } from "react";

import { buscarUsuarios } from "@/services/usuariosService.js";

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // const [page, setPage] = useState(1);
    // const [totalPages, setTotalPages] = useState(1);

    // const [sortColumn, setSortColumn] = useState('usuarios.id');
    // const [sortDirection, setSortDirection] = useState('ASC');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("false");
    const [sortColumn, setSortColumn] = useState('usuarios.id');
    const [sortDirection, setSortDirection] = useState('ASC');
    const [search, setSearch] = useState("");

    const carregarLista = useCallback(async () => {
        setLoading(true);
        try {
            const response = await buscarUsuarios(search, page, statusFilter, sortColumn, sortDirection);
            
            setUsuarios(response || []);
            setTotalPages(response.pagination?.lastPage || 1);
            setPage(response.pagination?.page || 1);
        } catch (error) {
            console.error("Erro no hook useUsuarios:", error);
        } finally {
            setLoading(false);
        }
    }, [search, page, statusFilter, sortColumn, sortDirection]);

    // UM ÚNICO MAESTRO: Sempre que qualquer estado de controle mudar, ele atualiza a lista sem conflito
   useEffect(() => {
        let isMounted = true;

        const iniciarBusca = async () => {
            // Joga a execução do loading para a próxima fila (microtask)
            // permitindo que o React termine o desenho inicial em paz
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
        setPage(1); // Reseta para a primeira página ao ordenar
    };

    return {
        usuarios,
        loading,
        page,
        setPage,
        totalPages,
        sortColumn,
        sortDirection,
        statusFilter,
        setStatusFilter,
        setSearch, // Expõe para a página atualizar o termo de busca
        handleSort,
        refrescarLista: carregarLista
    };

}
