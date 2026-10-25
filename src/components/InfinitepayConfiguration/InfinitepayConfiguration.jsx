'use client';
import { useInfinitepayConfiguration } from '@/hooks/useInfinitepayConfiguration.js';
import styles from './InfinitepayConfiguration.module.css';

export default function InfinitepayConfiguration() {
    const {configuration,form,setForm,apiKey,setApiKey,available,saving,message,error,save}=useInfinitepayConfiguration();
    const change=(field,value)=>setForm(current=>({...current,[field]:value}));
    return <section className={styles.panel} aria-labelledby="infinitepay-config-title">
        <h2 id="infinitepay-config-title">Configuração InfinitePay</h2>
        <p>Ativação disponível somente em homologação isolada e com os requisitos validados pelo servidor. Desativar novas cobranças preserva a verificação dos pagamentos existentes.</p>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        {!configuration ? <p>Consultando configuração...</p> : <form onSubmit={save} className={styles.form}>
            <label>InfiniteTag<input value={form.handle} onChange={e=>change('handle',e.target.value)} required maxLength={150} autoComplete="off" /></label>
            <label>Nova API Key<input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} maxLength={4096} autoComplete="new-password" spellCheck={false} /></label>
            <small>{configuration.has_api_key ? 'Credencial protegida já cadastrada. Deixe em branco para preservá-la.' : 'Nenhuma credencial cadastrada.'} A chave não é exibida após salvar.</small>
            <label>Parcelas com taxas absorvidas<input type="number" min="0" max="12" step="1" required value={form.assured_installments} onChange={e=>change('assured_installments',Number(e.target.value))} /></label>
            <label className={styles.toggle}><input type="checkbox" checked={form.ativo} disabled={!available && !configuration.ativo} onChange={e=>change('ativo',e.target.checked)} />Permitir novas cobranças em homologação</label>
            {!available && <small>Ativação bloqueada. As configurações podem ser salvas sem habilitar cobranças.</small>}
            <button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar configuração InfinitePay'}</button>
        </form>}
    </section>;
}
