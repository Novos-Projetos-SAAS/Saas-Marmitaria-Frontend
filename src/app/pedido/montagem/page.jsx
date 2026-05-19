'use client'

import { useRouter } from "next/navigation"
import Image from "next/image"

import { useState, useEffect } from "react"

import { useCardapio } from "@/hooks/useCardapio.js"

import { usePedido } from "@/context/PedidoContext"

import formatarNomeImagem from "@/utils/formatImages.js"

import styles from './page.module.css'

export default function Montagem() {

    const router = useRouter();

    const { alimentos, loading: loadingCardapio } = useCardapio();

    const { marmitaAtual, alternarAlimento, adicionarAoCarrinho } = usePedido();

    const [quantidade, setQuantidade] = useState(1);
    const [isFinalizando, setIsFinalizando] = useState(false)

    // Proteção de rota: se não tiver tamanho selecinado, retorna para a tela de pedido para selecionar o tamanho
    useEffect(() => {
        if (!marmitaAtual?.tamanho) {
            router.replace('/pedido');
        }
    }, [marmitaAtual, router, isFinalizando]);


    // Agrupamento por Categoria
    const categoriasAgrupadas = alimentos.reduce((acc, alimento) => {
        // se a api não mandar o nome da categoria, cai num fallback
        const nomeCat = alimento.categoria_nome || 'Opções';

        if (!acc[nomeCat]) {
            acc[nomeCat] = {
                nome: nomeCat,
                // Aqui pega o limite por categoria vindo do banco (se não retornar do banco, assume valor 2)
                limite: alimento.limite_escolhas || 2,
                itens: []
            }
        }

        acc[nomeCat].itens.push(alimento)
        return acc;

    }, {})


    const handleAdicionar = () => {

        setIsFinalizando(true)

        const sucesso = adicionarAoCarrinho(quantidade);

        if (sucesso) {
            // se adicionou com sucesso, manda o usuário para a home
            router.push('/pedido')
        } else {
            setIsFinalizando(false)
        }

    }
    function FotoAlimento({ nome }) {
        const nomeArquivo = formatarNomeImagem(nome);
        // Tenta carregar em .webp por performance, se preferir png mude a extensão abaixo
        const [imgSrc, setImgSrc] = useState(`/alimentos/${nomeArquivo}.webp`);

        return (
            <div className={styles.containerFotoAlimento}>
                <Image
                    src={imgSrc}
                    alt={nome}
                    fill
                    sizes="96px"
                    className={styles.fotoAlimento}
                    // Se a imagem não existir na public/alimentos, assume o fallback sem quebrar a tela
                    onError={() => setImgSrc('/alimentos/padrao.webp')}
                />
            </div>
        );
    }


    // Trava de loading visual
    if (loadingCardapio) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' }}>
                <span style={{ color: '#EA580C', fontWeight: '600' }}>Preparando ingredientes...</span>
            </div>
        )
    }


    // Trava anti-tela-branca
    if (!marmitaAtual?.tamanho) return null;


    // Cálculos de preço em tempo real
    const precoBase = Number(marmitaAtual.tamanho.preco_base);
    const total = precoBase * quantidade;


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
                {Object.values(categoriasAgrupadas).map((categoria) => {

                    // Conta quantos itens desta categoria já estão no objeto marmitaAtual.itens
                    const qtdSelecionadaNestaCat = marmitaAtual.itens.filter(
                        i => i.categoria_nome === categoria.nome
                    ).length;

                    return (
                        <div key={categoria.nome} className={styles.blocoCategoria}>
                            <div className={styles.cabecalhoCategoria}>
                                <h2>{categoria.nome}</h2>
                                <span className={styles.contadorLimite}>
                                    {qtdSelecionadaNestaCat} / {categoria.limite} opções
                                </span>
                            </div>

                            <div className={styles.gridAlimentos}>
                                {categoria.itens.map((alimento) => {
                                    // Verifica se ESTE alimento específico já foi clicado
                                    const isSelecionado = marmitaAtual.itens.some(i => i.id === alimento.id);

                                    return (
                                        <div
                                            key={alimento.id}
                                            // Se estiver selecionado, aplica a classe que acende a borda laranja
                                            className={`${styles.cardAlimento} ${isSelecionado ? styles.cardSelecionado : ''}`}
                                            onClick={() => alternarAlimento(alimento, categoria.limite)}
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

            {/* BARRA FIXA INFERIOR */}
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