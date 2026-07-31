'use client'

import { useState } from "react";
import { X, Check, RefreshCw } from "lucide-react";

// Importando os seus hooks que vão ao banco de dados
import { useCardapio } from "@/hooks/useCardapio"; 
import { useTamanhosMarmitas } from "@/hooks/useTamanhosMarmitas"; 

import styles from "./montarMarmitaModal.module.css";

export default function ModalMontarMarmita({ onClose, onAdicionar }) {
    
    // Puxando os dados reais e renomeando os loadings para não dar conflito
    const { cardapioAgrupado, loading: loadingCardapio } = useCardapio();
    const { tamanhos, loading: loadingTamanhos } = useTamanhosMarmitas();

    const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');
    const [alimentosSelecionados, setAlimentosSelecionados] = useState([]);
    const [quantidade, setQuantidade] = useState(1);

    const toggleAlimento = (id) => {
        setAlimentosSelecionados(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleConfirmar = () => {
        if (!tamanhoSelecionado) return alert("Selecione um tamanho!");
        if (alimentosSelecionados.length === 0) return alert("Selecione pelo menos um alimento!");

        const tamanhoObj = tamanhos.find(t => t.id === Number(tamanhoSelecionado));

        // Envia a marmita montada de volta para o array do formulário principal
        onAdicionar({
            tamanho_id: Number(tamanhoSelecionado),
            tamanho_nome: tamanhoObj.nome, 
            preco_unitario: Number(tamanhoObj.preco_base), 
            quantidade: quantidade,
            alimentos: alimentosSelecionados
        });

        onClose(); 
    };

    const isCarregando = loadingCardapio || loadingTamanhos;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Montar Marmita</h3>
                    <button onClick={onClose} className={styles.btnFechar}><X size={20} /></button>
                </div>

                <div className={styles.body}>
                    {isCarregando ? (
                        <div className={styles.loadingContainer}>
                            <RefreshCw className={styles.spin} size={24} />
                            <p>Sincronizando cardápio...</p>
                        </div>
                    ) : (
                        <>
                            {/* PASSO 1: TAMANHO (Vem do banco) */}
                            <div className={styles.secao}>
                                <h4>1. Escolha o Tamanho</h4>
                                <select 
                                    className={styles.selectModal}
                                    value={tamanhoSelecionado} 
                                    onChange={e => setTamanhoSelecionado(e.target.value)}
                                >
                                    <option value="" disabled>Selecione o tamanho...</option>
                                    {(tamanhos || [])
                                        .filter(t => t.ativo !== false) // Filtra os inativos
                                        .map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nome} - R$ {Number(t.preco_base).toFixed(2).replace('.', ',')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PASSO 2: ALIMENTOS (Vem do banco já agrupado) */}
                            <div className={styles.secao}>
                                <h4>2. Selecione os Alimentos</h4>
                                
                                {(!cardapioAgrupado || Object.keys(cardapioAgrupado).length === 0) ? (
                                    <p className={styles.emptyCardapio}>O cardápio de hoje está vazio ou a loja está fechada.</p>
                                ) : (
                                    Object.entries(cardapioAgrupado).map(([categoria, itens]) => {
                                        // Oculta itens que a cozinha marcou como indisponíveis hoje
                                        const itensDisponiveis = itens.filter(item => item.disponivel_hoje !== false);
                                        
                                        if (itensDisponiveis.length === 0) return null;

                                        return (
                                            <div key={categoria} className={styles.grupoCategoria}>
                                                <h5 className={styles.tituloCategoria}>{categoria}</h5>
                                                <div className={styles.gridAlimentos}>
                                                    {itensDisponiveis.map(alimento => (
                                                        <label 
                                                            key={alimento.id} 
                                                            className={`${styles.cardAlimento} ${alimentosSelecionados.includes(alimento.id) ? styles.selecionado : ''}`}
                                                        >
                                                            <input 
                                                                type="checkbox" 
                                                                checked={alimentosSelecionados.includes(alimento.id)}
                                                                onChange={() => toggleAlimento(alimento.id)}
                                                                className={styles.checkboxOculto}
                                                            />
                                                            <div className={styles.checkIcon}>
                                                                {alimentosSelecionados.includes(alimento.id) && <Check size={14} color="white" />}
                                                            </div>
                                                            <span>{alimento.nome}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* PASSO 3: QUANTIDADE */}
                            <div className={styles.secaoHorizontal}>
                                <h4>Quantidade de Marmitas Iguais:</h4>
                                <div className={styles.contador}>
                                    <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}>-</button>
                                    <span>{quantidade}</span>
                                    <button onClick={() => setQuantidade(q => q + 1)}>+</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button onClick={onClose} className={styles.btnCancelar} disabled={isCarregando}>Cancelar</button>
                    <button onClick={handleConfirmar} className={styles.btnConfirmar} disabled={isCarregando}>
                        Adicionar ao Pedido
                    </button>
                </div>
            </div>
        </div>
    );
}