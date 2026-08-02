import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";
import AlimentosClient from "./AlimentosClient";
import styles from "./page.module.css";

export const metadata = {
    title: "Marmitaria | Alimentos", // Ajuste para o nome do seu sistema
    description: "Módulo de alimentos da Marmitaria",
};

export default function AlimentosPage() {
    return (
        <Can perform="alimentos.listar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.title}>Alimentos</h1>
                <AlimentosClient />
            </div>
        </Can>
    );
}