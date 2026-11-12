'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Clock, ChefHat, Bike, Store, CheckCircle2, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import { useDetalhesPedido } from '@/hooks/usePedidos';
import { listarPedidoPorTelefoneUsuario } from '@/services/pedidosService.js';
import { providerUrl } from '@/services/infinitepayService';
import { catalogImage, kitchenProgress, money, orderDate, paymentLabels } from '@/utils/customerOrderDisplay';
import styles from './page.module.css';

function OrderItem({ item, product = false }) {
    const [failed, setFailed] = useState(false);
    const image = catalogImage(item.imagem_url);
    const name = product ? item.nome || 'Produto' : item.tipo === 'ESPECIAL' ? item.nome || 'Marmita especial'
        : `Marmita personalizada${item.tamanho ? ` · ${item.tamanho}` : ''}`;

    return <li className={styles.item}>
        <div className={styles.thumbnail}>
            {image && !failed
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={image} alt="" width="64" height="64" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
                : <ShoppingBag size={25} aria-hidden="true" />}
            <span className={styles.quantity} aria-label={`Quantidade: ${item.quantidade}`}>{item.quantidade}×</span>
        </div>
        <div className={styles.itemInfo}>
            <h3>{name}</h3>
            {item.categoria_nome && <p className={styles.category}>{item.categoria_nome}</p>}
            {item.descricao && <p>{item.descricao}</p>}
            {item.alimentos?.length > 0 && <p>{item.alimentos.map(food => typeof food === 'string' ? food : food.nome).filter(Boolean).join(', ')}</p>}
            {item.observacao && <p className={styles.note}>Observação: {item.observacao}</p>}
            <div className={styles.itemPrice}><span>{item.quantidade} × {money(item.preco_unitario)}</span><strong>{money(item.subtotal)}</strong></div>
        </div>
    </li>;
}

function Tracking({ pedido }) {
    const progress = kitchenProgress(pedido);
    const icons = [Clock, ChefHat, pedido.metodo_entrega === 'Retirada' || pedido.status === 'Pronto para Retirada' ? Store : Bike, CheckCircle2];

    return <section className={styles.tracking} aria-label="Acompanhamento" aria-live="polite">
        <div className={`${styles.kitchenStatus} ${pedido.status === 'Cancelado' ? styles.canceled : ''}`}>
            <span>Cozinha</span><strong>{pedido.status}</strong>
        </div>
        <p className={styles.financialStatus}>Pagamento: <strong>{paymentLabels[pedido.pagamento_status] || 'Status indisponível'}</strong></p>
        {pedido.status === 'Cancelado' && <p className={styles.warning}>Este pedido foi cancelado.</p>}
        {pedido.status !== 'Cancelado' && progress.blocked && <p className={styles.warning}>A cozinha aguarda a confirmação do pagamento para iniciar o preparo.</p>}
        <ol className={styles.timeline}>
            {progress.steps.map((step, index) => {
                const Icon = icons[index];
                return <li key={step} className={index <= progress.index ? styles.activeStep : ''} aria-current={index === progress.index ? 'step' : undefined}>
                    <span className={styles.stepIcon}><Icon size={19} /></span><span>{step}</span>
                </li>;
            })}
        </ol>
    </section>;
}

function PublicPreview({ pedido }) {
    return <>
        <div className={styles.orderHeading}>
            <div><span className={styles.eyebrow}>Acompanhamento</span><h2>Pedido #{pedido.id}</h2>
                <time dateTime={pedido.criado_em}>{orderDate(pedido.criado_em)}</time>
            </div>
        </div>
        <Tracking pedido={pedido} />
        <p className={styles.message} role="status">
            O andamento deste pedido está disponível. Para consultar itens, endereço, checkout e comprovante,
            é necessário o acesso privado usado na compra ou uma verificação de identidade junto à loja.
        </p>
    </>;
}

export default function DetalhesPedido({ params }) {
    const { id } = use(params);
    const { pedido, carregando, erro, atualizar } = useDetalhesPedido(id);
    const [fallback, setFallback] = useState({ id: null, pedido: null, carregando: false });

    // O resumo consultado por telefone é público e contém somente dados de acompanhamento.
    // Nunca é utilizado para desbloquear endereço, itens privados, checkout ou comprovante.
    useEffect(() => {
        if (!erro || pedido) return;
        const telefone = (() => {
            try { return localStorage.getItem('marmitaria_telefone_cliente')?.replace(/\D/g, '') || ''; }
            catch { return ''; }
        })();
        if (!/^\d{10,11}$/.test(telefone)) return;

        let ativo = true;
        const controller = new AbortController();
        setFallback({ id, pedido: null, carregando: true });
        listarPedidoPorTelefoneUsuario(telefone, controller.signal).then(result => {
            if (!ativo) return;
            const encontrado = result?.data?.find(item => String(item.id) === String(id));
            setFallback({ id, pedido: encontrado || null, carregando: false });
        }).catch(() => {
            if (ativo) setFallback({ id, pedido: null, carregando: false });
        });
        return () => { ativo = false; controller.abort(); };
    }, [erro, id, pedido]);

    const resumo = String(fallback.id) === String(id) ? fallback.pedido : null;
    const consultandoResumo = String(fallback.id) === String(id) && fallback.carregando;
    const receipt = pedido?.pagamento_status === 'PAGO' ? providerUrl(pedido.receipt_url, 'receipt') : null;
    const checkout = pedido?.pagamento_status === 'PENDENTE' && pedido?.status !== 'Cancelado'
        ? providerUrl(pedido.checkout_url) : null;

    return <main className={styles.container}>
        <header className={styles.header}>
            <Link href="/acompanhar" className={styles.back} aria-label="Voltar a Meus Pedidos"><ArrowLeft size={21} /></Link>
            <h1>Detalhes do Pedido</h1>
        </header>

        {carregando && !pedido && <p className={styles.message} role="status">Carregando seu pedido…</p>}
        {!pedido && !carregando && resumo && <PublicPreview pedido={resumo} />}
        {!pedido && !carregando && !resumo && consultandoResumo && <p className={styles.message} role="status">Consultando o andamento…</p>}
        {!pedido && !carregando && !resumo && !consultandoResumo && <>
            {erro && <p className={styles.message} role="alert">{erro}</p>}
            <button className={styles.refresh} onClick={atualizar}><RefreshCw size={17} />Tentar novamente</button>
        </>}

        {pedido && <>
            <div className={styles.orderHeading}>
                <div><span className={styles.eyebrow}>Marmitaria</span><h2>Pedido #{pedido.id}</h2>
                    <time dateTime={pedido.criado_em}>{orderDate(pedido.criado_em)}</time>
                </div>
                <button className={styles.refresh} onClick={atualizar} disabled={carregando} aria-label="Atualizar pedido">
                    <RefreshCw size={18} />Atualizar
                </button>
            </div>
            <Tracking pedido={pedido} />
            <div className={styles.columns}>
                <section className={styles.section} aria-labelledby="items-title">
                    <h2 id="items-title"><ShoppingBag size={20} />Itens do pedido</h2>
                    <ul className={styles.items}>
                        {(pedido.marmitas || []).map(item => <OrderItem key={`m-${item.id}`} item={item} />)}
                        {(pedido.produtos || []).map(item => <OrderItem key={`p-${item.id}`} item={item} product />)}
                    </ul>
                    {pedido.observacoes && <div className={styles.orderNote}><h3>Observações do pedido</h3><p>{pedido.observacoes}</p></div>}
                </section>
                <div className={styles.side}>
                    <section className={styles.section} aria-labelledby="delivery-title">
                        <h2 id="delivery-title"><MapPin size={20} />{pedido.metodo_entrega === 'Retirada' ? 'Retirada' : 'Entrega'}</h2>
                        {pedido.metodo_entrega === 'Retirada' ? <p className={styles.delivery}>Retirada na loja</p> : <div className={styles.delivery}>
                            {pedido.metodo_entrega && <p>{pedido.metodo_entrega}</p>}
                            {pedido.endereco_cliente && <address>{pedido.endereco_cliente}</address>}
                        </div>}
                    </section>
                    <section className={styles.section} aria-labelledby="payment-title">
                        <h2 id="payment-title"><CreditCard size={20} />Pagamento</h2>
                        <dl className={styles.paymentData}>
                            {pedido.metodo_pagamento_nome && <div><dt>Método</dt><dd>{pedido.metodo_pagamento_nome}</dd></div>}
                            {pedido.provedor && <div><dt>Provedor</dt><dd>{pedido.provedor}</dd></div>}
                            <div><dt>Status</dt><dd className={pedido.pagamento_status === 'PAGO' ? styles.paid : ''}>
                                {paymentLabels[pedido.pagamento_status] || 'Status indisponível'}</dd></div>
                            <div><dt>Valor total</dt><dd>{money(pedido.valor_total)}</dd></div>
                        </dl>
                        {receipt && <a className={styles.receipt} href={receipt} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Comprovante</a>}
                        {checkout && <a className={styles.checkout} href={checkout} referrerPolicy="no-referrer" onClick={event => {
                            if (!(new Date(pedido.checkout_valid_until).getTime() > Date.now())) { event.preventDefault(); atualizar(); }
                        }}>Continuar pagamento</a>}
                        {pedido.fluxo_pagamento === 'INFINITEPAY' && pedido.pagamento_status === 'PENDENTE' && !checkout && pedido.status !== 'Cancelado'
                            && <p className={styles.small}>Nenhum checkout válido disponível. Consulte a loja antes de fazer outro pedido.</p>}
                    </section>
                    <section className={styles.section} aria-labelledby="summary-title">
                        <h2 id="summary-title">Resumo financeiro</h2>
                        <dl className={styles.summary}>
                            <div><dt>Marmitas</dt><dd>{money(pedido.resumo?.marmitas)}</dd></div>
                            <div><dt>Produtos e complementos</dt><dd>{money(pedido.resumo?.produtos)}</dd></div>
                            <div className={styles.total}><dt>Total</dt><dd>{money(pedido.valor_total)}</dd></div>
                        </dl>
                    </section>
                </div>
            </div>
        </>}
    </main>;
}
