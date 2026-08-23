// import axios from "axios";
// import Cookies from "js-cookie";
// import chalk from "chalk";
// import logSymbols from "log-symbols";

// const api = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_API_URL,
//     timeout: 50000,
//     headers: {
//         "Content-Type": "application/json",
//     },
//     withCredentials: true // Garante o envio automático do cookie httpOnly
// });

// // --- INTERCEPTOR DE REQUISIÇÃO ---
// api.interceptors.request.use((config) => {
//     // REMOVIDO: A tentativa manual de ler o token e colocar no Header.
//     // O navegador já faz isso sozinho por causa do withCredentials.
//     return config;
// }, (error) => {
//     console.error(logSymbols.error, chalk.red("Erro ao preparar a requisição:"), error.message);
//     return Promise.reject(error);
// });

// // --- INTERCEPTOR DE RESPOSTA ---
// api.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         const statusCode = error.response?.status;

//         // Erros 4xx são respostas esperadas da API e serão tratados pela tela que fez a requisição.
//         // Somente falhas de conexão e erros internos do servidor aparecem no console.
//         if (!error.response || statusCode >= 500) {
//             console.error(logSymbols.error, chalk.red("Erro na resposta da API:"), error.message);
//         }

//         if (statusCode === 401) {
//             console.warn(logSymbols.warning, chalk.yellow("Token inválido ou vencido. Redirecionando para login..."));

//             if (typeof window !== 'undefined') {
//                 if (!window.location.pathname.includes('/auth/login')) {
//                     Cookies.remove('role');
//                     Cookies.remove('is_logged');
//                     localStorage.removeItem('user');

//                     window.location.href = '/auth/login';

//                     // 👇 A BALA DE PRATA PARA O NEXT.JS NÃO PISCAR O ERRO
//                     // Isso congela a execução e impede que o erro vaze para o componente
//                     return new Promise(() => {});
//                 }
//             }
//         }

//         return Promise.reject(error);
//     }
// );

// export default api;

import axios from "axios";
import Cookies from "js-cookie";
import chalk from "chalk";
import logSymbols from "log-symbols";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 50000,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

// --- INTERCEPTOR DE REQUISIÇÃO ---

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error(
            logSymbols.error,
            chalk.red("Erro ao preparar a requisição:"),
            error.message
        );

        return Promise.reject(error);
    }
);

// --- INTERCEPTOR DE RESPOSTA ---

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Cancelamentos do AbortController são esperados e não representam erro.
        if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
            return Promise.reject(error);
        }

        const statusCode = error.response?.status;

        // Erros 4xx são tratados pela tela responsável pela requisição.
        // Somente falhas de conexão e erros internos aparecem no console.
        if (!error.response || statusCode >= 500) {
            console.error(
                logSymbols.error,
                chalk.red("Erro na resposta da API:"),
                error.message
            );
        }

        if (statusCode === 401) {
            console.warn(
                logSymbols.warning,
                chalk.yellow("Token inválido ou vencido. Redirecionando para login...")
            );

            if (
                typeof window !== "undefined" &&
                !window.location.pathname.includes("/auth/login")
            ) {
                Cookies.remove("role");
                Cookies.remove("is_logged");
                localStorage.removeItem("user");

                window.location.href = "/auth/login";

                return new Promise(() => {});
            }
        }

        return Promise.reject(error);
    }
);

export default api;