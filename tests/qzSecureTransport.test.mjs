import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { registerHooks } from 'node:module';

const implementation = await import('../src/services/qzSecureTransport.mjs').catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
    throw error;
});
const stationId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const documentId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const printer = 'SYNTHETIC-TEST-PRINTER';
const signature = 'U1lOVEhFVElDLVNJR05BVFVSRQ==';

function fixture(overrides = {}) {
    assert.equal(typeof implementation.createQzSecureTransport, 'function', 'secure transport must be implemented');
    const requests = [], prints = [], messages = [], hooks = {};
    let active = false, connections = 0, timestamp = Date.now();
    const approved = {
        documentId, stationId, pedidoId: 7, printer,
        params: { printer: { name: printer }, options: { units: 'mm', copies: 1 },
            data: [{ type: 'pixel', format: 'html', flavor: 'plain', data: '<html>SERVER APPROVED</html>' }] },
        expiresAt: new Date(Date.now() + 60000).toISOString()
    };
    const sign = hash => new Promise((resolve, reject) => hooks.sign(hash)(resolve, reject));
    async function signedCall(call, params) {
        const message = JSON.stringify({ call, params, timestamp: timestamp++ });
        messages.push(message);
        const hash = await hooks.hash(message);
        assert.equal(hash, createHash('sha256').update(message).digest('hex'), 'QZ receives actual SHA256, never the preimage');
        return sign(hash);
    }
    const qz = {
        api: { setSha256Type(fn) { hooks.hash = fn; } },
        security: {
            setCertificatePromise(fn, options) { hooks.certificate = fn; hooks.certificateOptions = options; },
            setSignaturePromise(fn) { hooks.sign = fn; },
            setSignatureAlgorithm(value) { hooks.algorithm = value; }
        },
        websocket: {
            isActive: () => active,
            async connect() { connections++; await new Promise(hooks.certificate); active = true; },
            async disconnect() { active = false; }
        },
        printers: { async find(query) { await signedCall('printers.find', { query }); return query; } },
        async print(config, data) {
            const params = { printer: config.getPrinter(), options: config.getOptions(), data };
            await signedCall('print', params); prints.push(params);
        }
    };
    const api = { async post(path, body, config) {
        requests.push({ path, body, config });
        assert.equal(config.withCredentials, true, 'secure calls use the existing cookie session');
        if (path === '/qz/csrf') return { data: { csrfToken: 'SYNTHETIC-CSRF' } };
        assert.equal(config.headers['X-Infinitepay-CSRF'], 'SYNTHETIC-CSRF');
        if (path === '/qz/documento') return { data: structuredClone(approved) };
        if (path === '/qz/prepare') {
            assert.equal(body.stationId, stationId);
            assert.equal(body.request, createHash('sha256').update(body.message).digest('hex'));
            const message = JSON.parse(body.message);
            assert.equal(body.documentId, message.call === 'print' ? approved.documentId : undefined);
            return { data: { intentId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', expiresAt: approved.expiresAt } };
        }
        if (path === '/qz/assinar') {
            assert.deepEqual(Object.keys(body).sort(), ['intentId', 'request']);
            assert.match(body.request, /^[0-9a-f]{64}$/);
            return { data: signature };
        }
        assert.fail('unexpected endpoint: ' + path);
    } };
    const deps = { api, qz, stationId, certificate: 'SYNTHETIC PUBLIC CERTIFICATE', cryptoImpl: webcrypto, ...overrides };
    const transport = implementation.createQzSecureTransport(deps);
    return { transport, api, qz, hooks, approved, requests, prints, messages, signedCall, sign, connections: () => connections };
}

test('candidate printing defaults to disabled and secure-test is never a production mode', async () => {
    assert.equal(typeof implementation.resolveQzSigningMode, 'function');
    for(const env of [undefined,'production','development','unknown'])for(const mode of [undefined,'legacy','secure-test','invalid',''])
        assert.equal(implementation.resolveQzSigningMode(mode,env),'disabled',`${env}/${mode}`);
    assert.equal(implementation.resolveQzSigningMode('secure-test','test'),'secure-test');
    assert.equal(implementation.resolveQzSigningMode('legacy','test'),'disabled');
});

let serviceImport = 0;
async function loadService(mode, f, action, environment='test') {
    const key = '__qzServiceFixture' + serviceImport++, previous = {};
    const env = { NODE_ENV:environment, NEXT_PUBLIC_QZ_SIGNING_MODE: mode, NEXT_PUBLIC_QZ_STATION_ID: stationId, NEXT_PUBLIC_QZ_CERTIFICATE: 'SYNTHETIC PUBLIC CERTIFICATE' };
    for (const [name, value] of Object.entries(env)) {
        previous[name] = process.env[name];
        if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    globalThis[key] = f;
    const hooks = registerHooks({ resolve(specifier, context, next) {
        if (context.parentURL?.includes('/src/services/qzService.js?') && ['qz-tray', './api'].includes(specifier)) {
            const property = specifier === 'qz-tray' ? 'qz' : 'api';
            return { url: 'data:text/javascript,' + encodeURIComponent(`export default globalThis[${JSON.stringify(key)}].${property}`), shortCircuit: true };
        }
        const resolved = next(specifier, context);
        return resolved.url.includes('/src/services/qzService.js?') ? { ...resolved, format: 'module' } : resolved;
    } });
    try { await action(await import('../src/services/qzService.js?' + key)); }
    finally {
        hooks.deregister(); delete globalThis[key];
        for (const [name, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[name]; else process.env[name] = value;
        }
    }
}

test('real qzService never uses legacy signing and only enables the isolated secure test transport', async () => {
    for (const mode of [undefined, 'legacy', 'secure-test', 'typo-secure']) {
        const f = fixture();
        await loadService(mode, f, async service => {
            assert.equal(service.qzPrintingEnabled,mode==='secure-test');
                await assert.rejects(f.sign('a'.repeat(64)));
                if (mode === 'secure-test') await service.imprimirCupom('UNTRUSTED BROWSER HTML', printer, { pedidoId: 7 });
                else await assert.rejects(service.imprimirCupom('', printer, { pedidoId: 7 }));
                assert.equal(f.requests.some(x => x.path === '/qz/assinar' && !x.body.intentId), false);
                assert.equal(f.requests.filter(x => x.path === '/qz/documento').length, mode === 'secure-test' ? 1 : 0);
        });
    }
});

test('production qzService cannot connect, sign or print despite complete public test configuration',async()=>{
    for(const mode of [undefined,'legacy','secure-test']) {
        const f=fixture();
        await loadService(mode,f,async service=>{
            assert.equal(service.qzPrintingEnabled,false);
            await assert.rejects(service.conectarQZ());await assert.rejects(service.imprimirCupom('',printer,{pedidoId:7}));
            assert.equal(f.connections(),0);assert.deepEqual(f.requests,[]);assert.deepEqual(f.prints,[]);
        },'production');
    }
});

test('secure printing uses only server document and exact approved QZ parameters', async () => {
    const f = fixture();
    assert.equal(await f.transport.imprimirCupom('<html>BROWSER TAMPERED</html>', printer, { pedidoId: 7 }), true);
    assert.deepEqual(f.prints, [f.approved.params]);
    assert.equal(f.hooks.algorithm, 'SHA512');
    assert.equal(f.hooks.certificateOptions.rejectOnFailure, true);
    assert.deepEqual(f.requests.map(x => x.path), ['/qz/csrf', '/qz/documento', '/qz/prepare', '/qz/assinar', '/qz/prepare', '/qz/assinar']);
    assert.deepEqual(f.requests[1].body, { stationId, pedidoId: 7 });
    assert.equal(JSON.stringify(f.requests).includes('BROWSER TAMPERED'), false);
});

test('captured digest is consumed once and arbitrary hashes never reach the signer', async () => {
    const f = fixture();
    await f.transport.imprimirCupom('', printer, { pedidoId: 7 });
    const count = f.requests.length;
    await assert.rejects(f.sign(createHash('sha256').update(f.messages.at(-1)).digest('hex')));
    await assert.rejects(f.sign('a'.repeat(64)));
    assert.equal(f.requests.length, count);
});

test('print preimage mutation is rejected before requesting any print intention', async () => {
    for (const mutation of [params => { params.printer.name = 'OTHER'; }, params => { params.printer = { host: '127.0.0.1', port: 9100 }; },
        params => { params.data[0].data = 'ALTERED DOCUMENT'; }, params => { params.options.copies = 2; }]) {
        const f = fixture();
        f.qz.print = async (config, data) => {
            const params = structuredClone({ printer: config.getPrinter(), options: config.getOptions(), data });
            mutation(params); await f.signedCall('print', params);
        };
        await assert.rejects(f.transport.imprimirCupom('', printer, { pedidoId: 7 }));
        assert.equal(f.requests.filter(x => x.path === '/qz/prepare').length, 1, 'only printer discovery may be prepared');
        assert.equal(f.prints.length, 0);
    }
});

test('server document must match the order, station and printer before using Tray', async () => {
    for (const mutate of [doc => { doc.stationId = 'OTHER'; }, doc => { doc.pedidoId = 8; }, doc => { doc.printer = 'OTHER'; },
        doc => { doc.params.printer = { name: printer, host: '127.0.0.1' }; }, doc => { doc.expiresAt = '2000-01-01T00:00:00Z'; }]) {
        const f = fixture(); mutate(f.approved);
        await assert.rejects(f.transport.imprimirCupom('', printer, { pedidoId: 7 }));
        assert.equal(f.connections(), 0); assert.equal(f.prints.length, 0);
    }
});

test('missing secure station, certificate, WebCrypto or order rejects before network or Tray', async () => {
    for (const overrides of [{ stationId: '' }, { stationId: 'not-a-uuid' }, { certificate: '' }, { cryptoImpl: {} }]) {
        const f = fixture(overrides);
        await assert.rejects(f.transport.imprimirCupom('', printer, { pedidoId: 7 }));
        assert.equal(f.requests.length, 0); assert.equal(f.connections(), 0);
    }
    const f = fixture(); await assert.rejects(f.transport.imprimirCupom('', printer));
    assert.equal(f.requests.length, 0); assert.equal(f.connections(), 0);
});

test('missing certificate also rejects a direct connection and certificate callback', async () => {
    const f = fixture({ certificate: '' });
    await assert.rejects(f.transport.conectarQZ());
    await assert.rejects(new Promise(f.hooks.certificate));
    assert.equal(f.connections(), 0);
});

test('discovery must find the exact approved printer', async () => {
    const f = fixture(); f.qz.printers.find = async () => 'OTHER PRINTER';
    await assert.rejects(f.transport.imprimirCupom('', printer, { pedidoId: 7 }));
    assert.equal(f.prints.length, 0);
});

test('session, CSRF and server failures produce safe errors without anonymous fallback', async () => {
    for (const path of ['/qz/csrf', '/qz/documento', '/qz/prepare', '/qz/assinar']) {
        const f = fixture(), original = f.api.post;
        f.api.post = async (...args) => {
            if (args[0] === path) throw new Error('RAW_PRIVATE_REQUEST_AND_SIGNATURE');
            return original(...args);
        };
        await assert.rejects(f.transport.imprimirCupom('', printer, { pedidoId: 7 }), error => !error.message.includes('RAW_PRIVATE'));
        assert.equal(f.prints.length, 0);
        assert.equal(f.requests.some(x => x.path === '/qz/assinar' && !x.body.intentId), false);
    }
});

test('malformed CSRF, expired intent and invalid base64 signature fail closed', async () => {
    for (const [path, data] of [['/qz/csrf', {}], ['/qz/prepare', { intentId: 'intent', expiresAt: '2000-01-01T00:00:00Z' }], ['/qz/assinar', 'not base64!']]) {
        const f = fixture(), original = f.api.post;
        f.api.post = async (...args) => args[0] === path ? { data } : original(...args);
        await assert.rejects(f.transport.imprimirCupom('', printer, { pedidoId: 7 }));
        assert.equal(f.prints.length, 0);
    }
});

test('concurrent jobs are serialized and each print stays bound to its own server document', async () => {
    const f = fixture(), original = f.qz.print, originalPost = f.api.post; const order = [];
    f.api.post = async (...args) => {
        if (args[0] === '/qz/documento' && args[1].pedidoId === 8) {
            f.approved.pedidoId = 8; f.approved.documentId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
            f.approved.params.data[0].data = '<html>SECOND SERVER DOCUMENT</html>';
        }
        return originalPost(...args);
    };
    f.qz.print = async (...args) => { order.push('start'); await new Promise(resolve => setTimeout(resolve, 10)); await original(...args); order.push('end'); };
    await Promise.all([f.transport.imprimirCupom('FIRST', printer, { pedidoId: 7 }), f.transport.imprimirCupom('SECOND', printer, { pedidoId: 8 })]);
    assert.deepEqual(order, ['start', 'end', 'start', 'end']); assert.equal(f.prints.length, 2);
    assert.equal(f.requests.filter(x => x.path === '/qz/documento').length, 2);
    assert.deepEqual(f.requests.filter(x => x.path === '/qz/prepare' && x.body.documentId).map(x => x.body.documentId), [documentId, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd']);
    assert.deepEqual(f.prints.map(x => x.data[0].data), ['<html>SERVER APPROVED</html>', '<html>SECOND SERVER DOCUMENT</html>']);
});

test('timeout aborts pending HTTP, never retries and rejects queued or late work', async () => {
    const f = fixture({ timeoutMs: 20 }); let pendingSignal, release; const original = f.api.post;
    f.api.post = async (path, body, config) => {
        if (path === '/qz/prepare') { pendingSignal = config.signal; await new Promise(resolve => { release = resolve; }); }
        return original(path, body, config);
    };
    const first = f.transport.imprimirCupom('', printer, { pedidoId: 7 });
    const second = f.transport.imprimirCupom('', printer, { pedidoId: 7 });
    const result = await Promise.allSettled([first, second]);
    assert.deepEqual(result.map(x => x.status), ['rejected', 'rejected']);
    assert.equal(pendingSignal.aborted, true); release(); await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(f.requests.filter(x => x.path === '/qz/assinar').length, 0); assert.equal(f.prints.length, 0);
    assert.equal(f.requests.filter(x => x.path === '/qz/documento').length, 1);
});

test('an HTTP timeout quarantines the transport before a queued job can start', async () => {
    const f = fixture(); const original = f.api.post;
    f.api.post = async (...args) => {
        if (args[0] === '/qz/assinar') throw Object.assign(new Error('RAW_PRIVATE_TIMEOUT'), { code: 'ECONNABORTED' });
        return original(...args);
    };
    const results = await Promise.allSettled([f.transport.imprimirCupom('', printer, { pedidoId: 7 }), f.transport.imprimirCupom('', printer, { pedidoId: 7 })]);
    assert.deepEqual(results.map(x => x.status), ['rejected', 'rejected']);
    assert.equal(f.requests.filter(x => x.path === '/qz/documento').length, 1);
    assert.equal(f.prints.length, 0);
});

test('bounded preimage capture rejects unsupported QZ calls and excessive unsigned captures', async () => {
    const f = fixture();
    f.qz.print = async config => {
        await assert.rejects(f.hooks.hash(JSON.stringify({ call: 'file.write', params: {}, timestamp: Date.now() })));
        for (let i = 0; i < 8; i++) await f.hooks.hash(JSON.stringify({ call: 'printers.find', params: { query: printer }, timestamp: Date.now() + i }));
        await assert.rejects(f.hooks.hash(JSON.stringify({ call: 'printers.find', params: { query: printer }, timestamp: Date.now() + 100 })));
        assert.equal(config.getPrinter().name, printer);
    };
    await f.transport.imprimirCupom('', printer, { pedidoId: 7 });
    await assert.rejects(f.hooks.hash(JSON.stringify({ call: 'printers.find', params: { query: printer }, timestamp: Date.now() })));
});
