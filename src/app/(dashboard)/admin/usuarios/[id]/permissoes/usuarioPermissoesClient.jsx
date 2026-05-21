'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, ArrowLeft, Save } from "lucide-react";

import { useUsuarioPermissoes } from "@/hooks/useUsuarioPermissoes.js";
import { useAuthContext } from "@/context/AuthContext.js";

import AccessDenied from "@/components/ui/accessDenied/index.jsx";
import Can from "@/components/ui/can/index.jsx";
import Swal from "sweetalert2";

import styles from './page.module.css';

export default function UsuarioPermissoesClient({ userId }) {

    const router = useRouter();

    const { hasPermission, user: currentUser, refreshSession } = useAuthContext();

    const {
        todasPermissoes,
        permissoesSelecionadas,
        loading,
        fetchPermissoes,
        handleToggle,
        handleSave,
        hasUnsavedChanges,
        acessoNegado
    } = useUsuarioPermissoes(userId);

    useEffect(() => {
        if (userId) {
            fetchPermissoes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const onSaveClick = async () => {
        const success = await handleSave();

        if (success) {
            if (currentUser && String(currentUser.id) === String(userId)) {
                await refreshSession();
            }
            router.push("/admin/usuarios");
        }
    }

    const handleGoBack = async () => {
        if (hasUnsavedChanges) {
            if (hasPermission("permissoes.editar")) {
                const result = await Swal.fire({
                    title: 'Alterações não salvas!',
                    text: 'Você modificou as permissões. Se sair agora, perderá essas alterações. Deseja realmente sair?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ea580c', // Laranja da marca
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Sim, sair sem salvar',
                    cancelButtonText: 'Ficar e Salvar',
                    reverseButtons: true
                });

                if (result.isConfirmed) router.push("/admin/usuarios");
            } else {
                const result = await Swal.fire({
                    title: 'Ação não permitida',
                    text: 'Você modificou os acessos, mas não possui permissão de alterar. As alterações serão descartadas.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ea580c',
                    cancelButtonColor: '#6b7280',
                    confirmButtonText: 'Entendi, sair',
                    cancelButtonText: 'Cancelar',
                    reverseButtons: true
                });

                if (result.isConfirmed) router.push("/admin/usuarios");
            }
        } else {
            router.push("/admin/usuarios");
        }
    };

    // if (accessDenied) return <AccessDenied />;

    // Comente a linha do seu componente e coloque um h1 simples
    if (acessoNegado) {
        return <h1>Acesso Negado (Teste)</h1>;
        // return <AccessDenied />;
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Carregando permissões...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <Shield size={28} className={styles.headerIcon} />
                    <div>
                        <h1>Gerenciar Permissões</h1>
                        <p>Ative ou desative os acessos deste usuário no sistema.</p>
                    </div>
                </div>
                <button className={styles.btnBack} onClick={handleGoBack}>
                    <ArrowLeft size={16} /> Voltar
                </button>
            </header>

            <div className={styles.modulesGrid}>
                {Object.entries(todasPermissoes).map(([modulo, permissoesDoModulo]) => (
                    <div key={modulo} className={styles.moduleCard}>
                        <h2 className={styles.moduleTitle}>{modulo.toUpperCase()}</h2>
                        <div className={styles.togglesList}>
                            {permissoesDoModulo.map((perm) => (
                                <label key={perm.id} className={styles.toggleRow}>
                                    <div className={styles.toggleInfo}>
                                        <span className={styles.chave}>{perm.descricao}</span>
                                        <span className={styles.descricao}>{perm.nome}</span>
                                    </div>
                                    <div className={styles.switchWrapper}>
                                        <input
                                            type="checkbox"
                                            className={styles.switchInput}
                                            checked={permissoesSelecionadas.has(perm.nome)}
                                            onChange={() => handleToggle(perm.nome)}
                                        />
                                        <div className={styles.switchSlider}></div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.actionsBar}>
                <button className={styles.btnCancel} onClick={handleGoBack}>
                    Cancelar
                </button>
                <Can perform="permissoes.editar">
                    <button className={styles.btnSave} onClick={onSaveClick}>
                        <Save size={18} />
                        Salvar Permissões
                    </button>
                </Can>
            </div>
        </div>
    );

}