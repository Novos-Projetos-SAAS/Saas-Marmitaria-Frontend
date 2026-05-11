import api from "./api";

export async function buscarAlimentos(params = {}) {
    const response = await api.get("/alimentos",{ params });
    return response.data.data;
}