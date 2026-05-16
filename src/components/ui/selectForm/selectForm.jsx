"use client";

import styles from "./selectForm.module.css";

export default function SelectForm({ 
    label, 
    name, 
    options = [], 
    error, 
    isLoading = false,
    loadingText = "Carregando...",
    placeholder = "Selecione...",
    ...props 
}) {
    return (
        <div className={styles.inputGroup}>
            {label && (
                <label htmlFor={name} className={styles.label}>
                    {label}
                </label>
            )}
            
            <select
                id={name}
                name={name}
                // Adiciona a classe de erro se existir
                className={`${styles.select} ${error ? styles.inputError : ""}`}
                // Bloqueia o select se estiver carregando ou se o props.disabled for true
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <option value="">{loadingText}</option>
                ) : (
                    <>
                        {/* Mostra o placeholder apenas se não houver valor selecionado */}
                        {!props.value && <option value="" disabled>{placeholder}</option>}
                        
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </>
                )}
            </select>
            
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}