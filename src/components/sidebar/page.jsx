// src/components/Sidebar/Sidebar.js
'use client'

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
    CreditCard,
    ShieldCheck,
    Tags,
    LogOut,
    X // Adicionado o ícone de fechar
} from "lucide-react";

import styles from './page.module.css';

export default function Sidebar({ menuAberto, fecharMenu }) {
    const pathname = usePathname();
    const { logoutRequest } = useAuthContext();

    const menuItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard }, 
        { label: "Pedidos", href: "/admin/pedidos", icon: ClipboardList, permissao: "pedidos.listar" },
        { label: "Cardápio", href: "/admin/cardapio", icon: ChefHat, permissao: "cardapio.listar" },
        { label: "Alimentos", href: "/admin/alimentos", icon: Utensils, permissao: "alimentos.listar" },
        { label: "Categorias", href: "/admin/categorias", icon: Tags, permissao: "categorias_alimentos.listar" },
        { label: "Tamanhos Marmitas", href: "/admin/tamanhos", icon: Package, permissao: "tamanhos_marmitas.listar" },
         { label: "Usuários", href: "/admin/usuarios", icon: Users, permissao: "usuarios.listar" },
        // { label: "Relatórios", href: "/admin/relatorios", icon: PieChart, permissao: "relatorios.financeiro" },
        { label: "Pagamentos", href: "/admin/pagamentos", icon: CreditCard, permissao: "metodos_pagamento.listar" },
        // { label: "Permissões", href: "/admin/permissoes", icon: ShieldCheck, permissao: "permissoes.listar" },
        { label: "Configuração Loja", href: "/admin/loja", icon: Settings, permissao: "loja.configurar" },
    ];

    return (
        <aside className={`${styles.sidebar} ${menuAberto ? styles.sidebarAberta : ''}`}>
            <div className={styles.logoContainer}>
                <ChefHat size={32} color="#ea580c" />
                <h2>Marmitaria</h2>
                <button className={styles.btnFecharMobile} onClick={fecharMenu}>
                    <X size={24} />
                </button>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item, index) => {
                    const Icone = item.icon;
                    const ativo = pathname === item.href;

                    // Função interna para renderizar o link para evitar repetição de código
                    const renderLink = () => (
                        <ItemSidebar
                            key={index}
                            label={item.label}
                            icon={item.icon}
                            href={item.href}
                            onClick={fecharMenu}
                        />
                    );

                    // Se o item tem permissão, envolvemos no <Can />
                    if (item.permissao) {
                        return (
                            <Can key={index} perform={item.permissao}>
                                {renderLink()}
                            </Can>
                        );
                    }

                    // Se não tem permissão (ex: Dashboard), renderiza direto
                    return renderLink();
                })}
            </nav>

            <div className={styles.logoutContainer}>
                <button onClick={logoutRequest} className={styles.btnLogout}>
                    <LogOut size={20} />
                    <span>Sair do sistema</span>
                </button>
            </div>
        </aside>
    );
}