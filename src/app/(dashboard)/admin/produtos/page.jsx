import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import ProdutosClient from "./ProdutosClient";

/**
 * Reutilizamos exatamente o CSS visual da página
 * de Alimentos para manter o padrão do projeto.
 */
import styles from "../alimentos/page.module.css";

export const metadata = {
    title: "Marmitaria | Produtos",
    description: "Gerenciamento de produtos da Marmitaria"
};

export default function ProdutosPage() {
    return (
        <Can perform="produtos.listar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    Produtos
                </h1>
                <ProdutosClient />
            </div>
        </Can>
    );
}