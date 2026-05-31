import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";
import ConfiguracoesClient from "./ConfiguracoesClient.jsx";
import styles from "./page.module.css"; 

export const metadata = {
    title: "Configurações da Loja | Admin",
};

export default function ConfiguracoesPage() {
    return (
        <Can perform="loja.configurar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Configurações da Loja</h1>
                <ConfiguracoesClient />
            </div>
        </Can>
    );
}