'use client';

import { CalendarDays, ChevronLeft, ChevronRight, CreditCard, QrCode, ReceiptText, RefreshCw, WalletCards } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext.js';
import { useFinancialOrders } from '@/hooks/useFinancialOrders.js';
import { providerUrl } from '@/services/infinitepayService.js';
import styles from './FinancialOrders.module.css';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function FinancialOrders() {
    const { hasPermission } = useAuthContext();
    const { orders, groups, page, changePage, hasNextPage, applyPeriod, loading, pendingId, error, notice, refresh, reconcile } = useFinancialOrders();
    return <section className={styles.panel} aria-labelledby="payments-heading">
        <div className={styles.heading}>
            <div><h2 id="payments-heading">Histórico de pagamentos</h2><p>Recebimentos via InfinitePay. Datas e horários de Brasília.</p></div>
            <button type="button" onClick={refresh} disabled={loading || pendingId !== null}>
                <RefreshCw size={18} aria-hidden="true" />{loading ? 'Consultando…' : 'Atualizar'}
            </button>
        </div>
        <form className={styles.filters} aria-label="Filtrar pagamentos por período" onSubmit={event => {
            event.preventDefault();
            const fields = new FormData(event.currentTarget);
            applyPeriod({ data_inicio: fields.get('data_inicio'), data_fim: fields.get('data_fim') });
        }} onReset={() => applyPeriod({ data_inicio: '', data_fim: '' })}>
            <div className={styles.filterTitle}><CalendarDays size={19} aria-hidden="true" /><span>Período</span></div>
            <label>De<input type="date" name="data_inicio" disabled={loading || pendingId !== null} /></label>
            <label>Até<input type="date" name="data_fim" disabled={loading || pendingId !== null} /></label>
            <button className={styles.applyButton} type="submit" disabled={loading || pendingId !== null}>Aplicar período</button>
            <button type="reset" disabled={loading || pendingId !== null}>Limpar</button>
        </form>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {notice && <p role="status" className={styles.notice}>{notice}</p>}
        {loading && <p role="status" className={styles.empty}>Carregando pagamentos…</p>}
        {!loading && !error && orders.length === 0 && <p className={styles.empty}>{page > 1 ? 'Nenhum pagamento nesta página. Volte para a página anterior.' : 'Nenhum pagamento encontrado para este período.'}</p>}
        <div className={styles.list} aria-busy={loading}>{groups.map(group => <section key={group.key} aria-labelledby={`day-${group.key}`}>
            <header className={styles.dayHeading}>
                <h3 id={`day-${group.key}`}>{group.label}</h3>
                <div className={styles.dayTotal}><span>{group.completeTotal ? 'Confirmados no dia' : 'Confirmados nesta página'}</span><strong>{currency.format(group.totalCents / 100)}</strong></div>
            </header>
            <div className={styles.dayOrders}>{group.orders.map(order => {
                const receipt = providerUrl(order.receipt_url, 'receipt');
                const MethodIcon = order.methodIcon === 'pix' ? QrCode : order.methodIcon === 'card' ? CreditCard : WalletCards;
                return <article key={order.key} className={styles.order}>
                    <div className={styles.transaction}>
                        <div className={styles.methodIcon} title={order.methodLabel}><MethodIcon size={23} aria-hidden="true" /></div>
                        <div className={styles.customer}>
                            <h4>{order.nome_cliente || 'Cliente não informado'}</h4>
                            <p className={styles.meta}>
                                <span>{order.pedido_id != null ? `Pedido #${order.pedido_id}` : 'Pedido não informado'}</span>
                                <time dateTime={order.dateTime}>{order.time}</time>
                                <span>{order.methodLabel}</span>
                            </p>
                        </div>
                        <span className={`${styles.status} ${order.refunded ? styles.refundedStatus : order.paid ? styles.paidStatus : ''}`}>{order.statusLabel}</span>
                        <div className={`${styles.amount} ${order.refunded ? styles.refunded : order.paid ? styles.paid : ''}`}>
                            <strong>{Number.isSafeInteger(order.amountCents) ? currency.format(order.amountCents / 100) : 'Valor não informado'}</strong>
                            {order.refunded && <span>Valor original</span>}
                        </div>
                        <div className={styles.receiptSlot}>{receipt && <a className={styles.receipt} href={receipt} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
                            aria-label={`Abrir comprovante do pedido #${order.pedido_id} em nova aba`}>
                            <ReceiptText size={21} aria-hidden="true" /><span className={styles.tooltip} aria-hidden="true">Abrir comprovante</span>
                        </a>}</div>
                    </div>
                    {/* {hasPermission('pagamentos.conciliar') && order.pagamento_status !== 'PAGO' &&
                        <form className={styles.reconciliation} onSubmit={event => {
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
                                <button type="submit" disabled={pendingId !== null || loading}>{pendingId === order.pedido_id ? 'Verificando…' : 'Solicitar conciliação'}</button>
                            </details>
                        </form>} */}
                </article>;
            })}</div>
        </section>)}</div>
        <nav className={styles.pagination} aria-label="Páginas de pagamentos">
            <button type="button" onClick={() => changePage(page - 1)} disabled={page <= 1 || loading || pendingId !== null}><ChevronLeft size={18} aria-hidden="true" />Anterior</button>
            <span aria-live="polite">Página {page}</span>
            <button type="button" onClick={() => changePage(page + 1)} disabled={!hasNextPage || loading || pendingId !== null}>Próxima<ChevronRight size={18} aria-hidden="true" /></button>
        </nav>
    </section>;
}
