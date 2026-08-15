// 'use client'

// import { useRouter } from "next/navigation"
// import Image from "next/image"
// import { useState, useEffect } from "react"
// import { ShoppingBag, X } from "lucide-react"

// import { useCardapioClient } from "@/hooks/useCardapioClient"
// import { usePedido } from "@/context/PedidoContext"
// import formatarNomeImagem from "@/utils/formatImages.js"
// import styles from './page.module.css'
// import toast from "react-hot-toast"

// export default function Montagem() {
//     const router = useRouter();

//     const { alimentosAgrupados, loading: loadingCardapio } = useCardapioClient();
//     const { marmitaAtual, alternarAlimento, adicionarAoCarrinho } = usePedido();

//     // Estado que controla se o Modal de Observação está aberto
//     const [modalAberto, setModalAberto] = useState(false);
//     const [quantidade, setQuantidade] = useState(1);
//     const [observacao, setObservacao] = useState("");
//     const [isFinalizando, setIsFinalizando] = useState(false);

//     useEffect(() => {
//         if (!marmitaAtual?.tamanho) {
//             router.replace('/pedido');
//         }
//     }, [marmitaAtual, router, isFinalizando]);

//     const handleAvançar = () => {
//         // Verifica se selecionou pelo menos alguma coisa
//         if (marmitaAtual?.itens?.length === 0) {
//             // alert("Selecione pelo menos um item para sua marmita.");
//             toast.error("Selecione pelo menos um item para sua marmita.");
//             return;
//         }
//         setModalAberto(true);
//     };

//     const handleConfirmarMarmita = () => {
//         setIsFinalizando(true);

//         const sucesso = adicionarAoCarrinho(quantidade, observacao);

//         if (sucesso) {
//             router.push('/pedido/complementos');
//         } else {
//             setIsFinalizando(false);
//         }
//     };

//     function FotoAlimento({ nome }) {
//         const nomeArquivo = formatarNomeImagem(nome);
//         const [imgSrc, setImgSrc] = useState(`/alimentos/${nomeArquivo}.webp`);

//         return (
//             <div className={styles.containerFotoAlimento}>
//                 <Image
//                     src={imgSrc}
//                     alt={nome || "Foto do Alimento"}
//                     fill
//                     sizes="96px"
//                     className={styles.fotoAlimento}
//                     onError={() => setImgSrc('/alimentos/padrao.webp')}
//                 />
//             </div>
//         );
//     }

//     if (loadingCardapio) {
//         return (
//             <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
//                 <span style={{ color: '#EA580C', fontWeight: '600' }}>Preparando ingredientes...</span>
//             </div>
//         );
//     }

//     if (!marmitaAtual?.tamanho) return null;

//     const precoBase = Number(marmitaAtual.tamanho.preco_base);
//     const totalParcial = precoBase * quantidade;

//     const nomesCategorias = Object.keys(alimentosAgrupados || {});

//     return (
//         <main className={styles.container}>
//             <header className={styles.header}>
//                 <button className={styles.btnVoltar} onClick={() => router.push('/pedido')}>
//                     ← Trocar Tamanho
//                 </button>
//                 <h1>Marmita {marmitaAtual.tamanho.nome}</h1>
//                 <p>Preço base: R$ {precoBase.toFixed(2).replace('.', ',')}</p>
//             </header>

//             <section className={styles.areaMontagem}>
//                 {nomesCategorias.map((nomeCategoria) => {
//                     const itensDaCategoria = alimentosAgrupados[nomeCategoria];
//                     const limiteDaCategoria = itensDaCategoria[0]?.limite_escolhas || 2;
//                     const qtdSelecionadaNestaCat = marmitaAtual.itens.filter(
//                         i => i.categoria_nome === nomeCategoria
//                     ).length;

//                     return (
//                         <div key={nomeCategoria} className={styles.blocoCategoria}>
//                             <div className={styles.cabecalhoCategoria}>
//                                 <h2>{nomeCategoria}</h2>
//                                 <span className={styles.contadorLimite}>
//                                     {qtdSelecionadaNestaCat} / {limiteDaCategoria} opções
//                                 </span>
//                             </div>

//                             <div className={styles.gridAlimentos}>
//                                 {itensDaCategoria.map((alimento) => {
//                                     const isSelecionado = marmitaAtual.itens.some(i => i.id === alimento.id);

//                                     return (
//                                         <div
//                                             key={alimento.id}
//                                             className={`${styles.cardAlimento} ${isSelecionado ? styles.cardSelecionado : ''}`}
//                                             onClick={() => alternarAlimento(alimento, limiteDaCategoria)}
//                                         >
//                                             <FotoAlimento nome={alimento.nome} />
//                                             <span className={styles.nomeAlimento}>{alimento.nome}</span>
//                                             {isSelecionado && <span className={styles.iconeCheck}>✓</span>}
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     );
//                 })}
//             </section>

//             {/* BARRA FIXA ABAIXO PARA AVANÇAR */}
//             <div className={styles.barraFixa}>
//                 <div className={styles.conteudoBarra}>
//                     <div style={{ width: '100%' }}>
//                         <button className={styles.btnAdicionar} onClick={handleAvançar} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
//                             <ShoppingBag size={18} />
//                             Avançar
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* MODAL DE RESUMO E OBSERVAÇÃO */}
//             {modalAberto && (
//                 <div className={styles.modalOverlay}>
//                     <div className={styles.modalContent}>
//                         <div className={styles.modalHeader}>
//                             <h2>Quase lá!</h2>
//                             <button className={styles.closeBtn} onClick={() => setModalAberto(false)}>
//                                 <X size={20} />
//                             </button>
//                         </div>
                        
//                         <div className={styles.modalBody}>
//                             <p>Confirme os detalhes da sua marmita <strong>{marmitaAtual.tamanho.nome}</strong>:</p>
                            
//                             <ul className={styles.listaResumo}>
//                                 {marmitaAtual.itens.map(item => (
//                                     <li key={item.id}>• {item.nome}</li>
//                                 ))}
//                             </ul>

//                             <div className={styles.inputGroup}>
//                                 <label htmlFor="obs">Alguma observação? (Opcional)</label>
//                                 <textarea 
//                                     id="obs"
//                                     placeholder="Ex: Tirar a cebola, arroz por baixo, etc."
//                                     value={observacao}
//                                     onChange={(e) => setObservacao(e.target.value)}
//                                     rows={3}
//                                     maxLength={60}
//                                     className={styles.textareaObs}
//                                 />
//                             </div>

//                             <div className={styles.controleQtdWrapper}>
//                                 <span>Quantas dessas você quer?</span>
//                                 <div className={styles.controleQtd}>
//                                     <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))}>-</button>
//                                     <span>{quantidade}</span>
//                                     <button onClick={() => setQuantidade(quantidade + 1)}>+</button>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className={styles.modalFooter}>
//                             <button className={styles.btnFinalizar} onClick={handleConfirmarMarmita}>
//                                 Adicionar ao Carrinho • R$ {totalParcial.toFixed(2).replace('.', ',')}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </main>
//     );
// }

'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCardapioClient } from '@/hooks/useCardapioClient.js';
import { usePedido } from '@/context/PedidoContext.js';
import formatarNomeImagem from '@/utils/formatImages.js';

import styles from './page.module.css';

export default function Montagem() {
    const router = useRouter();
    const { alimentosAgrupados, loading: loadingCardapio } = useCardapioClient();
    const { marmitaAtual, alternarAlimento, adicionarAoCarrinho, lojaAbertaPedido, validarLojaParaAcao } = usePedido();

    const [modalAberto, setModalAberto] = useState(false);
    const [quantidade, setQuantidade] = useState(1);
    const [observacao, setObservacao] = useState('');
    const [isFinalizando, setIsFinalizando] = useState(false);

    useEffect(() => {
        if (lojaAbertaPedido === false) {
            setModalAberto(false);
            router.replace('/');
            return;
        }

        if (!marmitaAtual?.tamanho) {
            router.replace('/pedido');
        }
    }, [lojaAbertaPedido, marmitaAtual, router]);

    const handleAvancar = async () => {
        if (!marmitaAtual?.itens?.length) {
            toast.error('Selecione pelo menos um item para sua marmita.');
            return;
        }

        const lojaValida = await validarLojaParaAcao();
        if (!lojaValida) {
            router.replace('/');
            return;
        }

        setModalAberto(true);
    };

    const handleConfirmarMarmita = async () => {
        if (isFinalizando) return;

        setIsFinalizando(true);

        const lojaValida = await validarLojaParaAcao();
        if (!lojaValida) {
            setModalAberto(false);
            setIsFinalizando(false);
            router.replace('/');
            return;
        }

        const sucesso = adicionarAoCarrinho(quantidade, observacao.trim());

        if (sucesso) {
            router.push('/pedido/complementos');
            return;
        }

        setIsFinalizando(false);
    };

    function FotoAlimento({ nome }) {
        const nomeArquivo = formatarNomeImagem(nome);
        const [imgSrc, setImgSrc] = useState(`/alimentos/${nomeArquivo}.webp`);

        return (
            <div className={styles.containerFotoAlimento}>
                <Image src={imgSrc} alt={nome || 'Foto do alimento'} fill sizes="72px" className={styles.fotoAlimento} onError={() => setImgSrc('/alimentos/padrao.webp')} />
            </div>
        );
    }

    if (loadingCardapio) {
        return (
            <div className={styles.loadingPage}>
                <div className={styles.loadingSpinner} />
                <span>Preparando ingredientes...</span>
            </div>
        );
    }

    if (!marmitaAtual?.tamanho || lojaAbertaPedido !== true) {
        return null;
    }

    const precoBase = Number(marmitaAtual.tamanho.preco_base);
    const totalParcial = precoBase * quantidade;
    const nomesCategorias = Object.keys(alimentosAgrupados || {});

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button type="button" className={styles.btnVoltar} onClick={() => router.push('/pedido')}>
                    <ArrowLeft size={17} />
                    Trocar tamanho
                </button>

                <div className={styles.headerTitulo}>
                    <div>
                        <span className={styles.headerLegenda}>Monte do seu jeito</span>
                        <h1>Marmita {marmitaAtual.tamanho.nome}</h1>
                    </div>
                    <div className={styles.precoHeader}>R$ {precoBase.toFixed(2).replace('.', ',')}</div>
                </div>
            </header>

            <section className={styles.areaMontagem}>
                {nomesCategorias.map((nomeCategoria) => {
                    const itensDaCategoria = alimentosAgrupados[nomeCategoria];
                    const limiteDaCategoria = itensDaCategoria[0]?.limite_escolhas || 2;
                    const qtdSelecionadaNestaCat = marmitaAtual.itens.filter((item) => item.categoria_nome === nomeCategoria).length;
                    const limiteAtingido = qtdSelecionadaNestaCat >= limiteDaCategoria;

                    return (
                        <div key={nomeCategoria} className={styles.blocoCategoria}>
                            <div className={styles.cabecalhoCategoria}>
                                <div>
                                    <h2>{nomeCategoria}</h2>
                                    <p>Escolha até {limiteDaCategoria} {limiteDaCategoria === 1 ? 'opção' : 'opções'}</p>
                                </div>
                                <span className={`${styles.contadorLimite} ${limiteAtingido ? styles.contadorCompleto : ''}`}>{qtdSelecionadaNestaCat}/{limiteDaCategoria}</span>
                            </div>

                            <div className={styles.gridAlimentos}>
                                {itensDaCategoria.map((alimento) => {
                                    const isSelecionado = marmitaAtual.itens.some((item) => item.id === alimento.id);

                                    return (
                                        <button type="button" key={alimento.id} className={`${styles.cardAlimento} ${isSelecionado ? styles.cardSelecionado : ''}`} onClick={() => alternarAlimento(alimento, limiteDaCategoria)}>
                                            <FotoAlimento nome={alimento.nome} />
                                            <span className={styles.nomeAlimento}>{alimento.nome}</span>
                                            <span className={`${styles.checkAlimento} ${isSelecionado ? styles.checkSelecionado : ''}`}>
                                                {isSelecionado && <Check size={16} strokeWidth={3} />}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </section>

            <div className={styles.barraFixa}>
                <div className={styles.conteudoBarra}>
                    <button type="button" className={styles.btnAdicionar} onClick={handleAvancar}>
                        <ShoppingBag size={18} />
                        Avançar
                    </button>
                </div>
            </div>

            {modalAberto && (
                <div className={styles.modalOverlay} onMouseDown={(event) => { if (event.target === event.currentTarget) setModalAberto(false); }}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHandle} />

                        <div className={styles.modalHeader}>
                            <div><h2>Quase lá!</h2></div>
                            <button type="button" className={styles.closeBtn} onClick={() => setModalAberto(false)}>
                                <X size={19} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p className={styles.descricaoModal}>Confira sua marmita <strong>{marmitaAtual.tamanho.nome}</strong>.</p>

                            <div className={styles.resumoMarmita}>
                                <div className={styles.resumoTitulo}>
                                    <span>Itens escolhidos</span>
                                    <strong>{marmitaAtual.itens.length}</strong>
                                </div>
                                <ul className={styles.listaResumo}>
                                    {marmitaAtual.itens.map((item) => (
                                        <li key={item.id}>
                                            <span className={styles.bolinhaResumo} />
                                            {item.nome}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.inputGroup}>
                                <div className={styles.labelObservacao}>
                                    <label htmlFor="obs">Alguma observação?</label>
                                    <span>{observacao.length}/60</span>
                                </div>
                                <textarea id="obs" placeholder="Ex: Tirar a cebola, arroz por baixo..." value={observacao} onChange={(event) => setObservacao(event.target.value)} rows={3} maxLength={60} className={styles.textareaObs} />
                            </div>

                            <div className={styles.controleQtdWrapper}>
                                <div>
                                    <strong>Quantidade</strong>
                                    <span>Quantas marmitas iguais?</span>
                                </div>
                                <div className={styles.controleQtd}>
                                    <button type="button" onClick={() => setQuantidade(Math.max(1, quantidade - 1))} disabled={quantidade <= 1}>−</button>
                                    <span>{quantidade}</span>
                                    <button type="button" onClick={() => setQuantidade(quantidade + 1)}>+</button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnFinalizar} onClick={handleConfirmarMarmita} disabled={isFinalizando || lojaAbertaPedido !== true}>
                                <span>{isFinalizando ? 'Adicionando...' : 'Adicionar ao carrinho'}</span>
                                <strong>R$ {totalParcial.toFixed(2).replace('.', ',')}</strong>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
