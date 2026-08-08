'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { renderToString } from 'react-dom/server';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { buscarDadosEmpresa } from '@/services/dadosEmpresaService.js';
import { imprimirCupom } from '@/services/qzService.js';
import CupomPedido from '@/components/CupomPedido/cupomPedido';

export default function NotificationListener() {
    const router = useRouter();
    const filaImpressaoRef = useRef(Promise.resolve());
    const pedidosRecebidosRef = useRef(new Set());

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333', { withCredentials: true });

        // Adiciona o pedido em uma fila FIFO para impedir duas chamadas simultâneas ao QZ Tray.
        const enfileirarImpressao = pedido => {
            if (!pedido?.id || pedidosRecebidosRef.current.has(pedido.id)) return;

            pedidosRecebidosRef.current.add(pedido.id);

            // Mantém uma proteção simples contra eventos duplicados sem deixar o Set crescer indefinidamente.
            if (pedidosRecebidosRef.current.size > 500) {
                const primeiroPedidoId = pedidosRecebidosRef.current.values().next().value;
                pedidosRecebidosRef.current.delete(primeiroPedidoId);
            }

            filaImpressaoRef.current = filaImpressaoRef.current.then(async () => {
                const resEmpresa = await buscarDadosEmpresa();
                const config = resEmpresa?.data;

                if (!config?.imprimir_automaticamente || !config?.nome_impressora) return;

                const htmlDoCupom = renderToString(<CupomPedido pedido={pedido} />);
                await imprimirCupom(htmlDoCupom, config.nome_impressora);
                console.log(`🖨️ Pedido #${pedido.id} enviado para impressão automática.`);
            }).catch(error => {
                console.error(`Erro ao imprimir automaticamente o pedido #${pedido.id}:`, error);
                toast.error(`Pedido #${pedido.id} recebido, mas não foi possível imprimir automaticamente.`, { id: `print-error-${pedido.id}` });
            });
        };

        socket.on('novo_pedido_recebido', novoPedido => {
            const audio = new Audio('/sons/campainha.mp3');
            audio.play().catch(() => console.log('Áudio aguardando interação do usuário.'));

            toast.success(t => (
                <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <span>📢 Novo Pedido <b>#{novoPedido.id}</b> de <b>{novoPedido.nome_cliente}</b></span>
                    <button type="button" onClick={() => { toast.dismiss(t.id); router.push('/admin/pedidos'); }} style={{ backgroundColor: '#EA580C', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Ver Pedido</button>
                </div>
            ), { duration: 7000, position: 'top-right', id: `toast-pedido-${novoPedido.id}` });

            window.dispatchEvent(new CustomEvent('marmitaria:pedidos-atualizados'));
            enfileirarImpressao(novoPedido);
        });

        socket.on('pedido_atualizado', () => {
            window.dispatchEvent(new CustomEvent('marmitaria:pedidos-atualizados'));
        });

        socket.on('connect_error', error => {
            console.warn('Socket administrativo indisponível:', error.message);
        });

        return () => socket.disconnect();
    }, [router]);

    return null;
}
