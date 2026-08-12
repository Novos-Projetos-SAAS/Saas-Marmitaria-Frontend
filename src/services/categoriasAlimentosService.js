import api from './api';

export async function buscarCategoriasDeAlimentosAdmin(
    search = '',
    page = 1,
    statusFilter = 'all',
    sort = 'id',
    order = 'ASC',
    limit = 10
) {
    let excluidos = 'mixed';

    if (statusFilter === 'false') {
        excluidos = 'false';
    }

    if (statusFilter === 'true') {
        excluidos = 'true';
    }

    const response = await api.get("/categorias-alimentos", {
        params: {
            search,
            page,
            limit,
            sort,
            order,
            excluidos,
            status: 'todos'
        }
    });

    // Retorna o objeto completo porque a listagem precisa da paginação.
    return response.data;
}

export async function buscarCategoriaPorId(id) {
    const response = await api.get(`/categorias-alimentos/${id}`);
    return response.data.data || response.data;
}

export async function criarCategoria(data) {
    const response = await api.post("/categorias-alimentos", data);
    return response.data.data;
}

export async function alterarCategoria(id, data) {
    const response = await api.patch(`/categorias-alimentos/${id}`, data);
    return response.data.data;
}

export async function toggleCategoriaStatus(id, status) {
    let response;

    if (status === true) {
        response = await api.patch(`/categorias-alimentos/${id}/reativar`);
    } else {
        response = await api.delete(`/categorias-alimentos/${id}`);
    }

    return response.data;
}