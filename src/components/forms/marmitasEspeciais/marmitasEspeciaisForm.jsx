'use client';

import { useEffect, useState } from "react";
import { Edit, Save } from "lucide-react";

import Can from "@/components/ui/can";
import InputForm from "@/components/ui/inputForm/inputForm.jsx";

import styles from "./marmitasEspeciaisForm.module.css";

export default function MarmitasEspeciaisForm({
    initialData,
    mode = "create",
    onSave,
    onCancel
}) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEditable, setIsEditable] = useState(mode === "create" || mode === "edit");
    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        nome: initialData?.nome || "",
        descricao: initialData?.descricao || "",
        preco: initialData?.preco ?? "",
        ativo: initialData?.ativo ?? true
    });

    useEffect(() => {
        if (!initialData) return;

        setFormData({
            id: initialData.id || null,
            nome: initialData.nome || "",
            descricao: initialData.descricao || "",
            preco: initialData.preco ?? "",
            ativo: initialData.ativo ?? true
        });

        setIsEditable(mode === "create" || mode === "edit");
    }, [initialData, mode]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((anterior) => ({
            ...anterior,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((anterior) => ({
                ...anterior,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const novosErros = {};

        if (!formData.nome || formData.nome.trim().length < 2) {
            novosErros.nome = "Informe um nome válido.";
        }

        const preco = Number(String(formData.preco).replace(",", "."));

        if (!Number.isFinite(preco) || preco <= 0) {
            novosErros.preco = "Informe um valor maior que zero.";
        }

        setErrors(novosErros);

        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        const payload = {
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim() || null,
            preco: Number(String(formData.preco).replace(",", ".")),
            ativo: formData.ativo
        };

        try {
            const resultado = await onSave(payload);

            if (resultado !== false && mode === "edit") {
                setIsEditable(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = () => {
        if (mode === "view" && isEditable) {
            setFormData({
                id: initialData?.id || null,
                nome: initialData?.nome || "",
                descricao: initialData?.descricao || "",
                preco: initialData?.preco ?? "",
                ativo: initialData?.ativo ?? true
            });
            setErrors({});
            setIsEditable(false);
            return;
        }

        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {formData.id && (
                <div className={styles.fullWidth}>
                    <InputForm
                        label="ID"
                        name="id"
                        value={formData.id}
                        disabled
                    />
                </div>
            )}

            <InputForm
                label="Nome da Marmita Especial"
                name="nome"
                placeholder="Ex: Caldo de Quenga - Tamanho M"
                value={formData.nome}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.nome}
            />

            <InputForm
                label="Valor (R$)"
                name="preco"
                placeholder="Ex: 23,00"
                inputMode="decimal"
                value={formData.preco}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.preco}
            />

            <div className={styles.fullWidth}>
                <div className={styles.textareaGroup}>
                    <label htmlFor="descricao" className={styles.label}>
                        Descrição
                    </label>

                    <textarea
                        id="descricao"
                        name="descricao"
                        rows="5"
                        placeholder="Ex: Caldo especial preparado com frango desfiado, mandioca, milho e cheiro-verde."
                        value={formData.descricao}
                        onChange={handleChange}
                        disabled={!isEditable}
                        className={styles.textarea}
                    />
                </div>
            </div>

            <div className={styles.fullWidth}>
                <label className={`${styles.toggleCard} ${!isEditable ? styles.toggleDisabled : ""}`}>
                    <input
                        type="checkbox"
                        checked={formData.ativo}
                        disabled={!isEditable}
                        onChange={() => {
                            setFormData((anterior) => ({
                                ...anterior,
                                ativo: !anterior.ativo
                            }));
                        }}
                    />

                    <div>
                        <strong>Marmita Especial Ativa</strong>
                        <span>
                            Quando ativa, ficará disponível para ser exibida aos clientes. Quando inativa, não aparecerá no cardápio público.
                        </span>
                    </div>
                </label>
            </div>

            <div className={styles.actions}>
                {!isEditable ? (
                    <Can perform="cardapio.gerenciar">
                        <button
                            type="button"
                            className={styles.btnSave}
                            onClick={() => setIsEditable(true)}
                        >
                            <Edit size={16} />
                            Editar Dados
                        </button>
                    </Can>
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
                            {loading ? "Salvando..." : (
                                <>
                                    <Save size={18} />
                                    {mode === "create"
                                        ? "Cadastrar Marmita Especial"
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
