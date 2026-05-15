import { useState, useCallback } from "react";

import { buscarUsuarios } from "@/services/usuariosService.js";

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [sortColumn, setSortColumn] = useState('usuarios.id');
    const [sortDirection, setSortDirection] = useState('ASC');

    const listarUsuarios = useCallback(async (search, page = 1, status = 'all', sort, direction) => {
        
        setLoading(true);

        try {

            const response = await buscarUsuarios(search, page, status, sort, direction);

            setUsuarios(response || []);
            
            setTotalPages(response.pagination?.lastPage || 1);
            setPage(response.pagination?.page || 1);
            
            setSortColumn(sort);
            setSortDirection(direction);

        } catch (error) {
            console.error("Erro no hook useUsuarios:", error);
        } finally {
            setLoading(false);
        }

    }, []);

    const handleSort = (column) => {
        const isSameColumn = sortColumn === column;
        const newDirection = isSameColumn && sortDirection === "ASC" ? "DESC" : "ASC";
        setSortColumn(column);
        setSortDirection(newDirection);
    };

    return {
        usuarios,
        loading,
        page,
        totalPages,
        sortColumn,
        sortDirection,
        listarUsuarios,
        handleSort
    };

}
