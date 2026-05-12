'use client'

import { useState, useEffect, useCallback } from "react";
import { buscarTamanhosMarmitas } from "../services/tamanhosMarmitasService";
import { buscarAlimentos } from "../services/alimentosService.js";
import toast from "react-hot-toast";

export function useCardapio() {
    const [tamanhos, setTamanhos] = useState([]);
    const [alimentos, setAlimentos] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Busca os dados do cardápio (Tamanhos e Alimentos)
     */
    // const carregarCardapio = useCallback(async () => {
    //     try {
    //         setLoading(true);

    //         // Faz as requisições em paralelo
    //         const [tamanhosData, alimentosData] = await Promise.all([
    //             buscarTamanhosMarmitas(),
    //             buscarAlimentos()
    //         ]);

    //         setTamanhos(tamanhosData || []);
    //         setAlimentos(alimentosData || []);

    //     } catch (error) {
    //         console.error(error);
    //         // Substituímos o Swal pelo react-hot-toast que instalamos
    //         toast.error("Não foi possível carregar o cardápio de hoje.");
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

    // useEffect(() => {
    //     carregarCardapio();
    // }, [carregarCardapio]);

    useEffect(() => {

        async function carregar() {

            try {

                // setLoading(true);

                const [tamanhosData, alimentosData] = await Promise.all([
                    buscarTamanhosMarmitas(),
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
        // carregarCardapio
    };
}