import {test} from 'node:test';
import assert from 'node:assert/strict';
import {logoutWithFinancialRevocation} from '../src/services/financialLogout.mjs';

test('ordinary logout needs no financial permission or CSRF bootstrap',async()=>{
    const calls=[];
    const result=await logoutWithFinancialRevocation({post:async path=>{calls.push(path);return {data:{status:'success'}};},get(){throw new Error('Unexpected financial call');}});
    assert.equal(result.status,'success');assert.deepEqual(calls,['/auth/logout']);
});
test('a sensitive session obtains CSRF and retries only logout after durable revocation is required',async()=>{
    const calls=[],csrf='a'.repeat(43);let count=0;
    const result=await logoutWithFinancialRevocation({
        async post(path,body,options){calls.push(path);if(!count++)throw {response:{status:409,data:{code:'FINANCIAL_SESSION_CSRF_REQUIRED'}}};
            assert.deepEqual(options,{headers:{'X-Infinitepay-CSRF':csrf}});return {data:{status:'success'}};},
        async get(path){calls.push(path);return {data:{status:'success',data:{csrfToken:csrf}}};}
    });
    assert.equal(result.status,'success');assert.deepEqual(calls,['/auth/logout','/pagamentos/controle-producao/session/logout-csrf','/auth/logout']);
});
test('failed logout, revocation or invalid CSRF never reports success or automatically retries financial operations',async()=>{
    for(const failure of ['network','csrf','revoke']) {
        let count=0;
        await assert.rejects(logoutWithFinancialRevocation({
            async post(){if(failure==='network' || count++)throw new Error('Unavailable');throw {response:{status:409,data:{code:'FINANCIAL_SESSION_CSRF_REQUIRED'}}};},
            async get(){return {data:{status:'success',data:{csrfToken:failure==='csrf'?'bad':'a'.repeat(43)}}};}
        }));
    }
});
