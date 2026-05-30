'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { criarAlimento } from '@/services/alimentosService';
import AlimentoForm from '@/components/forms/alimentos/alimentosForm';
import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';

import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

import styles from './page.module.css';

export default function CadastroAlimentoPage() {
    const router = useRouter();

    const handleSave = async (payload) => {
        try {
            await criarAlimento(payload);
            Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Novo alimento cadastrado com sucesso!',
                timer: 2000,
                showConfirmButton: false,
            });
            router.push("/admin/alimentos");
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Falha ao cadastrar o alimento.',
                confirmButtonColor: '#ea580c'
            });
            throw error;
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
            router.push("/admin/alimentos"); 
        }
    };

    return (
        <Can perform="alimentos.criar" fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/alimentos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>
                    <h1 className={styles.title}>
                        Cadastrar Novo Alimento 
                    </h1>
                </div>

                <AlimentoForm
                    initialData={null}
                    mode="create" 
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </Can>
    );
}