/**
 * Read-only projection of the backend's effective, process-bound financial state.
 * A stored config flag is never proof that checkout is authorized.
 */
export function getInfinitepayActivationState(configuration, processing, control, now = Date.now()) {
  const required = ['WORKER', 'CREATE_LINK', 'VERIFY_PAYMENT'];
  const approvals = Array.isArray(control?.approvals) ? control.approvals : [];
  const approval = approvals
    .filter(row => !row.revoked && !row.auditPending &&
      Number.isFinite(Date.parse(row.expiresAt)) && Date.parse(row.expiresAt) > now &&
      required.every(cap => row.effectiveCapabilities?.includes(cap)))
    .sort((a, b) => Date.parse(b.expiresAt) - Date.parse(a.expiresAt))[0] || null;
  const commercialActive = configuration?.ativo === true;
  const workerRunning = processing?.mode === 'production' && processing.running === true;
  const halted = control?.halted === true || control?.auditPending === true;
  const ready = commercialActive && workerRunning && Boolean(approval) && !halted;
  return {
    ready,
    commercialActive,
    workerRunning,
    halted,
    approval,
    expiresAt: approval?.expiresAt ?? null,
    missingCredential: !configuration?.has_api_key || !configuration?.handle,
    canAttemptActivation: Boolean(configuration && control && !halted &&
      configuration.has_api_key && configuration.handle),
  };
}
