import test from 'node:test';
import assert from 'node:assert/strict';
import {getInfinitepayActivationState} from '../src/utils/infinitepayActivationState.mjs';
const now = Date.parse('2026-10-30T18:00:00Z');
const conf = { ativo: true, handle: 'minha-tag', has_api_key: true };
const proc = { mode: 'production', running: true };
const grant = { revoked: false, auditPending: false,
  expiresAt: new Date(now + 300000).toISOString(),
  effectiveCapabilities: ['WORKER', 'CREATE_LINK', 'VERIFY_PAYMENT'] };
const ctl = { halted: false, auditPending: false, approvals: [grant] };
test('only live config, worker and approved capabilities produce enabled', () => {
  assert.equal(getInfinitepayActivationState(conf, proc, ctl, now).ready, true);
});
test('a stored active flag alone is insufficient', () => {
  assert.equal(getInfinitepayActivationState(conf, { ...proc, running: false }, ctl, now).ready, false);
  assert.equal(getInfinitepayActivationState({ ...conf, ativo: false }, proc, ctl, now).ready, false);
});
test('expired, revoked, insufficient or halted grants never enable', () => {
  assert.equal(getInfinitepayActivationState(conf, proc, { ...ctl, approvals: [{ ...grant, expiresAt: new Date(now - 1).toISOString() }] }, now).ready, false);
  assert.equal(getInfinitepayActivationState(conf, proc, { ...ctl, approvals: [{ ...grant, revoked: true }] }, now).ready, false);
  assert.equal(getInfinitepayActivationState(conf, proc, { ...ctl, approvals: [{ ...grant, effectiveCapabilities: ['CREATE_LINK', 'WORKER'] }] }, now).ready, false);
  assert.equal(getInfinitepayActivationState(conf, proc, { ...ctl, halted: true }, now).ready, false);
});
test('no credential means activation should not be attempted', () => {
  assert.equal(getInfinitepayActivationState({ ...conf, has_api_key: false }, proc, ctl, now).canAttemptActivation, false);
});
