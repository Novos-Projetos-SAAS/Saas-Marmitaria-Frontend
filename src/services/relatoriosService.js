import api from './api'; // Importe a sua instância do axios configurada com os interceptors/tokens

export async function listarRelatorios() {
    const { data } = await api.get('/relatorios');
    return data.data; // Retorna o array que está dentro de "data" no backend
};

export async function gerarRelatorio(id, filtros) {
    const { data } = await api.post(`/relatorios/${id}/gerar`, filtros);
    return data.data; // Retorna os dados do relatório { nome, colunas, dados }
};