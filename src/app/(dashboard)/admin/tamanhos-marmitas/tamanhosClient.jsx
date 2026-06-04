"use client";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";

import { useTamanhosMarmitas } from "@/hooks/useTamanhosMarmitas.js";

import { toggleTamanhoStatus } from "@/services/tamanhosMarmitasService.js";

import Table from "@/components/ui/table";
import ActionMenu from "@/components/ui/actionMenu";
import Pagination from "@/components/ui/pagination";
import Can from "@/components/ui/can";

import { Eye, Edit, Plus, Search, Trash2, RotateCcw, Filter } from "lucide-react";
import Swal from "sweetalert2";

import styles from "./tamanhosClient.module.css";

export default function TamanhosClient() {
    const {
        tamanhos,
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
    } = useTamanhosMarmitas();

    const [inputValue, setInputValue] = useState("");
    const isFirstRender = useRef(true);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(inputValue);
            setPage(1); // Reseta a paginação sempre que uma nova busca é feita
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, setSearch, setPage]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleArchiveTamanho = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Inativar Tamanho?',
            text: `O tamanho "${nome}" não poderá mais ser vendido.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, inativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // False = Rota DELETE (Soft Delete)
                await toggleTamanhoStatus(id, false);
                await Swal.fire({ title: 'Inativado!', text: 'Tamanho inativado com sucesso.', icon: 'success', confirmButtonColor: '#16a34a' });
                refrescarLista(); // Atualiza a tabela chamando o banco novamente
            } catch (error) {
                console.error(error);
                Swal.fire('Erro', 'Erro ao inativar o tamanho.', 'error');
            }
        }
    };

    const handleReactivateTamanho = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Reativar Tamanho?',
            text: `O tamanho "${nome}" voltará para a tela de vendas.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, reativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // True = Rota PATCH (Reativar)
                await toggleTamanhoStatus(id, true);
                await Swal.fire({ title: 'Ativado!', text: 'Tamanho restaurado com sucesso.', icon: 'success', confirmButtonColor: '#16a34a' });
                refrescarLista();
            } catch (error) {
                console.error(error);
                Swal.fire('Erro', 'Erro ao reativar o tamanho.', 'error');
            }
        }
    };

    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Nome", accessor: "nome" },
        {
            header: "Preço Base",
            accessor: "preco_base",
            render: (_, item) => (
                <span style={{ fontWeight: '600', color: '#ea580c' }}>
                    R$ {Number(item.preco_base).toFixed(2).replace('.', ',')}
                </span>
            )
        },
        {
            header: "Status",
            accessor: "deletado_em",
            render: (_, item) => {
                // DECLARAÇÃO 1: Para a coluna de Status
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
                )
            },
        },
        {
            header: "Ações",
            accessor: "id",
            className: styles.actionCell,
            render: (value, row, index) => {
                const itemObj = row || value;
                if (!itemObj || typeof itemObj !== 'object') return null;
                
                const isLastItems = index >= tamanhos.length - 2;
                
                // DECLARAÇÃO 2: Para a coluna de Ações
                const isAtivo = itemObj.deletado_em === null;
                
                const itemMobile = { ...itemObj, ativo: isAtivo };

                return (
                    <>
                        <div className={styles.desktopActions}>
                            <Can perform="tamanhos_marmitas.visualizar">
                                <Link
                                    href={`/admin/tamanhos-marmitas/${itemObj.id}?mode=view`}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }}
                                    title="Visualizar"
                                >
                                    <Eye size={18} />
                                </Link>
                            </Can>

                            <Can perform="tamanhos_marmitas.editar">
                                <Link
                                    href={`/admin/tamanhos-marmitas/${itemObj.id}?mode=edit`}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }}
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </Link>
                            </Can>

                            {isAtivo ? (
                                <Can perform="tamanhos_marmitas.deletar">
                                    <button
                                        onClick={() => handleArchiveTamanho(itemObj.id, itemObj.nome)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Inativar Tamanho"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </Can>
                            ) : (
                                <Can perform="tamanhos_marmitas.editar">
                                    <button
                                        onClick={() => handleReactivateTamanho(itemObj.id, itemObj.nome)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Reativar Tamanho"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </Can>
                            )}
                        </div>

                        <div className={styles.mobileActions}>
                            <ActionMenu
                                item={itemMobile} 
                                basePath="/admin/tamanhos-marmitas" 
                                permissionPrefix="tamanhos_marmitas" 
                                onArchive={handleArchiveTamanho}
                                onReactivate={handleReactivateTamanho}
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
                    {/* BARRA DE PESQUISA */}
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar tamanhos..."
                            className={styles.searchInput}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>

                    {/* SELECT DE FILTRO (Ativo/Inativo) */}
                    <div className={styles.selectWrapper}>
                        <Filter size={16} className={styles.filterIcon} />
                        <select
                            className={styles.statusSelect}
                            value={statusFilter}
                            onChange={handleStatusChange}
                        >
                            <option value="false">Apenas Ativos</option>
                            <option value="true">Apenas Inativos</option>
                            <option value="all">Todos</option>
                        </select>
                    </div>
                </div>

                {/* BOTÃO NOVO */}
                <Can perform="tamanhos_marmitas.criar">
                    <Link href="/admin/tamanhos-marmitas/cadastro" className={styles.newButton}>
                        <Plus size={20} />
                        <span>Novo Tamanho</span>
                    </Link>
                </Can>
            </div>

            {/* TABELA */}
            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    data={tamanhos}
                    isLoading={loading}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                />
            </div>

            {/* PAGINAÇÃO */}
            {!loading && tamanhos.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}