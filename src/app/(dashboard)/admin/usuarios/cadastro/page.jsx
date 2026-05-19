"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { useCadastro } from "@/hooks/useCadastro"; // Importando nosso novo Hook
import UsuarioForm from "@/components/forms/usuarios/usuarioForm";
import Can from "@/components/ui/can";
import AccessDenied from "@/components/ui/accessDenied";

import Swal from "sweetalert2";

import styles from "./page.module.css";

export default function RegisterUserPage() {
    const router = useRouter();

    // Extrai apenas a função que precisamos do hook
    const { cadastrarUsuario } = useCadastro();

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

    return (
        <Can perform="usuarios.criar" fallback={<AccessDenied />}>
            <div className={styles.wrapper}>

                <div className={styles.header}>
                    <Link href="/admin/usuarios" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>
                    <h1 className={styles.title}>Novo Usuário</h1>
                </div>

                {/* Passamos o cadastrarUsuario direto no onSave! */}
                <UsuarioForm
                    mode="create"
                    onSave={cadastrarUsuario}
                    onCancel={handleCancel}
                />

            </div>
        </Can>
    );
}