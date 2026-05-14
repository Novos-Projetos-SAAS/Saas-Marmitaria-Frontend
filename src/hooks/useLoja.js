'use client'

import { useState, useEffect } from "react";

import { buscarStatusLoja, alterarStatusLoja } from "@/services/lojaService.js"
import toast from "react-hot-toast";

export function useLoja() {
    const [statusLoja, setStatusLoja] = useState(false)
    const [loading, setLoading] = useState(true)
    const [atualizando, setAtualizando] = useState(false)

    const carregarStatus = async () => {
        try {
            setLoading(true);
            // Agora 'statusAtual' já é o booleano retornado pela service
            const statusAtual = await buscarStatusLoja();

            // Define o estado com o booleano puro vindo do banco Neon
            setStatusLoja(statusAtual);

        } catch (error) {
            console.error("Falha ao carregar status no Hook:", error);
            toast.error("Não foi possível carregar o status da loja.");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        Promise.resolve().then(() => {
            carregarStatus();
        });
    }, [])
    const alterarStatus = async () => {
        try {
            setAtualizando(true);
            const novoStatus = !statusLoja;

            // Se sua service espera um booleano direto:
            await alterarStatusLoja(novoStatus);

            // Se sua service espera um objeto, use: 
            // await alterarStatusLoja({ esta_aberta: novoStatus });

            setStatusLoja(novoStatus);
            toast.success(novoStatus ? "Loja ABERTA!" : "Loja FECHADA!");
        } catch (error) {
            console.error("Erro ao alterar status:", error);
            toast.error("Erro ao comunicar com o servidor.");
        } finally {
            setAtualizando(false);
        }
    }

    return { statusLoja, loading, carregarStatus, alterarStatus, atualizando }

}