"use client";

import Link from "next/link";

import {
    useEffect,
    useState
} from "react";

import {

    Edit,

    Eye,

    Filter,

    Plus,

    RotateCcw,

    Search,

    Trash2,

    Tags

} from "lucide-react";


import Swal from "sweetalert2";


import {
    useProdutos
} from "@/hooks/useProdutos.js";


import {

    alterarDisponibilidadeProduto,

    inativarProduto,

    reativarProduto

} from "@/services/produtosService.js";


import {
    buscarCategoriasProdutosParaSelect
} from "@/services/categoriasProdutosService.js";


import Table from "@/components/ui/table";
import ActionMenu from "@/components/ui/actionMenu";
import Pagination from "@/components/ui/pagination";
import Can from "@/components/ui/can";


/**
 * Usamos exatamente o CSS da tela de Alimentos.
 *
 * A ordem das colunas foi pensada para que
 * as mesmas regras mobile continuem funcionando.
 */
import styles from "../alimentos/AlimentosClient.module.css";


/**
 * Formata valores no padrão brasileiro.
 */
function formatarMoeda(
    valor
) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style:
                "currency",

            currency:
                "BRL"
        }
    );
}


export default function ProdutosClient() {

    const {

        produtos,

        loading,

        page,

        setPage,

        totalPages,

        setSearch,

        categoriaFilter,

        setCategoriaFilter,

        statusFilter,

        setStatusFilter,

        disponibilidadeFilter,

        setDisponibilidadeFilter,

        sortColumn,

        sortDirection,

        handleSort,

        refrescarLista

    } = useProdutos();


    const [
        inputValue,
        setInputValue
    ] = useState("");


    const [
        categorias,
        setCategorias
    ] = useState([]);


    /**
     * Pesquisa com debounce.
     */
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


    /**
     * Categorias utilizadas no filtro.
     */
    useEffect(() => {

        async function carregarCategorias() {

            try {

                const dados =
                    await buscarCategoriasProdutosParaSelect();


                setCategorias(
                    dados
                );

            } catch (error) {

                console.error(
                    "Erro ao carregar categorias:",
                    error
                );
            }
        }


        carregarCategorias();

    }, []);


    /**
     * Soft delete.
     */
    const handleArchiveProduto =
        async (
            id,
            nome
        ) => {

            const result =
                await Swal.fire({

                    title:
                        "Remover Produto?",

                    text:
                        `O produto "${nome}" deixará de aparecer no cardápio.`,

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

                await inativarProduto(
                    id
                );


                await Swal.fire({

                    title:
                        "Removido!",

                    text:
                        "Produto removido com sucesso.",

                    icon:
                        "success",

                    confirmButtonColor:
                        "#16a34a"
                });


                refrescarLista();

            } catch (error) {

                Swal.fire({

                    icon:
                        "error",

                    title:
                        "Erro",

                    text:
                        error
                            ?.response
                            ?.data
                            ?.message ||
                        "Não foi possível remover o produto."
                });
            }
        };


    /**
     * Restaura produto arquivado.
     */
    const handleReactivateProduto =
        async (
            id,
            nome
        ) => {

            const result =
                await Swal.fire({

                    title:
                        "Restaurar Produto?",

                    text:
                        `"${nome}" voltará ao cadastro, porém ficará indisponível até ser liberado.`,

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

                await reativarProduto(
                    id
                );


                await Swal.fire({

                    title:
                        "Restaurado!",

                    text:
                        "Produto restaurado. Libere-o quando quiser disponibilizá-lo.",

                    icon:
                        "success",

                    confirmButtonColor:
                        "#16a34a"
                });


                refrescarLista();

            } catch (error) {

                Swal.fire({

                    icon:
                        "error",

                    title:
                        "Erro",

                    text:
                        error
                            ?.response
                            ?.data
                            ?.message ||
                        "Não foi possível restaurar o produto."
                });
            }
        };


    /**
     * Altera disponibilidade do dia.
     */
    const handleDisponibilidade =
        async (
            produto
        ) => {

            const novoStatus =
                !produto.disponivel_hoje;


            try {

                await alterarDisponibilidadeProduto(

                    produto.id,

                    novoStatus
                );


                refrescarLista();

            } catch (error) {

                Swal.fire({

                    icon:
                        "error",

                    title:
                        "Erro",

                    text:
                        error
                            ?.response
                            ?.data
                            ?.message ||
                        "Não foi possível alterar a disponibilidade."
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
                "Produto",

            accessor:
                "nome",

            render:
                (
                    value,
                    item
                ) => (

                    <div>

                        <strong
                            style={{
                                color:
                                    "#18181b",

                                fontWeight:
                                    600
                            }}
                        >
                            {value}
                        </strong>


                        {item.descricao && (

                            <div
                                style={{
                                    color:
                                        "#71717a",

                                    fontSize:
                                        "0.78rem",

                                    marginTop:
                                        "3px",

                                    maxWidth:
                                        "320px",

                                    whiteSpace:
                                        "nowrap",

                                    overflow:
                                        "hidden",

                                    textOverflow:
                                        "ellipsis"
                                }}
                            >
                                {item.descricao}
                            </div>
                        )}

                    </div>
                )
        },


        /**
         * Coluna 3 fica oculta no mobile
         * pelo CSS já existente.
         */
        {
            header:
                "Categoria",

            accessor:
                "categoria_nome"
        },


        /**
         * Coluna 4 também fica oculta no mobile.
         */
        {
            header:
                "Disponibilidade",

            accessor:
                "disponivel_hoje",

            render:
                (
                    _,
                    item
                ) => {

                    const disponivel =
                        item.disponivel_hoje ===
                        true;


                    const badge = (

                        <span
                            style={{

                                display:
                                    "inline-flex",

                                alignItems:
                                    "center",

                                padding:
                                    "4px 8px",

                                borderRadius:
                                    "12px",

                                fontSize:
                                    "0.75rem",

                                fontWeight:
                                    700,

                                backgroundColor:
                                    disponivel
                                        ? "#dcfce7"
                                        : "#f4f4f5",

                                color:
                                    disponivel
                                        ? "#166534"
                                        : "#71717a",

                                border:
                                    "1px solid #e4e4e7"
                            }}
                        >

                            {disponivel
                                ? "Disponível"
                                : "Indisponível"}

                        </span>
                    );


                    if (
                        item.deletado_em ||
                        !item.ativo
                    ) {

                        return badge;
                    }


                    return (

                        <Can
                            perform="produtos.disponibilidade"
                            fallback={
                                badge
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    handleDisponibilidade(
                                        item
                                    )
                                }
                                style={{
                                    border:
                                        "none",

                                    background:
                                        "none",

                                    padding:
                                        0,

                                    cursor:
                                        "pointer"
                                }}
                                title="Alterar disponibilidade"
                            >

                                {badge}

                            </button>

                        </Can>
                    );
                }
        },


        /**
         * Mantemos Preço como coluna 5 para
         * continuar visível no mobile.
         */
        {
            header:
                "Preço",

            accessor:
                "preco",

            render:
                (
                    value
                ) => (

                    <strong
                        style={{
                            color:
                                "#18181b",

                            fontWeight:
                                600
                        }}
                    >
                        {formatarMoeda(
                            value
                        )}
                    </strong>
                )
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


                    const ativo =
                        item.ativo ===
                        true;


                    let label;
                    let background;
                    let color;


                    if (arquivado) {

                        label =
                            "Arquivado";

                        background =
                            "#fee2e2";

                        color =
                            "#991b1b";

                    } else if (ativo) {

                        label =
                            "Ativo";

                        background =
                            "#dcfce7";

                        color =
                            "#166534";

                    } else {

                        label =
                            "Inativo";

                        background =
                            "#fef3c7";

                        color =
                            "#92400e";
                    }


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


                    const isLastItems =
                        index >=
                        produtos.length - 2;


                    /**
                     * Para ActionMenu "ativo" representa
                     * se o registro está arquivado ou não.
                     *
                     * Não confundimos com produtos.ativo.
                     */
                    const itemMobile = {

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
                                    perform="produtos.visualizar"
                                >

                                    <Link
                                        href={`/admin/produtos/${item.id}?mode=view`}
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
                                        perform="produtos.editar"
                                    >

                                        <Link
                                            href={`/admin/produtos/${item.id}?mode=edit`}
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
                                        perform="produtos.deletar"
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleArchiveProduto(
                                                    item.id,
                                                    item.nome
                                                )
                                            }
                                            title="Remover"
                                            style={{
                                                color:
                                                    "#ef4444",

                                                border:
                                                    "none",

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
                                        perform="produtos.restaurar"
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleReactivateProduto(
                                                    item.id,
                                                    item.nome
                                                )
                                            }
                                            title="Restaurar"
                                            style={{
                                                color:
                                                    "#16a34a",

                                                border:
                                                    "none",

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
                                        itemMobile
                                    }

                                    basePath="/admin/produtos"

                                    permissionPrefix="produtos"

                                    reactivatePermission="produtos.restaurar"

                                    onArchive={
                                        handleArchiveProduto
                                    }

                                    onReactivate={
                                        handleReactivateProduto
                                    }

                                    isLast={
                                        isLastItems
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
                            placeholder="Buscar produtos..."
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
                                categoriaFilter
                            }
                            onChange={
                                (
                                    event
                                ) => {

                                    setCategoriaFilter(
                                        event.target.value
                                    );

                                    setPage(1);
                                }
                            }
                        >

                            <option value="">
                                Todas Categorias
                            </option>


                            {categorias.map(
                                (
                                    categoria
                                ) => (

                                    <option
                                        key={
                                            categoria.id
                                        }
                                        value={
                                            categoria.id
                                        }
                                    >
                                        {categoria.nome}
                                    </option>
                                )
                            )}

                        </select>

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
                                Ativos
                            </option>

                            <option value="inativo">
                                Inativos
                            </option>

                            <option value="arquivado">
                                Arquivados
                            </option>

                            <option value="todos">
                                Todos
                            </option>

                        </select>

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
                                disponibilidadeFilter
                            }
                            onChange={
                                (
                                    event
                                ) => {

                                    setDisponibilidadeFilter(
                                        event.target.value
                                    );

                                    setPage(1);
                                }
                            }
                        >

                            <option value="todos">
                                Disponibilidade
                            </option>

                            <option value="disponivel">
                                Disponíveis
                            </option>

                            <option value="indisponivel">
                                Indisponíveis
                            </option>

                        </select>

                    </div>

                </div>


                <div
                    style={{
                        display:
                            "flex",

                        gap:
                            "10px",

                        flexWrap:
                            "wrap"
                    }}
                >

                    <Can
                        perform="categorias_produtos.listar"
                    >

                        <Link
                            href="/admin/categorias-produtos"
                            className={
                                styles.newButton
                            }
                        >

                            <Tags
                                size={19}
                            />

                            <span>
                                Categorias
                            </span>

                        </Link>

                    </Can>


                    <Can
                        perform="produtos.criar"
                    >

                        <Link
                            href="/admin/produtos/cadastro"
                            className={
                                styles.newButton
                            }
                        >

                            <Plus
                                size={20}
                            />

                            <span>
                                Novo Produto
                            </span>

                        </Link>

                    </Can>

                </div>

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
                        produtos
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
                produtos.length > 0 &&
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