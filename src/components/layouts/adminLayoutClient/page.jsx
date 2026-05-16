'use client'

import { useState } from "react"

import Header from "@/components/header/page.jsx";
import Sidebar from "@/components/sidebar/page.jsx";

import styles from './page.module.css';

export default function AdminLayoutClient({ children }) {
    
    const [menuAberto, setMenuAberto] = useState(false);

    const fecharMenu = () => setMenuAberto(false);
    const abrirMenu = () => setMenuAberto(true);

    return (
        <div className={styles.layoutContainer}>
            {/* BACKDROP PARA MOBILE */}
            {menuAberto && <div className={styles.backdrop} onClick={fecharMenu}></div>}

            {/* SIDEBAR COMPONENTIZADA */}
            <Sidebar menuAberto={menuAberto} fecharMenu={fecharMenu} />

            <main className={styles.mainContent}>
                {/* HEADER COMPONENTIZADO */}
                <Header abrirMenu={abrirMenu} />

                {/* CONTEÚDO DAS PÁGINAS */}
                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>
        </div>
    );
}