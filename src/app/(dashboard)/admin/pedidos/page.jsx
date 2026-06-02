import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";
import PedidosClient from "./PedidosClient.jsx";
import styles from "./page.module.css"; 

export const metadata = { title: "Gestão de Pedidos | Admin" };

export default function PedidosPage() {
    return (
        <Can perform="pedidos.listar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Gestão de Pedidos</h1>
                <PedidosClient />
            </div>
        </Can>
    );
}