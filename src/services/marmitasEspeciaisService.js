import api from "./api";

export async function buscarMarmitasEspeciaisPublicas() {
    const response = await api.get("/marmitas-especiais");
    return response.data.data || [];
}

export async function buscarMarmitasEspeciaisAdmin(
    search = "",
    page = 1,
    status = "todos",
    sort = "id",
    order = "DESC"
) {
    const response = await api.get("/marmitas-especiais/admin", {
        params: {
            search,
            page,
            limit: 10,
            status,
            sort,
            order
        }
    });

    return response.data;
}

export async function buscarMarmitaEspecialPorId(id) {
    const response = await api.get(`/marmitas-especiais/${id}`);
    return response.data.data;
}

export async function criarMarmitaEspecial(payload) {
    const response = await api.post("/marmitas-especiais", payload);
    return response.data.data;
}

export async function editarMarmitaEspecial(id, payload) {
    const response = await api.patch(`/marmitas-especiais/${id}`, payload);
    return response.data.data;
}

export async function alterarStatusMarmitaEspecial(id, ativo) {
    const response = await api.patch(`/marmitas-especiais/${id}/status`, {
        ativo
    });

    return response.data;
}
