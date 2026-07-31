'use client';
import React, { useState } from 'react';
import styles from './filtrosRelatorioModal.module.css';

export default function ModalFiltrosRelatorio({ relatorio, acao, onClose, onConfirm, loading }) {
    const [filtrosSelecionados, setFiltrosSelecionados] = useState({});

    // Transforma "pdf" em "PDF", "excel" em "Excel", etc para os textos
    const acaoLabel = acao === 'pdf' ? 'PDF' : acao === 'excel' ? 'Excel' : 'Impressão';

    const handleMudanca = (nome, valor) => {
        setFiltrosSelecionados(prev => ({ ...prev, [nome]: valor }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(filtrosSelecionados);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h2 className={styles.titulo}>Filtros: {relatorio.nome}</h2>
                <p className={styles.subtitulo}>
                    Preencha os filtros para gerar o seu documento ({acaoLabel}).
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {relatorio.filtros_config?.map((filtro, idx) => (
                        <div key={idx} className={styles.inputGroup}>
                            <label className={styles.label}>{filtro.label}</label>
                            
                            {filtro.tipo === 'select' ? (
                                <select 
                                    className={styles.input}
                                    onChange={(e) => handleMudanca(filtro.nome, e.target.value)}
                                    value={filtrosSelecionados[filtro.nome] || ''}
                                    required
                                >
                                    <option value="" disabled>Selecione...</option>
                                    {filtro.opcoes.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>
                            ) : (
                                <input 
                                    className={styles.input}
                                    type={filtro.tipo} 
                                    onChange={(e) => handleMudanca(filtro.nome, e.target.value)}
                                    value={filtrosSelecionados[filtro.nome] || ''}
                                />
                            )}
                        </div>
                    ))}

                    <div className={styles.footer}>
                        <button type="button" onClick={onClose} className={styles.btnCancelar} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.btnConfirmar} disabled={loading}>
                            {loading ? 'Processando...' : `Gerar ${acaoLabel}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}