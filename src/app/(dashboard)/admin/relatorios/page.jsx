import RelatoriosClient from "./RelatoriosClient";

import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index"; // Ajuste o caminho se necessário

import styles from "./page.module.css";


export const metadata = {
    title: "Marmitaria | Relatórios", // Ajuste para o nome do seu sistema
    description: "Módulo de relatórios da Marmitaria",
};

export default function RelatoriosPage() {
    return (
        // Envolvemos a página inteira com a permissão exigida
        <Can perform="relatorios.visualizar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={`${styles.title} no-print`}>Painel de Relatórios</h1>   
                <RelatoriosClient />
            </div>
        </Can>
    );
}



