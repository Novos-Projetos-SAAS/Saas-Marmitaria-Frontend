// src/hooks/useCardapioClient.js (SOMENTE PARA A TELA PÚBLICA)
'use client'

import { useState, useEffect } from "react";
import { buscarTamanhosMarmitasParaMontagem } from "@/services/tamanhosMarmitasService";
import { buscarAlimentosDisponiveisHoje } from "@/services/alimentosService.js";
import toast from "react-hot-toast";

export function useCardapioClient() {
    const [tamanhos, setTamanhos] = useState([]);
    const [alimentosAgrupados, setAlimentosAgrupados] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            try {
                const [tamanhosData, alimentosData] = await Promise.all([
                    buscarTamanhosMarmitasParaMontagem(),
                    buscarAlimentosDisponiveisHoje()
                ]);

                setTamanhos(tamanhosData || []);

                const arrayAlimentos = alimentosData || [];
                const agrupados = arrayAlimentos.reduce((acc, alimento) => {
                    const categoria = alimento.categoria_nome || 'Outros';
                    if (!acc[categoria]) {
                        acc[categoria] = [];
                    }
                    acc[categoria].push(alimento);
                    return acc;
                }, {});

                setAlimentosAgrupados(agrupados);

            } catch (error) {
                console.error(error);
                toast.error("Não foi possível carregar o cardápio de hoje.");
            } finally {
                setLoading(false);
            }
        }

        carregar();

    }, []);

    return { tamanhos, alimentosAgrupados, loading };
}