'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

import { criarMarmitaEspecial } from "@/services/marmitasEspeciaisService.js";
import MarmitasEspeciaisForm from "@/components/forms/marmitasEspeciais/marmitasEspeciaisForm.jsx";
import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import styles from "./page.module.css";

export default function CadastroMarmitaEspecialPage() {
    const router = useRouter();

    const handleSave = async (payload) => {
        try {
            await criarMarmitaEspecial(payload);

            await Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: "Marmita especial cadastrada com sucesso!",
                timer: 1800,
                showConfirmButton: false
            });

            router.push("/admin/marmitas-especiais");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || "Falha ao cadastrar a marmita especial.";

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
        const result = await Swal.fire({
            title: "Deseja realmente cancelar?",
            text: "Os dados preenchidos serão perdidos.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f59e0b",
            cancelButtonColor: "#71717a",
            confirmButtonText: "Sim, quero cancelar",
            cancelButtonText: "Não, continuar preenchendo",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            router.push("/admin/marmitas-especiais");
        }
    };

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
                        Cadastrar Marmita Especial
                    </h1>
                </div>

                <MarmitasEspeciaisForm
                    initialData={null}
                    mode="create"
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </Can>
    );
}
