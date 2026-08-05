import { useState, useCallback } from 'react';
import { buscarDadosEmpresa, atualizarDadosEmpresa } from '@/services/dadosEmpresaService.js';
import Swal from 'sweetalert2';

export const useDadosEmpresa = () => {
    const [dados, setDados] = useState(null);
    const [loadingDados, setLoadingDados] = useState(true);
    const [saving, setSaving] = useState(false);

    const carregarDados = useCallback(async () => {
        setLoadingDados(true);
        try {
            const res = await buscarDadosEmpresa();
            if (res?.data) {
                setDados(res.data);
            }
        } catch (error) {
            Swal.fire('Erro', 'Não foi possível carregar as configurações da empresa.', 'error');
        } finally {
            setLoadingDados(false);
        }
    }, []);

    const salvarDados = async (payload) => {
        setSaving(true);
        try {
            await atualizarDadosEmpresa(payload);
            Swal.fire({
                title: 'Sucesso!',
                text: 'Configurações da empresa salvas.',
                icon: 'success',
                confirmButtonColor: '#16a34a'
            });
            await carregarDados(); // Recarrega para garantir sincronia
            return true;
        } catch (error) {
            Swal.fire('Erro', 'Ocorreu um erro ao salvar os dados.', 'error');
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