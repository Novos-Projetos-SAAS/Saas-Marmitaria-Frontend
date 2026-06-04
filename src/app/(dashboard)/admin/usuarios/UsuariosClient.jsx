"use client";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";

import { useUsuarios } from "@/hooks/useUsuarios.js";

import { toggleUserStatus } from "@/services/usuariosService.js";

import Table from "@/components/ui/table";
import ActionMenu from "@/components/ui/actionMenu";
import Pagination from "@/components/ui/pagination";
import Can from "@/components/ui/can";

import { Edit, Plus, Eye, Search, Trash2, RotateCcw, Filter, Shield } from "lucide-react";
import Swal from "sweetalert2";

import styles from "./UsuariosClient.module.css";

export default function UsuariosClient() {
    const {
        usuarios,
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
    } = useUsuarios();

    const [inputValue, setInputValue] = useState("");

    const isFirstRender = useRef(true);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearch(inputValue);
            setPage(1); // Reseta a paginação ao digitar uma nova busca
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue, setSearch, setPage]);

    const handlePageChange = (newPage) => {
        listarUsuarios(inputValue, newPage, statusFilter, sortColumn, sortDirection);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleArchiveUser = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Inativar Usuário?',
            text: `O usuário "${nome}" perderá o acesso ao sistema.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, inativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Passando false para inativar
                await toggleUserStatus(id, false);
                await Swal.fire({ title: 'Inativado!', text: 'Usuário bloqueado.', icon: 'success', confirmButtonColor: '#16a34a' });
                refrescarLista(inputValue, page, statusFilter, sortColumn, sortDirection);
            } catch (error) {
                console.error(error);
                Swal.fire('Erro', 'Erro ao inativar.', 'error');
            }
        }
    };

    const handleReactivateUser = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Reativar Usuário?',
            text: `O usuário "${nome}" poderá logar novamente.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, reativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Passando true para reativar
                await toggleUserStatus(id, true);
                await Swal.fire({ title: 'Ativado!', text: 'Acesso restaurado.', icon: 'success', confirmButtonColor: '#16a34a' });
                refrescarLista(inputValue, page, statusFilter, sortColumn, sortDirection);
            } catch (error) {
                console.error(error);
                Swal.fire('Erro', 'Erro ao reativar.', 'error');
            }
        }
    };

    // --- DEFINIÇÃO DAS COLUNAS (Ajustadas para o Knex) ---
    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Nome", accessor: "nome" },
        { header: "Email", accessor: "email" },
        {
            header: "Cargo",
            accessor: "cargo",
            render: (_, item) => (
                <span style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                }}>
                    {item.cargo}
                </span>
            ),
        },
        {
            header: "Status",
            accessor: "ativo",
            render: (_, item) => (
                <span style={{
                    backgroundColor: item.ativo ? '#dcfce7' : '#fee2e2',
                    color: item.ativo ? '#166534' : '#991b1b',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: item.ativo ? '1px solid #e5e7eb' : '1px solid #fecaca'
                }}>
                    {item.ativo ? "Ativo" : "Inativo"}
                </span>
            ),
        },
        {
            header: "Ações",
            accessor: "id", // Mudado para id para garantir o recebimento do identificador base
            className: styles.actionCell,
            render: (value, row, index) => {
                // Se a tabela enviar o objeto completo na primeira ou segunda propriedade, garantimos o fallback
                const userObj = row || value;

                if (!userObj || typeof userObj !== 'object') return null;

                const isLastItems = index >= usuarios.length - 2;

                return (
                    <>
                        {/* AÇÕES DE DESKTOP */}
                        <div className={styles.desktopActions}>
                            <Can perform="usuarios.visualizar">
                                <Link
                                    href={`/admin/usuarios/${userObj.id}?mode=view`}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }}
                                    title="Visualizar"
                                >
                                    <Eye size={18} />
                                </Link>
                            </Can>

                            <Can perform="usuarios.editar">
                                <Link
                                    href={`/admin/usuarios/${userObj.id}?mode=edit`}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }}
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </Link>
                            </Can>

                            {userObj.ativo ? (
                                <Can perform="usuarios.deletar">
                                    <button
                                        onClick={() => handleArchiveUser(userObj.id, userObj.nome)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Inativar Usuário"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </Can>
                            ) : (
                                <Can perform="usuarios.reativar">
                                    <button
                                        onClick={() => handleReactivateUser(userObj.id, userObj.nome)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Reativar Acesso"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                </Can>
                            )}

                            <Can perform="permissoes.visualizar">
                                <Link
                                    href={`/admin/usuarios/${userObj.id}/permissoes`}
                                    title="Gerenciar Permissões"
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }}
                                >
                                    <Shield size={18} />
                                </Link>
                            </Can>
                        </div>

                        {/* AÇÕES DE MOBILE */}
                        <div className={styles.mobileActions}>
                            <ActionMenu
                                item={userObj} 
                                basePath="/admin/usuarios"
                                permissionPrefix="usuarios"
                                showPermissions={true}
                                onArchive={handleArchiveUser} 
                                onReactivate={handleReactivateUser} 
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
                        <input
                            type="text"
                            placeholder="Pesquisar usuários..."
                            className={styles.searchInput}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>

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

                <Can perform="usuarios.criar">
                    <Link href="/admin/usuarios/cadastro" className={styles.newButton}>
                        <Plus size={20} />
                        <span>Novo Usuário</span>
                    </Link>
                </Can>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    data={usuarios}
                    isLoading={loading}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                />
            </div>

            {!loading && usuarios.length > 0 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}