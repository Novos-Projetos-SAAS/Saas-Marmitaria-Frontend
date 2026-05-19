'use client'

import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'

import { use, Suspense } from 'react'

import { useUsuario } from '@/hooks/useUsuario.js';

import { atualizarUsuario } from '@/services/usuariosService.js';

import UsuarioForm from '@/components/forms/usuarios/usuarioForm.jsx';
import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';

import { ArrowLeft, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

import styles from './page.module.css';

function DetalhesUsuarioContent() {

    const router = useRouter();
    const searchParams = useSearchParams();

    const params = useParams();
    const usuarioId = params.id;

    const modeUrl = searchParams.get('mode') || 'view'; // 'view' ou 'edit'

    const { usuario, loading, refresh } = useUsuario(usuarioId);

    const handleUpdate = async (data) => {
        try {
            await atualizarUsuario(usuarioId, data);

            Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Usuário atualizado com sucesso!',
                timer: 2000,
                showConfirmButton: false,
            });

            router.push("/admin/usuarios");
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Falha ao atualizar usuário!',
            });
        }
    };

    const handleCancel = async () => {
        const result = await Swal.fire({
            title: 'Deseja realmente cancelar?',
            text: 'Todas as alterações não salvas serão perdidas.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b', // 🟡 O amarelo/âmbar que definimos para warnings
            cancelButtonColor: '#71717a',  // Cinza discreto para o botão de voltar/desistir
            confirmButtonText: 'Sim, quero cancelar',
            cancelButtonText: 'Não, continuar editando',
            reverseButtons: true // Opcional: Inverte a posição dos botões para deixar o "Sim" na direita
        });

        // Se o usuário clicou no botão "Sim, quero cancelar"
        if (result.isConfirmed) {
            router.push("/admin/usuarios"); // Executa o redirecionamento
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Buscando ficha do usuário...</p>
            </div>
        );
    }

    const permissaoNecessaria = modeUrl === "edit" ? "usuarios.editar" : "usuarios.visualizar";

    return (
        <Can perform={permissaoNecessaria} fallback={<AccessDenied />}>
            <div className={styles.wrapper}>

                <div className={styles.header}>
                    <Link href="/admin/usuarios" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>
                    <h1 className={styles.title}>
                        {modeUrl === "edit" ? "Editar Usuário" : "Ficha do Usuário"}
                    </h1>
                </div>

                {/* Renderiza o formulário apenas quando os dados do hook estiverem prontos */}
                {usuario && (
                    <UsuarioForm
                        initialData={usuario}
                        mode={modeUrl} // 'view' mantém os campos disabled, 'edit' já abre liberado
                        onSave={handleUpdate}
                        onCancel={handleCancel}
                    />
                )}

            </div>
        </Can>
    );
}

export default function EditUserPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <RefreshCw className="animate-spin" color="#ea580c" size={30} />
            </div>
        }>
            <DetalhesUsuarioContent id={id} />
        </Suspense>
    );
}