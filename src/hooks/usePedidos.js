'use client'

import { useState } from "react";
import { criarPedido , listarPedidoPorTelefoneUsuario} from "@/services/pedidosService.js";
import { usePedido } from "@/context/PedidoContext.js"; // Para limpar o carrinho depois
import toast from "react-hot-toast";

export function usePedidos() {
    const [enviando, setEnviando] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const { limparCarrinho } = usePedido();

    const finalizarPedidoNoBanco = async (payload) => {
        setEnviando(true);
        try {
            await criarPedido(payload);

            console.log(payload)

            toast.success("Pedido registrado com sucesso!");
            limparCarrinho();
            return true; // Sucesso
        } catch (error) {
            toast.error("Falha ao registrar pedido no servidor.");
            return false; // Erro
        } finally {
            setEnviando(false);
        }
    };

    const buscarPedidoPorTelefoneUsuario = async (telefone) => {
        setBuscando(true);

        try {
            const numeroLimpo = telefone.replace(/\D/g, '');

            const pedidoEncontrado = await listarPedidoPorTelefoneUsuario(numeroLimpo);
            return pedidoEncontrado;
        } catch (error) {
            console.error("Erro na busca:", error);
            // Retorna null para a tela saber que não achou nada e mostrar o erro
            return null; 
        } finally {
            setBuscando(false);
        }
    }

    return {
        finalizarPedidoNoBanco,
        buscarPedidoPorTelefoneUsuario,
        buscando,
        enviando
    };
}