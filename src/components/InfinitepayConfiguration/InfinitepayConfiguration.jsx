'use client';

import { CreditCard, RefreshCw } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext.js';
import { useInfinitepayConfiguration } from '@/hooks/useInfinitepayConfiguration.js';
import styles from './InfinitepayConfiguration.module.css';

export default function InfinitepayConfiguration() {
    const { hasPermission } = useAuthContext();
    const { configuration, form, setForm, apiKey, setApiKey, loading, busy, error, notice, refresh, save, toggle } = useInfinitepayConfiguration();
    const canConfigure = hasPermission('pagamentos.configurar');
    const update = (name, value) => setForm(previous => ({ ...previous, [name]: value }));
    return <div className={styles.container}>
        <section className={styles.panel} aria-labelledby="infinitepay-title">
            <header className={styles.header}><CreditCard size={22} aria-hidden="true" /><h2 id="infinitepay-title">Status InfinitePay</h2></header>
            <div className={styles.body}>
                <h3 aria-live="polite">{loading ? 'Consultando InfinitePay…' : !configuration ? 'Status indisponível' : configuration.ativo ? 'InfinitePay Ativada' : 'InfinitePay Desativada'}</h3>
                {configuration && <p>{configuration.ativo
                    ? 'Pagamentos online habilitados. A InfinitePay permanecerá ativa até você desativá-la.'
                    : 'Novas cobranças online estão desabilitadas.'}</p>}
                {configuration && hasPermission('pagamentos.ativar') && <label className={styles.toggle}>
                    <input type="checkbox" role="switch" checked={configuration.ativo === true} disabled={loading || busy}
                        onChange={event => toggle(event.target.checked)} />
                    <span>Habilitar pagamentos online</span>
                </label>}
                <button className={styles.secondary} type="button" onClick={refresh} disabled={loading || busy}>
                    <RefreshCw size={16} aria-hidden="true" /> Atualizar status
                </button>
            </div>
        </section>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {notice && <p className={styles.success} role="status">{notice}</p>}
        {configuration && canConfigure && <section className={styles.panel} aria-labelledby="infinitepay-settings">
            <header className={styles.header}><h2 id="infinitepay-settings">Configuração da InfinitePay</h2></header>
            <form className={styles.form} onSubmit={save}>
                <label>InfiniteTag<input name="handle" autoComplete="off" spellCheck={false} value={form.handle} required maxLength={150}
                    disabled={busy || loading} onChange={event => update('handle', event.target.value)} /></label>
                <label>Nova API Key<input name="infinitepay_api_key" type="password" autoComplete="new-password" spellCheck={false}
                    value={apiKey} maxLength={4096} disabled={busy || loading} onChange={event => setApiKey(event.target.value)} aria-describedby="api-key-hint" /></label>
                <p className={styles.helper} id="api-key-hint">{configuration.has_api_key ? 'Uma chave protegida está cadastrada. Deixe em branco para preservá-la.' : 'Cadastre a API Key antes de ativar os pagamentos.'}</p>
                <label>Parcelas com taxas assumidas pela loja (0–12)<input name="assured_installments" type="number" min="0" max="12" step="1" required
                    value={form.assured_installments} disabled={busy || loading} onChange={event => update('assured_installments', event.target.value === '' ? '' : Number(event.target.value))} /></label>
                <p className={styles.helper}>De 0 a 12 parcelas. O valor 0 repassa as taxas de parcelamento ao comprador.</p>
                <button type="submit" disabled={busy || loading}>{busy ? 'Salvando…' : 'Salvar configuração'}</button>
            </form>
        </section>}
        <p className={styles.helper}>A desativação impede novas cobranças. Pagamentos já iniciados continuam disponíveis para confirmação.</p>
    </div>;
}
