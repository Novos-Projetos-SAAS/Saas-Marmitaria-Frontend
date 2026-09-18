'use client';

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

import {
    buscarMarmitaEspecialPorId,
    editarMarmitaEspecial
} from "@/services/marmitasEspeciaisService.js";

import MarmitasEspeciaisForm from "@/components/forms/marmitasEspeciais/marmitasEspeciaisForm.jsx";
import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import styles from "./page.module.css";

function DetalhesMarmitaEspecialContent({ id }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modeUrl = searchParams.get("mode") || "view";

    const [marmita, setMarmita] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregar = async () => {
            try {
                const dados = await buscarMarmitaEspecialPorId(id);
                setMarmita(dados);
            } catch (error) {
                const message = error.response?.data?.message || "Marmita especial não encontrada.";

                await Swal.fire({
                    icon: "error",
                    title: "Erro",
                    text: message,
                    confirmButtonColor: "#ea580c"
                });

                router.push("/admin/marmitas-especiais");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            carregar();
        }
    }, [id, router]);

    const handleUpdate = async (payload) => {
        try {
            await editarMarmitaEspecial(id, payload);

            await Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: "Marmita especial atualizada com sucesso!",
                timer: 1800,
                showConfirmButton: false
            });

            router.push("/admin/marmitas-especiais");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || "Falha ao atualizar a marmita especial.";

            await Swal.fire({
                icon: statusCode === 409 ? "warning" : "error",
                title: statusCode === 409 ? "Marmita já cadastrada" : "Erro",
                text: message,
                confirmButtonColor: "#ea580c"
            });

            return false;
        }
    };

    const handleCancel = async () => {
        if (modeUrl === "view") {
            router.push("/admin/marmitas-especiais");
            return;
        }

        const result = await Swal.fire({
            title: "Deseja realmente cancelar?",
            text: "As alterações não salvas serão perdidas.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f59e0b",
            cancelButtonColor: "#71717a",
            confirmButtonText: "Sim, quero cancelar",
            cancelButtonText: "Não, continuar editando",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            router.push("/admin/marmitas-especiais");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Buscando marmita especial...</p>
            </div>
        );
    }

    return (
        <Can perform="cardapio.gerenciar" fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link
                        href="/admin/marmitas-especiais"
                        className={styles.btnVoltar}
                    >
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>

                    <h1 className={styles.title}>
                        {modeUrl === "edit"
                            ? "Editar Marmita Especial"
                            : "Detalhes da Marmita Especial"}
                    </h1>
                </div>

                {marmita && (
                    <MarmitasEspeciaisForm
                        initialData={marmita}
                        mode={modeUrl}
                        onSave={handleUpdate}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </Can>
    );
}

export default function MarmitaEspecialDetalhesPage({ params: paramsPromise }) {
    const params = use(paramsPromise);

    return (
        <Suspense
            fallback={
                <div className={styles.loadingContainer}>
                    <RefreshCw className={styles.spin} size={30} />
                </div>
            }
        >
            <DetalhesMarmitaEspecialContent id={params.id} />
        </Suspense>
    );
}
