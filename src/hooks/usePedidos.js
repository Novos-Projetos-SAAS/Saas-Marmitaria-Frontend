'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
    criarPedido, 
    criarPedidoAdmin, 
    listarPedidoPorTelefoneUsuario 
} from '@/services/pedidosService.js';

export function usePedidos() {
    const [enviando, setEnviando] = useState(false);
    const [buscando, setBuscando] = useState(false);

    /**
     * FINALIZAR PEDIDO
     * A impressão automática é centralizada no NotificationListener através do Socket.IO.
     */
    const finalizarPedidoNoBanco = async (payload, options = {}) => {
        const admin = options.admin === true;
        setEnviando(true);

        try {
            const response = admin ? await criarPedidoAdmin(payload) : await criarPedido(payload);
            toast.success('Pedido registrado com sucesso!');
            return response;
        } catch (error) {
            toast.error(
                error?.response?.data?.message || 'Falha ao registrar pedido no servidor.'
            );
            return null;
        } finally {
            setEnviando(false);
        }
    };

    /**
     * BUSCAR PEDIDO
     */
    const buscarPedidoPorTelefoneUsuario = async (telefone) => {
        setBuscando(true);
        try {
            const numeroLimpo = telefone.replace(/\D/g, '');
            return await listarPedidoPorTelefoneUsuario(numeroLimpo);
        } catch (error) {
            console.error('Erro na busca:', error);
            return null;
        } finally {
            setBuscando(false);
        }
    };

    return {
        finalizarPedidoNoBanco,
        buscarPedidoPorTelefoneUsuario,
        buscando,
        enviando
    };
}