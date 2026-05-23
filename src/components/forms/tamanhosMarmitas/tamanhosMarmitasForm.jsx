'use client'

import { useState } from "react"
import InputForm from "@/components/ui/inputForm/inputForm.jsx";
import { Edit, Save } from "lucide-react";
import styles from "./tamanhosMarmitasForm.module.css";

export default function TamanhoForm({ initialData, mode = 'create', onSave, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [isEditable, setIsEditable] = useState(mode === 'create' || mode === 'edit');
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        nome: initialData?.nome || "",
        preco_base: initialData?.preco_base !== undefined ? initialData.preco_base : "",
        ativo: initialData?.ativo ?? true,
    });

    if (initialData && initialData.id !== formData.id) {
        setFormData({
            id: initialData.id,
            nome: initialData.nome || "",
            preco_base: initialData.preco_base !== undefined ? initialData.preco_base : "",
            ativo: initialData.ativo ?? true,
        });
        setIsEditable(mode === 'create' || mode === 'edit');
    }

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

        if (formData.preco_base === "" || isNaN(formData.preco_base) || Number(formData.preco_base) < 0) {
            newErrors.preco_base = "Informe um preço válido (maior ou igual a zero).";
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
            preco_base: parseFloat(formData.preco_base),
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
                id: initialData?.id || null,
                nome: initialData?.nome || "",
                preco_base: initialData?.preco_base !== undefined ? initialData.preco_base : "",
                ativo: initialData?.ativo ?? true,
            });
            setErrors({});
        } else {
            onCancel();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {initialData && (
                <div style={{ gridColumn: '1 / -1' }}>
                    <InputForm
                        label="ID do Tamanho"
                        name="id"
                        value={initialData.id}
                        disabled={true}
                    />
                </div>
            )}

            <InputForm
                label="Nome do Tamanho"
                name="nome"
                placeholder="Ex: Média, Grande, Maromba"
                value={formData.nome}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.nome}
            />

            <InputForm
                label="Preço Base (R$)"
                name="preco_base"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 18.50"
                value={formData.preco_base}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.preco_base}
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
                                    {mode === 'create' ? "Cadastrar Tamanho" : "Salvar Alterações"}
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}