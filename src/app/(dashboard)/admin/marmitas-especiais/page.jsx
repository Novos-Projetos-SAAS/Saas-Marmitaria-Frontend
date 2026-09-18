import MarmitasEspeciaisClient from "./MarmitasEspeciaisClient.jsx";

import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import styles from "./page.module.css";

export const metadata = {
    title: "Marmitaria | Marmitas Especiais",
    description: "Gerenciamento de marmitas especiais"
};

export default function MarmitasEspeciaisPage() {
    return (
        <Can
            perform="cardapio.gerenciar"
            fallback={<AccessDenied />}
        >
            <div className={styles.container}>
                <h1 className={styles.title}>Marmitas Especiais</h1>
                <p className={styles.subtitle}>
                    Cadastre opções prontas com nome, descrição e valor próprios.
                </p>

                <MarmitasEspeciaisClient />
            </div>
        </Can>
    );
}
