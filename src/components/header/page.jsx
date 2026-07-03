// src/components/Header/Header.js
'use client'

import { useAuthContext } from '@/context/AuthContext.js';

import { Menu } from 'lucide-react';

import styles from './page.module.css';

export default function Header({ abrirMenu }) {
    const { user } = useAuthContext();

    // Extrai o nome de forma segura, seja ele 'usuario.nome' ou direto 'nome'
    const nomeUsuario = user?.usuario?.nome || user?.nome || 'Admin';
    const inicial = nomeUsuario.charAt(0).toUpperCase();

    return (
        <header className={`${styles.header} no-print`}>
            <button className={styles.btnMenuMobile} onClick={abrirMenu}>
                <Menu size={24} />
            </button>
            
            <div className={styles.headerInfo}>
                <span className={styles.boasVindas}>
                    Olá, <strong>{nomeUsuario}</strong>
                </span>
                <div className={styles.avatar}>
                    {inicial}
                </div>
            </div>
        </header>
    );
}