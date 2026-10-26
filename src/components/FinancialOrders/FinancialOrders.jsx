'use client';
import { useEffect, useState } from 'react';
import { listarPedidosFinanceiros, buscarComprovanteAdmin } from '@/services/pedidosService.js';
import toast from 'react-hot-toast';
import styles from './FinancialOrders.module.css';
import { validateReceiptUrl } from '@/services/adminReceipt.mjs';

function label(order) {
    if (order.pagamento_status === 'ESTORNADA') return 'Pagamento estornado';
    if (order.pagamento_status === 'DIVERGENTE') return 'Divergência financeira';
    if (order.cozinha_autorizada) return 'Pago e liberado';
    if (order.pagamento_status === 'AGUARDANDO') return 'Aguardando pagamento';
    if (['CRIANDO','INCERTA'].includes(order.pagamento_status)) return 'Em verificação';
    return 'Pagamento não confirmado';
}
export default function FinancialOrders() {
    const [orders, setOrders] = useState([]), [error, setError] = useState(false), [version, setVersion] = useState(0);
    const [receipts, setReceipts] = useState({});
    async function receipt(order) {
        try {
            const url = validateReceiptUrl(await buscarComprovanteAdmin(order.pedido_id));
            setReceipts(previous => ({ ...previous, [order.pedido_id]: url }));
        } catch { toast.error('Comprovante indisponível para este pedido.'); }
    }
    useEffect(() => {
        let active = true;
        listarPedidosFinanceiros().then(rows => { if (active) { setOrders(rows); setError(false); } })
            .catch(() => { if (active) setError(true); });
        return () => { active = false; };
    }, [version]);
    return <section className={styles.panel}>
        <h2>Pagamentos InfinitePay</h2>
        <p>Consulta financeira. Pedidos sem autorização permanecem fora da fila da cozinha e da impressão.</p>
        <button type="button" onClick={() => setVersion(value => value + 1)}>Atualizar pagamentos</button>
        {error && <p role="alert">Não foi possível consultar os pagamentos.</p>}
        {!error && orders.length === 0 && <p>Nenhum pedido InfinitePay registrado.</p>}
        <div className={styles.grid}>{orders.map(order => <article key={order.pedido_id} className={styles.order}>
            <strong>Pedido #{order.pedido_id} · {order.nome_cliente}</strong>
            <span>{label(order)}</span>
            <span>R$ {Number(order.valor_total).toFixed(2).replace('.', ',')}</span>
            <small>{order.cozinha_autorizada ? 'Operação autorizada pelo Backend.' : 'Preparo e impressão bloqueados.'}</small>
            {order.comprovante_disponivel && (receipts[order.pedido_id]
                ? <a href={receipts[order.pedido_id]} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Abrir comprovante autorizado</a>
                : <button type="button" onClick={() => receipt(order)}>Consultar comprovante</button>)}
        </article>)}</div>
    </section>;
}
