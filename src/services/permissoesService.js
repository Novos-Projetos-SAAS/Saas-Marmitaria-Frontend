import api from "./api";

export const listarTodasPermissoes = async () => {
    try {
        const response = await api.get('/permissoes');
        return response.data.data || [];
    }
    catch (error) {
        console.error('Erro ao buscar permissões:', error);
        throw error;
    }
};

export const listarPermissoesDoUsuario = async (userId) => {
    try {
        const response = await api.get(`/permissoes/${userId}`);
        return response.data.data || [];
    }
    catch (error) {
        console.error(`Erro ao buscar permissões do usuário ${userId}:`, error);
        throw error;
    }
};

export const atualizarPermissoesDoUsuario = async (userId, permissoes) => {
    try {
        const response = await api.patch(`/permissoes/${userId}/alterar`, { permissoes });
        return response.data;
    }
    catch (error) {
        console.error(`Erro ao atualizar permissões do usuário ${userId}:`, error);
        throw error;
    }
};