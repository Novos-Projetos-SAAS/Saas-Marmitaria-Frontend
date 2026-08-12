'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { use, Suspense, useState, useEffect } from 'react';

import { buscarCategoriaPorId, alterarCategoria } from '@/services/categoriasAlimentosService.js';

import CategoriaAlimentosForm from '@/components/forms/categoriasAlimentos/categoriasAlimentosForm';
import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';

import { ArrowLeft, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

import styles from './page.module.css';

function DetalhesCategoriaContent({ id }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoriaId = id;
    const modeUrl = searchParams.get('mode') || 'view';

    const [categoria, setCategoria] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoria = async () => {
            try {
                const data = await buscarCategoriaPorId(categoriaId);
                setCategoria(data);
            } catch (error) {
                const message = error.response?.data?.message || 'Categoria não encontrada ou removida.';

                await Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: message,
                    confirmButtonColor: '#ea580c'
                });

                router.push("/admin/categorias-alimentos");
            } finally {
                setLoading(false);
            }
        };

        if (categoriaId) {
            fetchCategoria();
        }
    }, [categoriaId, router]);

    const handleUpdate = async (data) => {
        try {
            await alterarCategoria(categoriaId, data);

            await Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Categoria atualizada com sucesso!',
                timer: 2000,
                showConfirmButton: false
            });

            router.push("/admin/categorias-alimentos");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || 'Falha ao atualizar a categoria.';

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
        if (modeUrl === 'view') {
            return router.push("/admin/categorias-alimentos");
        }

        const result = await Swal.fire({
            title: 'Deseja realmente cancelar?',
            text: 'Todas as alterações não salvas serão perdidas.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#71717a',
            confirmButtonText: 'Sim, quero cancelar',
            cancelButtonText: 'Não, continuar editando',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            router.push("/admin/categorias-alimentos");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Buscando ficha da categoria...</p>
            </div>
        );
    }

    const permissaoNecessaria = modeUrl === "edit" ? "categorias_alimentos.editar" : "categorias_alimentos.visualizar";

    return (
        <Can perform={permissaoNecessaria} fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/categorias-alimentos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>

                    <h1 className={styles.title}>
                        {modeUrl === "edit" ? "Editar Categoria" : "Detalhes da Categoria"}
                    </h1>
                </div>

                {categoria && (
                    <CategoriaAlimentosForm
                        initialData={categoria}
                        mode={modeUrl}
                        onSave={handleUpdate}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </Can>
    );
}

export default function EditCategoriaPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    return (
        <Suspense
            fallback={
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                    <RefreshCw className="animate-spin" color="#ea580c" size={30} />
                </div>
            }
        >
            <DetalhesCategoriaContent id={id} />
        </Suspense>
    );
}