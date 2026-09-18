'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useCardapioClient } from '@/hooks/useCardapioClient.js';
import { useLoja } from '@/hooks/useLoja.js';
import { usePedido } from '@/context/PedidoContext.js';

import styles from './page.module.css';

export default function Pedido() {
    const router = useRouter();
    const { statusLoja, loading: loadingLoja } = useLoja();
    const { tamanhos, marmitasEspeciais, loading: loadingCardapio } = useCardapioClient();
    const { iniciarNovaMarmita, carrinho, totalGeral, quantidadeTotalItens, validarLojaParaAcao } = usePedido();

    useEffect(() => {
        if (!loadingLoja && statusLoja === false) {
            router.replace('/');
        }
    }, [statusLoja, loadingLoja, router]);

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
                            <span className={styles.badgeEspecial}>Especial</span>
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

                                <div className={styles.seloPronta}>
                                    Pronta
                                </div>
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
