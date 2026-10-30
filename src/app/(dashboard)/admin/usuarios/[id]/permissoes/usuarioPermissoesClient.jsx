'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, ArrowLeft, Save, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

import { useUsuarioPermissoes } from '@/hooks/useUsuarioPermissoes.js';
import { useAuthContext } from '@/context/AuthContext.js';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';
import { labelFinancialPermission, SENSITIVE_FINANCIAL_PERMISSIONS } from '@/utils/financialPermissions.mjs';
import styles from './page.module.css';

export default function UsuarioPermissoesClient({ userId }) {
    const router = useRouter();
    const { hasPermission, refreshSession } = useAuthContext();
    const canEdit = hasPermission('permissoes.editar');
    const {
        todasPermissoes,
        permissoesSelecionadas,
        loading,
        saving,
        missingFinancialPermissions,
        newlyGrantedSensitive,
        fetchPermissoes,
        handleToggle,
        handleSave,
        hasUnsavedChanges,
        acessoNegado
    } = useUsuarioPermissoes(userId);

    useEffect(() => {
        if (userId) void fetchPermissoes();
    }, [userId, fetchPermissoes]);

    const onSaveClick = async () => {
        if (!canEdit || !hasUnsavedChanges || saving) return;
        if (newlyGrantedSensitive.length) {
            const result = await Swal.fire({
                title: 'Conceder acesso financeiro?',
                text: 'Você está concedendo: ' + newlyGrantedSensitive.join(', ') +
                    '. Esses acessos permitem configurar ou autorizar operações financeiras reais. ' +
                    'Somente um administrador pode concedê-los; nenhuma cobrança será habilitada apenas por salvar.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ea580c',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Confirmar concessão',
                cancelButtonText: 'Cancelar'
            });
            if (!result.isConfirmed) return;
        }
        const success = await handleSave();
        if (success) {
            // Atualiza as permissões inclusive quando a conta editada é a atual.
            await refreshSession();
            router.push('/admin/usuarios');
        }
    };

    const handleGoBack = async () => {
        if (hasUnsavedChanges) {
            const result = await Swal.fire({
                title: 'Alterações não salvas',
                text: 'As alterações realizadas nesta tela serão descartadas.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ea580c',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Descartar e sair',
                cancelButtonText: 'Continuar editando'
            });
            if (!result.isConfirmed) return;
        }
        router.push('/admin/usuarios');
    };

    if (acessoNegado) return <AccessDenied />;

    if (loading) {
        return <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Carregando permissões...</p>
        </div>;
    }

    return <div className={styles.container}>
        <header className={styles.header}>
            <div className={styles.headerTitle}>
                <Shield size={28} className={styles.headerIcon} />
                <div>
                    <h1>Gerenciar Permissões</h1>
                    <p>Usuário #{userId}. As alterações só passam a valer após salvar.</p>
                </div>
            </div>
            <button type="button" className={styles.btnBack} onClick={handleGoBack}>
                <ArrowLeft size={16} /> Voltar
            </button>
        </header>

        {todasPermissoes.pagamentos && <section className={styles.financialNotice} aria-label="Informações de permissões financeiras">
            <div className={styles.noticeHeader}>
                <ShieldAlert size={20} aria-hidden="true" />
                <strong>Permissões InfinitePay</strong>
            </div>
            <p>
                Configurar a InfinitePay e autorizar sua operação em produção são acessos distintos.
                A atribuição de permissões financeiras sensíveis exige uma conta administradora.
                Conceder acesso não liga o checkout: a ativação continua sujeita às
                credenciais, autorizações temporárias e validações do backend.
            </p>
        </section>}

        {missingFinancialPermissions.length > 0 && <p className={styles.permissionWarning} role="alert">
            As permissões {missingFinancialPermissions.join(' e ')} não constam no catálogo
            retornado pela API. Verifique as migrations do backend e o banco Neon.
            Elas não serão criadas automaticamente por esta tela.
        </p>}

        <div className={styles.modulesGrid}>
            {Object.entries(todasPermissoes).map(([modulo, permissoesDoModulo]) => {
                const financial = modulo === 'pagamentos';
                return <section key={modulo} className={`${styles.moduleCard} ${financial ? styles.financialModule : ''}`}>
                    <h2 className={styles.moduleTitle}>
                        {financial ? 'PAGAMENTOS / INFINITEPAY' : modulo.toUpperCase()}
                    </h2>
                    <div className={styles.togglesList}>
                        {permissoesDoModulo.map(perm => {
                            const sensitive = SENSITIVE_FINANCIAL_PERMISSIONS.includes(perm.nome);
                            return <label key={perm.id} className={styles.toggleRow}>
                                <div className={styles.toggleInfo}>
                                    <span className={styles.chave}>
                                        {financial ? labelFinancialPermission(perm) : perm.descricao || perm.nome}
                                    </span>
                                    <span className={styles.descricao}>{perm.nome}</span>
                                    {sensitive && <span className={styles.sensitiveDescription}>
                                        Acesso financeiro sensível — concessão exclusiva de administrador
                                    </span>}
                                </div>
                                <div className={styles.switchWrapper}>
                                    <input
                                        type="checkbox"
                                        className={styles.switchInput}
                                        checked={permissoesSelecionadas.has(perm.nome)}
                                        onChange={() => handleToggle(perm.nome)}
                                        disabled={!canEdit || saving}
                                        aria-label={`Permissão ${perm.nome}`}
                                    />
                                    <span className={styles.switchSlider} aria-hidden="true"></span>
                                </div>
                            </label>;
                        })}
                    </div>
                </section>;
            })}
        </div>

        <div className={styles.actionsBar}>
            <button type="button" className={styles.btnCancel} onClick={handleGoBack} disabled={saving}>
                Cancelar
            </button>
            {canEdit && <button type="button" className={styles.btnSave} onClick={onSaveClick}
                disabled={saving || !hasUnsavedChanges}>
                <Save size={18} />
                {saving ? 'Salvando...' : 'Salvar Permissões'}
            </button>}
        </div>
    </div>;
}
