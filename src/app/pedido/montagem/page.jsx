// 'use client'

// import { useRouter } from "next/navigation"
// import Image from "next/image"
// import { useState, useEffect } from "react"

// import { useCardapioClient } from "@/hooks/useCardapioClient"
// import { usePedido } from "@/context/PedidoContext"
// import formatarNomeImagem from "@/utils/formatImages.js"
// import styles from './page.module.css'

// export default function Montagem() {
//     const router = useRouter();

//     // 🚀 Pegamos o alimentosAgrupados direto do hook (que já fez o reduce por nós)
//     const { alimentosAgrupados, loading: loadingCardapio } = useCardapioClient();

//     const { marmitaAtual, alternarAlimento, adicionarAoCarrinho } = usePedido();

//     const [quantidade, setQuantidade] = useState(1);
//     const [isFinalizando, setIsFinalizando] = useState(false);

//     useEffect(() => {
//         if (!marmitaAtual?.tamanho) {
//             router.replace('/pedido');
//         }
//     }, [marmitaAtual, router, isFinalizando]);

//     /**
//  * Depois de montar a marmita,
//  * enviamos o cliente para os produtos complementares.
//  */
//     const handleAdicionar = () => {

//         setIsFinalizando(
//             true
//         );


//         const sucesso =
//             adicionarAoCarrinho(
//                 quantidade
//             );


//         if (sucesso) {

//             router.push(
//                 '/pedido/complementos'
//             );

//         } else {

//             setIsFinalizando(
//                 false
//             );
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
//     const total = precoBase * quantidade;

//     // 🚀 Extraímos as chaves (nomes das categorias) do objeto que veio do hook
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
//                 {/* 🚀 Usamos a lista de nomes para renderizar */}
//                 {nomesCategorias.map((nomeCategoria) => {
//                     // Pega a lista de alimentos (itens) que pertencem a essa categoria
//                     const itensDaCategoria = alimentosAgrupados[nomeCategoria];

//                     // Pega o limite do primeiro item (se não existir, o fallback é 2)
//                     const limiteDaCategoria = itensDaCategoria[0]?.limite_escolhas || 2;

//                     // Conta quantos já foram marcados
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
//                                             // 🚀 Passamos a função passando o alimento e o limite exato
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

//             <div className={styles.barraFixa}>
//                 <div className={styles.conteudoBarra}>
//                     <div className={styles.controleQtd}>
//                         <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))}>-</button>
//                         <span>{quantidade}</span>
//                         <button onClick={() => setQuantidade(quantidade + 1)}>+</button>
//                     </div>
//                     <button className={styles.btnAdicionar} onClick={handleAdicionar}>
//                         Adicionar • R$ {total.toFixed(2).replace('.', ',')}
//                     </button>
//                 </div>
//             </div>
//         </main>
//     );
// }

'use client'

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ShoppingBag, X } from "lucide-react"

import { useCardapioClient } from "@/hooks/useCardapioClient"
import { usePedido } from "@/context/PedidoContext"
import formatarNomeImagem from "@/utils/formatImages.js"
import styles from './page.module.css'

export default function Montagem() {
    const router = useRouter();

    const { alimentosAgrupados, loading: loadingCardapio } = useCardapioClient();
    const { marmitaAtual, alternarAlimento, adicionarAoCarrinho } = usePedido();

    // Estado que controla se o Modal de Observação está aberto
    const [modalAberto, setModalAberto] = useState(false);
    const [quantidade, setQuantidade] = useState(1);
    const [observacao, setObservacao] = useState("");
    const [isFinalizando, setIsFinalizando] = useState(false);

    useEffect(() => {
        if (!marmitaAtual?.tamanho) {
            router.replace('/pedido');
        }
    }, [marmitaAtual, router, isFinalizando]);

    const handleAvançar = () => {
        // Verifica se selecionou pelo menos alguma coisa
        if (marmitaAtual?.itens?.length === 0) {
            alert("Selecione pelo menos um item para sua marmita.");
            return;
        }
        setModalAberto(true);
    };

    const handleConfirmarMarmita = () => {
        setIsFinalizando(true);

        const sucesso = adicionarAoCarrinho(quantidade, observacao);

        if (sucesso) {
            router.push('/pedido/complementos');
        } else {
            setIsFinalizando(false);
        }
    };

    function FotoAlimento({ nome }) {
        const nomeArquivo = formatarNomeImagem(nome);
        const [imgSrc, setImgSrc] = useState(`/alimentos/${nomeArquivo}.webp`);

        return (
            <div className={styles.containerFotoAlimento}>
                <Image
                    src={imgSrc}
                    alt={nome || "Foto do Alimento"}
                    fill
                    sizes="96px"
                    className={styles.fotoAlimento}
                    onError={() => setImgSrc('/alimentos/padrao.webp')}
                />
            </div>
        );
    }

    if (loadingCardapio) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
                <span style={{ color: '#EA580C', fontWeight: '600' }}>Preparando ingredientes...</span>
            </div>
        );
    }

    if (!marmitaAtual?.tamanho) return null;

    const precoBase = Number(marmitaAtual.tamanho.preco_base);
    const totalParcial = precoBase * quantidade;

    const nomesCategorias = Object.keys(alimentosAgrupados || {});

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button className={styles.btnVoltar} onClick={() => router.push('/pedido')}>
                    ← Trocar Tamanho
                </button>
                <h1>Marmita {marmitaAtual.tamanho.nome}</h1>
                <p>Preço base: R$ {precoBase.toFixed(2).replace('.', ',')}</p>
            </header>

            <section className={styles.areaMontagem}>
                {nomesCategorias.map((nomeCategoria) => {
                    const itensDaCategoria = alimentosAgrupados[nomeCategoria];
                    const limiteDaCategoria = itensDaCategoria[0]?.limite_escolhas || 2;
                    const qtdSelecionadaNestaCat = marmitaAtual.itens.filter(
                        i => i.categoria_nome === nomeCategoria
                    ).length;

                    return (
                        <div key={nomeCategoria} className={styles.blocoCategoria}>
                            <div className={styles.cabecalhoCategoria}>
                                <h2>{nomeCategoria}</h2>
                                <span className={styles.contadorLimite}>
                                    {qtdSelecionadaNestaCat} / {limiteDaCategoria} opções
                                </span>
                            </div>

                            <div className={styles.gridAlimentos}>
                                {itensDaCategoria.map((alimento) => {
                                    const isSelecionado = marmitaAtual.itens.some(i => i.id === alimento.id);

                                    return (
                                        <div
                                            key={alimento.id}
                                            className={`${styles.cardAlimento} ${isSelecionado ? styles.cardSelecionado : ''}`}
                                            onClick={() => alternarAlimento(alimento, limiteDaCategoria)}
                                        >
                                            <FotoAlimento nome={alimento.nome} />
                                            <span className={styles.nomeAlimento}>{alimento.nome}</span>
                                            {isSelecionado && <span className={styles.iconeCheck}>✓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* BARRA FIXA ABAIXO PARA AVANÇAR */}
            <div className={styles.barraFixa}>
                <div className={styles.conteudoBarra}>
                    <div style={{ width: '100%' }}>
                        <button className={styles.btnAdicionar} onClick={handleAvançar} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <ShoppingBag size={18} />
                            Avançar
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE RESUMO E OBSERVAÇÃO */}
            {modalAberto && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Quase lá!</h2>
                            <button className={styles.closeBtn} onClick={() => setModalAberto(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <p>Confirme os detalhes da sua marmita <strong>{marmitaAtual.tamanho.nome}</strong>:</p>
                            
                            <ul className={styles.listaResumo}>
                                {marmitaAtual.itens.map(item => (
                                    <li key={item.id}>• {item.nome}</li>
                                ))}
                            </ul>

                            <div className={styles.inputGroup}>
                                <label htmlFor="obs">Alguma observação? (Opcional)</label>
                                <textarea 
                                    id="obs"
                                    placeholder="Ex: Tirar a cebola, arroz por baixo, etc."
                                    value={observacao}
                                    onChange={(e) => setObservacao(e.target.value)}
                                    rows={3}
                                    className={styles.textareaObs}
                                />
                            </div>

                            <div className={styles.controleQtdWrapper}>
                                <span>Quantas dessas você quer?</span>
                                <div className={styles.controleQtd}>
                                    <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))}>-</button>
                                    <span>{quantidade}</span>
                                    <button onClick={() => setQuantidade(quantidade + 1)}>+</button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.btnFinalizar} onClick={handleConfirmarMarmita}>
                                Adicionar ao Carrinho • R$ {totalParcial.toFixed(2).replace('.', ',')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}