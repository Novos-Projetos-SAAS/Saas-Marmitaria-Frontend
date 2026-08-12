"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

import {
    alterarCategoriaProduto,
    buscarCategoriaProdutoPorId
} from "@/services/categoriasProdutosService.js";

import CategoriasProdutosForm from "@/components/forms/categoriasProdutos/categoriasProdutosForm.jsx";
import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import styles from "../../categorias-alimentos/[id]/page.module.css";

function CategoriaContent({ id }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "view";

    const [categoria, setCategoria] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const carregarCategoria = async () => {
            try {
                const dados = await buscarCategoriaProdutoPorId(id);
                setCategoria(dados);
            } catch (error) {
                const message = error.response?.data?.message || "Categoria não encontrada ou removida.";

                await Swal.fire({
                    icon: "error",
                    title: "Erro",
                    text: message,
                    confirmButtonColor: "#ea580c"
                });

                router.push("/admin/categorias-produtos");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            carregarCategoria();
        }
    }, [id, router]);

    const handleUpdate = async (payload) => {
        try {
            await alterarCategoriaProduto(id, payload);

            await Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: "Categoria atualizada com sucesso!",
                timer: 1800,
                showConfirmButton: false
            });

            router.push("/admin/categorias-produtos");
            return true;
        } catch (error) {
            const statusCode = error.response?.status;
            const message = error.response?.data?.message || "Falha ao atualizar a categoria.";

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
        if (mode === "view") {
            return router.push("/admin/categorias-produtos");
        }

        const result = await Swal.fire({
            title: "Deseja realmente cancelar?",
            text: "Todas as alterações não salvas serão perdidas.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#f59e0b",
            cancelButtonColor: "#71717a",
            confirmButtonText: "Sim, quero cancelar",
            cancelButtonText: "Não, continuar editando",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            router.push("/admin/categorias-produtos");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Buscando categoria...</p>
            </div>
        );
    }

    const permissao = mode === "edit" ? "categorias_produtos.editar" : "categorias_produtos.listar";

    return (
        <Can perform={permissao} fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/categorias-produtos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>

                    <h1 className={styles.title}>
                        {mode === "edit" ? "Editar Categoria de Produto" : "Detalhes da Categoria"}
                    </h1>
                </div>

                {categoria && (
                    <CategoriasProdutosForm
                        initialData={categoria}
                        mode={mode}
                        onSave={handleUpdate}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </Can>
    );
}

export default function CategoriaProdutoPage({ params }) {
    const { id } = use(params);

    return (
        <Suspense
            fallback={
                <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
                    <RefreshCw className="animate-spin" color="#ea580c" size={30} />
                </div>
            }
        >
            <CategoriaContent id={id} />
        </Suspense>
    );
}