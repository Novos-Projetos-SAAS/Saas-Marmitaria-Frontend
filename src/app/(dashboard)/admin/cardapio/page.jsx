import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";
import CardapioClient from "./CardapioClient.jsx";
import styles from "./page.module.css";

export const metadata = {
    title: "Marmitaria | Cardápio", // Ajuste para o nome do seu sistema
    description: "Módulo de cardápio da Marmitaria",
};

export default function CardapioPage() {
    return (
        <Can perform="cardapio.gerenciar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Cardápio do Dia</h1>
                <CardapioClient />
            </div>
        </Can>
    );
}