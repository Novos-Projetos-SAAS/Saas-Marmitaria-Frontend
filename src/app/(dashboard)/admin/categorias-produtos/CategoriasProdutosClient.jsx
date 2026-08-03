"use client";

import {
    useEffect,
    useState
} from "react";

import Link from "next/link";

import {

    Edit,

    Eye,

    Filter,

    Plus,

    RotateCcw,

    Search,

    Trash2

} from "lucide-react";

import Swal from "sweetalert2";


import {
    useCategoriasProdutos
} from "@/hooks/useCategoriasProdutos.js";


import {

    inativarCategoriaProduto,

    reativarCategoriaProduto

} from "@/services/categoriasProdutosService.js";


import Table from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import ActionMenu from "@/components/ui/actionMenu";
import Can from "@/components/ui/can";


import styles from "../categorias-alimentos/CategoriasAlimentosClient.module.css";


export default function CategoriasProdutosClient() {

    const {

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

        refrescarLista

    } = useCategoriasProdutos();


    const [
        inputValue,
        setInputValue
    ] = useState("");


    useEffect(() => {

        const timeout =
            setTimeout(
                () => {

                    setSearch(
                        inputValue
                    );

                    setPage(1);

                },
                500
            );


        return () =>
            clearTimeout(
                timeout
            );

    }, [
        inputValue,
        setSearch,
        setPage
    ]);


    const handleArchive =
        async (
            id,
            nome
        ) => {

            const result =
                await Swal.fire({

                    title:
                        "Remover Categoria?",

                    text:
                        `Deseja remover "${nome}"?`,

                    icon:
                        "warning",

                    showCancelButton:
                        true,

                    confirmButtonColor:
                        "#ef4444",

                    cancelButtonColor:
                        "#6b7280",

                    confirmButtonText:
                        "Sim, remover!",

                    cancelButtonText:
                        "Cancelar"
                });


            if (
                !result.isConfirmed
            ) {

                return;
            }


            try {

                await inativarCategoriaProduto(
                    id
                );


                await Swal.fire({

                    icon:
                        "success",

                    title:
                        "Removida!",

                    text:
                        "Categoria removida com sucesso.",

                    confirmButtonColor:
                        "#16a34a"
                });


                refrescarLista();

            } catch (error) {

                await Swal.fire({

                    icon:
                        "error",

                    title:
                        "Não foi possível remover",

                    text:
                        error
                            ?.response
                            ?.data
                            ?.message ||
                        "Verifique se ainda existem produtos nesta categoria."
                });
            }
        };


    const handleReactivate =
        async (
            id,
            nome
        ) => {

            const result =
                await Swal.fire({

                    title:
                        "Restaurar Categoria?",

                    text:
                        `"${nome}" voltará a ficar disponível.`,

                    icon:
                        "question",

                    showCancelButton:
                        true,

                    confirmButtonColor:
                        "#16a34a",

                    cancelButtonColor:
                        "#6b7280",

                    confirmButtonText:
                        "Sim, restaurar!",

                    cancelButtonText:
                        "Cancelar"
                });


            if (
                !result.isConfirmed
            ) {

                return;
            }


            try {

                await reativarCategoriaProduto(
                    id
                );


                refrescarLista();

            } catch (error) {

                await Swal.fire({

                    icon:
                        "error",

                    title:
                        "Erro",

                    text:
                        error
                            ?.response
                            ?.data
                            ?.message ||
                        "Não foi possível restaurar a categoria."
                });
            }
        };


    const columns = [

        {
            header:
                "ID",

            accessor:
                "id"
        },


        {
            header:
                "Nome",

            accessor:
                "nome"
        },


        {
            header:
                "Produtos",

            accessor:
                "total_produtos",

            render:
                (
                    value
                ) => (

                    <span
                        style={{
                            fontWeight:
                                600,

                            color:
                                "#52525b"
                        }}
                    >
                        {value || 0} produto(s)
                    </span>
                )
        },


        {
            header:
                "Ordem",

            accessor:
                "ordem_exibicao"
        },


        {
            header:
                "Status",

            accessor:
                "ativo",

            render:
                (
                    _,
                    item
                ) => {

                    const arquivado =
                        item.deletado_em !==
                        null;


                    const label =
                        arquivado
                            ? "Arquivada"
                            : item.ativo
                                ? "Ativa"
                                : "Inativa";


                    const background =
                        arquivado
                            ? "#fee2e2"
                            : item.ativo
                                ? "#dcfce7"
                                : "#fef3c7";


                    const color =
                        arquivado
                            ? "#991b1b"
                            : item.ativo
                                ? "#166534"
                                : "#92400e";


                    return (

                        <span
                            style={{

                                backgroundColor:
                                    background,

                                color,

                                padding:
                                    "4px 8px",

                                borderRadius:
                                    "12px",

                                fontSize:
                                    "0.75rem",

                                fontWeight:
                                    "bold",

                                border:
                                    "1px solid #e5e7eb"
                            }}
                        >

                            {label}

                        </span>
                    );
                }
        },


        {
            header:
                "Ações",

            accessor:
                "actions",

            className:
                styles.actionCell,

            render:
                (
                    _,
                    item,
                    index
                ) => {

                    const arquivado =
                        item.deletado_em !==
                        null;


                    const mobileItem = {

                        ...item,

                        ativo:
                            !arquivado
                    };


                    return (

                        <>

                            <div
                                className={
                                    styles.desktopActions
                                }
                            >

                                <Can
                                    perform="categorias_produtos.listar"
                                >

                                    <Link
                                        href={`/admin/categorias-produtos/${item.id}?mode=view`}
                                        title="Visualizar"
                                        style={{
                                            color:
                                                "#2563eb",

                                            display:
                                                "flex"
                                        }}
                                    >

                                        <Eye
                                            size={18}
                                        />

                                    </Link>

                                </Can>


                                {!arquivado && (

                                    <Can
                                        perform="categorias_produtos.editar"
                                    >

                                        <Link
                                            href={`/admin/categorias-produtos/${item.id}?mode=edit`}
                                            title="Editar"
                                            style={{
                                                color:
                                                    "#2563eb",

                                                display:
                                                    "flex"
                                            }}
                                        >

                                            <Edit
                                                size={18}
                                            />

                                        </Link>

                                    </Can>
                                )}


                                {!arquivado ? (

                                    <Can
                                        perform="categorias_produtos.deletar"
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleArchive(
                                                    item.id,
                                                    item.nome
                                                )
                                            }
                                            style={{
                                                color:
                                                    "#ef4444",

                                                border:
                                                    0,

                                                background:
                                                    "none",

                                                cursor:
                                                    "pointer"
                                            }}
                                        >

                                            <Trash2
                                                size={18}
                                            />

                                        </button>

                                    </Can>

                                ) : (

                                    <Can
                                        perform="categorias_produtos.restaurar"
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleReactivate(
                                                    item.id,
                                                    item.nome
                                                )
                                            }
                                            style={{
                                                color:
                                                    "#16a34a",

                                                border:
                                                    0,

                                                background:
                                                    "none",

                                                cursor:
                                                    "pointer"
                                            }}
                                        >

                                            <RotateCcw
                                                size={18}
                                            />

                                        </button>

                                    </Can>
                                )}

                            </div>


                            <div
                                className={
                                    styles.mobileActions
                                }
                            >

                                <ActionMenu

                                    item={
                                        mobileItem
                                    }

                                    basePath="/admin/categorias-produtos"

                                    permissionPrefix="categorias_produtos"

                                    viewPermission="categorias_produtos.listar"

                                    reactivatePermission="categorias_produtos.restaurar"

                                    onArchive={
                                        handleArchive
                                    }

                                    onReactivate={
                                        handleReactivate
                                    }

                                    isLast={
                                        index >=
                                        categorias.length -
                                        2
                                    }
                                />

                            </div>

                        </>
                    );
                }
        }
    ];


    return (

        <div
            className={
                styles.wrapper
            }
        >

            <div
                className={
                    styles.actionsBar
                }
            >

                <div
                    className={
                        styles.filtersGroup
                    }
                >

                    <div
                        className={
                            styles.searchWrapper
                        }
                    >

                        <Search
                            size={20}
                            className={
                                styles.searchIcon
                            }
                        />


                        <input
                            type="text"
                            placeholder="Buscar categorias..."
                            className={
                                styles.searchInput
                            }
                            value={
                                inputValue
                            }
                            onChange={
                                (
                                    event
                                ) =>
                                    setInputValue(
                                        event.target.value
                                    )
                            }
                        />

                    </div>


                    <div
                        className={
                            styles.selectWrapper
                        }
                    >

                        <Filter
                            size={16}
                            className={
                                styles.filterIcon
                            }
                        />


                        <select
                            className={
                                styles.statusSelect
                            }
                            value={
                                statusFilter
                            }
                            onChange={
                                (
                                    event
                                ) => {

                                    setStatusFilter(
                                        event.target.value
                                    );

                                    setPage(1);
                                }
                            }
                        >

                            <option value="ativo">
                                Ativas
                            </option>

                            <option value="inativo">
                                Inativas
                            </option>

                            <option value="arquivado">
                                Arquivadas
                            </option>

                            <option value="todos">
                                Todas
                            </option>

                        </select>

                    </div>

                </div>


                <Can
                    perform="categorias_produtos.criar"
                >

                    <Link
                        href="/admin/categorias-produtos/cadastro"
                        className={
                            styles.newButton
                        }
                    >

                        <Plus
                            size={20}
                        />

                        <span>
                            Nova Categoria
                        </span>

                    </Link>

                </Can>

            </div>


            <div
                className={
                    styles.tableContainer
                }
            >

                <Table
                    columns={
                        columns
                    }
                    data={
                        categorias
                    }
                    isLoading={
                        loading
                    }
                    onSort={
                        handleSort
                    }
                    sortColumn={
                        sortColumn
                    }
                    sortDirection={
                        sortDirection
                    }
                />

            </div>


            {!loading &&
                categorias.length > 0 &&
                totalPages > 1 && (

                    <Pagination
                        currentPage={
                            page
                        }
                        totalPages={
                            totalPages
                        }
                        onPageChange={
                            setPage
                        }
                    />
                )}

        </div>
    );
}