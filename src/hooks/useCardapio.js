'use client'

import { useState, useEffect, useCallback } from "react";
import { buscarTamanhosMarmitasParaMontagem } from "../services/tamanhosMarmitasService";
import { buscarAlimentos } from "../services/alimentosService.js";
import toast from "react-hot-toast";

export function useCardapio() {
    const [tamanhos, setTamanhos] = useState([]);
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function carregar() {

            try {
                const [tamanhosData, alimentosData] = await Promise.all([
                    buscarTamanhosMarmitasParaMontagem(),
                    buscarAlimentos()
                ]);

                setTamanhos(tamanhosData || []);
                setAlimentos(alimentosData || []);

            } catch (error) {

                console.error(error);
                toast.error("Não foi possível carregar o cardápio.");

            } finally {

                setLoading(false);

            }
        }

        carregar();

    }, []);

    return {
        tamanhos,
        alimentos,
        loading
    };
}