
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "react-hot-toast";

import { PedidoProvider } from "../context/PedidoContext.js";

import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: 'Marmitaria',
    description: 'Monte sua marmita quentinha e receba em casa!',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
            <body suppressHydrationWarning>
                <PedidoProvider>
                    {children}
                    {/* TOASTER PREMIUM CUSTOMIZADO */}
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            // Estilo geral da caixinha do Toast
                            style: {
                                background: '#FFFFFF',
                                color: '#18181B', // Zinco 900
                                border: '1px solid #E4E4E7',
                                borderRadius: '6px', // Canto mais reto
                                padding: '16px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            },
                            // Estilo específico para mensagens de Sucesso
                            success: {
                                iconTheme: {
                                    primary: '#065F46', // Verde escuro premium
                                    secondary: '#FFFFFF',
                                },
                            },
                            // Estilo específico para mensagens de Erro (Limites de categoria)
                            error: {
                                iconTheme: {
                                    primary: '#EA580C', // Nosso Laranja Queimado (Accent)
                                    secondary: '#FFFFFF',
                                },
                                style: {
                                    // Dá um leve tom de alerta no fundo quando for erro
                                    backgroundColor: '#FFF7ED',
                                    borderColor: '#FFEDD5',
                                    color: '#EA580C',
                                }
                            },
                        }}
                    />
                </PedidoProvider>
            </body>
        </html>
    );
}
