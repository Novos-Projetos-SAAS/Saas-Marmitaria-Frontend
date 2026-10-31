import api from './api';

const base = '/pagamentos/controle-producao';

function secureHeaders(csrf) {
  if (typeof csrf !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(csrf)) {
    throw new Error('Sessão administrativa financeira não verificada.');
  }
  return { 'X-Infinitepay-CSRF': csrf };
}

/** Session-bound, server-validated CSRF. Never persist this in localStorage. */
export async function obtainProductionCsrf() {
  const response = await api.get(
    '/pagamentos/controle-producao/csrf'
  );

  return response.data.data.csrfToken;
}

export async function readProductionControl(csrf) {
  const response = await api.get(base, { headers: secureHeaders(csrf) });
  return response.data.data;
}

/** An explicit administrator action, valid for at most 15 minutes. */
export async function approveProductionCheckout(csrf) {
  const response = await api.post(`${base}/approvals`, {
    capabilities: ['WORKER', 'CREATE_LINK', 'VERIFY_PAYMENT'],
    validForSeconds: 900,
  }, { headers: secureHeaders(csrf) });
  return response.data.data;
}

export async function startAuthorizedFinancialWorker(csrf) {
  const response = await api.post(`${base}/worker/start`, {}, { headers: secureHeaders(csrf) });
  return response.data.data;
}
