'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { criarCategoria } from '@/services/categoriasAlimentosService.js';
import CategoriaAlimentosForm from '@/components/forms/categoriasAlimentos/categoriasAlimentosForm';
import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';

import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

import styles from './page.module.css';

export default function CadastroCategoriaPage() {
    const router = useRouter();

    const handleSave = async (payload) => {
        try {
            await criarCategoria(payload);

            await Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Nova categoria cadastrada com sucesso!',
                timer: 2000,
                showConfirmButton: false
            });

            router.push("/admin/categorias-alimentos");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || 'Falha ao cadastrar a categoria.';

            await Swal.fire({
                icon: statusCode === 409 ? 'warning' : 'error',
                title: statusCode === 409 ? 'Categoria já cadastrada' : 'Erro',
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
            router.push("/admin/categorias-alimentos");
        }
    };

    return (
        <Can perform="categorias_alimentos.criar" fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/categorias-alimentos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>

                    <h1 className={styles.title}>Cadastrar Nova Categoria</h1>
                </div>

                <CategoriaAlimentosForm
                    initialData={null}
                    mode="create"
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </Can>
    );
}