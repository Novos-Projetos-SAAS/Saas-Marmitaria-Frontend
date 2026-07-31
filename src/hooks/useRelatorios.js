import { useState, useCallback } from 'react';
import { listarRelatorios, gerarRelatorio } from '../services/relatoriosService.js';
// import { toast } from 'react-toastify'; // Descomente se usar toast

export function useRelatorios() {
    const [relatorios, setRelatorios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingGeracao, setLoadingGeracao] = useState(false);

    const fetchRelatorios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listarRelatorios();
            setRelatorios(data);
        } catch (error) {
            console.error('Erro ao buscar relatórios:', error);
            // toast.error('Erro ao buscar catálogo de relatórios');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDadosRelatorio = async (id, filtros) => {
        setLoadingGeracao(true);
        try {
            const data = await gerarRelatorio(id, filtros);
            return data;
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw error; // Lança para o modal tratar (ex: mostrar mensagem)
        } finally {
            setLoadingGeracao(false);
        }
    };

    return {
        relatorios,
        loading,
        loadingGeracao,
        fetchRelatorios,
        fetchDadosRelatorio
    };
}