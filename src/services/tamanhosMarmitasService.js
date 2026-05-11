import api from "./api";

export async function buscarTamanhosMarmitas() {
    const response = await api.get("/tamanhos-marmitas");

    return response.data.data;
}