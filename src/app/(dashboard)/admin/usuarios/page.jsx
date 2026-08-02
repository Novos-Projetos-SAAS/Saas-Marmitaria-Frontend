import UsuariosClient from "./UsuariosClient.jsx";

import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index"; // Ajuste o caminho se necessário

import styles from "./page.module.css";

export const metadata = {
    title: "Marmitaria | Usuários", // Ajuste para o nome do seu sistema
    description: "Módulo de usuários da Marmitaria",
};

export default function Users() {
    return (
        // Envolvemos a página inteira com a permissão exigida
        <Can perform="usuarios.listar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.title}>Painel de Usuários</h1>   
                <UsuariosClient />
            </div>
        </Can>
    );
}