import axios from "axios";
import Cookies from "js-cookie";
import chalk from "chalk";
import logSymbols from "log-symbols";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
    },
  withCredentials: true
});

// --- INTERCEPTOR DE REQUISIÇÃO ---
api.interceptors.request.use((config) => {
  const token = Cookies.get('token'); 

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  console.error(logSymbols.error, chalk.red("Erro ao preparar a requisição:"), error.message);
  return Promise.reject(error);
});

// --- INTERCEPTOR DE RESPOSTA ---
api.interceptors.response.use(
  (response) => {
    // Pode descomentar a linha abaixo se quiser ver sucesso em toda requisição
    // console.log(logSymbols.success, chalk.green(`Sucesso [${response.config.method.toUpperCase()}] ${response.config.url}`));
    return response;
  },
  (error) => {
    console.error(logSymbols.error, chalk.red("Erro na resposta da API:"), error.message);

    if (error.response && error.response.status === 401) {
      console.warn(logSymbols.warning, chalk.yellow("Token inválido ou vencido. Redirecionando para login..."));

      if (typeof window !== 'undefined') {
        if (!window.location.pathname.includes('/login')) {
            Cookies.remove('token');
            Cookies.remove('role');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;