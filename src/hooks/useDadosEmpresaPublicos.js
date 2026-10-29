'use client';

import { useAsyncLoad } from '@/hooks/useAsyncLoad.js';

import { useCallback, useState } from 'react';
import { buscarDadosEmpresaPublicos } from '@/services/dadosEmpresaService.js';

export const useDadosEmpresaPublicos = () => {
    const [dados, setDados] = useState(null);

    const consultarDados = useCallback(async ({ signal } = {}) => {

        try {
            const response = await buscarDadosEmpresaPublicos();
            if (signal?.aborted) return;
            setDados(response?.data || null);
        } catch {
            if (signal?.aborted) return;
            setDados(null);
        }
    }, []);

    const { loading: loadingDados, refresh: carregarDados } = useAsyncLoad(consultarDados);

    return {
        dados,
        loadingDados,
        carregarDados
    };
};