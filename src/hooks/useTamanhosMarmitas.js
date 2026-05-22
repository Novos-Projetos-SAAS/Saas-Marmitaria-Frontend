'use client'

import { useState, useCallback } from "react";

import {
    buscarTamanhosMarmitasAdmin,
    criarTamanhoMarmita,
    alterarTamanhoMarmita,
    excluirTamanhoMarmita
} from "../services/tamanhosMarmitasService.js";

import Swal from "sweetalert2";

export function useTamanhosMarmitas() {
    const [tamanhos, setTamanhos] = useState([]);
    const [loading, setLoading] = useState(false);

    const carregarTamanhos = useCallback(async () => {
        setLoading(true);
        try {
            const data = await buscarTamanhosMarmitasAdmin();
            setTamanhos(data || []);

            console.log(data || []);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: extrairMensagemErro(error, 'Não foi possível carregar os tamanhos.'),
                confirmButtonColor: '#ea580c'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSalvarTamanho = async (id, dados) => {
        try {
            if (id) {
                await alterarTamanhoMarmita(id, dados);

                Swal.fire({
                    icon: "success",
                    title: "Sucesso!",
                    text: "Tamanho atualizado com sucesso.",
                    confirmButtonColor: "#16a34a",
                });

            } else {

                await criarTamanhoMarmita(dados);

                Swal.fire({
                    icon: "success",
                    title: "Sucesso!",
                    text: "Novo tamanho cadastrado.",
                    confirmButtonColor: "#16a34a",
                });
            }

            await carregarTamanhos();

            console.log(tamanhos);
            return true;

        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: extrairMensagemErro(error, 'Não foi possível salvar o tamanho.'),
                confirmButtonColor: '#ea580c'
            });

            return false;
        }
    };

    const handleToggleStatus = async (id, statusAtual) => {
        try {

            await alterarTamanhoMarmita(id, { ativo: !statusAtual });

            setTamanhos(prev => prev.map(t =>
                t.id === id ? { ...t, ativo: !statusAtual } : t
            ));

            return true;

        } catch (error) {

            console.error(error);

            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: ('Não foi possível atualizar o status do tamanho.'),
                confirmButtonColor: '#ea580c'
            });

            return false;
        }
    };

    const handleExcluirTamanho = async (id) => {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: "Este tamanho não estará mais disponível para novas montagens.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ea580c',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sim, remover!',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await excluirTamanhoMarmita(id);
                Swal.fire({
                    icon: 'success',
                    title: 'Removido!',
                    text: 'O tamanho foi removido com sucesso.',
                    confirmButtonColor: '#16a34a'
                });

                // Atualiza a lista tirando o item deletado
                setTamanhos(prev => prev.filter(t => t.id !== id));
                return true;
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: extrairMensagemErro(error, 'Não foi possível remover o tamanho.'),
                    confirmButtonColor: '#ea580c'
                });
                return false;
            }
        }
        return false;
    };

    return {
        tamanhos,
        loading,
        carregarTamanhos,
        handleSalvarTamanho,
        handleToggleStatus,
        handleExcluirTamanho
    };
}