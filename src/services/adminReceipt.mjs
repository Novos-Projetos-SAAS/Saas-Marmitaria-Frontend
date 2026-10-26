import { paymentOrigin } from './paymentOrigins.mjs';

export function validateReceiptUrl(value) {
    if (typeof value !== 'string' || /[\s\p{C}\\]/u.test(value)) throw new Error('Comprovante inválido.');
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.origin !== paymentOrigin('receipt') || url.username || url.password ||
        url.hash || url.search || url.href !== value || url.pathname === '/' || /%(?:2f|5c|2e|25|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) {
        throw new Error('Comprovante inválido.');
    }
    return value;
}

export async function openAdminReceipt(id, fetchReceipt, browser = window) {
    // Reserve the tab in the user gesture; authorize again before any external navigation.
    const tab = browser.open('about:blank', '_blank');
    if (!tab) throw new Error('Permita abrir uma nova aba para consultar o comprovante.');
    try {
        tab.opener = null;
        const meta = tab.document.createElement('meta');
        meta.name = 'referrer'; meta.content = 'no-referrer'; tab.document.head.append(meta);
        tab.document.title = 'Consultando comprovante';
        const url = validateReceiptUrl(await fetchReceipt(id));
        if (tab.closed) return;
        const link = tab.document.createElement('a');
        link.href = url; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer';
        tab.document.body.append(link); link.click();
    } catch (error) {
        if (!tab.closed) {
            tab.document.body.textContent = 'Comprovante indisponível. Volte à página de pedidos.';
            tab.close();
        }
        throw error;
    }
}
