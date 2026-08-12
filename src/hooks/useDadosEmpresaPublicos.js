'use client';

import { useCallback, useEffect, useState } from 'react';
import { buscarDadosEmpresaPublicos } from '@/services/dadosEmpresaService.js';

export const useDadosEmpresaPublicos = () => {
    const [dados, setDados] = useState(null);
    const [loadingDados, setLoadingDados] = useState(true);

    const carregarDados = useCallback(async () => {
        setLoadingDados(true);

        try {
            const response = await buscarDadosEmpresaPublicos();
            setDados(response?.data || null);
        } catch {
            setDados(null);
        } finally {
            setLoadingDados(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    return {
        dados,
        loadingDados,
        carregarDados
    };
};