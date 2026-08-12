'use client';

import { use, Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import {
    buscarTamanhoPorId,
    alterarTamanhoMarmita
} from '@/services/tamanhosMarmitasService.js';

import TamanhoForm from '@/components/forms/tamanhosMarmitas/tamanhosMarmitasForm.jsx';
import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';

import { ArrowLeft, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

import styles from './page.module.css';

function DetalhesTamanhoContent({ id }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tamanhoId = id;
    const modeUrl = searchParams.get('mode') || 'view';

    const [tamanho, setTamanho] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTamanho = async () => {
            try {
                const data = await buscarTamanhoPorId(tamanhoId);
                setTamanho(data);
            } catch (error) {
                const message = error.response?.data?.message || 'Tamanho não encontrado ou removido.';

                await Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: message,
                    confirmButtonColor: '#ea580c'
                });

                router.push("/admin/tamanhos-marmitas");
            } finally {
                setLoading(false);
            }
        };

        if (tamanhoId) {
            fetchTamanho();
        }
    }, [tamanhoId, router]);

    const handleUpdate = async (data) => {
        try {
            await alterarTamanhoMarmita(tamanhoId, data);

            await Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Tamanho atualizado com sucesso!',
                timer: 2000,
                showConfirmButton: false
            });

            router.push("/admin/tamanhos-marmitas");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || 'Falha ao atualizar o tamanho.';

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
        if (modeUrl === 'view') {
            return router.push("/admin/tamanhos-marmitas");
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
            router.push("/admin/tamanhos-marmitas");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Buscando ficha do tamanho...</p>
            </div>
        );
    }

    const permissaoNecessaria = modeUrl === "edit"
        ? "tamanhos_marmitas.editar"
        : "tamanhos_marmitas.visualizar";

    return (
        <Can perform={permissaoNecessaria} fallback={<AccessDenied />}>
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
                        {modeUrl === "edit"
                            ? "Editar Tamanho"
                            : "Detalhes do Tamanho"}
                    </h1>
                </div>

                {tamanho && (
                    <TamanhoForm
                        initialData={tamanho}
                        mode={modeUrl}
                        onSave={handleUpdate}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </Can>
    );
}

export default function EditTamanhoPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    return (
        <Suspense
            fallback={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '50px'
                    }}
                >
                    <RefreshCw
                        className="animate-spin"
                        color="#ea580c"
                        size={30}
                    />
                </div>
            }
        >
            <DetalhesTamanhoContent id={id} />
        </Suspense>
    );
}