import api from './api.js';

export async function buscarStatusLoja() {
    const response = await api.get('/status-loja');
    return response.data?.data?.esta_aberta ?? null;
}

export async function alterarStatusLoja(novoStatus) {
    const response = await api.patch('/status-loja/alterar', {
        esta_aberta: novoStatus
    });

    return response.data;
}
