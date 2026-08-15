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
            const data = error?.response?.data;

            if (data?.code === 'ALIMENTOS_INDISPONIVEIS' || data?.code === 'PRODUTOS_INDISPONIVEIS' || data?.code === 'PRODUTOS_ALTERADOS' || data?.code === 'LOJA_FECHADA') {
                return {
                    status: 'conflict',
                    code: data.code,
                    message: data.message,
                    details: data.details || null
                };
            }

            toast.error(data?.message || 'Falha ao registrar pedido no servidor.');
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
            const numeroLimpo = String(telefone || '').replace(/\D/g, '');

            if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
                return null;
            }

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
