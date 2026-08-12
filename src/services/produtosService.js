import api from "./api";

function traduzirStatus(statusFilter) {
    switch (statusFilter) {
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

export async function buscarProdutosAdmin({
    search = "",
    page = 1,
    limit = 10,
    categoriaId = "",
    statusFilter = "ativo",
    disponibilidade = "todos",
    sort = "ordem_exibicao",
    order = "ASC"
} = {}) {
    const filtroStatus = traduzirStatus(statusFilter);

    const response = await api.get("/produtos/admin", {
        params: {
            search,
            page,
            limit,
            categoria_id: categoriaId || undefined,
            disponibilidade,
            sort,
            order,
            ...filtroStatus
        }
    });

    return response.data;
}

export async function buscarProdutosCardapio(categoriaId = null) {
    const response = await api.get("/produtos/cardapio", {
        params: {
            categoria_id: categoriaId || undefined
        }
    });

    return response.data?.data || [];
}

export async function buscarProdutoPorId(id) {
    const response = await api.get(`/produtos/${id}`);
    return response.data?.data || response.data;
}

export async function criarProduto(data) {
    const response = await api.post("/produtos", data);
    return response.data?.data;
}

export async function alterarProduto(id, data) {
    const response = await api.patch(`/produtos/${id}`, data);
    return response.data?.data;
}

export async function alterarDisponibilidadeProduto(id, disponivel_hoje) {
    const response = await api.patch(`/produtos/${id}/disponibilidade`, {
        disponivel_hoje
    });

    return response.data;
}

export async function inativarProduto(id) {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
}

export async function reativarProduto(id) {
    const response = await api.patch(`/produtos/${id}/reativar`);
    return response.data;
}