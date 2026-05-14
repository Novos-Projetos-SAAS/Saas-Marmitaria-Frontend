import api from "./api";

export async function login(email, senha) {

    try {
        // Ajuste a rota '/auth/login' conforme o seu backend
        const response = await api.post('/auth/login', {
            email: email,
            senha: senha
        });

        // O backend geralmente retorna algo como: { status: 'success', data: { token: '...', user: {...} } }
        return response.data;
    } catch (error) {
        console.error("Erro no authService (login):", error);
        // Lança o erro para ser tratado pela tela de Login (ex: mostrar toast de "Senha incorreta")
        throw error;
    }

}


export async function getMe() {
  const { data } = await api.get("/permissoes/me");
  return data;
}


export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        console.error("Erro no authService (logout):", error);
        throw error;
    }
};