import api from "./api";


/**
 * Traduz o filtro visual do Frontend
 * para os parâmetros aceitos pelo Backend.
 */
function traduzirStatus(
    statusFilter
) {

    switch (
        statusFilter
    ) {

        case "ativo":

            return {
                status: "ativo",
                excluidos: "false"
            };


        case "inativo":

            return {
                status: "inativo",
                excluidos: "false"
            };


        case "arquivado":

            return {
                status: "todos",
                excluidos: "true"
            };


        case "todos":

            return {
                status: "todos",
                excluidos: "mixed"
            };


        default:

            return {
                status: "ativo",
                excluidos: "false"
            };
    }
}


/**
 * Listagem administrativa.
 */
export async function buscarCategoriasProdutosAdmin({

    search = "",

    page = 1,

    limit = 10,

    statusFilter = "ativo",

    sort = "ordem_exibicao",

    order = "ASC"

} = {}) {

    const filtroStatus =
        traduzirStatus(
            statusFilter
        );


    const response =
        await api.get(
            "/categorias-produtos/admin",
            {

                params: {

                    search,

                    page,

                    limit,

                    sort,

                    order,

                    ...filtroStatus
                }
            }
        );


    return response.data;
}


/**
 * Retorna categorias não excluídas
 * para selects administrativos.
 *
 * Incluímos categorias inativas para que
 * produtos antigos continuem exibindo
 * corretamente sua categoria.
 */
export async function buscarCategoriasProdutosParaSelect() {

    const response =
        await api.get(
            "/categorias-produtos/admin",
            {

                params: {

                    page:
                        1,

                    limit:
                        100,

                    status:
                        "todos",

                    excluidos:
                        "false",

                    sort:
                        "nome",

                    order:
                        "ASC"
                }
            }
        );


    return response.data?.data || [];
}


/**
 * Busca uma categoria específica.
 */
export async function buscarCategoriaProdutoPorId(
    id
) {

    const response =
        await api.get(
            `/categorias-produtos/${id}`
        );


    return (
        response.data?.data ||
        response.data
    );
}


/**
 * Cadastra categoria.
 */
export async function criarCategoriaProduto(
    data
) {

    const response =
        await api.post(
            "/categorias-produtos",
            data
        );


    return response.data?.data;
}


/**
 * Edita categoria.
 */
export async function alterarCategoriaProduto(
    id,
    data
) {

    const response =
        await api.patch(
            `/categorias-produtos/${id}`,
            data
        );


    return response.data?.data;
}


/**
 * Soft delete.
 */
export async function inativarCategoriaProduto(
    id
) {

    const response =
        await api.delete(
            `/categorias-produtos/${id}`
        );


    return response.data;
}


/**
 * Restauração.
 */
export async function reativarCategoriaProduto(
    id
) {

    const response =
        await api.patch(
            `/categorias-produtos/${id}/reativar`
        );


    return response.data;
}