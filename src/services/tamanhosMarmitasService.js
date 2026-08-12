import api from "./api";

export async function buscarTamanhosMarmitasParaMontagem() {
    const response = await api.get("/tamanhos-marmitas");
    return response.data.data;
}

export async function buscarTamanhosMarmitasAdmin(
    search = '',
    page = 1,
    status = 'all',
    sort = 'id',
    order = 'ASC'
) {
    const response = await api.get("/tamanhos-marmitas/admin", {
        params: {
            search,
            page,
            limit: 10,
            sort,
            order,
            deletados: status
        }
    });

    return response.data;
}

export async function buscarTamanhoPorId(id) {
    const response = await api.get(`/tamanhos-marmitas/${id}`);
    return response.data.data || response.data;
}

export async function criarTamanhoMarmita(tamanhoData) {
    const response = await api.post("/tamanhos-marmitas", tamanhoData);
    return response.data.data;
}

export async function alterarTamanhoMarmita(id, tamanhoData) {
    const response = await api.patch(`/tamanhos-marmitas/${id}`, tamanhoData);
    return response.data.data;
}

export async function toggleTamanhoStatus(id, status) {
    let response;

    if (status === true) {
        response = await api.patch(`/tamanhos-marmitas/${id}/reativar`);
    } else {
        response = await api.delete(`/tamanhos-marmitas/${id}`);
    }

    return response.data;
}