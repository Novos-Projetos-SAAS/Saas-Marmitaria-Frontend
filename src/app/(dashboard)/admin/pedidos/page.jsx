import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";
import PedidosClient from "./PedidosClient.jsx";
import styles from "./page.module.css"; 

export const metadata = {
    title: "Marmitaria | Usuários", // Ajuste para o nome do seu sistema
    description: "Módulo de usuários da Marmitaria",
};

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