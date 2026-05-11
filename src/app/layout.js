
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
                    <Toaster position="bottom-right" />
                </PedidoProvider>
            </body>
        </html>
    );
}
