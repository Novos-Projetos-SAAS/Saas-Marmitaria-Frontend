"use client";

import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// Importe os services que serão usados nos cadastros
import { criarUsuario } from "@/services/cadastrosService.js";

export function useCadastro() {
    const router = useRouter();

    const CORES_SWAL = {
        sucesso: "#16a34a", // Emerald 600 (Verde)
        erro: "#ef4444",    // Red 500 (Vermelho)
        warning: "#f59e0b"  // Amber 500 (Amarelo/Ouro da sua marca)
    };

    // --- CADASTRO DE USUÁRIO ---
    const cadastrarUsuario = async (payload) => {
        try {
            await criarUsuario(payload);

            await Swal.fire({
                title: 'Sucesso!',
                text: 'Usuário cadastrado com sucesso.',
                icon: 'success',
                confirmButtonColor: CORES_SWAL.sucesso
            });

            router.push('/admin/usuarios');
            return true; // Retorna true para sinalizar sucesso

        } catch (error) {
            Swal.fire({
                title: 'Erro!',
                text: error.response?.data?.message || 'Não foi possível realizar o cadastro.',
                icon: 'error',
                confirmButtonColor: CORES_SWAL.erro
            });
            throw error; // Repassa o erro para o Form desligar o botão de "Salvando..."
        }
    };

    // Futuramente você pode adicionar aqui:
    // const cadastrarAlimento = async (payload) => { ... }
    // const cadastrarCliente = async (payload) => { ... }

    return {
        cadastrarUsuario,
        // cadastrarAlimento,
        // cadastrarCliente
    };
}