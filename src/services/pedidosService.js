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