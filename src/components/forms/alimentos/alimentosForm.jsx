'use client'

import { useState, useEffect } from "react"
import InputForm from "@/components/ui/inputForm/inputForm.jsx";
import SelectForm from "@/components/ui/selectForm/selectForm.jsx";
import { Edit, Save } from "lucide-react";
import { buscarCategoriasDeAlimentosAdmin } from "@/services/categoriasAlimentosService.js";
import styles from "./alimentosForm.module.css";

export default function AlimentoForm({ initialData, mode = 'create', onSave, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [isEditable, setIsEditable] = useState(mode === 'create' || mode === 'edit');
    const [errors, setErrors] = useState({});

    // Lista de categorias para o Select
    const [categorias, setCategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);

    // 🚀 1. Prepara os dados iniciais com segurança antes do state
    const data = Array.isArray(initialData) ? initialData[0] : (initialData || null);

    const [formData, setFormData] = useState({
        id: data?.id || null,
        nome: data?.nome || "",
        descricao: data?.descricao || "",
        categoria_alimento_id: data?.categoria_id || "",
        ativo: data ? (data.disponivel_hoje === 1 || data.disponivel_hoje === true) : true,
    });

    // 🚀 2. CORREÇÃO DE PERFORMANCE: O padrão "Derived State" (Sem useEffect)
    // Se a propriedade mudou (o ID que veio da API é diferente do que está no state), 
    // atualizamos diretamente aqui. O React cancela o render atual e recomeça limpo.
    if (data && data.id !== formData.id) {
        setFormData({
            id: data.id || null,
            nome: data.nome || "",
            descricao: data.descricao || "",
            categoria_alimento_id: data.categoria_alimento_id || "",
            imagem_alimento: data.imagem_alimento || "",
            ativo: data.ativo === 1 || data.ativo === true,
        });
        setIsEditable(mode === 'create' || mode === 'edit');
    }

    // O useEffect para buscar as categorias (chamada de API externa) continua normal e permitido
    useEffect(() => {
        buscarCategoriasDeAlimentosAdmin('', 1, 'false', 'nome', 'ASC')
            .then(res => setCategorias(res || []))
            .catch(err => console.error("Erro ao buscar categorias", err))
            .finally(() => setLoadingCategorias(false));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nome || formData.nome.trim().length < 2) {
            newErrors.nome = "O nome deve ter pelo menos 2 caracteres.";
        }
        if (!formData.categoria_alimento_id) {
            newErrors.categoria_alimento_id = "Selecione uma categoria.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        const payload = {
            nome: formData.nome,
            descricao: formData.descricao,
            categoria_alimento_id: Number(formData.categoria_alimento_id),
            // imagem_alimento: formData.imagem_alimento,
            ativo: formData.ativo
        };

        try {
            await onSave(payload);
            if (mode === 'edit') setIsEditable(false);
        } catch (error) {
            console.error("Erro no formulário:", error);
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
                categoria_alimento_id: data?.categoria_alimento_id || "",
                // imagem_alimento: data?.imagem_alimento || "",
                ativo: data ? (data.ativo === 1 || data.ativo === true) : true,
            });
            setErrors({});
        } else {
            onCancel();
        }
    };

    const opcoesCategoria = categorias.map(c => ({
        value: c.id,
        label: c.nome
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
                name="categoria_alimento_id"
                options={opcoesCategoria}
                value={formData.categoria_alimento_id}
                onChange={handleChange}
                disabled={!isEditable}
                isLoading={loadingCategorias}
                loadingText="Carregando categorias..."
                error={errors.categoria_alimento_id}
            />

            {/* <InputForm
                label="Nome do Arquivo de Imagem"
                name="imagem_alimento"
                placeholder="Ex: arroz-branco.png"
                value={formData.imagem_alimento}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.imagem_alimento}
            /> */}

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
                    <button type="button" className={styles.btnSave} onClick={() => setIsEditable(true)}>
                        <Edit size={16} style={{ marginRight: 8 }} /> Editar Dados
                    </button>
                ) : (
                    <>
                        <button type="button" onClick={handleCancelClick} className={styles.btnCancel} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.btnSave} disabled={loading}>
                            {loading ? "Salvando..." : (
                                <>
                                    <Save size={18} style={{ marginRight: 8 }} />
                                    {mode === 'create' ? "Cadastrar Alimento" : "Salvar Alterações"}
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}