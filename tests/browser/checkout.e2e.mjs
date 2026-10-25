import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, createHash, X509Certificate } from 'node:crypto';
import { readFileSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createServer as httpServer } from 'node:http';
import { createServer as httpsServer } from 'node:https';
import { spawn, execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, join, dirname, basename } from 'node:path';
import { chromium, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

// This is an automated test harness, never an operational server or an H1 command.
const backendRoot = process.env.CHECKOUT_BACKEND_REPOSITORY || fileURLToPath(new URL('../../../Saas-Marmitaria-Backend/', import.meta.url));
const tlsCert = process.env.CHECKOUT_TEST_TLS_CERT, tlsKey = process.env.CHECKOUT_TEST_TLS_KEY;
if (Boolean(tlsCert) !== Boolean(tlsKey)) throw new Error('Informe certificado e chave TLS de teste juntos.');
const origin = (tlsCert ? 'https' : 'http') + '://localhost:55443';
let fixture, appDb, server, next, browser, runtime, backend, io, adminToken, getOrder, chromeLaunchOptions, backendApp, normalApplication;
let scenario = 'AGUARDANDO', calls = 0, deliveryFailure = false, onlineEnabled = true, returnNavigation;
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
    process.env.JWT_SECRET = randomBytes(32).toString('base64');
    await fixture.db('niveis_acesso').insert({ id: 1, nome: 'admin', descricao: 'Teste isolado' });
    await fixture.db('usuarios').insert({ id: 1, nome: 'ADMIN SINTETICO', email: 'browser@invalid.test', senha_hash: 'NO_REAL_LOGIN', nivel_acesso_id: 1, ativo: true });
    const [permission] = await fixture.db('permissoes').insert({ nome: 'admin', descricao: 'Teste isolado' }).returning('*');
    await fixture.db('permissoes_usuarios').insert({ usuario_id: 1, permissao_id: permission.id });
    adminToken = (await load('node_modules/jsonwebtoken/index.js')).default.sign({ id: 1, cargo: 'admin' }, process.env.JWT_SECRET, { expiresIn: '30m' });
    await fixture.db('dados_empresa').insert({ id: 1, nome_proprietario: 'SINTETICO', razao_social: 'SINTETICA', nome_fantasia: 'MARMITARIA SINTETICA',
        cnpj: '00000000000000', telefone_empresa: '11999999999', cep: '00000000', logradouro: 'Rua sintética', numero: '1', bairro: 'Sintético', cidade: 'Sintética', estado: 'SP', imprimir_automaticamente: false });
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
    const app = (await load('src/app.js')).default; backendApp=app; appDb = (await load('src/database/connection.js')).default;
    getOrder = (await load('src/utils/pedidosUtils.js')).buscarPedidoCompletoPorId;
    server = tlsCert ? httpsServer({ cert: readFileSync(tlsCert), key: readFileSync(tlsKey) }, app) : httpServer(app);
    server.prependListener('request', req => {
        if (req.method === 'GET' && req.url.split('?')[0] === '/pagamentos/infinitepay/retorno') {
            returnNavigation = { site: req.headers['sec-fetch-site'], hasOwner: (req.headers.cookie || '').includes('__Host-marmitaria-checkout=') };
        }
    });
    server.listen(0, '127.0.0.1'); await new Promise(done => server.once('listening', done));
    backend = (tlsCert ? 'https://localhost:' : 'http://localhost:') + server.address().port;
    const { createInfinitepayRuntime } = await load('src/infinitepayRuntime.js');
    const { parseObservedInfinitepayEvent } = await load('src/services/infinitepayObservedContracts.js');
    runtime = createInfinitepayRuntime({ db: fixture.db, creationEnabled: async () => onlineEnabled,
        checkoutClient: { async createCheckout({ payload }) {
            returnUrls.set(payload.order_nsu, payload.redirect_url);
            calls++; if (scenario === 'INCERTA') throw new Error('SYNTHETIC_TIMEOUT');
            return { checkoutUrl: 'https://checkout.infinitepay.io/SYNTHETIC-' + calls, invoiceSlug: 'SYNTHETIC-INVOICE-' + payload.order_nsu };
        } }, checkClient: { async checkPayment({ orderNsu }) {
            const payment = await fixture.db('pagamentos').where({ order_nsu: orderNsu }).first();
            return { paid: true, amount: Number(payment.valor_centavos), paidAmount: Number(payment.valor_centavos), installments: 1, captureMethod: 'pix' };
        } }, parseEvent: parseObservedInfinitepayEvent, deliver: async dto => {
            if (deliveryFailure) throw new Error('SYNTHETIC_SOCKET_FAILURE');
            delivered.add(dto.key); io.to('pedidos').emit('novo_pedido_recebido', await getOrder(dto.pedidoId));
        },
        redirectUrl: (tlsCert ? backend : 'https://synthetic-backend.invalid') + '/pagamentos/infinitepay/retorno',
        webhookUrl: (tlsCert ? backend : 'https://synthetic-backend.invalid') + '/pagamentos/infinitepay/webhook',
        successUrl: (tlsCert ? origin : 'https://synthetic-shop.invalid') + '/pedido/sucesso', receiptOrigins: ['https://recibo.infinitepay.io'] });
    app.locals.infinitepayRuntime = runtime;
    const { Server } = await load('node_modules/socket.io/dist/index.js');
    io = new Server(server, { cors: { origin, credentials: true } });
    io.of('/publico');
    io.use((socket, done) => (socket.handshake.headers.cookie || '').split(';').some(value => value.trim() === 'token=' + adminToken) ? done() : done(new Error('Sessão sintética exigida.')));
    io.on('connection', socket => socket.join('pedidos')); global.io = io;
    const tlsArgs = tlsCert ? ['--experimental-https','--experimental-https-cert',tlsCert,'--experimental-https-key',tlsKey,'--experimental-https-ca',tlsCert] : [];
    next = spawn(process.execPath, ['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','55443', ...tlsArgs], {
        cwd: fileURLToPath(new URL('../../', import.meta.url)), windowsHide: true, stdio: ['ignore','pipe','pipe'],
        env: { ...process.env, NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_API_URL: backend,
            NEXT_PUBLIC_SITE_URL: origin, CHECKOUT_SITE_ORIGIN: origin, CHECKOUT_BACKEND_URL: backend,
            NEXT_PUBLIC_QZ_CERTIFICATE: '', INFINITEPAY_ENCRYPTION_KEY: '', INFINITEPAY_ENCRYPTION_KEYS: '' }
    });
    let startup = ''; next.stdout.on('data', data => { startup = (startup + data).slice(-4000); }); next.stderr.on('data', data => { startup = (startup + data).slice(-4000); });
    const deadline = Date.now() + 120000;
    while (true) {
        if (next.exitCode !== null) throw new Error('Next de testes encerrou: ' + startup);
        try { const result = await fetch(origin + '/pedido/sucesso'); if (result.ok) break; } catch {}
        if (Date.now() >= deadline) throw new Error('Timeout ao iniciar Next de testes.');
        await new Promise(done => setTimeout(done, 300));
    }
    const spki = tlsCert && createHash('sha256').update(new X509Certificate(readFileSync(tlsCert)).publicKey.export({ type: 'spki', format: 'der' })).digest('base64');
    chromeLaunchOptions = { channel: 'chrome', headless: process.env.CHECKOUT_BROWSER_HEADED !== '1',
        args: spki ? ['--ignore-certificate-errors-spki-list=' + spki] : [],
        slowMo: process.env.CHECKOUT_BROWSER_HEADED === '1' ? 150 : 0 };
    browser = await chromium.launch(chromeLaunchOptions);
}, { timeout: 180000 });
after(async () => {
    await normalApplication?.stop();
    await browser?.close();
    if (next?.pid && next.exitCode === null) {
        if (process.platform === 'win32') execFileSync('taskkill.exe', ['/PID', String(next.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        else next.kill('SIGTERM');
    }
    server?.closeAllConnections();
    if (io) await new Promise(done => io.close(done));
    if (server?.listening) { server.closeAllConnections(); await new Promise(done => server.close(done)); }
    delete global.io;
    await appDb?.destroy(); await fixture?.close();
});

test('normal application activates through admin and runs real adapters, automatic worker and isolated outbox for Pix and credit', { timeout: 150000 }, async () => {
    const { initializeInfinitepayApplication } = await load('src/infinitepayApplication.js');
    const publicOrigin=tlsCert ? backend : 'https://backend.invalid.test';
    const successOrigin=tlsCert ? origin : 'https://shop.invalid.test';
    const settings={NODE_ENV:'development',INFINITEPAY_MODE:'homologation',DB_HOST:'127.0.0.1',DB_NAME:'infinitepay_phase1_test',INFINITEPAY_DATABASE_NAME:'infinitepay_phase1_test',
        INFINITEPAY_CHECKOUT_ENABLED:'true',INFINITEPAY_PUBLIC_ORIGIN:publicOrigin,INFINITEPAY_SUCCESS_URL:successOrigin+'/pedido/sucesso',
        ALLOWED_ORIGINS:successOrigin,INFINITEPAY_ALLOWED_PUBLIC_ORIGINS:publicOrigin+','+successOrigin};
    let posts=0, checkRequests=0, captureMethod='pix'; const payloads=new Map();
    normalApplication=await initializeInfinitepayApplication({app:backendApp,db:fixture.db,env:settings,transport:async(url,init)=>{
        assert.equal(init.headers['X-Api-Key'],'SYNTHETIC_5A_KEY'); const body=JSON.parse(init.body);
        if(url.endsWith('/links')) {posts++;payloads.set(body.order_nsu,body);return {status:200,json:async()=>({url:'https://checkout.infinitepay.io/SYNTHETIC-NORMAL-'+posts})};}
        checkRequests++;assert.ok(body.order_nsu && body.transaction_nsu && body.slug);
        return {status:200,json:async()=>({success:true,paid:true,amount:2000,paid_amount:captureMethod==='pix'?2000:2100,installments:1,capture_method:captureMethod})};
    }});
    normalApplication.start({intervalMs:50});
    const admin=await adminContext({viewport:{width:390,height:844}}), operator=await admin.newPage();
    try {
        await operator.goto(origin+'/admin/configuracoes-loja');
        await operator.getByRole('button',{name:'InfinitePay',exact:true}).click();
        await operator.getByLabel('InfiniteTag').fill('synthetic-browser');
        await operator.getByLabel('Nova API Key').fill('SYNTHETIC_5A_KEY');
        await operator.getByRole('button',{name:'Salvar configuração InfinitePay'}).click();
        await expect(operator.getByLabel('Nova API Key')).toHaveValue('');
        await operator.getByLabel('Permitir novas cobranças em homologação').check();
        await operator.getByRole('button',{name:'Salvar configuração InfinitePay'}).click();
        await expect.poll(async()=>(await fixture.db('config_infinitepay').first()).ativo).toBe(true);
        for(const [method,capture] of [['Pix','pix'],['Crédito','credit_card']]) {
            captureMethod=capture;
            const buyer=await context(), page=await buyer.newPage();
            try {
                await cart(page,method);await submit(page);await expect(page.getByRole('heading',{name:'Checkout simulado'})).toBeVisible();
                const payment=await fixture.db('pagamentos').orderBy('id','desc').first();
                assert.equal(payment.status,'AGUARDANDO');assert.equal((await fixture.db('pedidos').where({id:payment.pedido_id}).first()).liberado_cozinha_em,null);
                assert.equal(await operator.evaluate(async url=>(await fetch(url,{credentials:'include'})).status,backend+'/pedidos/'+payment.pedido_id+'/operacao'),409);
                const event={event_type:'paid',order_nsu:payment.order_nsu,invoice_slug:'SYNTHETIC-NORMAL-SLUG-'+payment.id,transaction_nsu:'SYNTHETIC-NORMAL-TXN-'+payment.id,
                    receipt_url:'https://recibo.infinitepay.io/SYNTHETIC-NORMAL-TXN-'+payment.id};
                // Turn off new creation while the existing transaction is still awaiting payment.
                if(capture==='credit_card') {settings.INFINITEPAY_CHECKOUT_ENABLED='false';await fixture.db('config_infinitepay').where({id:1}).update({ativo:false});}
                for(let n=0;n<3;n++) assert.equal((await fetch(backend+'/pagamentos/infinitepay/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event)})).status,200);
                await expect.poll(async()=>(await fixture.db('pagamentos').where({id:payment.id}).first()).status).toBe('PAGA');
                await expect.poll(async()=>(await fixture.db('outbox_eventos').where({pedido_id:payment.pedido_id}).first())?.status).toBe('CONCLUIDO');
                assert.equal(Number((await fixture.db('infinitepay_entregas_homologacao').where({pedido_id:payment.pedido_id}).count('* as n').first()).n),1);
                await page.goto(origin+'/pedido/sucesso');await expect(page.getByRole('heading',{name:'Pedido liberado',exact:true})).toBeVisible();
                const canonical=await fixture.db('vw_rel_pedidos_financeiros').where({id:payment.pedido_id}).first();
                assert.equal(Number(canonical.valor_venda),20);assert.equal(canonical.capture_method,capture);
                assert.ok(await getOrder(payment.pedido_id));
            } finally {await buyer.close();}
        }
        assert.equal(posts,2);assert.ok(checkRequests>=2);assert.equal(payloads.size,2);
        assert.equal(await operator.evaluate(()=>window.syntheticPrints),0);
        assert.equal(normalApplication.status().consumer,'isolated');
        await operator.goto(origin+'/admin/pedidos');await expect(operator.getByRole('heading',{name:'Gestão de Pedidos',level:2})).toBeVisible();
    } finally {await normalApplication.stop();backendApp.locals.infinitepayRuntime=runtime;delete backendApp.locals.infinitepayActivation;await admin.close();}
});
async function context(options = {}, profileDirectory) {
    const settings = { viewport: { width: 390, height: 844 }, ...options };
    const ctx = profileDirectory ? await chromium.launchPersistentContext(profileDirectory, { ...chromeLaunchOptions, ...settings }) : await browser.newContext(settings);
    await ctx.addInitScript(() => { window.syntheticPrints = 0; window.print = () => { window.syntheticPrints++; }; });
    await ctx.routeWebSocket('**', socket => {
        const target = new URL(socket.url()); target.protocol = target.protocol === 'wss:' ? 'https:' : 'http:';
        if ([origin, backend].includes(target.origin)) socket.connectToServer(); else socket.close();
    });
    await ctx.route('**/*', route => {
        const target = new URL(route.request().url());
        if (target.origin === 'https://checkout.infinitepay.io' && target.pathname.startsWith('/SYNTHETIC-'))
            return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<h1>Checkout simulado</h1>' });
        if (target.origin === 'https://recibo.infinitepay.io' && target.pathname.startsWith('/SYNTHETIC-'))
            return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<h1>Comprovante sintético autorizado</h1>' });
        if ([origin, backend].includes(target.origin) && !target.pathname.startsWith('/qz/')) return route.continue();
        return route.abort('blockedbyclient');
    });
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
async function adminContext(options = {}) {
    const ctx = await context(options);
    await ctx.addCookies([
        { name: 'token', value: adminToken, domain: 'localhost', path: '/', httpOnly: true, secure: Boolean(tlsCert), sameSite: 'Lax' },
        { name: 'is_logged', value: 'true', domain: 'localhost', path: '/' },
        { name: 'role', value: 'admin', domain: 'localhost', path: '/' }
    ]);
    return ctx;
}
test('browser transport, host-only cookies and CSRF protect a real BFF request', { timeout: 90000 }, async () => {
    const ctx = await context({ viewport: { width: 320, height: 760 } }), page = await ctx.newPage();
    try {
        const response = await page.goto(origin + '/pedido/sucesso');
        assert.equal(await page.evaluate(() => window.isSecureContext), true);
        if (tlsCert) {
            assert.match((await response.securityDetails()).protocol, /^TLS 1\.[23]$/);
            assert.equal(new URL(backend).protocol, 'https:');
        }
        const before = Number((await fixture.db('pedidos').count('* as n').first()).n);
        const result = await page.evaluate(async () => {
            const session = await fetch('/api/checkout/sessao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
            const invalid = await fetch('/api/checkout/pedido', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Checkout-CSRF': 'invalid' }, body: '{}' });
            return { session: session.status, invalid: invalid.status, visible: document.cookie };
        });
        assert.equal(result.session, 200); assert.equal(result.invalid, 403);
        assert.equal(result.visible.includes('__Host-marmitaria-checkout'), false);
        const cookie = (await ctx.cookies()).find(value => value.name === '__Host-marmitaria-checkout');
        assert.ok(cookie.httpOnly && cookie.secure && cookie.sameSite === 'Lax' && cookie.domain === 'localhost' && cookie.path === '/');
        assert.equal(Number((await fixture.db('pedidos').count('* as n').first()).n), before);
    } finally { await ctx.close(); }
});
for (const method of ['Dinheiro','Débito']) test('browser legacy ' + method + ' survives refresh without checkout', { timeout: 90000 }, async () => {
    scenario = 'AGUARDANDO'; const beforeCalls = calls, ctx = await context(), page = await ctx.newPage();
    try {
        await cart(page, method); await submit(page); await expect(page.getByRole('heading', { name: 'Pedido liberado' })).toBeVisible();
        await page.reload(); await expect(page.getByRole('heading', { name: 'Pedido liberado' })).toBeVisible();
        assert.equal(calls, beforeCalls);
    } finally { await ctx.close(); }
});
test('browser Pix and credit preserve the legacy flow when checkout is disabled', { timeout: 90000 }, async () => {
    const beforeCalls = calls; onlineEnabled = false;
    try {
        for (const method of ['Pix', 'Crédito']) {
            const ctx = await context(), page = await ctx.newPage();
            try {
                await cart(page, method); await submit(page); await expect(page.getByRole('heading', { name: 'Pedido liberado' })).toBeVisible();
                const order = await fixture.db('pedidos').orderBy('id', 'desc').first();
                assert.equal(order.fluxo_pagamento, 'POSTERIOR');
            } finally { await ctx.close(); }
        }
        assert.equal(calls, beforeCalls);
    } finally { onlineEnabled = true; }
});
test('narrow cart preserves required fields and presents an uncertain payment without horizontal overflow', { timeout: 90000 }, async () => {
    scenario = 'INCERTA'; const ctx = await context({ viewport: { width: 320, height: 760 } }), page = await ctx.newPage(), beforeCalls = calls;
    try {
        await cart(page); await page.locator('[name=nome]').fill(''); await submit(page);
        assert.equal(await page.locator('[name=nome]').evaluate(input => input.validity.valueMissing), true); assert.equal(calls, beforeCalls);
        await page.locator('[name=nome]').fill('CLIENTE SINTETICO');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        const title = await page.getByRole('heading', { name: 'HOMOLOGACAO SINTETICA', exact: true }).boundingBox();
        const price = await page.getByText('R$ 20,00', { exact: true }).first().boundingBox();
        assert.ok(title.x + title.width <= price.x || price.x + price.width <= title.x || title.y + title.height <= price.y || price.y + price.height <= title.y,
            'Cart title and price must not overlap at 320px.');
        await page.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE3B_CARRINHO_MOBILE.png', import.meta.url)), fullPage: true });
        await submit(page); await expect(page.getByRole('heading', { name: 'Verificação inconclusiva' })).toBeVisible();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE3B_INCERTA_MOBILE.png', import.meta.url)), fullPage: true });
    } finally { scenario = 'AGUARDANDO'; await ctx.close(); }
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
        let destination;
        if (tlsCert) {
            await reopened.goto('https://checkout.infinitepay.io/SYNTHETIC-RETURN');
            await reopened.evaluate(url => {
                const link = document.createElement('a'); link.href = url; link.textContent = 'Retornar à marmitaria'; document.body.appendChild(link);
            }, returned.toString());
            const redirect = reopened.waitForResponse(response => response.url() === returned.toString() && response.status() === 303);
            await reopened.getByRole('link', { name: 'Retornar à marmitaria' }).click();
            const received = await redirect;
            assert.deepEqual(returnNavigation, { site: 'cross-site', hasOwner: true });
            destination = new URL(received.headers().location); assert.equal(destination.origin, origin);
        } else {
            const redirect = await fetch(backend + returned.pathname + returned.search, { redirect: 'manual' });
            assert.equal(redirect.status, 303); destination = new URL(redirect.headers.get('location'));
            await reopened.goto('about:blank'); await reopened.goto(origin + destination.pathname + destination.hash);
        }
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

test('a fully restarted Chrome process recovers the owned order from its persistent HttpOnly cookie', { timeout: 90000 }, async () => {
    scenario = 'AGUARDANDO'; const temp = realpathSync(tmpdir()), profile = mkdtempSync(join(temp, 'marmitaria-fase3b-')), beforeCalls = calls;
    let ctx;
    try {
        ctx = await context({}, profile); const page = await ctx.newPage(); await cart(page); await submit(page);
        await expect(page.getByRole('heading', { name: 'Checkout simulado' })).toBeVisible();
        const owned = (await ctx.cookies()).find(cookie => cookie.name === '__Host-marmitaria-checkout');
        assert.ok(owned?.httpOnly && owned.expires > Date.now() / 1000);
        await ctx.close(); ctx = undefined;
        ctx = await context({}, profile);
        assert.equal((await ctx.cookies()).find(cookie => cookie.name === owned.name)?.value, owned.value);
        const reopened = await ctx.newPage(); await reopened.goto(origin + '/pedido/sucesso');
        await expect(reopened.getByRole('heading', { name: 'Aguardando pagamento' })).toBeVisible();
        assert.equal(calls - beforeCalls, 1); assert.equal(await reopened.evaluate(() => document.cookie.includes('__Host-marmitaria-checkout')), false);
    } finally {
        await ctx?.close();
        const target = realpathSync(profile);
        assert.ok(dirname(target) === temp && basename(target).startsWith('marmitaria-fase3b-'));
        rmSync(target, { recursive: true, maxRetries: 10, retryDelay: 200 });
    }
});

test('admin browser blocks stale unpaid printing and preserves release across socket failure and duplicate events', { timeout: 120000 }, async () => {
    scenario = 'AGUARDANDO'; const buyer = await context(), admin = await adminContext({ viewport: { width: 1280, height: 900 } });
    try {
        const customer = await buyer.newPage(); await cart(customer); await submit(customer);
        await expect(customer.getByRole('heading', { name: 'Checkout simulado' })).toBeVisible();
        const payment = await fixture.db('pagamentos').orderBy('id', 'desc').first();
        const page = await admin.newPage(); let configReads = 0;
        page.on('response', response => { if (response.url() === backend + '/configuracoes/empresa') configReads++; });
        await page.goto(origin + '/admin/pedidos'); await expect(page.getByRole('heading', { name: 'Gestão de Pedidos', level: 2 })).toBeVisible();
        await expect.poll(() => io.of('/').sockets.size).toBe(1);
        assert.equal(await page.getByRole('row').filter({ hasText: '#' + payment.pedido_id }).count(), 0);
        assert.equal(await page.evaluate(async url => (await fetch(url, { credentials: 'include' })).status, backend + '/pedidos/' + payment.pedido_id + '/operacao'), 409);
        assert.equal(await page.evaluate(async url => (await fetch(url, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Em Preparo' }) })).status, backend + '/pedidos/' + payment.pedido_id + '/status'), 409);
        const stale = { ...(await fixture.db('pedidos').where({ id: payment.pedido_id }).first()), cozinha_autorizada: true };
        await page.route(backend + '/pedidos/admin?*', async route => {
            const response = await route.fetch(), body = await response.json(); body.data = [stale]; await route.fulfill({ response, json: body });
        });
        await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
        const staleRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: '#' + payment.pedido_id, exact: true }) });
        await staleRow.getByTitle('Imprimir Comanda').click();
        await expect(page.getByText('Impressão bloqueada: o Backend não autorizou este pedido.')).toBeVisible();
        assert.equal(await page.evaluate(() => window.syntheticPrints), 0); assert.equal(configReads, 0);
        await page.unroute(backend + '/pedidos/admin?*');
        await page.getByRole('button', { name: 'Pagamentos InfinitePay', exact: true }).click();
        let card = page.locator('article').filter({ hasText: 'Pedido #' + payment.pedido_id + ' ·' });
        await expect(card.getByText('Aguardando pagamento', { exact: true })).toBeVisible();
        assert.equal(await card.getByRole('button', { name: /Imprimir/ }).count(), 0);
        deliveryFailure = true;
        const payload = { event_type: 'paid', order_nsu: payment.order_nsu, invoice_slug: payment.invoice_slug, transaction_nsu: 'SYNTHETIC-ADMIN-' + payment.id };
        for (let i = 0; i < 3; i++) assert.equal((await fetch(backend + '/pagamentos/infinitepay/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).status, 200);
        await runtime.processPending({ limit: 5 });
        assert.equal((await fixture.db('pagamentos').where({ id: payment.id }).first()).status, 'PAGA');
        assert.equal((await fixture.db('outbox_eventos').where({ pedido_id: payment.pedido_id }).first()).status, 'ERRO');
        // Fixture receipt has the same independent verification provenance as the synthetic H3 test.
        await fixture.db('pagamentos').where({ id: payment.id }).update({ receipt_url: 'https://recibo.infinitepay.io/' + payload.transaction_nsu });
        await page.getByRole('button', { name: 'Atualizar pagamentos' }).click(); await expect(card.getByText('Pago e liberado', { exact: true })).toBeVisible();
        await card.getByRole('button', { name: 'Consultar comprovante' }).click();
        const receiptPage = page.waitForEvent('popup'); await card.getByRole('link', { name: 'Abrir comprovante autorizado' }).click();
        const receipt = await receiptPage; await expect(receipt.getByRole('heading', { name: 'Comprovante sintético autorizado' })).toBeVisible(); await receipt.close();
        await page.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE3B_ADMIN_DESKTOP.png', import.meta.url)), fullPage: true });
        deliveryFailure = false;
        await fixture.db('outbox_eventos').where({ pedido_id: payment.pedido_id }).update({ proxima_tentativa_em: new Date(0) });
        await runtime.processPending({ limit: 5 });
        const fresh = await getOrder(payment.pedido_id);
        for (let i = 0; i < 3; i++) io.to('pedidos').emit('novo_pedido_recebido', fresh);
        await expect.poll(() => configReads).toBe(1);
        await expect.poll(async () => (await fixture.db('outbox_eventos').where({ pedido_id: payment.pedido_id }).first()).status).toBe('CONCLUIDO');
        assert.equal(Number((await fixture.db('outbox_eventos').where({ pedido_id: payment.pedido_id }).count('* as n').first()).n), 1);
        await page.getByRole('button', { name: 'Pedidos do Dia', exact: true }).click();
        await page.getByPlaceholder('Buscar por Nome, Telefone ou #ID...').fill(String(payment.pedido_id));
        const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: '#' + payment.pedido_id, exact: true }) });
        await expect(row).toBeVisible(); await row.getByTitle('Imprimir Comanda').click();
        await expect.poll(async () => page.evaluate(() => window.syntheticPrints)).toBe(1);
        assert.equal(configReads, 2);
        await page.setViewportSize({ width: 320, height: 760 });
        await page.getByRole('button', { name: 'Pagamentos InfinitePay', exact: true }).click();
        card = page.locator('article').filter({ hasText: 'Pedido #' + payment.pedido_id + ' ·' });
        await expect(card).toBeVisible(); await card.getByRole('button', { name: 'Consultar comprovante' }).click();
        const touchSizes = { tab: (await page.getByRole('button', { name: 'Pagamentos InfinitePay', exact: true }).boundingBox()).height,
            receipt: (await card.getByRole('link', { name: 'Abrir comprovante autorizado' }).boundingBox()).height };
        assert.ok(Object.values(touchSizes).every(height => height >= 48), 'Mobile touch heights: ' + JSON.stringify(touchSizes));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE3B_ADMIN_MOBILE.png', import.meta.url)), fullPage: true });
    } finally { deliveryFailure = false; await buyer.close(); await admin.close(); }
});

test('admin PDV keeps all four payment methods posterior with checkout disabled', { timeout: 120000 }, async () => {
    const ctx = await adminContext(), page = await ctx.newPage(), beforeCalls = calls;
    onlineEnabled = false;
    try {
        await page.goto(origin + '/admin/pedidos');
        for (const method of ['Pix', 'Crédito', 'Dinheiro', 'Débito']) {
            await page.getByRole('button', { name: 'Lançar Pedido Balcão' }).click();
            await page.locator('[name=nome_cliente]').fill('PDV SINTETICO ' + method);
            await page.locator('input[type=tel]').fill('11999999999');
            await page.locator('[name=metodo_pagamento_id]').selectOption({ label: method });
            await page.getByRole('button', { name: 'Especial', exact: true }).click();
            await page.getByRole('dialog').locator('select').first().selectOption({ index: 1 });
            await page.getByRole('button', { name: 'Adicionar ao Pedido', exact: true }).click();
            const saved = page.waitForResponse(response => response.url() === backend + '/pedidos/admin' && response.request().method() === 'POST');
            await page.getByRole('button', { name: 'Confirmar Pedido', exact: true }).click();
            assert.equal((await saved).status(), 201);
            const order = await fixture.db('pedidos').orderBy('id', 'desc').first();
            assert.equal(order.nome_cliente, 'PDV SINTETICO ' + method); assert.equal(order.fluxo_pagamento, 'POSTERIOR');
            assert.ok(await getOrder(order.id)); assert.equal(await fixture.db('pagamentos').where({ pedido_id: order.id }).first(), undefined);
            await expect(page.getByRole('heading', { name: 'Gestão de Pedidos', level: 2 })).toBeVisible();
        }
        assert.equal(calls, beforeCalls); assert.equal(await page.evaluate(() => window.syntheticPrints), 0);
    } finally { onlineEnabled = true; await ctx.close(); }
});

let reportFixture;
async function prepareReports() {
    if (reportFixture) return reportFixture;
    const db = fixture.db, date = '2050-10-25';
    const dateFilters = [{ nome: 'data_inicio', tipo: 'date', label: 'Data inicial' }, { nome: 'data_fim', tipo: 'date', label: 'Data final' }];
    for (const [nome, funcao_db, fields] of [
        ['Faturamento por Período','fn_rel_faturamento_periodo', [['data_faturamento','Data'],['qtd_pedidos','Pedidos'],['total_faturado','Vendas consideradas']]],
        ['Vendas por Tamanho de Marmita','fn_rel_vendas_tamanho', [['tamanho_nome','Tamanho'],['qtd_vendida','Quantidade'],['faturamento_tamanho','Total']]],
        ['Histórico de Vendas','fn_rel_historico_vendas_financeiro', [['pedido_id','Pedido'],['valor_total','Valor do pedido'],['situacao_financeira','Situação'],['valor_considerado','Venda considerada']]]
    ]) await db('catalogo_relatorios').insert({ nome, funcao_db, descricao: 'Catálogo sintético', ativo: true,
        filtros_config: JSON.stringify(dateFilters), colunas_config: JSON.stringify(fields.map(([chave,label]) => ({ chave, label, totalizar: ['qtd_pedidos','total_faturado','valor_considerado'].includes(chave) }))) });
    await db('metodos_pagamento').insert({ id: 15, nome: 'Personalizado sintético', codigo: 'PERSONALIZADO', tipo_financeiro: 'OUTRO' });
    const size = await db('tamanhos_marmitas').first();
    for (let n = 0; n < 10; n++) {
        const [special] = await db('marmitas_especiais').insert({ nome: 'Financeiro especial ' + n, preco: 20 }).returning('*');
        const [order] = await db('pedidos').insert({ nome_cliente: 'RELATORIO SINTETICO ' + n, telefone_cliente: '11999999999',
            tipo_pedido: 'Presencial', metodo_entrega: 'Retirada', metodo_pagamento_id: n === 1 ? 14 : n === 3 ? 15 : 13,
            fluxo_pagamento: n < 6 ? 'POSTERIOR' : 'INFINITEPAY', status: n === 9 ? 'Cancelado' : 'Pendente',
            valor_total: 20, criado_em: date + 'T15:00:00Z' }).returning('*');
        await db('itens_pedido').insert({ pedido_id: order.id, tamanho_marmita_id: n === 0 ? size.id : null,
            marmita_especial_id: n === 0 ? null : special.id, quantidade: 1, preco_unitario: 20, subtotal: 20, nome_item_snapshot: special.nome });
        if (n >= 6) {
            const [payment] = await db('pagamentos').insert({ pedido_id: order.id, tentativa_numero: 1, order_nsu: 'SYNTHETIC-REPORT-' + n,
                status: n === 7 ? 'INCERTA' : n === 8 ? 'ESTORNADA' : 'PAGA', valor_centavos: 2000, valid_until: date + 'T23:00:00Z',
                ...(n === 7 ? {} : { provider_verified_at: date + 'T18:00:00Z', pago_em: date + 'T18:00:00Z',
                    transaction_nsu: 'SYNTHETIC-REPORT-TXN-' + n, invoice_slug: 'SYNTHETIC-REPORT-SLUG-' + n,
                    capture_method: 'credit_card', valor_base_provider_centavos: 2000, valor_pago_provider_centavos: 2100 }),
                ...(n === 8 ? { estornado_em: date + 'T20:00:00Z' } : {}) }).returning('*');
            if (n === 6) {
                await db('pagamentos').insert({ pedido_id: order.id, tentativa_numero: 2, order_nsu: 'SYNTHETIC-REPORT-FAILED', status: 'FALHOU', bloqueia_nova_cobranca: false, valor_centavos: 2000, valid_until: date + 'T23:00:00Z' });
                await db('pagamentos_eventos').insert([1,2].map(x => ({ pagamento_id: payment.id, event_key: 'synthetic-report-repeat-' + x, tipo_evento: 'WEBHOOK' })));
            }
        }
    }
    reportFixture = { date }; return reportFixture;
}

test('financial dashboard preserves configuration, excludes uncertain revenue and renders four specials on mobile', { timeout: 120000 }, async () => {
    const { date } = await prepareReports(), ctx = await adminContext({ viewport: { width: 320, height: 760 } }), page = await ctx.newPage();
    try {
        await page.goto(origin + '/admin');
        await page.locator('#periodo-dashboard').selectOption('personalizado');
        await page.locator('#data-inicio-dashboard').fill(date); await page.locator('#data-fim-dashboard').fill(date);
        const finance = page.getByRole('region', { name: 'Pagamentos InfinitePay' });
        await expect(finance).toContainText('3 · R$'); await expect(finance).toContainText('60,00');
        await expect(finance).toContainText('não informados');
        const dto = await page.evaluate(async url => (await (await fetch(url, { credentials: 'include' })).json()).data, backend + '/dashboard?data_inicio=' + date + '&data_fim=' + date);
        assert.equal(dto.cards.faturamento, 160); assert.equal(dto.graficos.marmitas_especiais.length, 4);
        assert.equal(dto.financeiro.pendentes_verificacao, 1); assert.equal(dto.financeiro.estornos, 1);
        await expect(page.getByRole('heading', { name: 'Tamanhos de marmita mais vendidos' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Marmitas especiais mais vendidas' })).toBeVisible();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.equal((await fixture.db('config_infinitepay').first()).ativo, false);
        await finance.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE4_RESUMO_FINANCEIRO_MOBILE.png', import.meta.url)) });
        await page.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE4_DASHBOARD_MOBILE.png', import.meta.url)), fullPage: true });
    } finally { await ctx.close(); }
});

test('report browser keeps size/special adjacency and exports financial PDF and Excel with unknown amounts intact', { timeout: 120000 }, async () => {
    const { date } = await prepareReports(), ctx = await adminContext({ viewport: { width: 1280, height: 900 } }), page = await ctx.newPage(), beforeCalls = calls;
    try {
        await page.goto(origin + '/admin/relatorios');
        await expect(page.getByRole('heading', { name: 'Painel de Relatórios' })).toBeVisible();
        const rows = await page.getByRole('row').allTextContents();
        assert.equal(rows.findIndex(r => r.includes('Vendas de Marmitas Especiais')), rows.findIndex(r => r.includes('Vendas por Tamanho de Marmita')) + 1);
        for (const type of ['Excel','PDF']) {
            const row = page.getByRole('row').filter({ hasText: 'Pagamentos InfinitePay' });
            if (type === 'Excel') await row.getByTitle('Gerar Excel', { exact: true }).click();
            else {
                await page.setViewportSize({ width: 320, height: 760 });
                await row.getByRole('button', { name: 'Ações do relatório' }).click();
                await page.getByRole('button', { name: 'Gerar PDF', exact: true }).click();
            }
            const form = page.locator('form');
            await form.locator('input[type=date]').nth(0).fill(date); await form.locator('input[type=date]').nth(1).fill(date);
            await form.locator('select').nth(0).selectOption('pedido'); await form.locator('select').nth(1).selectOption('todos');
            const downloadPromise = page.waitForEvent('download');
            await form.getByRole('button', { name: 'Gerar ' + type, exact: true }).click();
            const download = await downloadPromise;
            const bytes = readFileSync(await download.path());
            if (type === 'Excel') {
                const workbook = XLSX.read(bytes, { type: 'buffer' });
                const data = XLSX.utils.sheet_to_json(workbook.Sheets['Relatório']);
                assert.equal(data.length, 4); assert.equal(data.filter(r => r['Situação financeira'] === 'PAGA').length, 2);
                assert.ok(data.every(r => r['Taxas (R$)'] === 'Não informado' && r['Líquido recebido (R$)'] === 'Não informado'));
                assert.equal(data.find(r => r['Situação financeira'] === 'INCERTA')['Base confirmada (R$)'], 'Não informado');
                assert.ok(XLSX.utils.sheet_to_csv(workbook.Sheets['Critérios']).includes('America/Sao_Paulo'));
            } else {
                assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
                assert.ok(bytes.toString('latin1').includes('America/Sao_Paulo'));
                assert.ok(bytes.toString('latin1').includes('INCERTA'));
            }
            assert.ok(!bytes.includes(Buffer.from('SYNTHETIC-REPORT-TXN-')));
        }
        await page.setViewportSize({ width: 1280, height: 900 });
        for (const name of ['Faturamento por Período','Histórico de Vendas']) {
            await page.getByRole('row').filter({ hasText: name }).getByTitle('Gerar Excel', { exact: true }).click();
            const form = page.locator('form');
            await form.locator('input[type=date]').nth(0).fill(date); await form.locator('input[type=date]').nth(1).fill(date);
            const pending = page.waitForEvent('download'); await form.getByRole('button', { name: 'Gerar Excel', exact: true }).click();
            const workbook = XLSX.read(readFileSync(await (await pending).path()), { type: 'buffer' });
            const data = XLSX.utils.sheet_to_json(workbook.Sheets['Relatório']);
            if (name.startsWith('Faturamento')) {
                assert.equal(data[0]['Vendas consideradas'], 'R$ 160,00'); assert.equal(data[0].Pedidos, '10');
                assert.equal(data.at(-1)['Vendas consideradas'], 'R$ 160,00');
            } else {
                const uncertain = data.find(row => row.Situação === 'INCERTA');
                assert.equal(uncertain['Valor do pedido'], 'R$ 20,00'); assert.equal(uncertain['Venda considerada'], 'R$ 0,00');
                assert.equal(data.at(-1)['Venda considerada'], 'R$ 140,00'); assert.equal(data.at(-1)['Valor do pedido'], '-');
            }
        }
        assert.equal(calls, beforeCalls); assert.equal(await page.evaluate(() => window.syntheticPrints), 0);
        await page.screenshot({ path: fileURLToPath(new URL('../../../../outputs/FASE4_RELATORIOS.png', import.meta.url)), fullPage: true });
    } finally { await ctx.close(); }
});
