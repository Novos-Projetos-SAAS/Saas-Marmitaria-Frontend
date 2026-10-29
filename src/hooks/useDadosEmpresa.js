'use client';

import { useAsyncLoad } from '@/hooks/useAsyncLoad.js';

import { useState, useCallback } from 'react';
import {
    buscarDadosEmpresa,
    atualizarDadosEmpresa
} from '@/services/dadosEmpresaService.js';

import Swal from 'sweetalert2';

export const useDadosEmpresa = () => {
    const [dados, setDados] = useState(null);
    const [saving, setSaving] = useState(false);

    const consultarDados = useCallback(async ({ signal } = {}) => {

        try {
            const response = await buscarDadosEmpresa();
            if (signal?.aborted) return;

            const empresa =
                response?.data?.data ??
                response?.data ??
                response ??
                null;

            setDados(empresa);
        } catch (error) {
            if (signal?.aborted) return;
            setDados(null);

            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível carregar as configurações da empresa.',
                confirmButtonColor: '#a54b3c'
            });
        }
    }, []);

    const { loading: loadingDados, refresh: carregarDados } = useAsyncLoad(consultarDados);

    const salvarDados = async (payload) => {
        setSaving(true);

        try {
            await atualizarDadosEmpresa(payload);

            await Swal.fire({
                title: 'Sucesso!',
                text: 'Configurações da empresa salvas.',
                icon: 'success',
                confirmButtonColor: '#16a34a'
            });

            await carregarDados();

            return true;
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Ocorreu um erro ao salvar os dados.',
                confirmButtonColor: '#a54b3c'
            });

            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        dados,
        loadingDados,
        saving,
        carregarDados,
        salvarDados
    };
};