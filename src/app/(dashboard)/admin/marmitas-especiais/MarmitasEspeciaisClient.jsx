'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Edit, Eye, Filter, Plus, Power, PowerOff, Search } from "lucide-react";
import Swal from "sweetalert2";

import { useMarmitasEspeciais } from "@/hooks/useMarmitasEspeciais.js";
import { alterarStatusMarmitaEspecial } from "@/services/marmitasEspeciaisService.js";

import Table from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import Can from "@/components/ui/can";

import styles from "./MarmitasEspeciaisClient.module.css";

export default function MarmitasEspeciaisClient() {
    const {
        marmitas,
        loading,
        page,
        setPage,
        totalPages,
        statusFilter,
        setStatusFilter,
        sortColumn,
        sortDirection,
        setSearch,
        handleSort,
        refrescarLista
    } = useMarmitasEspeciais();

    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearch(inputValue);
        }, 500);

        return () => clearTimeout(timeout);
    }, [inputValue, setSearch]);

    const handleAlterarStatus = async (marmita) => {
        const novoStatus = !marmita.ativo;

        const result = await Swal.fire({
            title: novoStatus ? "Ativar Marmita Especial?" : "Inativar Marmita Especial?",
            text: novoStatus
                ? `A opção "${marmita.nome}" voltará a aparecer para os clientes.`
                : `A opção "${marmita.nome}" deixará de aparecer para os clientes.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: novoStatus ? "#16a34a" : "#ef4444",
            cancelButtonColor: "#71717a",
            confirmButtonText: novoStatus ? "Sim, ativar" : "Sim, inativar",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) return;

        try {
            await alterarStatusMarmitaEspecial(marmita.id, novoStatus);

            await Swal.fire({
                icon: "success",
                title: novoStatus ? "Ativada!" : "Inativada!",
                text: novoStatus
                    ? "Marmita especial ativada com sucesso."
                    : "Marmita especial inativada com sucesso.",
                timer: 1600,
                showConfirmButton: false
            });

            await refrescarLista();
        } catch (error) {
            const message = error.response?.data?.message || "Não foi possível alterar o status da marmita especial.";

            await Swal.fire({
                icon: "error",
                title: "Erro",
                text: message,
                confirmButtonColor: "#ea580c"
            });
        }
    };

    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Nome", accessor: "nome" },
        {
            header: "Valor",
            accessor: "preco",
            render: (_, item) => (
                <span className={styles.preco}>
                    R$ {Number(item.preco).toFixed(2).replace(".", ",")}
                </span>
            )
        },
        {
            header: "Descrição",
            accessor: "descricao",
            render: (_, item) => (
                <span className={styles.descricao}>
                    {item.descricao || "Sem descrição"}
                </span>
            )
        },
        {
            header: "Status",
            accessor: "ativo",
            render: (_, item) => (
                <span className={item.ativo ? styles.badgeAtivo : styles.badgeInativo}>
                    {item.ativo ? "Ativa" : "Inativa"}
                </span>
            )
        },
        {
            header: "Ações",
            accessor: "id",
            className: styles.actionCell,
            render: (_, item) => (
                <div className={styles.actions}>
                    <Can perform="cardapio.gerenciar">
                        <Link
                            href={`/admin/marmitas-especiais/${item.id}?mode=view`}
                            className={styles.btnVisualizar}
                            title="Visualizar"
                        >
                            <Eye size={18} />
                        </Link>
                    </Can>

                    <Can perform="cardapio.gerenciar">
                        <Link
                            href={`/admin/marmitas-especiais/${item.id}?mode=edit`}
                            className={styles.btnEditar}
                            title="Editar"
                        >
                            <Edit size={18} />
                        </Link>
                    </Can>

                    <Can perform="cardapio.gerenciar">
                        <button
                            type="button"
                            onClick={() => handleAlterarStatus(item)}
                            className={item.ativo ? styles.btnInativar : styles.btnAtivar}
                            title={item.ativo ? "Inativar" : "Ativar"}
                        >
                            {item.ativo ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                    </Can>
                </div>
            )
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
                            placeholder="Buscar marmitas especiais..."
                            className={styles.searchInput}
                            value={inputValue}
                            onChange={(event) => setInputValue(event.target.value)}
                        />
                    </div>

                    <div className={styles.selectWrapper}>
                        <Filter size={16} className={styles.filterIcon} />

                        <select
                            className={styles.statusSelect}
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <option value="todos">Todos</option>
                            <option value="ativos">Apenas Ativas</option>
                            <option value="inativos">Apenas Inativas</option>
                        </select>
                    </div>
                </div>

                <Can perform="cardapio.gerenciar">
                    <Link
                        href="/admin/marmitas-especiais/cadastro"
                        className={styles.newButton}
                    >
                        <Plus size={20} />
                        <span>Nova Marmita Especial</span>
                    </Link>
                </Can>
            </div>

            <div className={styles.tableContainer}>
                <Table
                    columns={columns}
                    data={marmitas}
                    isLoading={loading}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                />
            </div>

            {!loading && marmitas.length > 0 && totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
