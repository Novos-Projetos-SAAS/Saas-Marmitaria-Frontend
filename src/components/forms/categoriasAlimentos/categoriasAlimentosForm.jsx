'use client'

import { useState } from "react"
import InputForm from "@/components/ui/inputForm/inputForm.jsx";
import { Edit, Save } from "lucide-react";
import styles from "./categoriasAlimentosForm.module.css"; 

export default function CategoriaAlimentosForm({ initialData, mode = 'create', onSave, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [isEditable, setIsEditable] = useState(mode === 'create' || mode === 'edit');
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        nome: initialData?.nome || "",
        limite_escolhas: initialData?.limite_escolhas !== undefined ? initialData.limite_escolhas : 1,
        ativo: initialData?.ativo ?? true,
    });

    

    if (initialData && initialData.id !== formData.id) {
        setFormData({
            id: initialData.id,
            nome: initialData.nome || "",
            limite_escolhas: initialData.limite_escolhas !== undefined ? initialData.limite_escolhas : 1,
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

        if (formData.limite_escolhas === "" || isNaN(formData.limite_escolhas) || Number(formData.limite_escolhas) < 1) {
            newErrors.limite_escolhas = "O limite deve ser no mínimo 1.";
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
            limite_escolhas: parseInt(formData.limite_escolhas, 10),
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
                limite_escolhas: initialData?.limite_escolhas !== undefined ? initialData.limite_escolhas : 1,
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
                        label="ID da Categoria"
                        name="id"
                        value={initialData.id}
                        disabled={true}
                    />
                </div>
            )}

            <InputForm
                label="Nome da Categoria"
                name="nome"
                placeholder="Ex: Guarnições, Proteínas"
                value={formData.nome}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.nome}
            />

            <InputForm
                label="Limite de Escolhas"
                name="limite_escolhas"
                type="number"
                min="1"
                placeholder="Ex: 2"
                value={formData.limite_escolhas}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.limite_escolhas}
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
                                    {mode === 'create' ? "Cadastrar Categoria" : "Salvar Alterações"}
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </form>
    );
}