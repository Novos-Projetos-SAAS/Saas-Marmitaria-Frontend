'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    criarPedido,
    criarPedidoAdmin,
    listarPedidoPorTelefoneUsuario,
    detalharPedidoCliente
} from '@/services/pedidosService.js';

export function usePedidos() {
    const [enviando, setEnviando] = useState(false);
    const [buscando, setBuscando] = useState(false);

    /**
     * FINALIZAR PEDIDO
     * A impressão automática é centralizada no NotificationListener através do Socket.IO.
     */
    const finalizarPedidoNoBanco = async (payload, options = {}) => {
        const admin = options.admin === true;
        setEnviando(true);

        try {
            const response = admin ? await criarPedidoAdmin(payload) : await criarPedido(payload);
            toast.success('Pedido registrado com sucesso!');
            return response;
        } catch (error) {
            const data = error?.response?.data;

            if (data?.code === 'ALIMENTOS_INDISPONIVEIS' || data?.code === 'PRODUTOS_INDISPONIVEIS' || data?.code === 'PRODUTOS_ALTERADOS' || data?.code === 'MARMITAS_ESPECIAIS_ALTERADAS' || data?.code === 'LOJA_FECHADA') {
                return {
                    status: 'conflict',
                    code: data.code,
                    message: data.message,
                    details: data.details || null
                };
            }

            toast.error(data?.message || 'Falha ao registrar pedido no servidor.');
            return null;
        } finally {
            setEnviando(false);
        }
    };

    /**
     * BUSCAR PEDIDO
     */
    const buscarPedidoPorTelefoneUsuario = async (telefone) => {
        setBuscando(true);

        try {
            const numeroLimpo = String(telefone || '').replace(/\D/g, '');

            if (numeroLimpo.length < 10 || numeroLimpo.length > 11) {
                return null;
            }

            return await listarPedidoPorTelefoneUsuario(numeroLimpo);
        } catch (error) {
            console.error('Erro na busca:', error);
            return null;
        } finally {
            setBuscando(false);
        }
    };

    return {
        finalizarPedidoNoBanco,
        buscarPedidoPorTelefoneUsuario,
        buscando,
        enviando
    };
}

export function usePedidosCliente() {
    const [telefone, setTelefone] = useState('');
    const [pedidos, setPedidos] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [erro, setErro] = useState('');
    const [consultou, setConsultou] = useState(false);
    const request = useRef(null);
    const consulta = useRef('');
    const buscar = useCallback(async (value, silent = false) => {
        const phone = String(value || '').replace(/\D/g, '');
        if (!/^\d{10,11}$/.test(phone)) {
            request.current?.abort(); consulta.current = ''; setPedidos([]); setBuscando(false);
            setErro('Informe um telefone válido com DDD.'); return;
        }
        if (silent && request.current) return;
        request.current?.abort();
        const controller = new AbortController(); request.current = controller; consulta.current = phone;
        if (!silent) { setBuscando(true); setPedidos([]); }
        setErro('');
        try {
            const result = await listarPedidoPorTelefoneUsuario(phone, controller.signal);
            if (controller.signal.aborted) return;
            setPedidos(result?.data || []); setConsultou(true);
            try { localStorage.setItem('marmitaria_telefone_cliente', phone); } catch { /* Search works without storage. */ }
        } catch (error) {
            if (!controller.signal.aborted) setErro(error.response?.status === 429
                ? 'Muitas consultas. Aguarde um minuto e tente novamente.' : 'Não foi possível consultar os pedidos. Tente novamente.');
        } finally {
            if (request.current === controller) { request.current = null; setBuscando(false); }
        }
    }, []);
    useEffect(() => {
        const initial = setTimeout(() => {
            try {
                const saved = localStorage.getItem('marmitaria_telefone_cliente');
                if (saved) { setTelefone(saved); void buscar(saved); }
            } catch { /* Manual search remains available. */ }
        }, 0);
        const update = () => { if (!document.hidden && consulta.current) void buscar(consulta.current, true); };
        const timer = setInterval(update, 20000);
        window.addEventListener('focus', update);
        return () => { clearTimeout(initial); clearInterval(timer); request.current?.abort(); window.removeEventListener('focus', update); };
    }, [buscar]);
    return { telefone, setTelefone, pedidos, buscando, erro, consultou, buscar };
}

export function useDetalhesPedido(id) {
    const [state, setState] = useState({ id, pedido: null, carregando: true, erro: '' });
    const refresh = useRef(null);
    useEffect(() => {
        let stopped = false, busy = false;
        const controller = new AbortController();
        async function load(manual = false) {
            if (busy || stopped || document.hidden) return;
            busy = true;
            if (manual) setState(value => ({ ...value, carregando: true }));
            try {
                if (!/^[1-9]\d{0,9}$/.test(String(id)) || Number(id) > 2147483647) {
                    setState({ id, pedido: null, carregando: false, erro: 'Pedido inválido.' }); return;
                }
                const pedido = await detalharPedidoCliente(id, controller.signal);
                if (!stopped) setState({ id, pedido, carregando: false, erro: '' });
            } catch (error) {
                if (!stopped) setState(previous => ({
                    id, pedido: [403, 404].includes(error.response?.status) || String(previous.id) !== String(id) ? null : previous.pedido,
                    carregando: false, erro: [403, 404].includes(error.response?.status)
                        ? 'Acesso protegido. Abra no navegador usado na compra. Em outro navegador, entre em contato com a marmitaria para verificar seu acesso.'
                        : 'Não foi possível atualizar o pedido. Tente novamente.'
                }));
            } finally { busy = false; }
        }
        refresh.current = () => void load(true);
        void load();
        const visible = () => { if (!document.hidden) void load(); };
        const timer = setInterval(visible, 20000);
        document.addEventListener('visibilitychange', visible);
        return () => { stopped = true; controller.abort(); clearInterval(timer); refresh.current = null; document.removeEventListener('visibilitychange', visible); };
    }, [id]);
    const current = String(state.id) === String(id) ? state : { pedido: null, carregando: true, erro: '' };
    return { ...current, atualizar: () => refresh.current?.() };
}
