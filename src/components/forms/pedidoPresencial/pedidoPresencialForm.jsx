'use client'

import { useEffect, useState } from "react";
import { usePedidos } from "@/hooks/usePedidos";
import { useMetodosPagamento } from "@/hooks/useMetodosPagamento";
import { buscarMarmitasEspeciaisPublicas } from "@/services/marmitasEspeciaisService.js";

import ModalMontarMarmita from "@/components/modals/montarMarmita/montarMarmitaModal";
import modalStyles from "@/components/modals/montarMarmita/montarMarmitaModal.module.css";
import TelefoneInput from "@/components/ui/inputMask";

import { Save, X, ShoppingBag, User, MapPin, Plus, Minus, Star, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./pedidoPresencialForm.module.css";

export default function FormPedidoPresencial({ voltarParaLista }) {
    const { finalizarPedidoNoBanco, enviando } = usePedidos();
    const { metodosPagamento, loadingMetodosPagamento } = useMetodosPagamento();

    const [modalAberto, setModalAberto] = useState(false);
    const [modalEspecialAberto, setModalEspecialAberto] = useState(false);
    const [opcoesMarmitasEspeciais, setOpcoesMarmitasEspeciais] = useState([]);
    const [loadingMarmitasEspeciais, setLoadingMarmitasEspeciais] = useState(true);
    const [marmitaEspecialSelecionadaId, setMarmitaEspecialSelecionadaId] = useState('');
    const [quantidadeMarmitaEspecial, setQuantidadeMarmitaEspecial] = useState(1);

    const [formData, setFormData] = useState({
        nome_cliente: '',
        telefone_cliente: '',
        logradouro: '',
        numero: '',
        complemento: '',
        tipo_pedido: 'Presencial',
        metodo_entrega: 'Retirada',
        metodo_pagamento_id: '',
        observacoes: '',
        marmitas: [],
        marmitas_especiais: [],
        produtos: [],
        precisa_troco: false, // 👇 Adicionado
        troco_para: ''        // 👇 Adicionado
    });

    useEffect(() => {
        async function carregarMarmitasEspeciais() {
            try {
                const marmitas = await buscarMarmitasEspeciaisPublicas();
                setOpcoesMarmitasEspeciais(marmitas || []);
            } catch (error) {
                console.error(error);
                setOpcoesMarmitasEspeciais([]);
            } finally {
                setLoadingMarmitasEspeciais(false);
            }
        }

        carregarMarmitasEspeciais();
    }, []);

    // Calcula o total do pedido dinamicamente
    const totalPedido =
        formData.marmitas.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0) +
        formData.marmitas_especiais.reduce((acc, item) => acc + (item.preco * item.quantidade), 0) +
        formData.produtos.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

    // Identifica se o método de pagamento selecionado é Dinheiro
    const isPagamentoDinheiro = metodosPagamento
        .find(m => String(m.id) === String(formData.metodo_pagamento_id))
        ?.nome.toLowerCase().includes('dinheiro');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => {
            const newState = { 
                ...prev, 
                [name]: type === 'checkbox' ? checked : value 
            };

            // Limpa os campos de endereço se mudar para Retirada
            if (name === 'metodo_entrega' && value === 'Retirada') {
                newState.logradouro = '';
                newState.numero = '';
                newState.complemento = '';
            }

            // Limpa os campos de troco se o usuário trocar a forma de pagamento
            if (name === 'metodo_pagamento_id') {
                const isDinheiro = metodosPagamento
                    .find(m => String(m.id) === String(value))
                    ?.nome.toLowerCase().includes('dinheiro');
                
                if (!isDinheiro) {
                    newState.precisa_troco = false;
                    newState.troco_para = '';
                }
            }

            return newState;
        });
    };

    const handleSalvarPedido = async (e) => {
        e.preventDefault();

        if (!formData.nome_cliente.trim()) {
            return toast.error("O nome do cliente é obrigatório.");
        }

        const telefoneLimpo = String(formData.telefone_cliente || "").replace(/\D/g, "");

        if (!telefoneLimpo) {
            return toast.error("O telefone do cliente é obrigatório.");
        }

        if (telefoneLimpo.length !== 10 && telefoneLimpo.length !== 11) {
            return toast.error("Informe um telefone válido com DDD.");
        }

        let enderecoFinal = null;

        if (formData.metodo_entrega === "Entrega") {
            if (!formData.logradouro.trim() || !formData.numero.trim()) {
                return toast.error("Preencha a Rua/Avenida e o Número para entrega.");
            }
            enderecoFinal = `${formData.logradouro.trim()}, ${formData.numero.trim()} - Centro (${formData.complemento.trim() || "Sem complemento"})`;
        }

        if (!formData.metodo_pagamento_id) {
            return toast.error("Selecione um método de pagamento.");
        }

        // Validação do Troco
        if (isPagamentoDinheiro && formData.precisa_troco) {
            const valorTroco = parseFloat(String(formData.troco_para).replace(',', '.'));
            if (isNaN(valorTroco) || valorTroco <= totalPedido) {
                return toast.error(`O valor do troco deve ser maior que o total do pedido (R$ ${totalPedido.toFixed(2).replace('.', ',')}).`);
            }
        }

        if (formData.marmitas.length === 0 && formData.marmitas_especiais.length === 0) {
            return toast.error("Adicione pelo menos uma marmita ao pedido.");
        }

        const payloadDoBanco = {
            nome_cliente: formData.nome_cliente.trim(),
            telefone_cliente: telefoneLimpo,
            endereco_cliente: enderecoFinal,
            tipo_pedido: formData.tipo_pedido,
            metodo_entrega: formData.metodo_entrega,
            metodo_pagamento_id: Number(formData.metodo_pagamento_id),
            observacoes: formData.observacoes.trim() || null,
            
            // Novos campos de troco
            precisa_troco: isPagamentoDinheiro ? formData.precisa_troco : false,
            troco_para: isPagamentoDinheiro && formData.precisa_troco ? parseFloat(String(formData.troco_para).replace(',', '.')) : null,

            marmitas: formData.marmitas.map((item) => ({
                tamanho_id: Number(item.tamanho_id),
                quantidade: Number(item.quantidade),
                alimentos: item.alimentos.map(Number),
                observacao: item.observacao || null
            })),
            marmitas_especiais: formData.marmitas_especiais.map((item) => ({
                marmita_especial_id: Number(item.marmita_especial_id),
                quantidade: Number(item.quantidade),
                preco_referencia: Number(item.preco)
            })),
            produtos: (formData.produtos || []).map((produto) => ({
                produto_id: Number(produto.produto_id),
                quantidade: Number(produto.quantidade),
            })),
        };

        const resposta = await finalizarPedidoNoBanco(payloadDoBanco, { admin: true });

        if (resposta?.status === 'conflict') {
            toast.error(resposta.message || "O pedido precisa ser atualizado antes de ser salvo.");
            return;
        }

        if (resposta) {
            voltarParaLista();
        }
    };

    const removerMarmita = (index) => {
        const novasMarmitas = [...formData.marmitas];
        novasMarmitas.splice(index, 1);
        setFormData(prev => ({ ...prev, marmitas: novasMarmitas }));
    };

    const removerMarmitaEspecial = (marmitaEspecialId) => {
        setFormData(prev => ({
            ...prev,
            marmitas_especiais: prev.marmitas_especiais.filter(
                item => Number(item.marmita_especial_id) !== Number(marmitaEspecialId)
            )
        }));
    };

    const removerProduto = (produtoId) => {
        setFormData(prev => ({ ...prev, produtos: prev.produtos.filter(produto => produto.produto_id !== produtoId) }));
    };

    const fecharModalEspecial = () => {
        setModalEspecialAberto(false);
        setMarmitaEspecialSelecionadaId('');
        setQuantidadeMarmitaEspecial(1);
    };

    const adicionarMarmitaEspecial = () => {
        const marmita = opcoesMarmitasEspeciais.find(
            item => Number(item.id) === Number(marmitaEspecialSelecionadaId)
        );

        if (!marmita) {
            return toast.error("Selecione uma marmita especial.");
        }

        setFormData(prev => {
            const especiais = prev.marmitas_especiais.map(item => ({ ...item }));
            const existente = especiais.find(
                item => Number(item.marmita_especial_id) === Number(marmita.id)
            );

            if (existente) {
                existente.quantidade += quantidadeMarmitaEspecial;
                existente.nome = marmita.nome;
                existente.descricao = marmita.descricao || null;
                existente.preco = Number(marmita.preco);
            } else {
                especiais.push({
                    marmita_especial_id: Number(marmita.id),
                    nome: marmita.nome,
                    descricao: marmita.descricao || null,
                    preco: Number(marmita.preco),
                    quantidade: quantidadeMarmitaEspecial
                });
            }

            return {
                ...prev,
                marmitas_especiais: especiais
            };
        });

        toast.success("Marmita especial adicionada ao pedido!");
        fecharModalEspecial();
    };

    const marmitaEspecialSelecionada = opcoesMarmitasEspeciais.find(
        item => Number(item.id) === Number(marmitaEspecialSelecionadaId)
    );

    return (
        <>
            <form onSubmit={handleSalvarPedido} className={styles.cardGeral}>
                <div className={styles.header}>
                    <div>
                        <h2>Novo Pedido (PDV)</h2>
                        <p className={styles.textHint}>Registe um pedido feito presencialmente ou por telefone.</p>
                    </div>
                    <button type="button" className={styles.btnFechar} onClick={voltarParaLista}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.gridForm}>
                    <div className={styles.coluna}>
                        <h3 className={styles.sectionTitle}><User size={18} /> Dados do Cliente</h3>

                        <div className={styles.inputGroup}>
                            <label>Nome do Cliente *</label>
                            <input
                                type="text"
                                name="nome_cliente"
                                value={formData.nome_cliente}
                                onChange={handleChange}
                                placeholder="Ex: João Silva"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Telefone / WhatsApp *</label>
                            <TelefoneInput
                                name="telefone_cliente"
                                value={formData.telefone_cliente}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                required
                            />
                        </div>

                        <h3 className={styles.sectionTitle}><MapPin size={18} /> Entrega e Pagamento</h3>

                        <div className={styles.rowInputs}>
                            <div className={styles.inputGroup}>
                                <label>Origem do Pedido</label>
                                <select name="tipo_pedido" value={formData.tipo_pedido} onChange={handleChange}>
                                    <option value="Presencial">Balcão (Presencial)</option>
                                    <option value="Remoto">Telefone / WhatsApp</option>
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Forma de Entrega</label>
                                <select name="metodo_entrega" value={formData.metodo_entrega} onChange={handleChange}>
                                    <option value="Retirada">Retirar no Balcão</option>
                                    <option value="Entrega">Entrega (Motoboy)</option>
                                </select>
                            </div>
                        </div>

                        {formData.metodo_entrega === 'Entrega' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <div className={styles.rowInputs} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className={styles.inputGroup} style={{ flex: 3 }}>
                                        <label>Rua / Avenida *</label>
                                        <input
                                            type="text"
                                            name="logradouro"
                                            required
                                            value={formData.logradouro}
                                            onChange={handleChange}
                                            placeholder="Ex: Rua das Flores"
                                        />
                                    </div>
                                    <div className={styles.inputGroup} style={{ flex: 1, minWidth: '80px' }}>
                                        <label>Nº *</label>
                                        <input
                                            type="text"
                                            name="numero"
                                            required
                                            value={formData.numero}
                                            onChange={handleChange}
                                            placeholder="Ex: 123"
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Complemento (Opcional)</label>
                                    <input
                                        type="text"
                                        name="complemento"
                                        value={formData.complemento}
                                        onChange={handleChange}
                                        placeholder="Casa, Apto 45, Bloco B..."
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Método Pagamento *</label>
                            <select
                                name="metodo_pagamento_id"
                                value={formData.metodo_pagamento_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    {loadingMetodosPagamento ? 'Carregando opções...' : 'Selecione...'}
                                </option>
                                {metodosPagamento && metodosPagamento.map(metodo => (
                                    <option key={metodo.id} value={metodo.id}>
                                        {metodo.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 👇 BLOCO DO TROCO: APARECE SÓ SE FOR DINHEIRO */}
                        {isPagamentoDinheiro && (
                            <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e2e8f0' }}>
                                <div className={styles.inputGroup} style={{ marginBottom: formData.precisa_troco ? '15px' : '0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                        <input
                                            type="checkbox"
                                            name="precisa_troco"
                                            checked={formData.precisa_troco}
                                            onChange={handleChange}
                                            onWheel={(e) => e.target.blur()}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        Precisa de troco?
                                    </label>
                                </div>

                                {formData.precisa_troco && (
                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                        <label>Troco para quanto? *</label>
                                        <input
                                            type="number"
                                            name="troco_para"
                                            step="0.01"
                                            required={formData.precisa_troco}
                                            value={formData.troco_para}
                                            onChange={handleChange}
                                            placeholder={`Ex: ${Math.ceil(totalPedido + 10)}`}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Observações do Pedido (Geral)</label>
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                maxLength={60}
                                placeholder="Entregar na portaria, etc."
                                rows="2"
                            />
                        </div>
                    </div>

                    <div className={styles.colunaItens}>
                        <div className={styles.headerItens}>
                            <h3 className={styles.sectionTitle}><ShoppingBag size={18} /> Itens do Pedido</h3>

                            <div className={styles.acoesAdicionar}>
                                <button type="button" className={styles.btnAddItem} onClick={() => setModalAberto(true)}>
                                    <Plus size={15} />
                                    Marmita
                                </button>

                                <button
                                    type="button"
                                    className={styles.btnAddItem + ' ' + styles.btnAddEspecial}
                                    onClick={() => setModalEspecialAberto(true)}
                                >
                                    <Star size={15} />
                                    Especial
                                </button>
                            </div>
                        </div>

                        <div className={styles.listaItens}>
                            {formData.marmitas.length === 0 && formData.marmitas_especiais.length === 0 && formData.produtos.length === 0 ? (
                                <div className={styles.emptyCart}>
                                    <p>Nenhum item adicionado ainda.</p>
                                </div>
                            ) : (
                                <>
                                    {formData.marmitas.map((item, index) => (
                                        <div key={`marmita-${index}`} className={styles.itemCart}>
                                            <div className={styles.itemCartInfo}>
                                                <strong>{item.quantidade}x Marmita {item.tamanho_nome}</strong>
                                                <small>{item.alimentos.length} alimentos selecionados</small>
                                                {item.observacao && (
                                                    <span style={{ color: '#ea580c', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                                        Obs: {item.observacao}
                                                    </span>
                                                )}
                                                <span style={{ color: '#ea580c', fontWeight: '600', marginTop: '4px' }}>
                                                    R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                            <button type="button" className={styles.btnRemoveItem} onClick={() => removerMarmita(index)}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.marmitas_especiais.map(item => (
                                        <div key={'especial-' + item.marmita_especial_id} className={styles.itemCart}>
                                            <div className={styles.itemCartInfo}>
                                                <strong>{item.quantidade}x {item.nome}</strong>
                                                {item.descricao && (
                                                    <small className={styles.descricaoEspecialItem}>{item.descricao}</small>
                                                )}
                                                <span className={styles.precoEspecialItem}>
                                                    R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.btnRemoveItem}
                                                onClick={() => removerMarmitaEspecial(item.marmita_especial_id)}
                                                title="Remover marmita especial"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.produtos.map(produto => (
                                        <div key={`produto-${produto.produto_id}`} className={styles.itemCart}>
                                            <div className={styles.itemCartInfo}>
                                                <strong>{produto.quantidade}x {produto.nome}</strong>
                                                <small>{produto.categoria_nome}</small>
                                                <span style={{ color: '#ea580c', fontWeight: '600', marginTop: '4px' }}>
                                                    R$ {(produto.preco * produto.quantidade).toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                            <button type="button" className={styles.btnRemoveItem} onClick={() => removerProduto(produto.produto_id)}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>

                        {(formData.marmitas.length > 0 || formData.marmitas_especiais.length > 0 || formData.produtos.length > 0) && (
                            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #e4e4e7', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                                <strong>Total:</strong>
                                <strong style={{ color: '#ea580c' }}>R$ {totalPedido.toFixed(2).replace('.', ',')}</strong>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.footerAcoes}>
                    <button type="button" className={styles.btnCancelar} onClick={voltarParaLista}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.btnSalvar} disabled={enviando}>
                        {enviando ? "A registar..." : <><Save size={18} /> Confirmar Pedido</>}
                    </button>
                </div>
            </form>

            {modalAberto && (
                <ModalMontarMarmita
                    onClose={() => setModalAberto(false)}
                    onAdicionar={(novaMarmita, novosProdutos = []) => {
                        setFormData(prev => {
                            const produtos = prev.produtos.map(produto => ({ ...produto }));
                            novosProdutos.forEach(produto => {
                                const existente = produtos.find(item => item.produto_id === produto.produto_id);
                                if (existente) existente.quantidade += produto.quantidade;
                                else produtos.push(produto);
                            });
                            return { ...prev, marmitas: [...prev.marmitas, novaMarmita], produtos };
                        });
                        toast.success("Itens adicionados ao pedido!");
                        setModalAberto(false);
                    }}
                />
            )}

            {modalEspecialAberto && (
                <div
                    className={modalStyles.overlay}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharModalEspecial();
                    }}
                >
                    <div className={modalStyles.modal} role="dialog" aria-modal="true" aria-labelledby="titulo-modal-especial">
                        <div className={modalStyles.header}>
                            <h3 id="titulo-modal-especial">Adicionar Marmita Especial</h3>
                            <button type="button" onClick={fecharModalEspecial} className={modalStyles.btnFechar}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={modalStyles.body}>
                            {loadingMarmitasEspeciais ? (
                                <div className={modalStyles.loadingContainer}>
                                    <RefreshCw className={modalStyles.spin} size={24} />
                                    <p>Sincronizando marmitas especiais...</p>
                                </div>
                            ) : opcoesMarmitasEspeciais.length === 0 ? (
                                <p className={modalStyles.emptyCardapio}>Nenhuma marmita especial ativa no momento.</p>
                            ) : (
                                <>
                                    <div className={modalStyles.secao}>
                                        <h4>1. Escolha a Marmita Especial</h4>
                                        <select
                                            className={modalStyles.selectModal}
                                            value={marmitaEspecialSelecionadaId}
                                            onChange={(event) => setMarmitaEspecialSelecionadaId(event.target.value)}
                                        >
                                            <option value="" disabled>Selecione a marmita...</option>
                                            {opcoesMarmitasEspeciais.map((marmita) => (
                                                <option key={marmita.id} value={marmita.id}>
                                                    {marmita.nome} - R$ {Number(marmita.preco).toFixed(2).replace('.', ',')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={modalStyles.secao}>
                                        <h4>2. Detalhes</h4>

                                        {marmitaEspecialSelecionada ? (
                                            <div className={styles.previewEspecial}>
                                                <strong>{marmitaEspecialSelecionada.nome}</strong>
                                                {marmitaEspecialSelecionada.descricao && <p>{marmitaEspecialSelecionada.descricao}</p>}
                                                <span>R$ {Number(marmitaEspecialSelecionada.preco).toFixed(2).replace('.', ',')} cada</span>
                                            </div>
                                        ) : (
                                            <div className={styles.previewEspecialVazio}>
                                                Selecione uma marmita especial para visualizar os detalhes.
                                            </div>
                                        )}
                                    </div>

                                    <div className={modalStyles.secaoHorizontal}>
                                        <h4>3. Quantidade de Marmitas Iguais:</h4>

                                        <div className={modalStyles.contador}>
                                            <button
                                                type="button"
                                                onClick={() => setQuantidadeMarmitaEspecial(q => Math.max(1, q - 1))}
                                                disabled={quantidadeMarmitaEspecial <= 1}
                                            >
                                                <Minus size={15} />
                                            </button>

                                            <span>{quantidadeMarmitaEspecial}</span>

                                            <button
                                                type="button"
                                                onClick={() => setQuantidadeMarmitaEspecial(q => q + 1)}
                                            >
                                                <Plus size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={modalStyles.footer}>
                            <button
                                type="button"
                                onClick={fecharModalEspecial}
                                className={modalStyles.btnCancelar}
                                disabled={loadingMarmitasEspeciais}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={adicionarMarmitaEspecial}
                                className={modalStyles.btnConfirmar}
                                disabled={loadingMarmitasEspeciais || opcoesMarmitasEspeciais.length === 0 || !marmitaEspecialSelecionadaId}
                            >
                                Adicionar ao Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}