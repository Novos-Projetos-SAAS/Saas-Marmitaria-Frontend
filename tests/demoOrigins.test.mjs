import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentOrigin } from '../src/services/paymentOrigins.mjs';
import { checkoutDestination } from '../src/services/checkoutFlow.mjs';

test('demo payment origins are restricted to explicit development and the fixed local TLS backend',()=>{
    assert.equal(paymentOrigin('checkout',{}),'https://checkout.infinitepay.io');
    assert.equal(paymentOrigin('receipt',{environment:'development',demo:'local-only'}),'https://localhost:55446');
    assert.throws(()=>paymentOrigin('checkout',{environment:'production',demo:'local-only'}));
    assert.throws(()=>paymentOrigin('checkout',{environment:'development',demo:'typo'}));
    assert.throws(()=>checkoutDestination({checkout_url:'https://localhost:55446/__demo/checkout/fake'}));
});
