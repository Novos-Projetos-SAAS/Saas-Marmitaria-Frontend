'use client'

import { useState } from "react";
import { X, Check, RefreshCw, Minus, Plus } from "lucide-react";
import { useCardapio } from "@/hooks/useCardapio";
import { useTamanhosMarmitas } from "@/hooks/useTamanhosMarmitas";
import { useProdutosCardapio } from "@/hooks/useProdutosCardapio";
import styles from "./montarMarmitaModal.module.css";

export default function ModalMontarMarmita({ onClose, onAdicionar }) {
    const { cardapioAgrupado, loading: loadingCardapio } = useCardapio();
    const { tamanhos, loading: loadingTamanhos } = useTamanhosMarmitas();
    const { categoriasProdutos, loading: loadingProdutos } = useProdutosCardapio();
    const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');
    const [alimentosSelecionados, setAlimentosSelecionados] = useState([]);
    const [quantidade, setQuantidade] = useState(1);
    const [produtosSelecionados, setProdutosSelecionados] = useState([]);

    const toggleAlimento = (id) => {
        setAlimentosSelecionados(prev => prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]);
    };

    const alterarQuantidadeProduto = (produto, categoria, diferenca) => {
        setProdutosSelecionados(prev => {
            const existente = prev.find(item => item.produto_id === produto.id);
            const novaQuantidade = (existente?.quantidade || 0) + diferenca;
            if (novaQuantidade <= 0) return prev.filter(item => item.produto_id !== produto.id);
            if (existente) return prev.map(item => item.produto_id === produto.id ? { ...item, quantidade: novaQuantidade } : item);
            return [...prev, { produto_id: produto.id, nome: produto.nome, preco: Number(produto.preco), quantidade: 1, categoria_nome: categoria.nome }];
        });
    };

    const quantidadeProduto = (produtoId) => produtosSelecionados.find(item => item.produto_id === produtoId)?.quantidade || 0;

    const handleConfirmar = () => {
        if (!tamanhoSelecionado) return alert("Selecione um tamanho!");
        if (alimentosSelecionados.length === 0) return alert("Selecione pelo menos um alimento!");

        const tamanhoObj = tamanhos.find(t => t.id === Number(tamanhoSelecionado));
        onAdicionar({
            tamanho_id: Number(tamanhoSelecionado),
            tamanho_nome: tamanhoObj.nome,
            preco_unitario: Number(tamanhoObj.preco_base),
            quantidade,
            alimentos: alimentosSelecionados
        }, produtosSelecionados);
        onClose();
    };

    const isCarregando = loadingCardapio || loadingTamanhos || loadingProdutos;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Montar Marmita</h3>
                    <button type="button" onClick={onClose} className={styles.btnFechar}><X size={20} /></button>
                </div>

                <div className={styles.body}>
                    {isCarregando ? (
                        <div className={styles.loadingContainer}>
                            <RefreshCw className={styles.spin} size={24} />
                            <p>Sincronizando cardápio...</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.secao}>
                                <h4>1. Escolha o Tamanho</h4>
                                <select className={styles.selectModal} value={tamanhoSelecionado} onChange={e => setTamanhoSelecionado(e.target.value)}>
                                    <option value="" disabled>Selecione o tamanho...</option>
                                    {(tamanhos || []).filter(t => t.ativo !== false).map(t => (
                                        <option key={t.id} value={t.id}>{t.nome} - R$ {Number(t.preco_base).toFixed(2).replace('.', ',')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.secao}>
                                <h4>2. Selecione os Alimentos</h4>
                                {(!cardapioAgrupado || Object.keys(cardapioAgrupado).length === 0) ? (
                                    <p className={styles.emptyCardapio}>O cardápio de hoje está vazio ou a loja está fechada.</p>
                                ) : (
                                    Object.entries(cardapioAgrupado).map(([categoria, itens]) => {
                                        const itensDisponiveis = itens.filter(item => item.disponivel_hoje !== false);
                                        if (itensDisponiveis.length === 0) return null;
                                        return (
                                            <div key={categoria} className={styles.grupoCategoria}>
                                                <h5 className={styles.tituloCategoria}>{categoria}</h5>
                                                <div className={styles.gridAlimentos}>
                                                    {itensDisponiveis.map(alimento => (
                                                        <label key={alimento.id} className={`${styles.cardAlimento} ${alimentosSelecionados.includes(alimento.id) ? styles.selecionado : ''}`}>
                                                            <input type="checkbox" checked={alimentosSelecionados.includes(alimento.id)} onChange={() => toggleAlimento(alimento.id)} className={styles.checkboxOculto} />
                                                            <div className={styles.checkIcon}>{alimentosSelecionados.includes(alimento.id) && <Check size={14} color="white" />}</div>
                                                            <span>{alimento.nome}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className={styles.secaoHorizontal}>
                                <h4>3. Quantidade de Marmitas Iguais:</h4>
                                <div className={styles.contador}>
                                    <button type="button" onClick={() => setQuantidade(q => Math.max(1, q - 1))}>-</button>
                                    <span>{quantidade}</span>
                                    <button type="button" onClick={() => setQuantidade(q => q + 1)}>+</button>
                                </div>
                            </div>

                            <div className={styles.secao}>
                                <h4>4. Adicionar Produtos <small>(Opcional)</small></h4>
                                {categoriasProdutos.length === 0 ? (
                                    <p className={styles.emptyCardapio}>Nenhum produto disponível hoje.</p>
                                ) : categoriasProdutos.map(categoria => (
                                    <div key={categoria.id} className={styles.grupoCategoria}>
                                        <h5 className={styles.tituloCategoria}>{categoria.nome}</h5>
                                        <div className={styles.listaProdutos}>
                                            {(categoria.produtos || []).map(produto => {
                                                const quantidadeSelecionada = quantidadeProduto(produto.id);
                                                return (
                                                    <div key={produto.id} className={styles.produtoLinha}>
                                                        <div className={styles.produtoInfo}>
                                                            <strong>{produto.nome}</strong>
                                                            <span>R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
                                                        </div>
                                                        <div className={styles.contador}>
                                                            <button type="button" onClick={() => alterarQuantidadeProduto(produto, categoria, -1)} disabled={quantidadeSelecionada === 0}><Minus size={15} /></button>
                                                            <span>{quantidadeSelecionada}</span>
                                                            <button type="button" onClick={() => alterarQuantidadeProduto(produto, categoria, 1)}><Plus size={15} /></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className={styles.footer}>
                    <button type="button" onClick={onClose} className={styles.btnCancelar} disabled={isCarregando}>Cancelar</button>
                    <button type="button" onClick={handleConfirmar} className={styles.btnConfirmar} disabled={isCarregando}>Adicionar ao Pedido</button>
                </div>
            </div>
        </div>
    );
}
