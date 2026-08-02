import TamanhosClient from "./tamanhosClient.jsx";

import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx"; 

import styles from "./page.module.css";

export const metadata = {
    title: "Marmitaria | Tamanhos de marmitas", // Ajuste para o nome do seu sistema
    description: "Módulo de tamanhos de marmitas Marmitaria",
};

export default function TamanhosPage() {
    return (
        <Can perform="tamanhos_marmitas.listar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.title}>Tamanhos de Marmitas</h1>   
                <TamanhosClient />
            </div>
        </Can>
    );
}