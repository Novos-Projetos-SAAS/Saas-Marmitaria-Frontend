import api from "./api";

export const buscarDadosEmpresa = async () => {
    try {
        const response = await api.get('/configuracoes/empresa');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        throw error;
    }
};

export const atualizarDadosEmpresa = async (payload) => {
    try {
        const response = await api.put('/configuracoes/empresa', payload);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar dados da empresa:", error);
        throw error;
    }
};