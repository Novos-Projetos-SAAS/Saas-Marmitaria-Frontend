import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';

// This is an automated test harness, never an operational server or an H1 command.
const backendRoot = process.env.CHECKOUT_BACKEND_REPOSITORY || fileURLToPath(new URL('../../../Saas-Marmitaria-Backend/', import.meta.url));
const origin = 'http://localhost:55443';
let fixture, appDb, server, next, browser, runtime, backend, scenario = 'AGUARDANDO', calls = 0;
const delivered = new Set();
const returnUrls = new Map();
const load = path => import(pathToFileURL(resolve(backendRoot, path)).href);
before(async () => {
    if (!process.env.TEST_DATABASE_URL) throw new Error('Defina TEST_DATABASE_URL para PostgreSQL loopback infinitepay_*test descartável.');
    const { createTestDatabase } = await load('tests/helpers/testDatabase.js');
    fixture = await createTestDatabase(); await fixture.db.migrate.latest();
    process.env.NODE_ENV = 'test'; process.env.TEST_DATABASE_SCHEMA = fixture.schema;
    process.env.INFINITEPAY_CHECKOUT_ENABLED = 'false'; process.env.ALLOWED_ORIGINS = origin;
    process.env.INFINITEPAY_ENCRYPTION_KEY = randomBytes(32).toString('base64');
    await fixture.db('status_loja').insert({ id: 1, esta_aberta: true });
    await fixture.db('metodos_pagamento').insert([
        { id: 11, nome: 'Pix', codigo: 'PIX', tipo_financeiro: 'PIX' },
        { id: 12, nome: 'Crédito', codigo: 'CARTAO_CREDITO', tipo_financeiro: 'CREDITO' },
        { id: 13, nome: 'Dinheiro', codigo: 'DINHEIRO', tipo_financeiro: 'DINHEIRO' },
        { id: 14, nome: 'Débito', codigo: 'CARTAO_DEBITO', tipo_financeiro: 'DEBITO' }
    ]);
    await fixture.db('marmitas_especiais').insert({ nome: 'HOMOLOGACAO SINTETICA', descricao: 'Apenas teste automatizado', preco: 20, ativo: true });
    const [category] = await fixture.db('categorias_alimentos').insert({ nome: 'Categoria sintética', limite_escolhas: 1 }).returning('*');
    await fixture.db('alimentos').insert({ nome: 'Arroz sintético', categoria_id: category.id, disponivel_hoje: true });
    await fixture.db('tamanhos_marmitas').insert({ nome: 'Sintética', preco_base: 20 });
    const { encryptApiKey } = await load('src/utils/infinitepayCredentials.js');
    const [credential] = await fixture.db('infinitepay_credenciais').insert({ handle: 'synthetic-browser', ...encryptApiKey('SYNTHETIC_BROWSER_KEY', 'synthetic-browser') }).returning('*');
    await fixture.db('config_infinitepay').where({ id: 1 }).update({ handle: credential.handle, credencial_atual_id: credential.id });
    const app = (await load('src/app.js')).default; appDb = (await load('src/database/connection.js')).default;
    const { createInfinitepayRuntime } = await load('src/infinitepayRuntime.js');
    const { parseObservedInfinitepayEvent } = await load('src/services/infinitepayObservedContracts.js');
    runtime = createInfinitepayRuntime({ db: fixture.db, creationEnabled: async () => true,
        checkoutClient: { async createCheckout({ payload }) {
            returnUrls.set(payload.order_nsu, payload.redirect_url);
            calls++; if (scenario === 'INCERTA') throw new Error('SYNTHETIC_TIMEOUT');
            return { checkoutUrl: 'https://checkout.infinitepay.io/SYNTHETIC-' + calls, invoiceSlug: 'SYNTHETIC-INVOICE-' + payload.order_nsu };
        } }, checkClient: { async checkPayment({ orderNsu }) {
            const payment = await fixture.db('pagamentos').where({ order_nsu: orderNsu }).first();
            return { paid: true, amount: Number(payment.valor_centavos), paidAmount: Number(payment.valor_centavos), installments: 1, captureMethod: 'pix' };
        } }, parseEvent: parseObservedInfinitepayEvent, deliver: async dto => { delivered.add(dto.key); },
        redirectUrl: 'https://synthetic-backend.invalid/pagamentos/infinitepay/retorno', webhookUrl: 'https://synthetic-backend.invalid/pagamentos/infinitepay/webhook',
        successUrl: 'https://synthetic-shop.invalid/pedido/sucesso', receiptOrigins: ['https://recibo.infinitepay.io'] });
    app.locals.infinitepayRuntime = runtime;
    server = app.listen(0, '127.0.0.1'); await new Promise(done => server.once('listening', done));
    backend = 'http://127.0.0.1:' + server.address().port;
    next = spawn(process.execPath, ['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','55443'], {
        cwd: fileURLToPath(new URL('../../', import.meta.url)), windowsHide: true, stdio: ['ignore','pipe','pipe'],
        env: { ...process.env, NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_API_URL: backend,
            NEXT_PUBLIC_SITE_URL: origin, CHECKOUT_SITE_ORIGIN: origin, CHECKOUT_BACKEND_URL: backend,
            INFINITEPAY_ENCRYPTION_KEY: '', INFINITEPAY_ENCRYPTION_KEYS: '' }
    });
    let startup = ''; next.stdout.on('data', data => { startup = (startup + data).slice(-4000); }); next.stderr.on('data', data => { startup = (startup + data).slice(-4000); });
    const deadline = Date.now() + 120000;
    while (true) {
        if (next.exitCode !== null) throw new Error('Next de testes encerrou: ' + startup);
        try { const result = await fetch(origin + '/pedido/sucesso'); if (result.ok) break; } catch {}
        if (Date.now() >= deadline) throw new Error('Timeout ao iniciar Next de testes.');
        await new Promise(done => setTimeout(done, 300));
    }
    browser = await chromium.launch({ channel: 'chrome', headless: process.env.CHECKOUT_BROWSER_HEADED !== '1',
        slowMo: process.env.CHECKOUT_BROWSER_HEADED === '1' ? 150 : 0 });
}, { timeout: 180000 });
after(async () => {
    await browser?.close();
    if (next?.pid && next.exitCode === null) {
        if (process.platform === 'win32') execFileSync('taskkill.exe', ['/PID', String(next.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        else next.kill('SIGTERM');
    }
    if (server) { server.closeAllConnections(); await new Promise(done => server.close(done)); }
    await appDb?.destroy(); await fixture?.close();
});
async function context(options = {}) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
    await ctx.route('https://checkout.infinitepay.io/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Checkout simulado</h1>' }));
    await ctx.route('https://api.checkout.infinitepay.io/**', () => assert.fail('API financeira real proibida'));
    return ctx;
}
async function cart(page, method = 'Pix') {
    try {
    await page.goto(origin + '/pedido');
    await page.getByRole('button', { name: 'Adicionar HOMOLOGACAO SINTETICA ao pedido' }).click();
    await page.getByRole('button', { name: /Avançar/ }).click();
    await page.getByRole('button', { name: /Ir ao carrinho/ }).click();
    await page.locator('[name=nome]').fill('CLIENTE SINTETICO');
    await page.locator('input[type=tel]').fill('11999999999');
    await page.locator('[name=metodo_entrega]').selectOption('Retirada');
    await page.locator('[name=metodo_pagamento_id]').selectOption({ label: method });
    } catch (error) {
        console.info('Synthetic browser failure: ' + (await page.locator('body').innerText()).slice(0, 2500));
        await page.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE3A_BROWSER_FALHA.png', import.meta.url)), fullPage: true });
        throw error;
    }
}
async function submit(page) { await page.getByRole('button', { name: /Confirmar Pedido/ }).click(); }
for (const method of ['Dinheiro','Débito']) test('browser legacy ' + method + ' survives refresh without checkout', { timeout: 90000 }, async () => {
    scenario = 'AGUARDANDO'; const beforeCalls = calls, ctx = await context(), page = await ctx.newPage();
    try {
        await cart(page, method); await submit(page); await expect(page.getByRole('heading', { name: 'Pedido liberado' })).toBeVisible();
        await page.reload(); await expect(page.getByRole('heading', { name: 'Pedido liberado' })).toBeVisible();
        assert.equal(calls, beforeCalls);
    } finally { await ctx.close(); }
});
test('browser Pix keeps secure cookies, receives delayed verified payment without return and restores after close', { timeout: 90000 }, async () => {
    scenario = 'AGUARDANDO'; const ctx = await context(), page = await ctx.newPage();
    let restored;
    try {
        await cart(page); await submit(page); await expect(page.getByRole('heading', { name: 'Checkout simulado' })).toBeVisible();
        const state = await ctx.storageState(); const cookie = state.cookies.find(value => value.name === '__Host-marmitaria-checkout');
        assert.ok(cookie?.httpOnly && cookie.secure && cookie.sameSite === 'Lax' && cookie.expires > Date.now() / 1000);
        await ctx.close(); restored = await context({ storageState: state }); const reopened = await restored.newPage();
        await reopened.goto(origin + '/pedido/sucesso'); await expect(reopened.getByRole('heading', { name: 'Aguardando pagamento' })).toBeVisible();
        assert.equal(await reopened.evaluate(() => document.cookie.includes('__Host-marmitaria-checkout')), false);
        const payment = await fixture.db('pagamentos').orderBy('id','desc').first();
        const payload = { event_type: 'paid', order_nsu: payment.order_nsu, invoice_slug: payment.invoice_slug, transaction_nsu: 'SYNTHETIC-TX-' + payment.id };
        for (let i = 0; i < 3; i++) assert.equal((await fetch(backend + '/pagamentos/infinitepay/webhook', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) })).status, 200);
        await runtime.processPending({ limit: 5 });
        await reopened.getByRole('button', { name: 'Atualizar verificação' }).click(); await expect(reopened.getByRole('heading', { name: 'Pedido liberado' })).toBeVisible();
        assert.equal(Number((await fixture.db('outbox_eventos').where({ pedido_id: payment.pedido_id }).count('* as n').first()).n), 1);
        assert.ok(delivered.has('pedido_liberado:' + payment.pedido_id));
        assert.equal((await fixture.db('config_infinitepay').first()).ativo, false);
        // Synthetic stored receipt represents the previously homologated H3 provenance; payment_check has no receipt field.
        await fixture.db('pagamentos').where({ id: payment.id }).update({ receipt_url: 'https://recibo.infinitepay.io/' + payload.transaction_nsu });
        const returned = new URL(returnUrls.get(payment.order_nsu));
        returned.searchParams.set('order_nsu', payment.order_nsu); returned.searchParams.set('transaction_nsu', payload.transaction_nsu); returned.searchParams.set('slug', payment.invoice_slug);
        const destination = new URL(await runtime.receiveReturn(Object.fromEntries(returned.searchParams)));
        await reopened.goto('about:blank');
        await reopened.goto(origin + destination.pathname + destination.hash);
        await expect(reopened.getByRole('link', { name: 'Ver comprovante' })).toBeVisible();
        assert.ok(new URL(reopened.url()).searchParams.get('requisicao'));
        // Another tab may replace the shared read cookie; this tab must retain its owned order.
        const statusCookie = (await restored.cookies()).find(value => value.name === '__Host-marmitaria-status');
        await restored.addCookies([{ ...statusCookie, value: randomBytes(32).toString('base64url') }]);
        await reopened.reload(); await expect(reopened.getByRole('link', { name: 'Ver comprovante' })).toBeVisible();
        const stranger = await context();
        try {
            const ref = new URLSearchParams(destination.hash.slice(1)).get('ref');
            const checked = await fetch(origin + '/api/checkout/status', { headers: { 'X-Checkout-Status': ref } });
            assert.equal(checked.status, 200, 'BFF STATUS-only lookup: ' + await checked.text());
            const reader = await stranger.newPage(); await reader.goto(origin + destination.pathname + destination.hash);
            await expect(reader.getByRole('heading', { name: 'Pedido liberado' })).toBeVisible();
            assert.equal(await reader.getByRole('link', { name: 'Ver comprovante' }).count(), 0);
            assert.equal(new URL(reader.url()).hash, destination.hash);
        } finally { await stranger.close(); }
        await reopened.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE3A_MOBILE.png', import.meta.url)), fullPage: true });
    } finally { await restored?.close(); if (!restored) await ctx.close(); }
});
test('browser lost creation response recovers INCERTA with one simulated provider call', { timeout: 90000 }, async () => {
    scenario = 'INCERTA'; const beforeCalls = calls, ctx = await context(), page = await ctx.newPage();
    try {
        await ctx.route('**/api/checkout/pedido', async route => { await route.fetch(); await route.abort('failed'); });
        await cart(page, 'Crédito'); await submit(page);
        await expect(page.getByRole('heading', { name: 'Verificação inconclusiva' })).toBeVisible();
        await page.reload(); await expect(page.getByRole('heading', { name: 'Verificação inconclusiva' })).toBeVisible();
        assert.equal(calls - beforeCalls, 1);
    } finally { await ctx.close(); }
});
test('two browser tabs cannot create two orders from the shared intention', { timeout: 90000 }, async () => {
    scenario = 'AGUARDANDO'; const beforeCalls = calls, ctx = await context({ viewport: { width: 1280, height: 900 } });
    try {
        const first = await ctx.newPage(), second = await ctx.newPage(); await Promise.all([cart(first), cart(second)]);
        await first.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE3A_CARRINHO_DESKTOP.png', import.meta.url)), fullPage: true });
        await Promise.all([submit(first), submit(second)]);
        await expect(first.getByRole('heading', { name: 'Checkout simulado' })).toBeVisible();
        await expect(second.getByRole('heading', { name: 'Checkout simulado' })).toBeVisible();
        assert.equal(calls - beforeCalls, 1);
    } finally { await ctx.close(); }
});
test('browser credit opens only the simulated backend-validated checkout', { timeout: 90000 }, async () => {
    scenario = 'AGUARDANDO'; const beforeCalls = calls, ctx = await context(), page = await ctx.newPage();
    try {
        await cart(page, 'Crédito'); await submit(page); await expect(page.getByRole('heading', { name: 'Checkout simulado' })).toBeVisible();
        assert.equal(calls - beforeCalls, 1);
    } finally { await ctx.close(); }
});
