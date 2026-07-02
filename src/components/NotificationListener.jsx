'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { io } from "socket.io-client";
import toast from "react-hot-toast";

export default function NotificationListener() {

    const router = useRouter();
    
    useEffect(() => {
        // Conecta ao seu backend Node.js
        const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333");

        socket.on('novo_pedido_recebido', (novoPedido) => {
            // 1. Toca o sinal sonoro globalmente
            const audio = new Audio('/sons/campainha.mp3');
            audio.play().catch(() => {
                console.log("Áudio bloqueado pelo navegador. Aguardando interação do usuário.");
            });

            // 2. Exibe o Toast na tela (vai aparecer por cima de qualquer página)
            toast.success(
                (t) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span>
                            📢 Novo Pedido <b>#{novoPedido.id}</b> de <b>{novoPedido.nome_cliente}</b>!
                        </span>
                        
                        <button
                            onClick={() => {
                                toast.dismiss(t.id); // Esconde o toast
                                router.push('/admin/pedidos'); // Redireciona para a tela de pedidos
                            }}
                            style={{
                                backgroundColor: '#ea580c', // Laranja que combina com o seu sistema
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#c2410c'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#ea580c'}
                        >
                            Ver Pedido
                        </button>
                    </div>
                ), {
                duration: 7000, // 7 segundos para dar tempo do admin ver
                position: "top-right",
                id: `toast-pedido-${novoPedido.id}` // Evita múltiplos toasts para o mesmo pedido
            });
        });

        // Só desconecta se o admin fechar o sistema ou fizer logout
        return () => {
            socket.disconnect();
        };
    }, [router]);

    return null; // Componente invisível, não afeta o design
}