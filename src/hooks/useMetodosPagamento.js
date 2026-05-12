'use client'
import { useState, useEffect } from "react"

import { buscarMetodosDePagamento } from "@/services/metodosPagamentoService.js"
import toast from "react-hot-toast"

export function useMetodosPagamento() {

    const [metodosPagamento, setMetodosPagamento] = useState([]);
    const [loadingMetodosPagamento, setLoadingMetodosPagamento] = useState(true);

    useEffect(() => {
        async function carregar() {
            try {
                const dados = await buscarMetodosDePagamento();
                setMetodosPagamento(dados || []);
            } catch (error) {
                console.error("Erro no hook useMetodosPagamento:", error);
            } finally {
                setLoadingMetodosPagamento(false);
            }
        }

        carregar();
    }, []);

    return {
        metodosPagamento,
        loadingMetodosPagamento
    };

}