"use client";

import {
    Suspense,
    use,
    useEffect,
    useState
} from "react";

import Link from "next/link";

import {
    useRouter,
    useSearchParams
} from "next/navigation";

import {
    ArrowLeft,
    RefreshCw
} from "lucide-react";

import Swal from "sweetalert2";


import {

    alterarCategoriaProduto,

    buscarCategoriaProdutoPorId

} from "@/services/categoriasProdutosService.js";


import CategoriasProdutosForm from "@/components/forms/categoriasProdutos/categoriasProdutosForm.jsx";
import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";


import styles from "../../categorias-alimentos/[id]/page.module.css";


function CategoriaContent({
    id
}) {

    const router =
        useRouter();


    const params =
        useSearchParams();


    const mode =
        params.get(
            "mode"
        ) || "view";


    const [
        categoria,
        setCategoria
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    useEffect(() => {

        async function carregar() {

            try {

                const dados =
                    await buscarCategoriaProdutoPorId(
                        id
                    );


                setCategoria(
                    dados
                );

            } catch {

                router.push(
                    "/admin/categorias-produtos"
                );

            } finally {

                setLoading(
                    false
                );
            }
        }


        carregar();

    }, [
        id,
        router
    ]);


    if (loading) {

        return (

            <div
                className={
                    styles.loadingContainer
                }
            >

                <RefreshCw
                    className={
                        styles.spin
                    }
                    size={40}
                />

                <p>
                    Buscando categoria...
                </p>

            </div>
        );
    }


    const permissao =

        mode === "edit"

            ? "categorias_produtos.editar"

            : "categorias_produtos.listar";


    return (

        <Can
            perform={
                permissao
            }
            fallback={
                <AccessDenied />
            }
        >

            <div
                className={
                    styles.wrapper
                }
            >

                <div
                    className={
                        styles.header
                    }
                >

                    <Link
                        href="/admin/categorias-produtos"
                        className={
                            styles.btnVoltar
                        }
                    >

                        <ArrowLeft
                            size={18}
                        />

                        Voltar para Lista

                    </Link>


                    <h1
                        className={
                            styles.title
                        }
                    >

                        {mode === "edit"
                            ? "Editar Categoria de Produto"
                            : "Detalhes da Categoria"}

                    </h1>

                </div>


                <CategoriasProdutosForm

                    initialData={
                        categoria
                    }

                    mode={
                        mode
                    }

                    onSave={
                        async (
                            payload
                        ) => {

                            try {

                                await alterarCategoriaProduto(
                                    id,
                                    payload
                                );


                                await Swal.fire({

                                    icon:
                                        "success",

                                    title:
                                        "Sucesso",

                                    text:
                                        "Categoria atualizada com sucesso!",

                                    timer:
                                        1800,

                                    showConfirmButton:
                                        false
                                });


                                router.push(
                                    "/admin/categorias-produtos"
                                );

                            } catch (error) {

                                await Swal.fire({

                                    icon:
                                        "error",

                                    title:
                                        "Erro",

                                    text:
                                        error
                                            ?.response
                                            ?.data
                                            ?.message ||
                                        "Falha ao atualizar a categoria."
                                });


                                throw error;
                            }
                        }
                    }

                    onCancel={() =>
                        router.push(
                            "/admin/categorias-produtos"
                        )
                    }
                />

            </div>

        </Can>
    );
}


export default function CategoriaProdutoPage({
    params
}) {

    const {
        id
    } = use(params);


    return (

        <Suspense
            fallback={null}
        >

            <CategoriaContent
                id={
                    id
                }
            />

        </Suspense>
    );
}