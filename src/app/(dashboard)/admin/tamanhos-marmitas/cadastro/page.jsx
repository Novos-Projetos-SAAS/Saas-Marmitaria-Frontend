'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { criarTamanhoMarmita } from '@/services/tamanhosMarmitasService.js';

import TamanhoForm from '@/components/forms/tamanhosMarmitas/tamanhosMarmitasForm.jsx';
import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';

import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

import styles from './page.module.css';

export default function CadastroTamanhoPage() {
    const router = useRouter();

    const handleSave = async (payload) => {
        try {
            await criarTamanhoMarmita(payload);

            await Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Novo tamanho cadastrado com sucesso!',
                timer: 2000,
                showConfirmButton: false
            });

            router.push("/admin/tamanhos-marmitas");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || 'Falha ao cadastrar o tamanho.';

            await Swal.fire({
                icon: statusCode === 409 ? 'warning' : 'error',
                title: statusCode === 409 ? 'Tamanho já cadastrado' : 'Erro',
                text: message,
                confirmButtonColor: '#ea580c'
            });

            return false;
        }
    };

    const handleCancel = async () => {
        const result = await Swal.fire({
            title: 'Deseja realmente cancelar?',
            text: 'Os dados preenchidos serão perdidos.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Sim, quero cancelar',
            cancelButtonText: 'Não, continuar preenchendo',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            router.push("/admin/tamanhos-marmitas");
        }
    };

    return (
        <Can
            perform="tamanhos_marmitas.criar"
            fallback={<AccessDenied />}
        >
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link
                        href="/admin/tamanhos-marmitas"
                        className={styles.btnVoltar}
                    >
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>

                    <h1 className={styles.title}>
                        Cadastrar Novo Tamanho
                    </h1>
                </div>

                <TamanhoForm
                    initialData={null}
                    mode="create"
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </Can>
    );
}