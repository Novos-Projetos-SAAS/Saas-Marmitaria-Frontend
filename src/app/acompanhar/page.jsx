'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, Search, ShoppingBag } from 'lucide-react';
import { usePedidosCliente } from '@/hooks/usePedidos';
import { orderDate, paymentLabels } from '@/utils/customerOrderDisplay';
import TelefoneInput from '@/components/ui/inputMask/index.jsx';
import styles from './page.module.css';

export default function AcompanharPedido() {
    const { telefone, setTelefone, pedidos, buscando, erro, consultou, buscar } = usePedidosCliente();
    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.back} aria-label="Voltar ao início"><ArrowLeft size={21} /></Link>
                <h1>Meus Pedidos</h1>
            </header>
            <p className={styles.intro}>Seus pedidos, do pagamento à primeira garfada.</p>
            <form className={styles.search} onSubmit={event => { event.preventDefault(); void buscar(telefone); }}>
                <label className={styles.phone}>
                    <span>Telefone com DDD</span>
                    <TelefoneInput name="telefone" value={telefone} onChange={event => setTelefone(event.target.value)}
                        className={styles.input} placeholder="(00) 00000-0000" required />
                </label>
                <button className={styles.searchButton} disabled={buscando} aria-label="Buscar pedidos">
                    <Search size={21} />
                </button>
            </form>
            <div role="status" aria-live="polite" className={styles.feedback}>
                {erro || (buscando ? 'Consultando seus pedidos…' : consultou && pedidos.length === 0 ? 'Nenhum pedido encontrado para este telefone.' : '')}
            </div>
            {!consultou && !buscando && !erro && <div className={styles.empty}>
                <ShoppingBag size={30} aria-hidden="true" />
                <p>Informe seu telefone para acompanhar seus pedidos.</p>
            </div>}
            <ul className={styles.list} aria-label="Pedidos encontrados" aria-busy={buscando}>
                {pedidos.map(pedido => <li key={pedido.id}>
                    <Link href={`/acompanhar/${pedido.id}`} className={styles.card}>
                        <div className={styles.cardHeading}>
                            <div><h2>Pedido #{pedido.id}</h2><time dateTime={pedido.criado_em}>{orderDate(pedido.criado_em)}</time></div>
                            <ChevronRight className={styles.chevron} size={22} aria-hidden="true" />
                        </div>
                        <dl className={styles.statuses}>
                            <div><dt>Cozinha</dt><dd className={pedido.status === 'Cancelado' ? styles.canceled : styles.kitchen}>{pedido.status}</dd></div>
                            <div><dt>Pagamento</dt><dd className={pedido.pagamento_status === 'PAGO' ? styles.paid : styles.financial}>
                                {paymentLabels[pedido.pagamento_status] || 'Status indisponível'}
                            </dd></div>
                        </dl>
                    </Link>
                </li>)}
            </ul>
        </main>
    );
}
