import api from "./api";

export async function buscarAlimentos(params = {}) {
    const response = await api.get("/alimentos",{ params });
    return response.data.data;
}

export async function buscarAlimentosAdmin(search = '', page = 1, statusFilter = 'all', sort = 'id', order = 'ASC') {
    let excluidos = 'mixed';
    if (statusFilter === 'false') excluidos = 'false'; 
    if (statusFilter === 'true') excluidos = 'true';   

    try {
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
    } catch (error) {
        console.error("Erro ao buscar alimentos:", error);
        throw new Error("Não foi possível carregar os alimentos.");
    }
}

export async function buscarAlimentoPorId(id) {
    try {
        const response = await api.get(`/alimentos/${id}`);
        return response.data.data || response.data;
    } catch (error) {
        console.error(`Erro ao buscar alimento ${id}:`, error);
        throw error;
    }
}

export async function criarAlimento(data) {
    try {
        const response = await api.post("/alimentos", data);
        return response.data.data;
    } catch (error) {
        console.error("Erro ao criar alimento:", error);
        throw error;
    }
}

export async function alterarAlimento(id, data) {
    try {
        const response = await api.patch(`/alimentos/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error("Erro ao atualizar alimento:", error);
        throw error;
    }
}

export async function toggleAlimentoStatus(id, status) {
    try {
        let response;
        if (status === true) {
            response = await api.patch(`/alimentos/${id}/reativar`);
        } else {
            response = await api.delete(`/alimentos/${id}`);
        }
        return response.data;
    } catch (error) {
        console.error(`Erro ao ${status ? 'reativar' : 'inativar'} o alimento:`, error);
        throw error;
    }
}