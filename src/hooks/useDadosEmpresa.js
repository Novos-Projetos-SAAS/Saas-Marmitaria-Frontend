'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    buscarDadosEmpresa,
    atualizarDadosEmpresa
} from '@/services/dadosEmpresaService.js';

import Swal from 'sweetalert2';

export const useDadosEmpresa = () => {
    const [dados, setDados] = useState(null);
    const [loadingDados, setLoadingDados] = useState(true);
    const [saving, setSaving] = useState(false);

    const carregarDados = useCallback(async () => {
        setLoadingDados(true);

        try {
            const response = await buscarDadosEmpresa();

            const empresa =
                response?.data?.data ??
                response?.data ??
                response ??
                null;

            setDados(empresa);
        } catch (error) {
            setDados(null);

            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível carregar as configurações da empresa.',
                confirmButtonColor: '#a54b3c'
            });
        } finally {
            setLoadingDados(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

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