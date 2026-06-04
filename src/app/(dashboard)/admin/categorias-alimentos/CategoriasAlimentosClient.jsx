"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { useCategoriasAlimentos } from "@/hooks/useCategoriasAlimentos.js";
import { toggleCategoriaStatus } from "@/services/categoriasAlimentosService.js";

import Table from "@/components/ui/table";
import ActionMenu from "@/components/ui/actionMenu";
import Pagination from "@/components/ui/pagination";
import Can from "@/components/ui/can";

import { Edit, Plus, Search, Trash2, RotateCcw, Filter, Eye } from "lucide-react";
import Swal from "sweetalert2";
import styles from "./CategoriasAlimentosClient.module.css"; 

export default function CategoriasClient() {
    const {
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
        refrescarLista
    } = useCategoriasAlimentos();

    const [inputValue, setInputValue] = useState("");
    const isFirstRender = useRef(true);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(inputValue);
            setPage(1); 
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, setSearch, setPage]);

    const handlePageChange = (newPage) => setPage(newPage);
    const handleStatusChange = (e) => setStatusFilter(e.target.value);

    const handleArchiveCategoria = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Inativar Categoria?',
            text: `A categoria "${nome}" não aparecerá mais para seleção.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, inativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await toggleCategoriaStatus(id, false);
                await Swal.fire({ title: 'Inativada!', text: 'Categoria inativada.', icon: 'success', confirmButtonColor: '#16a34a' });
                refrescarLista();
            } catch (error) {
                Swal.fire('Erro', 'Erro ao inativar a categoria.', 'error');
            }
        }
    };

    const handleReactivateCategoria = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Reativar Categoria?',
            text: `A categoria "${nome}" voltará a ficar disponível.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, reativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await toggleCategoriaStatus(id, true);
                await Swal.fire({ title: 'Ativada!', text: 'Categoria restaurada.', icon: 'success', confirmButtonColor: '#16a34a' });
                refrescarLista();
            } catch (error) {
                Swal.fire('Erro', 'Erro ao reativar a categoria.', 'error');
            }
        }
    };

    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Nome", accessor: "nome" },
        { 
            header: "Limite de Escolhas", 
            accessor: "limite_escolhas",
            render: (_, item) => (
                <span style={{ fontWeight: '600', color: '#1e40af' }}>
                    {item.limite_escolhas} opções
                </span>
            )
        },
        {
            header: "Status",
            accessor: "deletado_em",
            render: (_, item) => {
                const isAtivo = item.deletado_em === null;
                return (
                    <span style={{
                        backgroundColor: isAtivo ? '#dcfce7' : '#fee2e2',
                        color: isAtivo ? '#166534' : '#991b1b',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: isAtivo ? '1px solid #e5e7eb' : '1px solid #fecaca'
                    }}>
                        {isAtivo ? "Ativo" : "Inativo"}
                    </span>
                );
            },
        },
        {
            header: "Ações",
            accessor: "id",
            className: styles.actionCell,
            render: (value, row, index) => {
                const itemObj = row || value;
                if (!itemObj || typeof itemObj !== 'object') return null;
                
                const isLastItems = index >= categorias.length - 2;
                const isAtivo = itemObj.deletado_em === null;
                const itemMobile = { ...itemObj, ativo: isAtivo };

                return (
                    <>
                        <div className={styles.desktopActions}>
                            <Can perform="categorias_alimentos.visualizar">
                                <Link href={`/admin/categorias-alimentos/${itemObj.id}?mode=view`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }} title="Visualizar">
                                    <Eye size={18} />
                                </Link>
                            </Can>
                            <Can perform="categorias_alimentos.editar">
                                <Link href={`/admin/categorias-alimentos/${itemObj.id}?mode=edit`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }} title="Editar">
                                    <Edit size={18} />
                                </Link>
                            </Can>
                            {isAtivo ? (
                                <Can perform="categorias_alimentos.deletar">
                                    <button onClick={() => handleArchiveCategoria(itemObj.id, itemObj.nome)} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Inativar Categoria">
                                        <Trash2 size={18} />
                                    </button>
                                </Can>
                            ) : (
                                <Can perform="categorias_alimentos.editar">
                                    <button onClick={() => handleReactivateCategoria(itemObj.id, itemObj.nome)} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }} title="Reativar Categoria">
                                        <RotateCcw size={18} />
                                    </button>
                                </Can>
                            )}
                        </div>

                        <div className={styles.mobileActions}>
                           <ActionMenu 
                                item={itemMobile}
                                basePath="/admin/categorias-alimentos"
                                permissionPrefix="categorias_alimentos" 
                                onArchive={handleArchiveCategoria} 
                                onReactivate={handleReactivateCategoria} 
                                isLast={isLastItems} 
                            />
                        </div>
                    </>
                );
            },
        }
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.actionsBar}>
                <div className={styles.filtersGroup}>
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input type="text" placeholder="Buscar categorias..." className={styles.searchInput} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                    </div>
                    <div className={styles.selectWrapper}>
                        <Filter size={16} className={styles.filterIcon} />
                        <select className={styles.statusSelect} value={statusFilter} onChange={handleStatusChange}>
                            <option value="false">Apenas Ativas</option>
                            <option value="true">Apenas Inativas</option>
                            <option value="all">Todas</option>
                        </select>
                    </div>
                </div>
                <Can perform="categorias_alimentos.criar">
                    <Link href="/admin/categorias-alimentos/cadastro" className={styles.newButton}>
                        <Plus size={20} />
                        <span>Nova Categoria</span>
                    </Link>
                </Can>
            </div>

            <div className={styles.tableContainer}>
                <Table columns={columns} data={categorias} isLoading={loading} onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
            </div>

            {!loading && categorias.length > 0 && totalPages > 1 && (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
        </div>
    );
}