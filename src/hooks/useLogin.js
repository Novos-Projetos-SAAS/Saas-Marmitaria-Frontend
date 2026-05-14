import { useState } from "react";

import { useRouter } from "next/navigation";

import { login } from "@/services/authService.js";

import Swal from "sweetalert2";

import Cookies from "js-cookie";

export function useLogin() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(email, senha) {
        setLoading(true);

        try {
            const response = await login(email, senha);

            if (response.status !== "success") {
                throw new Error("Erro no processamento do login.");
            }

            const usuario = response.data.usuario;
            const userRole = usuario.cargo;

            Cookies.set("role", userRole, { expires: 1, path: "/" });
            Cookies.set("is_logged", "true", { expires: 1, path: "/" });

            localStorage.setItem("user", JSON.stringify(usuario));

            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            Toast.fire({
                icon: "success",
                title: `Bem-vindo, ${usuario.nome}!`
            });

            // 6. Redirecionamento
            if (userRole === "admin" || userRole === 'atendente' || userRole === 'entregador') {
                router.push("/admin");
            } else {
                router.push("/");
            }


        } catch (error) {
            const status = error.response?.status;
            const msg = error.response?.data?.message || "Erro ao conectar com o servidor.";

            if (status === 401 || status === 403) {
                Swal.fire({
                    icon: "error",
                    title: "Acesso Negado",
                    text: msg,
                    confirmButtonColor: "#ea580c"
                });
                return;
            }

            Swal.fire({
                icon: "error",
                title: "Erro no Servidor",
                text: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
                confirmButtonColor: "#d33"
            });

        } finally {
            setLoading(false);
        }

        
    }
    
    return { handleLogin, loading };
}