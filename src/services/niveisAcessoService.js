import api from "./api";

export async function buscarNiveisAcesso() {

    try {
        const response = await api.get('/niveis-acesso')
        return response.data.data;
    } catch (error) {
        console.error("Erro ao buscar níveis de acesso:", error);
        throw error;
    }
    
}
