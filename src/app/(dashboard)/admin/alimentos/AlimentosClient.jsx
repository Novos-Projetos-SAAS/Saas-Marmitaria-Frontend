"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { useAlimentos } from "@/hooks/useAlimentos.js";
import { toggleAlimentoStatus } from "@/services/alimentosService.js";

import Table from "@/components/ui/table";
import ActionMenu from "@/components/ui/actionMenu";
import Pagination from "@/components/ui/pagination";
import Can from "@/components/ui/can";

import { Edit, Plus, Search, Trash2, RotateCcw, Filter, Eye } from "lucide-react";
import Swal from "sweetalert2";
import styles from "./AlimentosClient.module.css"; // Reaproveitando o CSS idêntico

export default function AlimentosClient() {
    const {
        alimentos, loading, page, setPage, totalPages,
        sortColumn, sortDirection, statusFilter, setStatusFilter,
        setSearch, handleSort, refrescarLista
    } = useAlimentos();

    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(inputValue);
            setPage(1); 
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, setSearch, setPage]);

    const handlePageChange = (newPage) => setPage(newPage);
    const handleStatusChange = (e) => setStatusFilter(e.target.value);

    const handleArchiveAlimento = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Inativar Alimento?',
            text: `O alimento "${nome}" não poderá ser selecionado nas marmitas.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, inativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await toggleAlimentoStatus(id, false);
                await Swal.fire({ title: 'Inativado!', text: 'Alimento bloqueado.', icon: 'success', confirmButtonColor: '#16a34a' });
                refrescarLista();
            } catch (error) {
                Swal.fire('Erro', 'Erro ao inativar o alimento.', 'error');
            }
        }
    };

    const handleReactivateAlimento = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Reativar Alimento?',
            text: `O alimento "${nome}" voltará ao cardápio.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, reativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await toggleAlimentoStatus(id, true);
                await Swal.fire({ title: 'Ativado!', text: 'Alimento restaurado.', icon: 'success', confirmButtonColor: '#16a34a' });
                refrescarLista();
            } catch (error) {
                Swal.fire('Erro', 'Erro ao reativar o alimento.', 'error');
            }
        }
    };

    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Nome", accessor: "nome" },
        { 
            header: "Categoria", 
            accessor: "categoria_nome", // Assumindo que seu JOIN retorna o nome da categoria aqui
            render: (_, item) => (
                <span style={{ color: '#52525b', fontWeight: '500' }}>
                    {item.categoria_nome || 'Sem Categoria'}
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
                
                const isLastItems = index >= alimentos.length - 2;
                const isAtivo = itemObj.deletado_em === null;
                const itemMobile = { ...itemObj, ativo: isAtivo };

                return (
                    <>
                        <div className={styles.desktopActions}>
                            <Can perform="alimentos.visualizar">
                                <Link href={`/admin/alimentos/${itemObj.id}?mode=view`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }} title="Visualizar">
                                    <Eye size={18} />
                                </Link>
                            </Can>
                            <Can perform="alimentos.editar">
                                <Link href={`/admin/alimentos/${itemObj.id}?mode=edit`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }} title="Editar">
                                    <Edit size={18} />
                                </Link>
                            </Can>
                            {isAtivo ? (
                                <Can perform="alimentos.deletar">
                                    <button onClick={() => handleArchiveAlimento(itemObj.id, itemObj.nome)} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Inativar">
                                        <Trash2 size={18} />
                                    </button>
                                </Can>
                            ) : (
                                <Can perform="alimentos.editar">
                                    <button onClick={() => handleReactivateAlimento(itemObj.id, itemObj.nome)} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }} title="Reativar">
                                        <RotateCcw size={18} />
                                    </button>
                                </Can>
                            )}
                        </div>

                        <div className={styles.mobileActions}>
                            <ActionMenu 
                                item={itemMobile}
                                basePath="/admin/alimentos"
                                permissionPrefix="alimentos"
                                onArchive={handleArchiveAlimento} 
                                onReactivate={handleReactivateAlimento} 
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
                        <input type="text" placeholder="Buscar alimentos..." className={styles.searchInput} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                    </div>
                    <div className={styles.selectWrapper}>
                        <Filter size={16} className={styles.filterIcon} />
                        <select className={styles.statusSelect} value={statusFilter} onChange={handleStatusChange}>
                            <option value="false">Apenas Ativos</option>
                            <option value="true">Apenas Inativos</option>
                            <option value="all">Todos</option>
                        </select>
                    </div>
                </div>
                <Can perform="alimentos.criar">
                    <Link href="/admin/alimentos/cadastro" className={styles.newButton}>
                        <Plus size={20} />
                        <span>Novo Alimento</span>
                    </Link>
                </Can>
            </div>

            <div className={styles.tableContainer}>
                <Table columns={columns} data={alimentos} isLoading={loading} onSort={handleSort} sortColumn={sortColumn} sortDirection={sortDirection} />
            </div>

            {!loading && alimentos.length > 0 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}