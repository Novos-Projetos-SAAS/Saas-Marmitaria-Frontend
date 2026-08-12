"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

import { criarCategoriaProduto } from "@/services/categoriasProdutosService.js";

import CategoriasProdutosForm from "@/components/forms/categoriasProdutos/categoriasProdutosForm.jsx";
import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import styles from "../../categorias-alimentos/cadastro/page.module.css";

export default function CadastroCategoriaProdutoPage() {
    const router = useRouter();

    const handleSave = async (payload) => {
        try {
            await criarCategoriaProduto(payload);

            await Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: "Categoria cadastrada com sucesso!",
                timer: 1800,
                showConfirmButton: false
            });

            router.push("/admin/categorias-produtos");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || "Falha ao cadastrar a categoria.";

            await Swal.fire({
                icon: statusCode === 409 ? "warning" : "error",
                title: statusCode === 409 ? "Categoria já cadastrada" : "Erro",
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
            router.push("/admin/categorias-produtos");
        }
    };

    return (
        <Can perform="categorias_produtos.criar" fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/categorias-produtos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>

                    <h1 className={styles.title}>
                        Cadastrar Categoria de Produto
                    </h1>
                </div>

                <CategoriasProdutosForm
                    initialData={null}
                    mode="create"
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </div>
        </Can>
    );
}