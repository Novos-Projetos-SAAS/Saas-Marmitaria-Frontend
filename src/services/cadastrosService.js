import api from "./api";

/**
 * Registra um novo usuário
 * @param {Object} payload - Objeto contendo nome, email, telefone, endereço e senha do usuário
 */

export async function criarUsuario(payload) {
    try {
        const response = await api.post('/usuarios', payload, {
            headers: {
            "Content-Type": "application/json"
        }
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        throw error;
    }
}