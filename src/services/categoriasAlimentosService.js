import api from './api';

export async function buscarCategoriasDeAlimentosAdmin(search = '', page = 1, statusFilter = 'all', sort = 'id', order = 'ASC', limit = 10) {
    // 🚀 Traduzindo para a linguagem do backend
    let excluidos = 'mixed';
    if (statusFilter === 'false') excluidos = 'false'; // Apenas ativas
    if (statusFilter === 'true') excluidos = 'true';   // Apenas inativas

    try {
        // 🚀 Ajuste a URL aqui se a sua rota for /categorias-alimentos ou /categorias-alimentos/admin
        const response = await api.get("/categorias-alimentos", {
            params: {
                search,
                page,
                limit,
                sort,
                order,
                excluidos,       // Bate com o req.query.excluidos
                status: 'todos'  // Ignora o filtro de booleano puro para usar o Soft Delete
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        throw new Error("Não foi possível carregar as categorias.");
    }
}

export async function buscarCategoriaPorId(id) {
    try {
        const response = await api.get(`/categorias-alimentos/${id}`);
        return response.data.data || response.data;
    } catch (error) {
        console.error(`Erro ao buscar categoria com ID ${id}:`, error);
        throw error;
    }
}

export async function criarCategoria(data) {
    try {
        const response = await api.post("/categorias-alimentos", data);
        return response.data.data;
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        throw error;
    }
}

export async function alterarCategoria(id, data) {
    try {
        const response = await api.patch(`/categorias-alimentos/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw error;
    }
}

export async function toggleCategoriaStatus(id, status) {
    try {
        let response;
        if (status === true) {
            response = await api.patch(`/categorias-alimentos/${id}/reativar`);
        } else {
            response = await api.delete(`/categorias-alimentos/${id}`);
        }
        return response.data;
    } catch (error) {
        console.error(`Erro ao ${status ? 'reativar' : 'inativar'} a categoria:`, error);
        throw error;
    }
}