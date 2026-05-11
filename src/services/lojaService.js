import api from "./api";

export async function buscarStatusLoja() {
    try {
        const response = await api.get('/status-loja')
        return response.data.data.esta_aberta;
    } catch (error) {
        console.error("Erro ao buscar status da loja", error);
    return false;
    }
}

export async function alterarStatusLoja(novoStatus) {
    const response = await api.patch('/status-loja/alterar',
        {aberta: novoStatus}
    )

    return response.data.data
}