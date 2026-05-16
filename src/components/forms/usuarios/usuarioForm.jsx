'use client'

import { useState, useEffect } from "react"

import { useNiveisAcesso } from "@/hooks/useNiveisAcesso.js";

import { validateEmail, validatePassword, getPasswordIssues } from "@/utils/validators";

import  InputForm  from "@/components/ui/inputForm/inputForm.jsx";
import  SelectForm  from "@/components/ui/selectForm/selectForm.jsx";

import { Edit, Save, Eye, EyeOff, Check, X } from "lucide-react";

import styles from "./usuarioForm.module.css";

const ErrorMessage = ({ message }) => {
    if (!message) return null;
    return <span className={styles.errorText}>{message}</span>;
};

const PasswordReqItem = ({ label, met }) => (
    <div className={`${styles.reqItem} ${met ? styles.success : styles.pending}`}>
        {met ? <Check size={12} /> : <X size={12} />}
        <span>{label}</span>
    </div>
);
const allPasswordRules = [
    "Mínimo de 8 caracteres",
    "Pelo menos uma letra maiúscula",
    "Pelo menos uma letra minúscula",
    "Pelo menos um número",
    "Pelo menos um caractere especial (!@#$...)"
];

export default function UsuarioForm({ initialData, mode = 'create', onSave, onCancel }) {

    const [loading, setLoading] = useState(false);
    const [isEditable, setIsEditable] = useState(mode === 'create' || mode === 'edit');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const {
        niveisAcesso,
        loading: loadingNiveis,
        listarNiveisAcesso
    } = useNiveisAcesso();

    // 1. Adicionamos o 'id' aqui para podermos comparar depois
    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        nome: initialData?.nome || "",
        email: initialData?.email || "",
        senha: "",
        nivel_acesso_id: initialData?.nivel_acesso_id || "", // Começa vazio
        ativo: initialData?.ativo ?? true,
    });

    // ========================================================================
    // CORREÇÃO DO AVISO: "You might not need an effect"
    // Atualizamos o estado diretamente durante o render se a prop mudou!
    // Isso anula o render atual e recomeça com os dados certos instantaneamente.
    // ========================================================================
    if (initialData && initialData.id !== formData.id) {
        setFormData({
            id: initialData.id,
            nome: initialData.nome || "",
            email: initialData.email || "",
            senha: "",
            nivel_acesso_id: initialData.nivel_acesso_id || "",
            ativo: initialData.ativo ?? true,
        });
        setIsEditable(mode === 'create' || mode === 'edit');
    }

    // 2. Preenche o Nível de Acesso automaticamente quando a API responde (Modo Create)
    if (mode === 'create' && niveisAcesso.length > 0 && !formData.nivel_acesso_id) {
        setFormData({
            ...formData,
            nivel_acesso_id: niveisAcesso[0].id
        });
    }

    // Busca os Níveis de Acesso na montagem
    useEffect(() => {
        listarNiveisAcesso();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Seta o primeiro nível por padrão APENAS quando os dados da API chegam

    const passwordIssues = getPasswordIssues(formData.senha);
    const isPasswordValid = validatePassword(formData.senha);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nome || formData.nome.trim().length < 3) {
            newErrors.nome = "O nome deve ter pelo menos 3 caracteres.";
        }

        if (!formData.email || !validateEmail(formData.email)) {
            newErrors.email = "E-mail inválido.";
        }

        if (!formData.nivel_acesso_id) {
            newErrors.nivel_acesso_id = "Selecione um nível de acesso.";
        }

        const isTypingPassword = formData.senha && formData.senha.length > 0;
        if (mode === 'create' || (mode === 'edit' && isTypingPassword)) {
            if (!isPasswordValid) {
                newErrors.senha = "A senha não atende aos requisitos.";
            }
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
            email: formData.email,
            nivel_acesso_id: Number(formData.nivel_acesso_id),
            ativo: formData.ativo
        };

        if (formData.senha) {
            payload.senha = formData.senha;
        }

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
                email: initialData?.email || "",
                senha: "",
                nivel_acesso_id: initialData?.nivel_acesso_id || 2,
                ativo: initialData?.ativo ?? true,
            });
            setErrors({});
        } else {
            onCancel();
        }
    };

    const opcoesNivelAcesso = niveisAcesso.map(n => ({
        value: n.id,
        label: n.nome
    }));

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {initialData && (
                <div style={{ gridColumn: '1 / -1' }}>
                    <InputForm
                        label="ID do Usuário"
                        name="id"
                        value={initialData.id}
                        disabled={true}
                    />
                </div>
            )}

            <InputForm
                label="Nome Completo"
                name="nome"
                placeholder="Ex: João da Silva"
                value={formData.nome}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.nome}
            />

            <InputForm
                label="E-mail de Acesso"
                name="email"
                type="email"
                placeholder="exemplo@marmitaria.com"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditable}
                error={errors.email}
            />

            <SelectForm
                label="Nível de Acesso"
                name="nivel_acesso_id"
                options={opcoesNivelAcesso}
                value={formData.nivel_acesso_id}
                onChange={handleChange}
                disabled={!isEditable}
                isLoading={loadingNiveis}
                loadingText="Carregando níveis..."
                error={errors.nivel_acesso_id}
            />

            <div className={styles.passwordWrapperBox}>
                <InputForm
                    label={mode === 'edit' ? "Nova Senha (deixe em branco para manter)" : "Senha"}
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.senha}
                    onChange={handleChange}
                    disabled={!isEditable}
                    error={errors.senha}
                />

                {isEditable && (
                    <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}

                {isEditable && formData.senha && formData.senha.length > 0 && !isPasswordValid && (
                    <div className={styles.passwordRequirements}>
                        {allPasswordRules.map((rule) => (
                            <PasswordReqItem
                                key={rule}
                                label={rule}
                                met={!passwordIssues.includes(rule)}
                            />
                        ))}
                    </div>
                )}
            </div>

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
                                    {mode === 'create' ? "Cadastrar Usuário" : "Salvar Alterações"}
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </form>
    );

}