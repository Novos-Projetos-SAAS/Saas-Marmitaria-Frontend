'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { criarTamanhoMarmita } from '@/services/tamanhosMarmitasService.js';

import TamanhoForm from '@/components/forms/tamanhosMarmitas/tamanhosMarmitasForm.jsx'; 
import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';

import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

import styles from './page.module.css'; // Podemos reaproveitar o mesmo CSS da tela de detalhes

export default function CadastroTamanhoPage() {
    const router = useRouter();

    const handleSave = async (payload) => {
        try {
            await criarTamanhoMarmita(payload);

            Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Novo tamanho cadastrado com sucesso!',
                timer: 2000,
                showConfirmButton: false,
            });

            router.push("/admin/tamanhos-marmitas");
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Falha ao cadastrar o tamanho. Verifique os dados e tente novamente.',
                confirmButtonColor: '#ea580c'
            });
            throw error; // Repassa o erro para o form parar o loading interno
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
        <Can perform="tamanhos_marmitas.criar" fallback={<AccessDenied />}>
            <div className={styles.wrapper}>

                <div className={styles.header}>
                    <Link href="/admin/tamanhos-marmitas" className={styles.btnVoltar}>
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