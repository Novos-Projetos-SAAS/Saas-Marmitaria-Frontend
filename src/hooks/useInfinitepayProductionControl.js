'use client';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {readInfinitepayConfiguration, saveInfinitepayConfiguration} from '@/services/infinitepayConfigurationService.js';
import {
  obtainProductionCsrf,
  readProductionControl,
  approveProductionCheckout,
  startAuthorizedFinancialWorker,
} from '@/services/infinitepayProductionControlService.js';
import {getInfinitepayActivationState} from '@/utils/infinitepayActivationState.mjs';

function safeError(error) {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  const label = Number.isInteger(status) ? `HTTP ${status}` : 'conexão indisponível';
  const safeCode = typeof code === 'string' && /^[A-Z][A-Z0-9_]{1,59}$/.test(code) ? ` (${code})` : '';
  return `Não foi possível confirmar a operação: ${label}${safeCode}. Confira HTTPS, sessão e autorizações.`;
}

export function useInfinitepayProductionControl() {
  const [configuration, setConfiguration] = useState(null);
  const [configCsrf, setConfigCsrf] = useState('');
  const [processing, setProcessing] = useState(null);
  const [control, setControl] = useState(null);
  const [controlError, setControlError] = useState('');
  const [form, setForm] = useState({handle:'', assured_installments:1});
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());

  const refresh = useCallback(async ({syncForm = false} = {}) => {
    const response = await readInfinitepayConfiguration();
    setConfiguration(response.data);
    setConfigCsrf(response.csrf_token);
    setProcessing(response.processing || null);
    if (syncForm) {
      setForm({handle:response.data.handle || '', assured_installments:response.data.assured_installments});
    }
    let currentControl = null;
    try {
      const csrf = await obtainProductionCsrf();
      currentControl = await readProductionControl(csrf);
      setControl(currentControl);
      setControlError('');
    } catch (controlFailure) {
      setControl(null);
      setControlError(safeError(controlFailure));
    }
    setNow(Date.now());
    return {configuration:response.data, processing:response.processing, control:currentControl};
  }, []);

  useEffect(() => {
    let active = true;
    refresh({syncForm:true}).catch(error => {
      if (active) setError(safeError(error));
    }).finally(() => { if (active) setLoading(false); });
    const timer = setInterval(() => {
      if (!active) return;
      refresh().catch(() => { if (active) setControl(null); });
    }, 30000);
    const clock = setInterval(() => { if (active) setNow(Date.now()); }, 5000);
    return () => {active = false; clearInterval(timer); clearInterval(clock);};
  }, [refresh]);

  const state = useMemo(
    () => getInfinitepayActivationState(configuration, processing, control, now),
    [configuration, processing, control, now]
  );

  async function saveSettings(event) {
    event.preventDefault();
    if (busy || !configuration) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await saveInfinitepayConfiguration({
        handle: form.handle.trim(),
        assured_installments: Number(form.assured_installments),
        ...(apiKey ? {api_key:apiKey} : {}),
      }, configCsrf);
      setApiKey('');
      await refresh({syncForm:true});
      setNotice('Configuração financeira salva. O checkout não foi habilitado por essa ação.');
    } catch (e) {
      setApiKey('');
      setError(safeError(e));
    } finally {setBusy(false);}
  }

  /** Called only after the user explicitly confirms production charges. */
  async function enableCheckout() {
    if (busy || !state.canAttemptActivation) return false;
    setBusy(true); setError(''); setNotice('');
    try {
      // Read again, to avoid granting against a removed or outdated credential.
      const current = await readInfinitepayConfiguration();
      if (!current.data?.has_api_key || !current.data?.handle) {
        throw new Error('Credencial InfinitePay ausente. Salve InfiniteTag e API Key antes de ativar.');
      }
      if (current.data.handle !== form.handle.trim() ||
        current.data.assured_installments !== Number(form.assured_installments) || apiKey) {
        throw new Error('Existem configurações não salvas. Salve a InfiniteTag e as parcelas antes de ativar.');
      }
      const csrf = await obtainProductionCsrf();
      // The server limits approval to 900 seconds, the administrator session
      // and the current backend boot. No automatic renewal or bypass.
      await approveProductionCheckout(csrf);
      await startAuthorizedFinancialWorker(csrf);
      await saveInfinitepayConfiguration({ativo:true}, current.csrf_token);
      const verified = await refresh();
      if (!getInfinitepayActivationState(verified.configuration, verified.processing, verified.control).ready) {
        throw new Error('Ativação não confirmada. Consulte o estado do servidor antes de tentar novamente.');
      }
      setNotice('Checkout InfinitePay autorizado e operacional. A autorização expira em até 15 minutos.');
      return true;
    } catch (e) {
      // No automatic retry, rollback or additional charge on an uncertain result.
      setError(e?.response ? safeError(e) : e.message || 'Falha ao confirmar a ativação.');
      try {await refresh();} catch { /* Preserve original error. */ }
      return false;
    } finally {setBusy(false);}
  }

  async function disableCheckout() {
    if (busy || !configuration?.ativo) return false;
    setBusy(true);setError('');setNotice('');
    try {
      // Disable new charges first. Keep the worker available to reconcile
      // attempts already created while its authorization remains valid.
      await saveInfinitepayConfiguration({ativo:false}, configCsrf);
      const checked = await refresh();
      if (checked.configuration.ativo !== false) throw new Error('Desativação ainda não confirmada.');
      setNotice('Novas cobranças bloqueadas. Pagamentos já iniciados permanecem para verificação.');
      return true;
    } catch (e) {
      setError(e?.response ? safeError(e) : e.message || 'Falha ao confirmar a desativação.');
      try {await refresh();} catch { /* Preserve original error. */ }
      return false;
    } finally {setBusy(false);}
  }

  return {
    configuration, form, setForm, apiKey, setApiKey, loading, busy, error, notice,
    controlError, state, control, processing, now, saveSettings, enableCheckout,
    disableCheckout, refresh,
  };
}
