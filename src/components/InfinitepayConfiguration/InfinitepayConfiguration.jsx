'use client';

import {useState} from 'react';
import {CreditCard, RefreshCw, ShieldCheck, ShieldAlert, Clock3} from 'lucide-react';
import {useInfinitepayProductionControl} from '@/hooks/useInfinitepayProductionControl.js';
import storeStyles from '@/app/(dashboard)/admin/configuracoes-loja/ConfiguracoesClient.module.css';
import styles from './InfinitepayConfiguration.module.css';

export default function InfinitepayConfiguration() {
  const {
    configuration, form, setForm, apiKey, setApiKey, loading, busy, error, notice,
    controlError, state, now, saveSettings, enableCheckout, disableCheckout, refresh,
  } = useInfinitepayProductionControl();
  const [confirming, setConfirming] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const expiresIn = state.expiresAt
    ? Math.max(0, Math.ceil((Date.parse(state.expiresAt) - now) / 60000)) : null;
  const updateField = (name, value) => setForm(old => ({...old, [name]: value}));

  function toggleRequested(event) {
    if (event.target.checked) {
      setAcknowledged(false);
      setConfirming(true);
    } else {
      setConfirming(false);
      void disableCheckout();
    }
  }

  async function confirmActivation() {
    if (!acknowledged || busy) return;
    const completed = await enableCheckout();
    if (completed) {setConfirming(false);setAcknowledged(false);}
  }

  return (
    <div className={styles.container}>
      <section className={storeStyles.card} aria-labelledby="infinitepay-status-title">
        <div className={storeStyles.cardHeader}>
          <CreditCard size={22} className={storeStyles.iconeNormal} aria-hidden="true" />
          <h2 className={storeStyles.h2} id="infinitepay-status-title">Status InfinitePay</h2>
        </div>
        <div className={storeStyles.cardBody}>
          <div className={storeStyles.infoBlock}>
            <h3>Pagamento online no aplicativo</h3>
            <p>Controle a criação de novas cobranças Pix e cartão. A autorização de produção exige confirmação administrativa e expira automaticamente.</p>
          </div>
          <div className={storeStyles.toggleWrapper}>
            <label className={storeStyles.switch}>
              <input
                type="checkbox"
                aria-label="Habilitar ou desabilitar checkout InfinitePay"
                checked={state.ready}
                onChange={toggleRequested}
                disabled={loading || busy || (!state.ready && !state.canAttemptActivation)}
              />
              <span className={storeStyles.slider} />
            </label>
            <span className={state.ready ? storeStyles.textoAberto : storeStyles.textoFechado} role="status">
              {loading ? 'Consultando...' : busy ? 'Sincronizando...' : state.ready ? 'InfinitePay Ativada' : 'InfinitePay Desativada'}
            </span>
          </div>
        </div>
        <div className={styles.statusFoot}>
          <div className={styles.statusDescription}>
            {state.ready ? <ShieldCheck size={18} aria-hidden="true"/> : <ShieldAlert size={18} aria-hidden="true"/>}
            <span>
              {state.ready
                ? `Checkout autorizado e worker ativo. Autorização restante: aproximadamente ${expiresIn} minuto(s).`
                : state.halted
                ? 'Controle de produção interrompido. É necessária recuperação administrativa explícita.'
                : configuration?.ativo
                ? 'Configuração comercial ativa, mas checkout indisponível: verifique autorização e worker.'
                : 'Novas cobranças estão bloqueadas. Isso não altera pagamentos já iniciados.'}
            </span>
          </div>
          <button type="button" className={styles.refresh} onClick={() => refresh().catch(() => {})} disabled={busy || loading}>
            <RefreshCw size={16} aria-hidden="true"/> Atualizar status
          </button>
        </div>
      </section>

      {controlError && <p className={styles.warning} role="alert">Não foi possível consultar o controle de produção: {controlError} É necessário ter a permissão <strong>pagamentos.ativar_producao</strong> e acessar o painel por HTTPS.</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {notice && <p className={styles.success} role="status">{notice}</p>}

      {configuration?.ativo && !state.ready && (
        <div className={styles.warning}>
          O campo comercial está ativo, mas a autorização de produção não está efetiva. Nenhum novo checkout deve ser considerado habilitado.
          <button type="button" className={styles.blockButton} onClick={() => disableCheckout()} disabled={busy}>
            Bloquear novas cobranças no banco
          </button>
        </div>
      )}

      {confirming && !state.ready && (
        <section className={styles.confirmPanel} aria-labelledby="confirm-production-title">
          <h3 id="confirm-production-title">Autorizar cobranças reais</h3>
          <p>Esta ação concede, por até <strong>15 minutos</strong>, as capacidades WORKER, CREATE_LINK e VERIFY_PAYMENT ao processo atual, inicia o worker e tenta habilitar novas cobranças no banco. Não há renovação automática. Não autoriza entrega operacional nem impressão.</p>
          <label className={styles.confirmCheckbox}>
            <input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} disabled={busy} />
            <span>Confirmo que estou habilitando pagamentos reais na InfinitePay no ambiente de produção.</span>
          </label>
          <div className={styles.actionRow}>
            <button type="button" onClick={confirmActivation} disabled={!acknowledged || busy || !state.canAttemptActivation}>
              {busy ? 'Validando autorização...' : 'Confirmar ativação'}
            </button>
            <button type="button" className={styles.secondary} onClick={() => {setConfirming(false);setAcknowledged(false);}} disabled={busy}>Cancelar</button>
          </div>
        </section>
      )}

      <section className={styles.settingsPanel} aria-labelledby="infinitepay-settings-title">
        <div className={styles.settingsHeader}>
          <h2 id="infinitepay-settings-title">Configuração da InfinitePay</h2>
          <p>Atualize os dados de integração separadamente. Salvar a configuração não habilita novas cobranças.</p>
        </div>
        {loading || !configuration ? <p>Carregando configuração financeira...</p> : (
          <form className={styles.form} onSubmit={saveSettings}>
            <label>InfiniteTag
              <input value={form.handle} onChange={event=>updateField('handle',event.target.value)} maxLength={150} required autoComplete="off" />
            </label>
            <label>Nova API Key
              <input value={apiKey} onChange={event=>setApiKey(event.target.value)} type="password" maxLength={4096} autoComplete="new-password" spellCheck="false" />
            </label>
            <p className={styles.helper}>{configuration.has_api_key ? 'Existe uma credencial protegida. Deixe a chave em branco para preservá-la.' : 'Cadastre a API Key antes da primeira ativação.'}</p>
            <label>Parcelas com taxas absorvidas
              <input type="number" min="0" max="12" step="1" value={form.assured_installments} onChange={event => updateField('assured_installments',Number(event.target.value))} required />
            </label>
            <div className={styles.actionRow}>
              <button type="submit" disabled={busy || loading}>{busy ? 'Processando...' : 'Salvar configuração'}</button>
            </div>
          </form>
        )}
      </section>
      <p className={styles.note}><Clock3 size={16} aria-hidden="true" /> A autorização expira em até 15 minutos, no logout administrativo ou ao reiniciar o backend. Quando expirar, o seletor voltará a indicar que o checkout está indisponível. Pendências financeiras devem ser verificadas antes de iniciar novo teste.</p>
    </div>
  );
}
