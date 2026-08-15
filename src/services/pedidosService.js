import api from './api';

export async function criarPedido(dadosPedido) {
    const response = await api.post('/pedidos', dadosPedido);
    return response.data;
}

export async function listarPedidoPorTelefoneUsuario(telefone) {
    try {
        const response = await api.get(`/pedidos/rastreio/${telefone}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }

        throw error;
    }
}

/**
 * Lista os pedidos utilizados pelo painel administrativo.
 */
export async function listarPedidosAdmin(params = {}) {
    const response = await api.get('/pedidos/admin', { params });
    return response.data;
}

/**
 * Altera o status de um pedido.
 */
export async function alterarStatusPedidoAPI(id, novoStatus) {
    const response = await api.patch(`/pedidos/${id}/status`, {
        status: novoStatus
    });

    return response.data;
}

/**
 * Pedido lançado através do painel administrativo.
 *
 * Diferente do POST /pedidos público, esta rota exige
 * autenticação e a permissão pedidos.criar.
 */
export async function criarPedidoAdmin(dadosPedido) {
    const response = await api.post('/pedidos/admin', dadosPedido);
    return response.data;
}