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
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "Erro",
                text: error?.response?.data?.message || "Falha ao cadastrar a categoria."
            });

            throw error;
        }
    };

    return (
        <Can perform="categorias_produtos.criar" fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/categorias-produtos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        Voltar para Lista
                    </Link>

                    <h1 className={styles.title}>Cadastrar Categoria de Produto</h1>
                </div>

                <CategoriasProdutosForm
                    mode="create"
                    onSave={handleSave}
                    onCancel={() => router.push("/admin/categorias-produtos")}
                />
            </div>
        </Can>
    );
}