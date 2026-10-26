import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateReceiptUrl, openAdminReceipt } from '../src/services/adminReceipt.mjs';

test('receipt navigation accepts only canonical HTTPS on the configured receipt origin', () => {
    assert.equal(validateReceiptUrl('https://recibo.infinitepay.io/TRANSACTION'), 'https://recibo.infinitepay.io/TRANSACTION');
    for (const url of [null, '', ' https://recibo.infinitepay.io/X', 'http://recibo.infinitepay.io/X',
        'https://recibo.infinitepay.io.evil.invalid/X', 'https://user@recibo.infinitepay.io/X',
        'https://recibo.infinitepay.io/X?token=private', 'https://recibo.infinitepay.io/X#x',
        'https://recibo.infinitepay.io/%2e%2e/X', 'https://recibo.infinitepay.io/']) {
        assert.throws(() => validateReceiptUrl(url));
    }
});
function browserFixture() {
    const nodes = [], popup = { opener: {}, closed: false, close() { this.closed = true; }, document: {
        head: { append(node) { nodes.push(node); } }, body: { append(node) { nodes.push(node); } },
        createElement(tag) { return { tag, click() { this.clicked = true; } }; }
    } };
    return { popup, nodes, browser: { open(url, target) { assert.equal(url, 'about:blank'); assert.equal(target, '_blank'); return popup; } } };
}
test('tab opens during the click, drops opener/referrer and fetches fresh authorization before navigation', async () => {
    const f = browserFixture(); let resolve, called;
    const pending = openAdminReceipt(42, id => { called = id; assert.equal(f.popup.opener, null); return new Promise(r => resolve = r); }, f.browser);
    assert.equal(called, 42); assert.equal(f.nodes.some(node => node.clicked), false);
    resolve('https://recibo.infinitepay.io/TRANSACTION'); await pending;
    assert.ok(f.nodes.some(node => node.name === 'referrer' && node.content === 'no-referrer'));
    assert.ok(f.nodes.some(node => node.clicked && node.rel === 'noopener noreferrer' && node.referrerPolicy === 'no-referrer'));
});
test('unavailable, stale or invalid receipts close the blank tab without navigating', async () => {
    for (const result of [() => { throw new Error('unavailable'); }, () => 'https://evil.invalid/X']) {
        const f = browserFixture(); await assert.rejects(openAdminReceipt(42, result, f.browser));
        assert.equal(f.popup.closed, true); assert.equal(f.nodes.some(node => node.clicked), false);
    }
    let called = false;
    await assert.rejects(openAdminReceipt(42, () => { called = true; }, { open() { return null; } }));
    assert.equal(called, false);
});
