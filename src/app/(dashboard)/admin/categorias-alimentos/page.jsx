import Can from "@/components/ui/can/index.jsx";
import AccessDenied from "@/components/ui/accessDenied/index.jsx";
import CategoriasClient from "./CategoriasAlimentosClient";
import styles from "./page.module.css";

export const metadata = {
    title: "Categorias de Alimentos | Admin",
};

export default function CategoriasPage() {
    return (
        <Can perform="categorias_alimentos.listar" fallback={<AccessDenied />}>
            <div className={styles.container}>
                <h1 className={styles.title}>Categorias de Alimentos</h1>
                <CategoriasClient />
            </div>
        </Can>
    );
}