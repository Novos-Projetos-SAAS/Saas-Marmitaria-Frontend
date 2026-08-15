'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { alterarStatusLoja, buscarStatusLoja } from '@/services/lojaService.js';

export function useLoja() {
    const [statusLoja, setStatusLoja] = useState(null);
    const [loading, setLoading] = useState(true);
    const [atualizando, setAtualizando] = useState(false);

    /**
     * Consulta o status atual diretamente no Backend.
     * Falha de conexão nunca é interpretada como loja fechada.
     */
    const carregarStatus = useCallback(async (options = {}) => {
        const { silencioso = false } = options;

        try {
            if (!silencioso) setLoading(true);

            const statusAtual = await buscarStatusLoja();

            if (typeof statusAtual !== 'boolean') {
                return null;
            }

            setStatusLoja(statusAtual);

            return statusAtual;
        } catch (error) {
            if (!silencioso) {
                toast.error(error?.response?.data?.message || 'Não foi possível confirmar o status da loja.');
            }

            return null;
        } finally {
            if (!silencioso) setLoading(false);
        }
    }, []);

    /**
     * Busca inicial e fallback de 60 segundos.
     */
    useEffect(() => {
        carregarStatus();

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                carregarStatus({ silencioso: true });
            }
        }, 60000);

        const handleFocus = () => {
            carregarStatus({ silencioso: true });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                carregarStatus({ silencioso: true });
            }
        };

        const handleStatusAlterado = (event) => {
            const statusRecebido = event?.detail?.esta_aberta;

            if (typeof statusRecebido === 'boolean') {
                setStatusLoja(statusRecebido);
                return;
            }

            carregarStatus({ silencioso: true });
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('marmitaria:status-loja-alterado', handleStatusAlterado);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('marmitaria:status-loja-alterado', handleStatusAlterado);
        };
    }, [carregarStatus]);

    /**
     * Antes de alterar, consulta novamente o Backend.
     * Isso impede alteração baseada em status nulo ou desatualizado.
     */
    const alterarStatus = async () => {
        if (atualizando) return false;

        try {
            setAtualizando(true);

            const statusAtual = await buscarStatusLoja();

            if (typeof statusAtual !== 'boolean') {
                toast.error('Não foi possível confirmar o status atual da loja.');
                return false;
            }

            setStatusLoja(statusAtual);

            const novoStatus = !statusAtual;

            await alterarStatusLoja(novoStatus);

            setStatusLoja(novoStatus);

            /**
             * Atualiza imediatamente os componentes deste navegador.
             * O Backend também notificará os clientes públicos pelo Socket.IO.
             */
            window.dispatchEvent(new CustomEvent('marmitaria:status-loja-alterado', {
                detail: {
                    esta_aberta: novoStatus
                }
            }));

            toast.success(novoStatus ? 'Loja ABERTA!' : 'Loja FECHADA!');

            return true;
        } catch (error) {
            const statusCode = error?.response?.status;
            const mensagem = error?.response?.data?.message;

            if (statusCode === 429) {
                toast.error(mensagem || 'Muitas solicitações foram realizadas. Aguarde alguns instantes e tente novamente.');
                return false;
            }

            toast.error(mensagem || 'Não foi possível alterar o status da loja.');

            return false;
        } finally {
            setAtualizando(false);
        }
    };

    return {
        statusLoja,
        loading,
        carregarStatus,
        alterarStatus,
        atualizando
    };
}