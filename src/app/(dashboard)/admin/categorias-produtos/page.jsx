import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";

import CategoriasProdutosClient from "./CategoriasProdutosClient";

import styles from "../categorias-alimentos/page.module.css";

export const metadata = {
    title: "Marmitaria | Categorias de Produtos",
    description: "Categorias dos produtos vendidos separadamente"
};

export default function CategoriasProdutosPage() {
    return (
        <Can perform="categorias_produtos.listar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.title}>Categorias de Produtos</h1>

                <CategoriasProdutosClient />
            </div>
        </Can>
    );
}