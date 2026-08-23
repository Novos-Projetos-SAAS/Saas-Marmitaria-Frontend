import api from "./api.js";

export async function buscarDadosDashboard({ dataInicio, dataFim, signal }) {
    const { data } = await api.get("/dashboard", {
        params: {
            data_inicio: dataInicio,
            data_fim: dataFim
        },
        signal
    });

    return data.data;
}
