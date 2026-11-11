import api from './api';
import { savedPayments } from '@/services/infinitepayService.js';

export async function criarPedido(dadosPedido) {
    const response = await api.post('/pedidos', dadosPedido);
    if (response.data?.data?.access_token) {
        // The HttpOnly order cookie still grants access if browser storage is unavailable.
        try {
            const key = 'marmitaria_acessos_pedidos';
            const stored = JSON.parse(localStorage.getItem(key) || '{}');
            localStorage.setItem(key, JSON.stringify({ ...stored, [response.data.data.pedido_id]: response.data.data.access_token }));
        } catch { /* Storage can be blocked in private browsing. */ }
    }
    return response.data;
}

export async function listarPedidoPorTelefoneUsuario(telefone, signal) {
    try {
        const response = await api.get(`/pedidos/rastreio/${encodeURIComponent(telefone)}`, { signal });
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }

        throw error;
    }
}

export async function detalharPedidoCliente(id, signal) {
    let token = savedPayments().find(item => String(item.pedido_id) === String(id))?.token;
    if (!token) {
        try { token = JSON.parse(localStorage.getItem('marmitaria_acessos_pedidos') || '{}')[id]; } catch { /* Use the order cookie. */ }
    }
    const response = await api.get(`/pedidos/detalhes/${encodeURIComponent(id)}`, {
        signal, headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data.data;
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
