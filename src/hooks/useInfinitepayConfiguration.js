'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readConfiguration, saveConfiguration, setActivation } from '@/services/infinitepayService.js';

export function useInfinitepayConfiguration() {
    const [configuration, setConfiguration] = useState(null);
    const [form, setForm] = useState({ handle: '', assured_installments: 1 });
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const csrf = useRef('');
    const lock = useRef(false);
    const apply = useCallback(result => {
        setConfiguration(result.data);
        setForm({ handle: result.data.handle || '', assured_installments: result.data.assured_installments ?? 1 });
        if (result.csrf_token) csrf.current = result.csrf_token;
    }, []);
    const refresh = useCallback(async () => {
        setLoading(true); setError('');
        try { apply(await readConfiguration()); }
        catch { setError('Não foi possível consultar a configuração. Atualize a página e confira sua permissão.'); }
        finally { setLoading(false); }
    }, [apply]);
    useEffect(() => {
        let active = true;
        readConfiguration().then(result => { if (active) apply(result); })
            .catch(() => { if (active) setError('Não foi possível consultar a configuração. Atualize a página e confira sua permissão.'); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [apply]);

    async function mutate(action, success) {
        if (lock.current) return;
        lock.current = true; setBusy(true); setError(''); setNotice('');
        try {
            const result = await action();
            if (result.data) apply(result); else apply(await readConfiguration());
            setApiKey(''); setNotice(success);
        } catch (failure) {
            setApiKey('');
            setError(failure.response?.data?.message || 'Não foi possível salvar. Confira os dados e tente novamente.');
        } finally { lock.current = false; setBusy(false); }
    }
    function save(event) {
        event.preventDefault();
        return mutate(() => saveConfiguration({ ...form, handle: form.handle.trim(),
            ...(apiKey ? { api_key: apiKey } : {}) }, csrf.current), 'Configuração salva.');
    }
    function toggle(ativo) {
        return mutate(() => setActivation(ativo, csrf.current), ativo ? 'InfinitePay ativada.' : 'InfinitePay desativada.');
    }
    return { configuration, form, setForm, apiKey, setApiKey, loading, busy, error, notice, refresh, save, toggle };
}
