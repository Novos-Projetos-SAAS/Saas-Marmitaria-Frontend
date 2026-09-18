'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useCardapioClient } from '@/hooks/useCardapioClient.js';
import { useLoja } from '@/hooks/useLoja.js';
import { usePedido } from '@/context/PedidoContext.js';

import styles from './page.module.css';

export default function Pedido() {
    const router = useRouter();
    const [marmitaEspecialSelecionada, setMarmitaEspecialSelecionada] = useState(null);
    const [quantidadeEspecial, setQuantidadeEspecial] = useState(1);
    const { statusLoja, loading: loadingLoja } = useLoja();
    const { tamanhos, marmitasEspeciais, loading: loadingCardapio } = useCardapioClient();
    const { iniciarNovaMarmita, carrinho, totalGeral, quantidadeTotalItens, validarLojaParaAcao } = usePedido();

    useEffect(() => {
        if (!loadingLoja && statusLoja === false) {
            router.replace('/');
        }
    }, [statusLoja, loadingLoja, router]);

    useEffect(() => {
        if (!marmitaEspecialSelecionada) return;

        const body = document.body;
        const overflowAnterior = body.style.overflow;

        body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setMarmitaEspecialSelecionada(null);
                setQuantidadeEspecial(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            body.style.overflow = overflowAnterior;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [marmitaEspecialSelecionada]);

    const abrirMarmitaEspecial = (marmita) => {
        setMarmitaEspecialSelecionada(marmita);
        setQuantidadeEspecial(1);
    };

    const fecharMarmitaEspecial = () => {
        setMarmitaEspecialSelecionada(null);
        setQuantidadeEspecial(1);
    };

    const diminuirQuantidadeEspecial = () => {
        setQuantidadeEspecial((quantidadeAtual) => Math.max(1, quantidadeAtual - 1));
    };

    const aumentarQuantidadeEspecial = () => {
        setQuantidadeEspecial((quantidadeAtual) => Math.min(99, quantidadeAtual + 1));
    };

    const selecionarTamanho = async (tamanho) => {
        const lojaValida = await validarLojaParaAcao();
        if (!lojaValida) {
            router.replace('/');
            return;
        }

        const iniciou = iniciarNovaMarmita(tamanho);
        if (iniciou) router.push('/pedido/montagem');
    };

    const avancarCarrinho = async () => {
        const lojaValida = await validarLojaParaAcao();
        if (!lojaValida) {
            router.replace('/');
            return;
        }

        router.push('/pedido/complementos');
    };

    if (loadingLoja || loadingCardapio) {
        return <div className={styles.containerCentral}>Sincronizando com a cozinha...</div>;
    }

    if (statusLoja !== true) {
        return null;
    }

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <button className={styles.btnVoltar} onClick={() => router.push('/')}>
                    ← Voltar
                </button>
                <h1>Escolha sua marmita</h1>
                <p>Veja as opções especiais ou monte do seu jeito</p>
            </header>

            {marmitasEspeciais.length > 0 && (
                <section className={styles.secaoEspeciais}>
                    <div className={styles.tituloSecao}>
                        <div>
                            <h2>Marmitas Especiais</h2>
                        </div>
                        <p>Opções prontas da casa</p>
                    </div>

                    <div className={styles.listaEspeciais}>
                        {marmitasEspeciais.map((marmita) => (
                            <article key={marmita.id} className={styles.cardEspecial}>
                                <div className={styles.infoEspecial}>
                                    <h3>{marmita.nome}</h3>

                                    {marmita.descricao && (
                                        <p>{marmita.descricao}</p>
                                    )}

                                    <span className={styles.precoEspecial}>
                                        R$ {Number(marmita.preco).toFixed(2).replace('.', ',')}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className={styles.btnAdicionarEspecial}
                                    aria-label={`Adicionar ${marmita.nome}`}
                                    title="Ver detalhes"
                                    onClick={() => abrirMarmitaEspecial(marmita)}
                                >
                                    +
                                </button>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <section className={styles.secaoTamanhos}>
                <div className={styles.tituloSecao}>
                    <div>
                        <h2>Monte sua Marmita</h2>
                    </div>
                    <p>Escolha o tamanho para começar</p>
                </div>

                <div className={styles.listaTamanhos}>
                    {tamanhos.map((tamanho) => (
                        <div key={tamanho.id} className={styles.cardTamanho} onClick={() => selecionarTamanho(tamanho)}>
                            <div className={styles.infoTamanho}>
                                <h2>Marmita {tamanho.nome}</h2>
                                <span className={styles.preco}>A partir de R$ {Number(tamanho.preco_base).toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className={styles.iconeSeta}>➔</div>
                        </div>
                    ))}
                </div>
            </section>

            {marmitaEspecialSelecionada && (
                <div
                    className={styles.modalOverlay}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            fecharMarmitaEspecial();
                        }
                    }}
                >
                    <div
                        className={styles.modalEspecial}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-marmita-especial"
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalLabel}>Marmita Especial</span>
                                <h2 id="titulo-marmita-especial">
                                    {marmitaEspecialSelecionada.nome}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className={styles.btnFecharModal}
                                onClick={fecharMarmitaEspecial}
                                aria-label="Fechar"
                                title="Fechar"
                            >
                                ×
                            </button>
                        </div>

                        {marmitaEspecialSelecionada.descricao && (
                            <p className={styles.modalDescricao}>
                                {marmitaEspecialSelecionada.descricao}
                            </p>
                        )}

                        <div className={styles.modalPreco}>
                            <span>Valor unitário</span>
                            <strong>
                                R$ {Number(marmitaEspecialSelecionada.preco).toFixed(2).replace('.', ',')}
                            </strong>
                        </div>

                        <div className={styles.quantidadeArea}>
                            <div>
                                <strong>Quantidade</strong>
                                <span>Escolha quantas deseja adicionar</span>
                            </div>

                            <div className={styles.controleQuantidade}>
                                <button
                                    type="button"
                                    onClick={diminuirQuantidadeEspecial}
                                    disabled={quantidadeEspecial <= 1}
                                    aria-label="Diminuir quantidade"
                                >
                                    −
                                </button>

                                <span>{quantidadeEspecial}</span>

                                <button
                                    type="button"
                                    onClick={aumentarQuantidadeEspecial}
                                    disabled={quantidadeEspecial >= 99}
                                    aria-label="Aumentar quantidade"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className={styles.modalTotal}>
                            <span>Total</span>
                            <strong>
                                R$ {(Number(marmitaEspecialSelecionada.preco) * quantidadeEspecial).toFixed(2).replace('.', ',')}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className={styles.btnAdicionarModal}
                            disabled
                            title="A integração com o carrinho será implementada na próxima etapa"
                        >
                            Adicionar ao pedido
                        </button>
                    </div>
                </div>
            )}

            {carrinho.length > 0 && (
                <div className={styles.barraCarrinho}>
                    <button className={styles.btnCarrinho} onClick={avancarCarrinho}>
                        <div className={styles.infoCarrinho}>
                            <span className={styles.qtdBadge}>{quantidadeTotalItens}</span>
                            <span>Avançar</span>
                        </div>
                        <span className={styles.totalCarrinho}>R$ {totalGeral.toFixed(2).replace('.', ',')}</span>
                    </button>
                </div>
            )}
        </main>
    );
}
