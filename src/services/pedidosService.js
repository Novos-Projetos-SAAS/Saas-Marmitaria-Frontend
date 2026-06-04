import api from "./api";

export async function criarPedido(dadosPedido) {
    try {
        // Envia o payload completo para a rota do seu Node.js
        const response = await api.post('/pedidos', dadosPedido);
        return response.data;
    } catch (error) {
        console.error("Erro no pedidoService:", error);
        throw error; // Lançamos o erro para o Hook tratar o alerta visual
    }
}

export async function listarPedidoPorTelefoneUsuario(telefone) {

    try {

        const response = await api.get(`/pedidos/rastreio/${telefone}`);
        return response.data;

    } catch (error) {
        if (error.response && error.response.status === 404) {
            // Retornamos nulo (ou um array vazio []) para a interface saber que não tem pedido, sem quebrar!
            return null;
        }

        console.error("Erro no pedidoService:", error);
        throw error;
    }

}

// ... suas funções criarPedido e listarPedidoPorTelefoneUsuario já existentes ...

export async function listarPedidosAdmin(params = {}) {
    try {
        // Ajuste a rota para a que você definiu no backend (ex: /pedidos/admin ou apenas /pedidos)
        const response = await api.get('/pedidos/admin', {
            params
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao listar pedidos do admin:", error);
        throw error;
    }
}

export async function alterarStatusPedidoAPI(id, novoStatus) {
    try {
        const response = await api.patch(`/pedidos/${id}/status`, { status: novoStatus });
        return response.data;
    } catch (error) {
        console.error("Erro ao alterar status:", error);
        throw error;
    }
}