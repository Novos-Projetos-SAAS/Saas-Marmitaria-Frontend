"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

import { alterarProduto, buscarProdutoPorId } from "@/services/produtosService.js";

import ProdutosForm from "@/components/forms/produtos/produtosForm.jsx";
import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import styles from "../../alimentos/[id]/page.module.css";

function ProdutoContent({ id }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "view";

    const [produto, setProduto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            try {
                const dados = await buscarProdutoPorId(id);
                setProduto(dados);
            } catch (error) {
                await Swal.fire({
                    icon: "error",
                    title: "Erro",
                    text: "Produto não encontrado.",
                    confirmButtonColor: "#ea580c"
                });

                router.push("/admin/produtos");
            } finally {
                setLoading(false);
            }
        }

        carregar();
    }, [id, router]);

    const handleUpdate = async (payload) => {
        try {
            await alterarProduto(id, payload);

            await Swal.fire({
                icon: "success",
                title: "Sucesso",
                text: "Produto atualizado com sucesso!",
                timer: 1800,
                showConfirmButton: false
            });

            router.push("/admin/produtos");
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "Erro",
                text: error?.response?.data?.message || "Falha ao atualizar o produto.",
                confirmButtonColor: "#ea580c"
            });

            throw error;
        }
    };

    const handleCancel = async () => {
        if (mode === "view") {
            router.push("/admin/produtos");
            return;
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
            router.push("/admin/produtos");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spin} size={40} />
                <p>Buscando produto...</p>
            </div>
        );
    }

    const permissao = mode === "edit" ? "produtos.editar" : "produtos.visualizar";

    return (
        <Can perform={permissao} fallback={<AccessDenied />}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <Link href="/admin/produtos" className={styles.btnVoltar}>
                        <ArrowLeft size={18} />
                        <span>Voltar para Lista</span>
                    </Link>

                    <h1 className={styles.title}>
                        {mode === "edit" ? "Editar Produto" : "Detalhes do Produto"}
                    </h1>
                </div>

                {produto && (
                    <ProdutosForm
                        initialData={produto}
                        mode={mode}
                        onSave={handleUpdate}
                        onCancel={handleCancel}
                    />
                )}
            </div>
        </Can>
    );
}

export default function ProdutoPage({ params }) {
    const { id } = use(params);

    return (
        <Suspense
            fallback={
                <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
                    <RefreshCw color="#ea580c" size={30} />
                </div>
            }
        >
            <ProdutoContent id={id} />
        </Suspense>
    );
}