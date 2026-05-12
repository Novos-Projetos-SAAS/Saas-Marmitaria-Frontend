'use client'

import { useState } from "react";
import { criarPedido } from "@/services/pedidosService.js";
import { usePedido } from "@/context/PedidoContext.js"; // Para limpar o carrinho depois
import toast from "react-hot-toast";

export function usePedidos() {
    const [enviando, setEnviando] = useState(false);
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

    return {
        finalizarPedidoNoBanco,
        enviando
    };
}