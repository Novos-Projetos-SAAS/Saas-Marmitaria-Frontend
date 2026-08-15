'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { usePedido } from '@/context/PedidoContext.js';
import { alterarStatusLoja } from '@/services/lojaService.js';

export function useLoja() {
    const {
        lojaAbertaPedido,
        verificandoLojaPedido,
        verificarLojaAgora,
        aplicarStatusLojaLocal
    } = usePedido();

    const [atualizando, setAtualizando] = useState(false);

    const carregarStatus = async () => {
        return verificarLojaAgora({ silencioso: false, notificarFechamento: false });
    };

    const alterarStatus = async () => {
        if (typeof lojaAbertaPedido !== 'boolean') {
            toast.error('Não foi possível identificar o status atual da loja.');
            return false;
        }

        try {
            setAtualizando(true);
            const novoStatus = !lojaAbertaPedido;

            await alterarStatusLoja(novoStatus);
            aplicarStatusLojaLocal(novoStatus, { notificarFechamento: false });

            toast.success(novoStatus ? 'Loja ABERTA!' : 'Loja FECHADA!');
            return true;
        } catch {
            toast.error('Erro ao comunicar com o servidor.');
            return false;
        } finally {
            setAtualizando(false);
        }
    };

    return {
        statusLoja: lojaAbertaPedido === true,
        loading: verificandoLojaPedido && lojaAbertaPedido === null,
        carregarStatus,
        alterarStatus,
        atualizando
    };
}
