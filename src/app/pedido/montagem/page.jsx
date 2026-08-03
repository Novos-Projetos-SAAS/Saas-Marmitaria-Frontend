'use client'

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"

import { useCardapioClient } from "@/hooks/useCardapioClient"
import { usePedido } from "@/context/PedidoContext"
import formatarNomeImagem from "@/utils/formatImages.js"
import styles from './page.module.css'

export default function Montagem() {
    const router = useRouter();

    // 🚀 Pegamos o alimentosAgrupados direto do hook (que já fez o reduce por nós)
    const { alimentosAgrupados, loading: loadingCardapio } = useCardapioClient();

    const { marmitaAtual, alternarAlimento, adicionarAoCarrinho } = usePedido();

    const [quantidade, setQuantidade] = useState(1);
    const [isFinalizando, setIsFinalizando] = useState(false);

    useEffect(() => {
        if (!marmitaAtual?.tamanho) {
            router.replace('/pedido');
        }
    }, [marmitaAtual, router, isFinalizando]);

    /**
 * Depois de montar a marmita,
 * enviamos o cliente para os produtos complementares.
 */
    const handleAdicionar = () => {

        setIsFinalizando(
            true
        );


        const sucesso =
            adicionarAoCarrinho(
                quantidade
            );


        if (sucesso) {

            router.push(
                '/pedido/complementos'
            );

        } else {

            setIsFinalizando(
                false
            );
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
    const total = precoBase * quantidade;

    // 🚀 Extraímos as chaves (nomes das categorias) do objeto que veio do hook
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
                {/* 🚀 Usamos a lista de nomes para renderizar */}
                {nomesCategorias.map((nomeCategoria) => {
                    // Pega a lista de alimentos (itens) que pertencem a essa categoria
                    const itensDaCategoria = alimentosAgrupados[nomeCategoria];

                    // Pega o limite do primeiro item (se não existir, o fallback é 2)
                    const limiteDaCategoria = itensDaCategoria[0]?.limite_escolhas || 2;

                    // Conta quantos já foram marcados
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
                                            // 🚀 Passamos a função passando o alimento e o limite exato
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

            <div className={styles.barraFixa}>
                <div className={styles.conteudoBarra}>
                    <div className={styles.controleQtd}>
                        <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))}>-</button>
                        <span>{quantidade}</span>
                        <button onClick={() => setQuantidade(quantidade + 1)}>+</button>
                    </div>
                    <button className={styles.btnAdicionar} onClick={handleAdicionar}>
                        Adicionar • R$ {total.toFixed(2).replace('.', ',')}
                    </button>
                </div>
            </div>
        </main>
    );
}