"use client";

import Link from "next/link";

import { useState, useEffect, useMemo } from "react";

import { useTamanhosMarmitas } from "@/hooks/useTamanhosMarmitas.js";

import Table from "@/components/ui/table";
import ActionMenu from "@/components/ui/actionMenu";
import Pagination from "@/components/ui/pagination";
import Can from "@/components/ui/can";

import { Edit, Plus, Search, Trash2, RotateCcw, Filter } from "lucide-react";
import Swal from "sweetalert2";

import styles from "./tamanhosClient.module.css";

export default function TamanhosClient() {
    const {
        tamanhos,
        loading,
        carregarTamanhos,
        handleToggleStatus,
        handleDeletar
    } = useTamanhosMarmitas();

    useEffect(() => {
        carregarTamanhos();
    }, [carregarTamanhos]);

    // Estados locais para busca, filtro e paginação
    const [inputValue, setInputValue] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const itensPorPagina = 10;

    // Lógica Local de Filtro e Busca
   const dadosFiltrados = useMemo(() => {
        return tamanhos.filter(tamanho => {
            const matchBusca = tamanho.nome.toLowerCase().includes(inputValue.toLowerCase());
            
            let matchStatus = true;
            // 🚀 Usando !! para garantir que o JavaScript leia como verdadeiro/falso
            if (statusFilter === "true") matchStatus = !tamanho.ativo;  // Quer inativos
            if (statusFilter === "false") matchStatus = !!tamanho.ativo; // Quer ativos

            return matchBusca && matchStatus;
        });
    }, [tamanhos, inputValue, statusFilter]);

    // Lógica Local de Paginação
    const totalPages = Math.ceil(dadosFiltrados.length / itensPorPagina);
    const dadosPaginados = useMemo(() => {
        const inicio = (page - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        return dadosFiltrados.slice(inicio, fim);
    }, [dadosFiltrados, page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleSearchChange = (e) => {
        setInputValue(e.target.value);
        setPage(1); // Reseta a página ao buscar
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1); // Reseta a página ao filtrar
    };

    const handleArchiveTamanho = async (id, nome) => {
        const result = await Swal.fire({
            title: 'Desativar Tamanho?',
            text: `O tamanho "${nome}" não poderá mais ser comprado.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, desativar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await handleToggleStatus(id, true); // Status atual é true, vai virar false
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
            await handleToggleStatus(id, false); // Status atual é false, vai virar true
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
            accessor: "id",
            className: styles.actionCell,
            render: (value, row, index) => {
                const itemObj = row || value;
                if (!itemObj || typeof itemObj !== 'object') return null;
                const isLastItems = index >= dadosPaginados.length - 2;

                return (
                    <>
                        {/* AÇÕES DE DESKTOP */}
                        <div className={styles.desktopActions}>
                            <Can perform="tamanhos_marmitas.editar">
                                <Link
                                    href={`/tamanhos-marmitas/${itemObj.id}?mode=edit`}
                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb', textDecoration: 'none' }}
                                    title="Editar"
                                >
                                    <Edit size={18} />
                                </Link>
                            </Can>

                            {itemObj.ativo ? (
                                <Can perform="tamanhos_marmitas.editar">
                                    <button
                                        onClick={() => handleArchiveTamanho(itemObj.id, itemObj.nome)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                        title="Desativar Tamanho"
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

                        {/* AÇÕES DE MOBILE (3 Pontinhos) */}
                        <div className={styles.mobileActions}>
                            <ActionMenu
                                usuario={itemObj} // Usando a mesma prop do seu componente base
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
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar tamanhos..."
                            className={styles.searchInput}
                            value={inputValue}
                            onChange={handleSearchChange}
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

                <Can perform="tamanhos_marmitas.criar">
                    <Link href="/tamanhos-marmitas/cadastro" className={styles.newButton}>
                        <Plus size={20} />
                        <span>Novo Tamanho</span>
                    </Link>
                </Can>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    data={dadosPaginados}
                    isLoading={loading}
                // onSort={handleSort} // Habilite caso tenha ordenação na Table
                />
            </div>

            {!loading && dadosFiltrados.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}