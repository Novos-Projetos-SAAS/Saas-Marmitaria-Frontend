
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/** @type {import("next").Metadata} */
export const metadata = {
    metadataBase: new URL(SITE_URL),

    title: {
        default: 'Marmitaria | Marmitas Caseiras e Delivery',
        template: '%s | Marmitaria'
    },

    description: 'Monte sua marmita do seu jeito com comida caseira, ingredientes frescos e muito sabor. Faça seu pedido online para entrega ou retirada.',

    applicationName: 'Marmitaria',

    keywords: [
        'marmitaria',
        'marmita',
        'marmitas',
        'marmita delivery',
        'delivery de marmita',
        'comida caseira',
        'comida brasileira',
        'almoço',
        'marmita personalizada',
        'montar marmita',
        'pedido online',
        'entrega de comida',
        'retirada de marmita'
    ],

    authors: [
        {
            name: 'Marmitaria'
        }
    ],

    creator: 'Marmitaria',
    publisher: 'Marmitaria',
    category: 'food',

    alternates: {
        canonical: '/'
    },

    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1
        }
    },

    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: '/',
        siteName: 'Marmitaria',
        title: 'Marmitaria | Marmitas Caseiras e Delivery',
        description: 'Monte sua marmita do seu jeito com comida caseira, ingredientes frescos e muito sabor. Peça online para entrega ou retirada.',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 630,
                alt: 'Marmitaria - Marmitas Caseiras e Delivery',
                type: 'image/jpeg'
            }
        ]
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Marmitaria | Marmitas Caseiras e Delivery',
        description: 'Monte sua marmita do seu jeito e faça seu pedido online para entrega ou retirada.',
        images: ['/logo.png']
    },

    formatDetection: {
        email: false,
        address: false,
        telephone: false
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
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
