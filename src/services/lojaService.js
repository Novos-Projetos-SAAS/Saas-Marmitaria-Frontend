import api from "./api";

export async function buscarStatusLoja() {
    try {
        const response = await api.get('/status-loja');
        // O seu JSON retorna { data: { esta_aberta: true } }
        return response.data.data.esta_aberta; 
    } catch (error) {
        console.error("Erro ao buscar status da loja", error);
        return false;
    }
}

export async function alterarStatusLoja(novoStatus) {
    // AJUSTE: Mude de 'aberta' para 'esta_aberta' para bater com o banco
    const response = await api.patch('/status-loja/alterar', {
        esta_aberta: novoStatus 
    });

    return response.data.data;
}