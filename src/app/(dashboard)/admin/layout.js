// src/app/admin/layout.js

import AdminLayoutClient from "@/components/layouts/adminLayoutClient/page.jsx";
import { AuthProvider } from "@/context/AuthContext.js";

export const metadata = {
    title: "Marmitaria | Painel Administrativo", // 👈 Atualizado para o nosso contexto
    description: "Sistema de gestão de pedidos e cardápio da marmitaria.",
    icons: {
        icon: "/favicon.ico", 
    },
};

export default function AdminLayout({ children }) {
    return (
        <AuthProvider>
            <AdminLayoutClient>
                {children}
            </AdminLayoutClient>
        </AuthProvider>
    );
}