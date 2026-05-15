"use client";

import Link from "next/link";
import { Edit, Plus, Eye, Search, Trash2, RotateCcw, Filter, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

import { useUsuarios } from "@/hooks/useUsuarios.js";
import { Table } from "@/components/ui/table";
import { ActionMenu } from "@/components/ui/actionMenu";
import { Pagination } from "@/components/ui/pagination";
import { Can } from "@/components/ui/can";

import { toggleUserStatus } from "@/services/usuariosService.js";
import styles from "./UsuariosClient.module.css";

export default function UsuariosClient() {
    const {
        usuarios, 
        loading, 
        listarUsuarios, // Nome corrigido do hook
        page, 
        totalPages,
        sortColumn, 
        sortDirection, 
        handleSort
    } = useUsuarios();

    const [inputValue, setInputValue] = useState("");
    // 'false' significa que deletado_em é null (ou seja, usuários ativos)
    const [statusFilter, setStatusFilter] = useState("false"); 
    const isMounted = useRef(false);

    // 1. BUSCA INICIAL (Roda apenas na montagem)
    useEffect(() => {
        // Ordenação padrão pelo backend do Knex: 'usuarios.id'
        listarUsuarios("", 1, statusFilter, "usuarios.id", "ASC"); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. EFEITO INSTANTÂNEO (Filtro de Status e Ordenação)
    useEffect(() => {
        if (!isMounted.current) return;
        listarUsuarios(inputValue, 1, statusFilter, sortColumn, sortDirection);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, sortColumn, sortDirection]);

    // 3. EFEITO DEBOUNCE (Apenas para Digitação no Input)
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            listarUsuarios(inputValue, 1, statusFilter, sortColumn, sortDirection);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

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
                listarUsuarios(inputValue, page, statusFilter, sortColumn, sortDirection);
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
                listarUsuarios(inputValue, page, statusFilter, sortColumn, sortDirection);
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
            render: (item) => (
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
            render: (item) => (
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
            accessor: "actions",
            render: (user) => (
                <>
                    {/* AÇÕES DE DESKTOP */}
                    <div className={styles.desktopActions}>
                        <Can perform="usuarios.visualizar">
                            <Link
                                href={`/admin/usuarios/${user.id}?mode=view`}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }}
                                title="Visualizar"
                            >
                                <Eye size={18} />
                            </Link>
                        </Can>

                        <Can perform="usuarios.editar">
                            <Link
                                href={`/admin/usuarios/${user.id}?mode=edit`}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }}
                                title="Editar"
                            >
                                <Edit size={18} />
                            </Link>
                        </Can>

                        {user.ativo ? (
                            <Can perform="usuarios.deletar">
                                <button
                                    onClick={() => handleArchiveUser(user.id, user.nome)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                    title="Inativar Usuário"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </Can>
                        ) : (
                            <Can perform="usuarios.reativar">
                                <button
                                    onClick={() => handleReactivateUser(user.id, user.nome)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer' }}
                                    title="Reativar Acesso"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </Can>
                        )}

                        <Can perform="permissoes.visualizar">
                            <Link
                                href={`/admin/usuarios/${user.id}/permissions`}
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
                            user={user}
                            onArchive={handleArchiveUser}
                            onReactivate={handleReactivateUser}
                        />
                    </div>
                </>
            ),
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
                    <Link href="/admin/usuarios/register" className={styles.newButton}>
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