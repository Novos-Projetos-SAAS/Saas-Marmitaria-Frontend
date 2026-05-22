import api from "./api";

export async function buscarTamanhosMarmitasParaMontagem() {
    try {
        const response = await api.get("/tamanhos-marmitas");
        return response.data.data;
    } catch (error) {
        console.error(error);
        throw new Error("Não foi possível carregar os tamanhos de marmitas.");
    }
    
}

export async function buscarTamanhosMarmitasAdmin() {
    try {
        const response = await api.get("/tamanhos-marmitas/admin");
        console.log(response);
        return response.data.data;
        
    } catch (error) {
        console.error(error);
        throw new Error("Não foi possível carregar os tamanhos de marmitas para admin.");
    }
}

export async function criarTamanhoMarmita(tamanhoData) {
    try {
        const response = await api.post("/tamanhos-marmitas", tamanhoData);
        return response.data.data;
    } catch (error) {
        console.error(error);
        throw new Error("Não foi possível criar o tamanho de marmita.");
    }
}

export async function alterarTamanhoMarmita(id, tamanhoData) {
    try {
        const response = await api.patch(`/tamanhos-marmitas/${id}`, tamanhoData);
        return response.data.data;
    } catch (error) {
        console.error(error);
        throw new Error("Não foi possível atualizar o tamanho de marmita.");
    }
}

export async function excluirTamanhoMarmita(id) {
    try {
        const response = await api.delete(`/tamanhos-marmitas/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(error);
        throw new Error("Não foi possível excluir o tamanho de marmita.");
    }
}