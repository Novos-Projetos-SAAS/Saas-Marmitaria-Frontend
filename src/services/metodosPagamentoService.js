import api from "./api";

export async function buscarMetodosDePagamento() {
    try {
        const response = await api.get('/metodos-pagamentos')

        return response.data.data

    } catch (error) {
        console.error("Erro ao buscar meios de pagamento:", error);
        return []; // Retorna array vazio em caso de falha para não quebrar o map() no front
    }
}