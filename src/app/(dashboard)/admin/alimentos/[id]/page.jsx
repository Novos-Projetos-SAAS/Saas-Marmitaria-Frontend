'use client'

import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { use, Suspense, useState, useEffect } from 'react'

import { buscarAlimentoPorId, alterarAlimento } from '@/services/alimentosService.js';

import AlimentoForm from '@/components/forms/alimentos/alimentosForm';
import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';

import { ArrowLeft, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

// Reaproveitando o CSS padrão que criamos para as telas de detalhes
import styles from './page.module.css';

function DetalhesAlimentoContent({ id }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const alimentoId = id;
    const modeUrl = searchParams.get('mode') || 'view'; // 'view' ou 'edit'

    const [alimento, setAlimento] = useState(null);
    const [loading, setLoading] = useState(true);

    // Busca os dados do Alimento ao abrir a tela
    useEffect(() => {
        const fetchAlimento = async () => {
            try {
                const data = await buscarAlimentoPorId(alimentoId);
                setAlimento(data);
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Alimento não encontrado ou removido.',
                    confirmButtonColor: '#ea580c'
                });
                router.push("/admin/alimentos");
            } finally {
                setLoading(false);
            }
        };

        if (alimentoId) fetchAlimento();
    }, [alimentoId, router]);

    const handleUpdate = async (data) => {
        try {
            await alterarAlimento(alimentoId, data);

            await Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Alimento atualizado com sucesso!',
                timer: 2000,
                showConfirmButton: false
            });

            router.push("/admin/alimentos");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || 'Falha ao atualizar o alimento.';

            await Swal.fire({
                icon: statusCode === 409 ? 'warning' : 'error',
                title: statusCode === 409 ? 'Alimento já cadastrado' : 'Erro',
                text: message,
                confirmButtonColor: '#ea580c'
            });

            return false;
        }
    };

    const handleCancel = async () => {
        if (modeUrl === 'view') {
            return router.push("/admin/alimentos");
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
            router.push("/admin/alimentos");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Buscando ficha do alimento...</p>
            </div>
        );
    }

    const permissaoNecessaria = modeUrl === "edit" ? "alimentos.editar" : "alimentos.visualizar";

    return (
        <Can perform={permissaoNecessaria} fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/alimentos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>
                    <h1 className={styles.title}>
                        {modeUrl === "edit" ? "Editar Alimento" : "Detalhes do Alimento"}
                    </h1>
                </div>

                {alimento && (
                    <AlimentoForm
                        initialData={alimento}
                        mode={modeUrl}
                        onSave={handleUpdate}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </Can>
    );
}

export default function EditAlimentoPage({ params: paramsPromise }) {
    // Padrão Next.js 15+ para lidar com params
    const params = use(paramsPromise);
    const { id } = params;

    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <RefreshCw className="animate-spin" color="#ea580c" size={30} />
            </div>
        }>
            <DetalhesAlimentoContent id={id} />
        </Suspense>
    );
}