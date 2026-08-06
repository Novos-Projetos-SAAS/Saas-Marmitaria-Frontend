'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

import { useAuthContext } from '@/context/AuthContext.js';

import Can from '../ui/can/index.jsx';
import ItemSidebar from '../ui/itemSidebar/index.jsx';

import {
    LayoutDashboard,
    ClipboardList,
    Utensils,
    Users,
    PieChart,
    Settings,
    ChefHat,
    Package,
    Box,
    Tags,
    LogOut,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

import styles from './page.module.css';

export default function Sidebar({ menuAberto, fecharMenu }) {
    const pathname = usePathname();
    const { logoutRequest } = useAuthContext();

    const menuScrollRef = useRef(null);

    const [mostrarIndicadorCima, setMostrarIndicadorCima] = useState(false);
    const [mostrarIndicadorBaixo, setMostrarIndicadorBaixo] = useState(false);

    const menuItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Pedidos', href: '/admin/pedidos', icon: ClipboardList, permissao: 'pedidos.listar' },
        { label: 'Cardápio', href: '/admin/cardapio', icon: ChefHat, permissao: 'cardapio.listar' },
        { label: 'Alimentos', href: '/admin/alimentos', icon: Utensils, permissao: 'alimentos.listar' },
        { label: 'Categorias Alimentos', href: '/admin/categorias-alimentos', icon: Tags, permissao: 'categorias_alimentos.listar' },
        { label: 'Tamanhos Marmitas', href: '/admin/tamanhos-marmitas', icon: Package, permissao: 'tamanhos_marmitas.listar' },
        { label: 'Produtos', href: '/admin/produtos', icon: Box, permissao: 'produtos.listar' },
        { label: 'Categorias Produtos', href: '/admin/categorias-produtos', icon: Tags, permissao: 'categorias_produtos.listar' },
        { label: 'Usuários', href: '/admin/usuarios', icon: Users, permissao: 'usuarios.listar' },
        { label: 'Relatórios', href: '/admin/relatorios', icon: PieChart, permissao: 'relatorios.visualizar' },
        { label: 'Configuração Loja', href: '/admin/configuracoes-loja', icon: Settings, permissao: 'loja.configurar' }
    ];

    useEffect(() => {
        const menu = menuScrollRef.current;

        if (!menu) return;

        /**
         * Controla de forma independente os indicadores superior
         * e inferior conforme a posição atual do scroll.
         */
        const verificarScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = menu;
            const tolerancia = 5;

            setMostrarIndicadorCima(scrollTop > tolerancia);
            setMostrarIndicadorBaixo(scrollTop + clientHeight < scrollHeight - tolerancia);
        };

        verificarScroll();

        menu.addEventListener('scroll', verificarScroll);
        window.addEventListener('resize', verificarScroll);

        /**
         * As permissões podem fazer itens aparecerem depois da
         * renderização inicial, então observamos alterações no menu.
         */
        const observer = new MutationObserver(() => {
            requestAnimationFrame(verificarScroll);
        });

        observer.observe(menu, {
            childList: true,
            subtree: true
        });

        return () => {
            menu.removeEventListener('scroll', verificarScroll);
            window.removeEventListener('resize', verificarScroll);
            observer.disconnect();
        };
    }, []);

    /**
     * Move o menu suavemente para cima ou para baixo.
     */
    const moverScroll = (direcao) => {
        menuScrollRef.current?.scrollBy({
            top: direcao === 'cima' ? -180 : 180,
            behavior: 'smooth'
        });
    };

    return (
        <aside className={`${styles.sidebar} no-print ${menuAberto ? styles.sidebarAberta : ''}`}>
            <div className={styles.logoContainer}>
                <ChefHat size={32} color="#ea580c" />
                <h2>Marmitaria</h2>

                <button
                    type="button"
                    className={styles.btnFecharMobile}
                    onClick={fecharMenu}
                    aria-label="Fechar menu"
                    title="Fechar menu"
                >
                    <X size={24} />
                </button>
            </div>

            <div className={styles.menuWrapper}>
                {mostrarIndicadorCima && (
                    <div className={`${styles.scrollAreaIndicator} ${styles.scrollAreaTop}`}>
                        <button
                            type="button"
                            className={`${styles.scrollIndicator} ${styles.scrollIndicatorTop}`}
                            onClick={() => moverScroll('cima')}
                            aria-label="Existem mais opções acima"
                            title="Mais opções acima"
                        >
                            <ChevronUp size={23} strokeWidth={2.5} />
                        </button>
                    </div>
                )}

                <nav ref={menuScrollRef} className={styles.nav}>
                    {menuItems.map((item) => {
                        const renderLink = () => (
                            <ItemSidebar
                                key={item.href}
                                label={item.label}
                                icon={item.icon}
                                href={item.href}
                                onClick={fecharMenu}
                            />
                        );

                        if (item.permissao) {
                            return (
                                <Can key={item.href} perform={item.permissao}>
                                    {renderLink()}
                                </Can>
                            );
                        }

                        return renderLink();
                    })}
                </nav>

                {mostrarIndicadorBaixo && (
                    <div className={`${styles.scrollAreaIndicator} ${styles.scrollAreaBottom}`}>
                        <button
                            type="button"
                            className={`${styles.scrollIndicator} ${styles.scrollIndicatorBottom}`}
                            onClick={() => moverScroll('baixo')}
                            aria-label="Existem mais opções abaixo"
                            title="Mais opções abaixo"
                        >
                            <ChevronDown size={23} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.logoutContainer}>
                <button type="button" onClick={logoutRequest} className={styles.btnLogout}>
                    <LogOut size={20} />
                    <span>Sair do sistema</span>
                </button>
            </div>
        </aside>
    );
}