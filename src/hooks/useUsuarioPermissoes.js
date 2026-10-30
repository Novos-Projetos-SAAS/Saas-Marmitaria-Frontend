'use client'

import { useState, useCallback } from 'react';

import {
    listarTodasPermissoes,
    listarPermissoesDoUsuario,
    atualizarPermissoesDoUsuario
} from '@/services/permissoesService.js';

import Swal from 'sweetalert2';
import {
    groupPermissionsByModule, getMissingFinancialPermissions, getNewSensitiveFinancialGrants
} from '@/utils/financialPermissions.mjs';

export function useUsuarioPermissoes(userId) {

    const [todasPermissoes, setTodasPermissoes] = useState({});
    const [permissoesSelecionadas, setPermissoesSelecionadas] = useState(new Set());
    const [parametrosIniciais, setParametrosIniciais] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [missingFinancialPermissions, setMissingFinancialPermissions] = useState([]);
    const [acessoNegado, setAcessoNegado] = useState(false);

    const DEPENDENCIES = {
        "pedidos.visualizar": ["usuarios.listar", "cardapio.listar"],
        "pedidos.gerenciar": ["pedidos.visualizar", "usuarios.listar", "cardapio.listar"],
        "cardapio.criar": ["cardapio.listar", "alimentos.listar"],
        "cardapio.alterar": ["cardapio.listar", "alimentos.listar"],
        "alimentos.criar": ["alimentos.listar"],
        "alimentos.alterar": ["alimentos.listar"],
    };

    const fetchPermissoes = useCallback(async () => {
        setLoading(true);
        setAcessoNegado(false);
        try {
            const [todas, doUsuario] = await Promise.all([
                listarTodasPermissoes(),
                listarPermissoesDoUsuario(userId)
            ]);

            const todasPermissoesArray = todas || [];
            const permissoesDoUsuarioArray = doUsuario || [];

            // 🚀 PASSO 1: Extrai apenas o texto do nome (ex: ["usuarios.listar", "pedidos.visualizar"])
            const apenasNomesDoUsuario = permissoesDoUsuarioArray.map(p => p.nome);

            // Somente permissões existentes no catálogo do backend podem ser exibidas/salvas.
            setTodasPermissoes(groupPermissionsByModule(todasPermissoesArray));
            setMissingFinancialPermissions(getMissingFinancialPermissions(todasPermissoesArray));
            
            // 🚀 PASSO 2: Alimenta os Sets com as strings limpas
            setPermissoesSelecionadas(new Set(apenasNomesDoUsuario));
            setParametrosIniciais(new Set(apenasNomesDoUsuario));

        } catch (error) {
            if (error.response && error.response.status === 403) {

                setAcessoNegado(true);

            } else {

                console.error("Erro ao carregar permissões:", error);

                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Não foi possível carregar as permissões. Tente novamente mais tarde.',
                });
            }
        } finally {
            setLoading(false);
        }

    }, [userId]);

    const handleToggle = (chave) => {
        setPermissoesSelecionadas((prev) => {
            const newSet = new Set(prev);

            if (newSet.has(chave)) {
                newSet.delete(chave);
                Object.entries(DEPENDENCIES).forEach(([dependentKey, requiredKeys]) => {
                    if (requiredKeys.includes(chave) && newSet.has(dependentKey)) {
                        newSet.delete(dependentKey);
                    }
                });
            } else {
                newSet.add(chave);
                if (DEPENDENCIES[chave]) {
                    DEPENDENCIES[chave].forEach(dep => {
                        newSet.add(dep);
                    });
                }
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        if (saving || loading || acessoNegado) return false;
        setSaving(true);
        try {
            const permissionsArray = Array.from(permissoesSelecionadas);
            await atualizarPermissoesDoUsuario(userId, permissionsArray);
            setParametrosIniciais(new Set(permissoesSelecionadas));

            Swal.fire({
                title: "Sucesso!",
                text: "Permissões atualizadas com sucesso.",
                icon: "success",
                confirmButtonColor: "#16a34a",
            });

            return true;
        } catch (error) {
            console.error("Erro ao salvar:", error);
            Swal.fire("Erro", error?.response?.status === 403
                ? "Sua conta não está autorizada a alterar essas permissões. A concessão de acessos financeiros exige um administrador."
                : "Falha ao salvar as permissões.", "error");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const hasUnsavedChanges =
        permissoesSelecionadas.size !== parametrosIniciais.size ||
        [...permissoesSelecionadas].some(perm => !parametrosIniciais.has(perm));

    return {
        todasPermissoes,
        permissoesSelecionadas,
        loading,
        saving,
        missingFinancialPermissions,
        newlyGrantedSensitive: getNewSensitiveFinancialGrants(parametrosIniciais, permissoesSelecionadas),
        fetchPermissoes,
        handleToggle,
        handleSave,
        hasUnsavedChanges,
        acessoNegado
    };
}