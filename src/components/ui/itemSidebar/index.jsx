"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import styles from "./index.module.css";

export default function ItemSidebar({ label, icon: Icon, href, onClick }) {
    const pathname = usePathname();

    // Lógica para marcar como ativo: 
    // Se for a home do admin, precisa ser exato. Se for rota tipo /admin/pedidos, usa startsWith.
    const isActive =
        href === "/admin"
            ? pathname === "/admin"
            : pathname === href || pathname.startsWith(href + "/");

    return (
        <Link
            href={href}
            className={`${styles.item} ${isActive ? styles.active : ""}`}
            onClick={onClick}
        >
            <Icon size={20} className={styles.icon} />
            <span>{label}</span>
        </Link>
    );
}