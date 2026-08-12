'use client';

import { useState, useEffect } from "react";
import InputForm from "@/components/ui/inputForm/inputForm.jsx";
import SelectForm from "@/components/ui/selectForm/selectForm.jsx";
import { Edit, Save } from "lucide-react";
import { buscarCategoriasDeAlimentosAdmin } from "@/services/categoriasAlimentosService.js";
import styles from "./alimentosForm.module.css";

export default function AlimentoForm({
    initialData,
    mode = 'create',
    onSave,
    onCancel
}) {
    const [loading, setLoading] = useState(false);
    const [isEditable, setIsEditable] = useState(mode === 'create' || mode === 'edit');
    const [errors, setErrors] = useState({});
    const [categorias, setCategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);

    const data = Array.isArray(initialData)
        ? initialData[0]
        : initialData || null;

    const [formData, setFormData] = useState({
        id: data?.id || null,
        nome: data?.nome || "",
        descricao: data?.descricao || "",
        categoria_id: data?.categoria_id || data?.categoria_alimento_id || "",
        disponivel_hoje: data
            ? data.disponivel_hoje === 1 || data.disponivel_hoje === true
            : true
    });

    if (data && data.id !== formData.id) {
        setFormData({
            id: data.id || null,
            nome: data.nome || "",
            descricao: data.descricao || "",
            categoria_id: data.categoria_id || data.categoria_alimento_id || "",
            disponivel_hoje: data.disponivel_hoje === 1 || data.disponivel_hoje === true
        });

        setIsEditable(mode === 'create' || mode === 'edit');
    }

    // Busca as categorias e extrai somente o array "data" da resposta da API.
    useEffect(() => {
        const carregarCategorias = async () => {
            setLoadingCategorias(true);

            try {
                const response = await buscarCategoriasDeAlimentosAdmin(
                    '',
                    1,
                    'all',
                    'nome',
                    'ASC',
                    1000
                );

                setCategorias(
                    Array.isArray(response?.data)
                        ? response.data
                        : []
                );
            } catch {
                setCategorias([]);
            } finally {
                setLoadingCategorias(false);
            }
        };

        carregarCategorias();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nome || formData.nome.trim().length < 2) {
            newErrors.nome = "O nome deve ter pelo menos 2 caracteres.";
        }

        if (!formData.categoria_id) {
            newErrors.categoria_id = "Selecione uma categoria.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const payload = {
            nome: formData.nome.trim(),
            descricao: formData.descricao?.trim() || null,
            categoria_id: Number(formData.categoria_id),
            disponivel_hoje: formData.disponivel_hoje === 'true' || formData.disponivel_hoje === true
        };

        try {
            const resultado = await onSave(payload);

            if (resultado !== false && mode === 'edit') {
                setIsEditable(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = () => {
        if (mode === 'view' && isEditable) {
            setIsEditable(false);

            setFormData({
                id: data?.id || null,
                nome: data?.nome || "",
                descricao: data?.descricao || "",
                categoria_id: data?.categoria_id || data?.categoria_alimento_id || "",
                disponivel_hoje: data
                    ? data.disponivel_hoje === 1 || data.disponivel_hoje === true
                    : true
            });

            setErrors({});
            return;
        }

        onCancel();
    };

    const isEditing = !!formData.id;

    // Proteção adicional para garantir que nunca seja executado .filter em um objeto.
    const listaCategorias = Array.isArray(categorias)
        ? categorias
        : [];

    const opcoesCategoria = listaCategorias
        .filter(categoria => {
            if (!isEditing) {
                return (
                    (categoria.ativo === true || categoria.ativo === 1) &&
                    !categoria.deletado_em
                );
            }

            return true;
        })
        .map(categoria => ({
            value: categoria.id,
            label:
                categoria.deletado_em ||
                categoria.ativo === false ||
                categoria.ativo === 0
                    ? `${categoria.nome} (Inativa)`
                    : categoria.nome
        }));

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {data && formData.id && (
                <div style={{ gridColumn: '1 / -1' }}>
                    <InputForm
                        label="ID do Alimento"
                        name="id"
                        value={formData.id}
                        disabled={true}
                    />
                </div>
            )}

            <InputForm
                label="Nome do Alimento"
                name="nome"
                placeholder="Ex: Arroz Branco, Feijão Tropeiro"
                value={formData.nome}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.nome}
            />

            <SelectForm
                label="Categoria"
                name="categoria_id"
                options={opcoesCategoria}
                value={formData.categoria_id}
                onChange={handleChange}
                disabled={!isEditable}
                isLoading={loadingCategorias}
                loadingText="Carregando categorias..."
                error={errors.categoria_id}
            />

            <InputForm
                label="Descrição (Opcional)"
                name="descricao"
                placeholder="Ex: Porção individual de arroz branco cozido no alho."
                value={formData.descricao}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.descricao}
            />

            <div className={styles.actions}>
                {!isEditable ? (
                    <button
                        type="button"
                        className={styles.btnSave}
                        onClick={() => setIsEditable(true)}
                    >
                        <Edit
                            size={16}
                            style={{ marginRight: 8 }}
                        />
                        Editar Dados
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handleCancelClick}
                            className={styles.btnCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={loading}
                        >
                            {loading ? (
                                "Salvando..."
                            ) : (
                                <>
                                    <Save
                                        size={18}
                                        style={{ marginRight: 8 }}
                                    />

                                    {mode === 'create'
                                        ? "Cadastrar Alimento"
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