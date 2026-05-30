import api from "./api";

// Puxa todos os alimentos para a tela do Admin (limit alto para não ter paginação)
export async function buscarCardapioCompleto() {
    try {
        const response = await api.get("/alimentos/admin", {
            params: { limit: 1000, excluidos: 'false', sort: 'categoria_id', order: 'ASC' }
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Erro ao buscar cardápio completo:", error);
        throw error;
    }
}

// Rota de ligar/desligar a chavinha
export async function toggleDisponibilidade(id, disponivel_hoje) {
    try {
        const response = await api.patch(`/alimentos/${id}/disponibilidade`, { disponivel_hoje });
        return response.data;
    } catch (error) {
        console.error("Erro ao alterar disponibilidade:", error);
        throw error;
    }
}

// Botão vermelho de Encerrar Expediente
export async function zerarCardapioDiario() {
    try {
        const response = await api.patch("/alimentos/zerar-cardapio");
        return response.data;
    } catch (error) {
        console.error("Erro ao zerar cardápio:", error);
        throw error;
    }
}