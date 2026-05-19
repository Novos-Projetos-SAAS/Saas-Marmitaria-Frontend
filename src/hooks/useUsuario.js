'use client';

import { useEffect, useState, useCallback } from 'react';

import { buscarUsuarioPorId } from '@/services/usuariosService.js';

export function useUsuario(usuarioId = null) {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(false);

    const carregarUsuario = useCallback(async (usuarioId) => {

        if (!usuarioId) return;

        try {
            setLoading(true);
            const data = await buscarUsuarioPorId(usuarioId);
            setUsuario(data);
        } catch (error) {
            console.error("Erro no hook useUsuario:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!usuarioId) return

        let isMounted = true;

        const iniciarBusca = async () => { 
            await Promise.resolve();

            if (isMounted) {
                await carregarUsuario(usuarioId);
            }
        }

        iniciarBusca();

        return () => {
            isMounted = false;
        }

    }, [usuarioId, carregarUsuario]);

    return { usuario, loading, refresh: () => carregarUsuario(usuarioId) };
}