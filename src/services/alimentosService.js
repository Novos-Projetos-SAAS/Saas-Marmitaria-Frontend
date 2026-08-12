import api from "./api";

export async function buscarAlimentos(params = {}) {
    const response = await api.get("/alimentos", { params });
    return response.data.data;
}

export async function buscarAlimentosAdmin(search = '', page = 1, statusFilter = 'all', sort = 'id', order = 'ASC') {
    let excluidos = 'mixed';

    if (statusFilter === 'false') excluidos = 'false';
    if (statusFilter === 'true') excluidos = 'true';

    const response = await api.get("/alimentos/admin", {
        params: {
            search,
            page,
            limit: 10,
            sort,
            order,
            excluidos,
            status: 'todos'
        }
    });

    return response.data;
}

export async function buscarAlimentosDisponiveisHoje() {
    const response = await api.get("/alimentos/cardapio-hoje");
    return response.data.data || response.data || [];
}

export async function buscarAlimentoPorId(id) {
    const response = await api.get(`/alimentos/${id}`);
    return response.data.data || response.data;
}

export async function criarAlimento(data) {
    const response = await api.post("/alimentos", data);
    return response.data.data;
}

export async function alterarAlimento(id, data) {
    const response = await api.patch(`/alimentos/${id}`, data);
    return response.data.data;
}

export async function toggleAlimentoStatus(id, status) {
    let response;

    if (status === true) {
        response = await api.patch(`/alimentos/${id}/reativar`);
    } else {
        response = await api.delete(`/alimentos/${id}`);
    }

    return response.data;
}