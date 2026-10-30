
"use client";

import styles from "./inputForm.module.css";

export default function InputForm({
    label,
    name,
    type = "text",
    error,
    ...props
}) {
    const inputProps = { ...props };

    // Campos com "value" devem permanecer controlados
    // desde a primeira renderização, mesmo quando a API
    // retorna null ou undefined.
    if (
        type !== "file" &&
        Object.prototype.hasOwnProperty.call(inputProps, "value")
    ) {
        inputProps.value = inputProps.value ?? "";
    }

    return (
        <div className={styles.inputGroup}>
            {label && (
                <label htmlFor={name} className={styles.label}>
                    {label}
                </label>
            )}

            <input
                id={name}
                name={name}
                type={type}
                className={`${styles.input} ${error ? styles.inputError : ""}`}
                {...inputProps}
            />

            {error && (
                <span className={styles.errorText}>{error}</span>
            )}
        </div>
    );
}
