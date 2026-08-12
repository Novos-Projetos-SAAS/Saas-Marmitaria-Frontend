'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    BookOpen,
    ClipboardList,
    MapPin,
    MessageCircle,
    Send,
    ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useLoja } from '@/hooks/useLoja';
import { useDadosEmpresaPublicos } from '@/hooks/useDadosEmpresaPublicos.js';
import { usePedido } from '@/context/PedidoContext.js';

import styles from './page.module.css';


export default function Home() {
    const router = useRouter();
    const { statusLoja, loading } = useLoja();
    const { carrinho, totalGeral, quantidadeTotalItens } = usePedido();
    const { dados, loadingDados } = useDadosEmpresaPublicos();

    const NOME_LOJA = dados?.nome_fantasia || 'Marmitaria';
    const WHATSAPP_LOJA = dados?.whatsapp || '';

    const enderecoCompleto = () => {
        if (!dados?.cep || !dados?.logradouro || !dados?.numero) {
            return null;
        }

        return `${dados.logradouro}, ${dados.numero}`;
    };

    

    const enderecoFormatado = enderecoCompleto();

    const abrirCardapio = () => {
        if (loading) return;

        if (!statusLoja) {
            toast.error(
                'Estamos fechados no momento. Volte em nosso horário de atendimento.'
            );
            return;
        }

        router.push('/pedido');
    };

    const abrirWhatsApp = () => {
        if (!WHATSAPP_LOJA) {
            toast.error('WhatsApp da empresa não configurado.');
            return;
        }

        const numeroWhatsApp = String(WHATSAPP_LOJA).replace(/\D/g, '');

        window.open(
            `https://wa.me/${numeroWhatsApp}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const compartilhar = async () => {
        const dadosCompartilhamento = {
            title: NOME_LOJA,
            text: `Confira o cardápio da ${NOME_LOJA}!`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(dadosCompartilhamento);
            } catch {
                return;
            }

            return;
        }

        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copiado!');
        } catch {
            toast.error('Não foi possível compartilhar o link.');
        }
    };

    return (
        <main className={styles.mainContainer}>
            <div className={styles.appCard}>
                <section className={styles.capa}>
                    <Image
                        src="/capa.png"
                        alt="Capa da marmitaria"
                        fill
                        priority
                        className={styles.capaImagem}
                        sizes="(max-width: 460px) 100vw, 460px"
                    />
                </section>

                <section className={styles.infoLoja}>
                    <div className={styles.logoWrap}>
                        <Image
                            src="/logo.png"
                            alt={NOME_LOJA}
                            fill
                            className={styles.logoImagem}
                            sizes="96px"
                        />
                    </div>

                    <div className={styles.dadosLoja}>
                        <h1>
                            {loadingDados ? 'Carregando...' : NOME_LOJA}
                        </h1>

                        {dados?.endereco && (
                            <p className={styles.endereco}>
                                <MapPin size={16} />

                                <span>
                                    {dados.endereco}
                                </span>
                            </p>
                        )}

                        {enderecoFormatado && (
                            <p className={styles.endereco}>
                                <MapPin size={16} />
                                <span>{enderecoFormatado}</span>
                            </p>
                        )}

                        <span
                            className={`${styles.status} ${statusLoja
                                ? styles.aberto
                                : styles.fechado
                                }`}
                        >
                            {loading
                                ? 'Verificando horário...'
                                : statusLoja
                                    ? 'Aberto'
                                    : 'Fechado'}
                        </span>


                    </div>
                </section>

                <section className={styles.actions}>
                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={abrirCardapio}
                        disabled={loading}
                    >
                        <BookOpen size={20} />
                        Ver cardápio
                    </button>

                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={abrirWhatsApp}
                    >
                        <MessageCircle size={20} />
                        WhatsApp
                    </button>

                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => router.push('/acompanhar')}
                    >
                        <ClipboardList size={19} />
                        Acompanhar pedido
                    </button>



                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={compartilhar}
                    >
                        <Send size={19} />
                        Compartilhar
                    </button>
                </section>

                {carrinho.length > 0 && (
                    <div className={styles.carrinhoFlutuante}>
                        <button
                            type="button"
                            onClick={() => router.push('/carrinho')}
                        >
                            <span className={styles.carrinhoInfo}>
                                <ShoppingBag size={18} />

                                <span>
                                    {quantidadeTotalItens}{' '}
                                    {quantidadeTotalItens === 1
                                        ? 'item'
                                        : 'itens'}
                                </span>
                            </span>

                            <strong>
                                R$ {Number(totalGeral || 0)
                                    .toFixed(2)
                                    .replace('.', ',')}
                            </strong>
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}