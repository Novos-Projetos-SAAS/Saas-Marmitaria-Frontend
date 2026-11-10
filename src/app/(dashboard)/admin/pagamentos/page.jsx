import Can from '@/components/ui/can/index.jsx';
import AccessDenied from '@/components/ui/accessDenied/index.jsx';
import FinancialOrders from '@/components/FinancialOrders/FinancialOrders.jsx';
import styles from '@/components/FinancialOrders/FinancialOrders.module.css';

export const metadata = { title: 'Pagamentos InfinitePay | Admin' };

export default function PagamentosPage() {
    return <Can perform={['pagamentos.visualizar', 'pagamentos.conciliar']} fallback={<AccessDenied />}>
        <div className={styles.page}><h1 className={styles.pageTitle}>Pagamentos</h1><FinancialOrders /></div>
    </Can>;
}
