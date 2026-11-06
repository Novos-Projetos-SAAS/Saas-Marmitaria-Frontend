'use client';

import { useAuthContext } from '@/context/AuthContext.js';
import { useFinancialOrders } from '@/hooks/useFinancialOrders.js';
import { providerUrl } from '@/services/infinitepayService.js';
import styles from './FinancialOrders.module.css';

const labels = { PENDENTE: 'Aguardando pagamento', PAGO: 'Pagamento confirmado', FALHOU: 'Pagamento falhou', CANCELADO: 'Pagamento cancelado' };
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FinancialOrders() {
    const { hasPermission } = useAuthContext();
    const { orders, page, changePage, loading, pendingId, error, notice, refresh, reconcile } = useFinancialOrders();
    return <section className={styles.panel} aria-labelledby="payments-heading">
        <div className={styles.heading}><div><h2 id="payments-heading">Pagamentos InfinitePay</h2><p>Confira pagamentos e solicite a confirmação de pedidos pendentes.</p></div>
            <button type="button" onClick={refresh} disabled={loading || pendingId !== null}>{loading ? 'Consultando…' : 'Atualizar pagamentos'}</button></div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {!loading && !error && orders.length === 0 && <p>{page > 1 ? 'Nenhum pagamento nesta página. Volte para a página anterior.' : 'Nenhum pagamento InfinitePay registrado.'}</p>}
        <div className={styles.list}>{orders.map(order => {
            const receipt = providerUrl(order.receipt_url, 'receipt');
            return <article key={order.pedido_id} className={styles.order}>
                <div className={styles.summary}><h3>Pedido #{order.pedido_id} · {order.nome_cliente}</h3>
                    <strong>{currency.format(Number(order.valor_total || 0))}</strong></div>
                <p className={order.pagamento_status === 'PAGO' ? styles.paid : styles.status}>{labels[order.pagamento_status] || 'Aguardando confirmação'}</p>
                <p>{order.metodo_pagamento_nome || 'InfinitePay (Pix ou cartão)'}</p>
                {receipt && <a href={receipt} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Ver comprovante</a>}
                {hasPermission('pagamentos.conciliar') && order.pagamento_status !== 'PAGO' && <form className={styles.reconciliation} onSubmit={event => {
                    event.preventDefault();
                    const fields = new FormData(event.currentTarget);
                    const values = Object.fromEntries([...fields.entries()].map(([key, value]) => [key, value.trim()]).filter(([, value]) => value));
                    void reconcile(order.pedido_id, values);
                }}>
                    {!order.checkout_url && <p>Sem os identificadores da transação, a conciliação tenta recuperar o link desta cobrança.</p>}
                    <details><summary>Informar dados da transação (opcional)</summary>
                        <p>Preencha se o retorno do pagamento não foi recebido. Os dados são conferidos pela InfinitePay.</p>
                        <label>Identificador da transação<input name="transaction_nsu" maxLength={200} autoComplete="off" spellCheck={false} /></label>
                        <label>Identificador da fatura (slug)<input name="slug" maxLength={200} autoComplete="off" spellCheck={false} /></label>
                    </details>
                    <button type="submit" disabled={pendingId !== null || loading}>{pendingId === order.pedido_id ? 'Verificando…' : 'Solicitar conciliação'}</button>
                </form>}
            </article>;
        })}</div>
        <nav className={styles.pagination} aria-label="Páginas de pagamentos">
            <button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1 || loading || pendingId !== null}>Página anterior</button>
            <span aria-live="polite">Página {page}</span>
            <button type="button" onClick={() => changePage(page + 1)} disabled={orders.length < 20 || loading || pendingId !== null}>Próxima página</button>
        </nav>
    </section>;
}
