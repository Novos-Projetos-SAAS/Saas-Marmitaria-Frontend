const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_SHA256 = /^[0-9a-f]{64}$/;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const MAX_PREIMAGES = 8;
const MAX_MESSAGE_BYTES = 2 * 1024 * 1024;

const failure = () => new Error('Impressão QZ segura bloqueada. Verifique a sessão e a configuração de testes.');
const timedOut = () => new Error('Tempo da impressão QZ segura esgotado. Verifique o resultado antes de reiniciar a sessão de testes.');
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const unexpired = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && Date.parse(value) > Date.now();
const sameKeys = (value, keys) => record(value) && Object.keys(value).sort().join(',') === [...keys].sort().join(',');
const canonical = value => JSON.stringify(value, function (_key, item) {
    return record(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item;
});

export function resolveQzSigningMode(value, environment = process.env.NODE_ENV) {
    return environment === 'test' && value === 'secure-test' ? 'secure-test' : 'disabled';
}

// This transport is opt-in for a guarded test backend. The station identifier is
// routing context only; the backend must authorize its owner on every request.
export function createQzSecureTransport({ api, qz, stationId, certificate, cryptoImpl = globalThis.crypto, timeoutMs = 15000 }) {
    let queue = Promise.resolve(), currentJob = null, halted = false;
    const preimages = new Map();

    function requireConfig() {
        if (!UUID.test(stationId || '') || typeof certificate !== 'string' || !certificate.trim() ||
            typeof cryptoImpl?.subtle?.digest !== 'function' || typeof api?.post !== 'function' ||
            !Number.isFinite(timeoutMs) || timeoutMs <= 0 || halted) throw failure();
    }

    function requireActive(job) {
        if (!job || currentJob !== job || !job.active || halted || job.controller.signal.aborted) throw failure();
    }

    function validateMessage(message, job) {
        requireActive(job);
        if (!sameKeys(message, ['call', 'params', 'timestamp']) || !Number.isSafeInteger(message.timestamp)) throw failure();
        if (message.call === 'printers.find') {
            if (!sameKeys(message.params, ['query']) || message.params.query !== job.printer) throw failure();
        } else if (message.call === 'print') {
            if (!job.document || !unexpired(job.document.expiresAt) || canonical(message.params) !== job.approvedParams) throw failure();
        } else throw failure();
    }

    async function sha256(message) {
        try {
            const job = currentJob;
            if (typeof message !== 'string' || message.length > MAX_MESSAGE_BYTES) throw failure();
            validateMessage(JSON.parse(message), job);
            const bytes = new TextEncoder().encode(message);
            if (bytes.byteLength > MAX_MESSAGE_BYTES) throw failure();
            const digest = await cryptoImpl.subtle.digest('SHA-256', bytes);
            requireActive(job);
            const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
            if (preimages.size >= MAX_PREIMAGES || preimages.has(hash)) throw failure();
            preimages.set(hash, { job, message });
            return hash;
        } catch { throw failure(); }
    }

    async function post(job, path, body, csrf) {
        requireActive(job);
        try {
            const response = await api.post(path, body, {
                withCredentials: true, timeout: timeoutMs, signal: job.controller.signal,
                ...(csrf ? { headers: { 'X-Infinitepay-CSRF': csrf } } : {})
            });
            requireActive(job);
            return response.data;
        } catch (error) {
            if (['ECONNABORTED', 'ETIMEDOUT', 'ERR_CANCELED'].includes(error?.code) || error?.name === 'AbortError') {
                halted = true; job.active = false; job.controller.abort();
            }
            throw failure();
        }
    }

    async function sign(hash) {
        const entry = preimages.get(hash);
        // Consume even on refusal. No digest survives a failed prepare/sign step.
        preimages.delete(hash);
        try {
            if (!HEX_SHA256.test(hash) || !entry) throw failure();
            const { job, message } = entry;
            const parsed = JSON.parse(message);
            validateMessage(parsed, job);
            const intent = await post(job, '/qz/prepare', {
                stationId, ...(parsed.call === 'print' ? { documentId: job.document.documentId } : {}),
                message, request: hash
            }, job.csrf);
            if (!record(intent) || typeof intent.intentId !== 'string' || !intent.intentId || !unexpired(intent.expiresAt)) throw failure();
            const signature = await post(job, '/qz/assinar', { intentId: intent.intentId, request: hash }, job.csrf);
            if (typeof signature !== 'string' || !signature || signature.length > 16384 || !BASE64.test(signature)) throw failure();
            return signature;
        } catch { throw failure(); }
    }

    qz.api.setSha256Type(sha256);
    qz.security.setSignatureAlgorithm('SHA512');
    qz.security.setCertificatePromise((resolve, reject) => {
        try { requireConfig(); resolve(certificate.replace(/\\n/g, '\n')); }
        catch { reject(failure()); }
    }, { rejectOnFailure: true });
    qz.security.setSignaturePromise(hash => (resolve, reject) => { sign(hash).then(resolve, reject); });

    async function conectarQZ() {
        try {
            requireConfig();
            if (!qz.websocket.isActive()) await qz.websocket.connect();
        } catch { throw failure(); }
    }

    async function desconectarQZ() {
        try {
            await queue;
            if (qz.websocket.isActive()) await qz.websocket.disconnect();
        } catch { throw failure(); }
    }

    function validateDocument(document, job, pedidoId) {
        const params = document?.params;
        if (!record(document) || !UUID.test(document.documentId || '') || document.stationId !== stationId ||
            document.pedidoId !== pedidoId || document.printer !== job.printer || !unexpired(document.expiresAt) ||
            !sameKeys(params, ['printer', 'options', 'data']) || !sameKeys(params.printer, ['name']) ||
            params.printer.name !== job.printer || !record(params.options) || !Array.isArray(params.data) || params.data.length !== 1 ||
            !sameKeys(params.data[0], ['type', 'format', 'flavor', 'data']) || params.data[0].type !== 'pixel' ||
            params.data[0].format !== 'html' || params.data[0].flavor !== 'plain' || typeof params.data[0].data !== 'string' ||
            !params.data[0].data) throw failure();
        job.document = document;
        job.approvedParams = canonical(params);
    }

    async function execute(job, pedidoId) {
        const csrf = await post(job, '/qz/csrf', {});
        if (!record(csrf) || typeof csrf.csrfToken !== 'string' || !csrf.csrfToken) throw failure();
        job.csrf = csrf.csrfToken;
        const document = await post(job, '/qz/documento', { stationId, pedidoId }, job.csrf);
        validateDocument(document, job, pedidoId);
        await conectarQZ(); requireActive(job);
        const printer = await qz.printers.find(job.printer); requireActive(job);
        if (printer !== job.printer) throw failure();

        // qz.print 2.2.6 reads these two methods. Using the server's complete
        // params avoids configs.create silently merging client-side defaults.
        const params = document.params;
        const config = { getPrinter: () => params.printer, getOptions: () => params.options };
        await qz.print(config, params.data); requireActive(job);
        return true;
    }

    async function run(printer, context) {
        requireConfig();
        if (typeof printer !== 'string' || !printer.trim() || !Number.isSafeInteger(context?.pedidoId) || context.pedidoId <= 0) throw failure();
        const job = { printer, active: true, controller: new AbortController() };
        currentJob = job;
        let timer;
        try {
            return await Promise.race([execute(job, context.pedidoId), new Promise((_resolve, reject) => {
                timer = setTimeout(() => {
                    // A late Tray/HTTP response cannot be safely retried. Quarantine
                    // this transport until an explicit page/session restart.
                    halted = true; job.active = false; job.controller.abort(); reject(timedOut());
                }, timeoutMs);
            })]);
        } catch { throw halted ? timedOut() : failure(); }
        finally {
            clearTimeout(timer); job.active = false; job.controller.abort();
            preimages.clear(); currentJob = null;
        }
    }

    function imprimirCupom(_browserHtml, printer, context) {
        const result = queue.then(() => run(printer, context));
        queue = result.catch(() => {});
        return result;
    }

    return { conectarQZ, desconectarQZ, imprimirCupom };
}
