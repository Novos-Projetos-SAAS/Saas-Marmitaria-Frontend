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

export async function buscarTamanhosMarmitasAdmin(search = '', page = 1, status = 'all', sort = 'id', order = 'ASC') {
    try {
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
        console.log(response);
        return response.data;

    } catch (error) {
        console.error(error);
        throw new Error("Não foi possível carregar os tamanhos de marmitas para admin.");
    }
}

export async function buscarTamanhoPorId(id) {
    try {
        const response = await api.get(`/tamanhos-marmitas/${id}`);
        // Retorna direto os dados para o formulário
        return response.data.data || response.data;
    } catch (error) {
        console.error(`Erro ao buscar tamanho com ID ${id}:`, error);
        throw error;
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

export async function toggleTamanhoStatus(id, status) {

    try {
        let response;
        if (status === true) {
            response = await api.patch(`/tamanhos-marmitas/${id}/reativar`);
        } else {
            response = await api.delete(`/tamanhos-marmitas/${id}`);
        }

        return response.data;


    } catch (error) {
        console.error(error);
        throw new Error(`Não foi possível ${status ? 'reativar' : 'inativar'} o tamanho de marmita.`);
    }
}

