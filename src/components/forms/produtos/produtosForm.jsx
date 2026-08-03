"use client";

import {
    useEffect,
    useState
} from "react";

import {
    Edit,
    Save
} from "lucide-react";

import Can from "@/components/ui/can";
import InputForm from "@/components/ui/inputForm/inputForm.jsx";
import SelectForm from "@/components/ui/selectForm/selectForm.jsx";


import {
    buscarCategoriasProdutosParaSelect
} from "@/services/categoriasProdutosService.js";


import styles from "./produtosForm.module.css";


export default function ProdutosForm({

    initialData,

    mode = "create",

    onSave,

    onCancel

}) {

    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        loadingCategorias,
        setLoadingCategorias
    ] = useState(true);


    const [
        categorias,
        setCategorias
    ] = useState([]);


    const [
        errors,
        setErrors
    ] = useState({});


    const [
        isEditable,
        setIsEditable
    ] = useState(
        mode === "create" ||
        mode === "edit"
    );


    const [
        formData,
        setFormData
    ] = useState({

        id:
            initialData?.id ||
            null,

        nome:
            initialData?.nome ||
            "",

        categoria_produto_id:
            initialData
                ?.categoria_produto_id ||
            "",

        descricao:
            initialData?.descricao ||
            "",

        preco:
            initialData?.preco ??
            "",

        ordem_exibicao:
            initialData
                ?.ordem_exibicao ??
            0,

        ativo:
            initialData?.ativo ??
            true,

        disponivel_hoje:
            initialData
                ?.disponivel_hoje ??
            true
    });


    /**
     * Sincroniza os dados quando a API
     * termina de carregar o produto.
     */
    useEffect(() => {

        if (!initialData) {
            return;
        }


        setFormData({

            id:
                initialData.id ||
                null,

            nome:
                initialData.nome ||
                "",

            categoria_produto_id:
                initialData
                    .categoria_produto_id ||
                "",

            descricao:
                initialData.descricao ||
                "",

            preco:
                initialData.preco ??
                "",

            ordem_exibicao:
                initialData
                    .ordem_exibicao ??
                0,

            ativo:
                initialData.ativo ??
                true,

            disponivel_hoje:
                initialData
                    .disponivel_hoje ??
                false
        });


        setIsEditable(

            mode === "create" ||
            mode === "edit"
        );

    }, [
        initialData,
        mode
    ]);


    /**
     * Carrega categorias para o select.
     */
    useEffect(() => {

        async function carregar() {

            try {

                const dados =
                    await buscarCategoriasProdutosParaSelect();


                setCategorias(
                    dados
                );

            } catch (error) {

                console.error(
                    "Erro ao carregar categorias:",
                    error
                );

            } finally {

                setLoadingCategorias(
                    false
                );
            }
        }


        carregar();

    }, []);


    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setFormData(
            (
                anterior
            ) => ({

                ...anterior,

                [name]:
                    value
            })
        );


        if (
            errors[name]
        ) {

            setErrors(
                (
                    anterior
                ) => ({

                    ...anterior,

                    [name]:
                        null
                })
            );
        }
    };


    /**
     * Gerencia os dois estados booleanos.
     */
    const handleBoolean = (
        name
    ) => {

        setFormData(
            (
                anterior
            ) => {

                const novoValor =
                    !anterior[name];


                /**
                 * Produto inativo não pode
                 * permanecer disponível.
                 */
                if (
                    name === "ativo" &&
                    novoValor === false
                ) {

                    return {

                        ...anterior,

                        ativo:
                            false,

                        disponivel_hoje:
                            false
                    };
                }


                return {

                    ...anterior,

                    [name]:
                        novoValor
                };
            }
        );
    };


    const validateForm = () => {

        const novosErros = {};


        if (
            !formData.nome ||
            formData.nome
                .trim()
                .length < 2
        ) {

            novosErros.nome =
                "Informe um nome válido.";
        }


        if (
            !formData
                .categoria_produto_id
        ) {

            novosErros
                .categoria_produto_id =
                "Selecione uma categoria.";
        }


        const preco =
            Number(

                String(
                    formData.preco
                ).replace(
                    ",",
                    "."
                )
            );


        if (
            !Number.isFinite(preco) ||
            preco < 0
        ) {

            novosErros.preco =
                "Informe um preço válido.";
        }


        const ordem =
            Number(
                formData.ordem_exibicao
            );


        if (
            !Number.isInteger(ordem) ||
            ordem < 0
        ) {

            novosErros
                .ordem_exibicao =
                "Informe uma ordem válida.";
        }


        setErrors(
            novosErros
        );


        return (
            Object.keys(
                novosErros
            ).length === 0
        );
    };


    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


            if (
                !validateForm()
            ) {

                return;
            }


            setLoading(true);


            const payload = {

                nome:
                    formData.nome
                        .trim(),

                categoria_produto_id:
                    Number(
                        formData
                            .categoria_produto_id
                    ),

                descricao:
                    formData.descricao
                        .trim() ||
                    null,

                preco:
                    Number(

                        String(
                            formData.preco
                        ).replace(
                            ",",
                            "."
                        )
                    ),

                ordem_exibicao:
                    Number(
                        formData
                            .ordem_exibicao
                    ),

                ativo:
                    formData.ativo,

                disponivel_hoje:
                    formData
                        .ativo
                        ? formData
                            .disponivel_hoje
                        : false
            };


            try {

                await onSave(
                    payload
                );

            } catch (error) {

                console.error(
                    "Erro ao salvar produto:",
                    error
                );

            } finally {

                setLoading(
                    false
                );
            }
        };


    const handleCancelClick =
        () => {

            if (
                mode === "view" &&
                isEditable
            ) {

                setFormData({

                    id:
                        initialData?.id ||
                        null,

                    nome:
                        initialData?.nome ||
                        "",

                    categoria_produto_id:
                        initialData
                            ?.categoria_produto_id ||
                        "",

                    descricao:
                        initialData
                            ?.descricao ||
                        "",

                    preco:
                        initialData
                            ?.preco ??
                        "",

                    ordem_exibicao:
                        initialData
                            ?.ordem_exibicao ??
                        0,

                    ativo:
                        initialData
                            ?.ativo ??
                        true,

                    disponivel_hoje:
                        initialData
                            ?.disponivel_hoje ??
                        false
                });


                setErrors({});

                setIsEditable(
                    false
                );

                return;
            }


            onCancel();
        };


    const opcoesCategorias =
        categorias.map(
            (
                categoria
            ) => ({

                value:
                    categoria.id,

                label:
                    categoria.ativo

                        ? categoria.nome

                        : `${categoria.nome} (Inativa)`,

                /**
                 * Uma categoria inativa continua aparecendo
                 * para representar cadastros antigos,
                 * porém não poderá ser escolhida.
                 */
                disabled:
                    !categoria.ativo &&
                    Number(
                        categoria.id
                    ) !==
                    Number(
                        formData
                            .categoria_produto_id
                    )
            })
        );


    return (

        <form
            onSubmit={
                handleSubmit
            }
            className={
                styles.form
            }
        >

            {formData.id && (

                <div
                    className={
                        styles.fullWidth
                    }
                >

                    <InputForm
                        label="ID do Produto"
                        name="id"
                        value={
                            formData.id
                        }
                        disabled
                    />

                </div>
            )}


            <InputForm
                label="Nome do Produto"
                name="nome"
                placeholder="Ex: Coca-Cola 350ml"
                value={
                    formData.nome
                }
                onChange={
                    handleChange
                }
                disabled={
                    !isEditable
                }
                error={
                    errors.nome
                }
            />


            <SelectForm
                label="Categoria"
                name="categoria_produto_id"
                placeholder="Selecione a categoria"
                options={
                    opcoesCategorias
                }
                value={
                    formData
                        .categoria_produto_id
                }
                onChange={
                    handleChange
                }
                disabled={
                    !isEditable
                }
                isLoading={
                    loadingCategorias
                }
                loadingText="Carregando categorias..."
                error={
                    errors
                        .categoria_produto_id
                }
            />


            <InputForm
                label="Preço"
                name="preco"
                placeholder="Ex: 6,50"
                inputMode="decimal"
                value={
                    formData.preco
                }
                onChange={
                    handleChange
                }
                disabled={
                    !isEditable
                }
                error={
                    errors.preco
                }
            />


            <InputForm
                label="Ordem de Exibição"
                name="ordem_exibicao"
                type="number"
                min="0"
                value={
                    formData
                        .ordem_exibicao
                }
                onChange={
                    handleChange
                }
                disabled={
                    !isEditable
                }
                error={
                    errors
                        .ordem_exibicao
                }
            />


            <div
                className={
                    styles.fullWidth
                }
            >

                <div
                    className={
                        styles.textareaGroup
                    }
                >

                    <label
                        htmlFor="descricao"
                        className={
                            styles.label
                        }
                    >
                        Descrição
                    </label>


                    <textarea
                        id="descricao"
                        name="descricao"
                        rows="4"
                        placeholder="Ex: Refrigerante Coca-Cola lata 350ml."
                        value={
                            formData.descricao
                        }
                        onChange={
                            handleChange
                        }
                        disabled={
                            !isEditable
                        }
                        className={
                            styles.textarea
                        }
                    />

                </div>

            </div>


            <div
                className={
                    styles.toggleGrid
                }
            >

                <label
                    className={
                        `${styles.toggleCard} ${!isEditable
                            ? styles.toggleDisabled
                            : ""
                        }`
                    }
                >

                    <input
                        type="checkbox"
                        checked={
                            formData.ativo
                        }
                        disabled={
                            !isEditable
                        }
                        onChange={() =>
                            handleBoolean(
                                "ativo"
                            )
                        }
                    />


                    <div>

                        <strong>
                            Produto Ativo
                        </strong>

                        <span>
                            Controla se o produto faz parte do catálogo.
                        </span>

                    </div>

                </label>


                <label
                    className={
                        `${styles.toggleCard} ${!isEditable ||
                            !formData.ativo

                            ? styles.toggleDisabled

                            : ""
                        }`
                    }
                >

                    <input
                        type="checkbox"
                        checked={
                            formData
                                .disponivel_hoje
                        }
                        disabled={
                            !isEditable ||
                            !formData.ativo
                        }
                        onChange={() =>
                            handleBoolean(
                                "disponivel_hoje"
                            )
                        }
                    />


                    <div>

                        <strong>
                            Disponível Hoje
                        </strong>

                        <span>
                            Define se o cliente pode adicioná-lo ao pedido hoje.
                        </span>

                    </div>

                </label>

            </div>


            <div
                className={
                    styles.actions
                }
            >

                {!isEditable ? (

                    <Can
                        perform="produtos.editar"
                    >

                        <button
                            type="button"
                            className={
                                styles.btnSave
                            }
                            onClick={() =>
                                setIsEditable(
                                    true
                                )
                            }
                        >

                            <Edit
                                size={16}
                            />

                            Editar Dados

                        </button>

                    </Can>

                ) : (

                    <>

                        <button
                            type="button"
                            onClick={
                                handleCancelClick
                            }
                            className={
                                styles.btnCancel
                            }
                            disabled={
                                loading
                            }
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className={
                                styles.btnSave
                            }
                            disabled={
                                loading
                            }
                        >

                            {loading
                                ? "Salvando..."
                                : (
                                    <>

                                        <Save
                                            size={18}
                                        />

                                        {mode ===
                                            "create"
                                            ? "Cadastrar Produto"
                                            : "Salvar Alterações"}

                                    </>
                                )}

                        </button>

                    </>
                )}

            </div>

        </form>
    );
}