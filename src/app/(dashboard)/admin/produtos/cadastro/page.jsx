"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

import { criarProduto } from "@/services/produtosService.js";

import ProdutosForm from "@/components/forms/produtos/produtosForm.jsx";
import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import styles from "../../alimentos/cadastro/page.module.css";

export default function CadastroProdutoPage() {
    const router = useRouter();

    const handleSave = async (payload) => {
        try {
            await criarProduto(payload);

            await Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: "Produto cadastrado com sucesso!",
                timer: 1800,
                showConfirmButton: false
            });

            router.push("/admin/produtos");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || "Falha ao cadastrar o produto.";

            await Swal.fire({
                icon: statusCode === 409 ? "warning" : "error",
                title: statusCode === 409 ? "Produto já cadastrado" : "Erro",
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
            router.push("/admin/produtos");
        }
    };

    return (
        <Can perform="produtos.criar" fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/produtos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>

                    <h1 className={styles.title}>
                        Cadastrar Novo Produto
                    </h1>
                </div>

                <ProdutosForm
                    mode="create"
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </Can>
    );
}