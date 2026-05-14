'use client'

import { createContext, useState, useEffect, useContext, useCallback } from "react";

import Cookies from "js-cookie";

import { getMe, logout } from "@/services/authService.js";

import { useRouter, usePathname } from "next/navigation";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [permissoes, setPermissoes] = useState([]);
    const [isReady, setIsReady] = useState(false);

    const router = useRouter();
    const pathname = usePathname();


    const logoutRequest = useCallback(async () => {
        try {
            // 1. Bate na rota do backend para invalidar a sessão/token
            await logout();
        } catch (error) {
            console.error("Erro ao invalidar sessão no servidor:", error);
        } finally {
            // 2. O 'finally' garante que o frontend será limpo de qualquer forma
            Cookies.remove('role', { path: '/' });
            Cookies.remove('is_logged', { path: '/' });
            localStorage.removeItem('user');

            setUser(null);
            router.push('/auth/login');
        }
    }, [router])

    const buscarDadosUsuario = useCallback(async () => {
        const isLogged = Cookies.get("is_logged");

        if (isLogged) {
            try {
                const response = await getMe();

                // 1. O seu JSON vem direto na resposta (ou dentro de response.data dependendo do seu axios)
                // Se você usa axios puro, geralmente é response.data
                const dados = response?.data || response;

                // Verificamos se o "status" é "success" conforme o seu retorno
                if (dados?.status === "success") {
                    // 2. Salvamos o usuário (nome, email, nivel_acesso)
                    setUser({
                        nome: dados.nome,
                        email: dados.email,
                        nivel_acesso: dados.nivel_acesso
                    });

                    // 3. Pegamos a lista de permissões que já vem no JSON
                    setPermissoes(dados.permissoes || []);

                } else {
                    throw new Error("Resposta da API não indica sucesso");
                }

            } catch (error) {
                console.error('Erro ao validar sessão:', error);
                logoutRequest();
            }
        } else {
            if (pathname.startsWith('/admin')) {
                router.push('/login');
            }
        }
        setIsReady(true);
    }, [pathname, router, logoutRequest]);

    useEffect(() => {
        // Criamos uma função async interna
        const inicializarSessao = async () => {
            await buscarDadosUsuario();
        };

        // E chamamos ela imediatamente
        inicializarSessao();
    }, [buscarDadosUsuario]);

    const hasPermission = useCallback((permissionName) => {
        if (!permissionName) return true;
        // Admins costumam ter "super permissão"
        if (permissoes.includes('admin')) return true;
        return permissoes.includes(permissionName);
    }, [permissoes]);

    return (
        <AuthContext.Provider value={{ user, permissoes, hasPermission, isReady, refreshSession: buscarDadosUsuario, logoutRequest }}>
            {isReady ? children : null}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);