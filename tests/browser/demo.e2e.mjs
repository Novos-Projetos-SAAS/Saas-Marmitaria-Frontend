import { before,after,test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash,X509Certificate } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium,expect,request } from '@playwright/test';

const shop='https://localhost:55445',backend='https://localhost:55446';
let browser,admin,operator,db,profile,spki;
async function context(options={}){
    const ctx=await browser.newContext({viewport:{width:390,height:844},...options});
    await ctx.route('**/*',route=>[shop,backend].includes(new URL(route.request().url()).origin)?route.continue():route.abort());
    await ctx.routeWebSocket('**',socket=>{
        const url=new URL(socket.url());url.protocol=url.protocol==='wss:'?'https:':'http:';
        if([shop,backend].includes(url.origin))socket.connectToServer();else socket.close();
    });
    return ctx;
}
before(async()=>{
    profile=JSON.parse(await readFile(new URL('../../../infinitepay-demo-private/profile.json',import.meta.url),'utf8'));
    assert.equal(profile.purpose,'INFINITEPAY_LOCAL_SIMULATION_ONLY');
    const healthClient=await request.newContext({ignoreHTTPSErrors:true});
    try{const health=await(await healthClient.get(backend+'/__demo/health')).json();assert.equal(health.purpose,profile.purpose);assert.equal(health.schema,'infinitepay_demo');}
    finally{await healthClient.dispose();}
    const cert=await readFile(new URL('../../../infinitepay-demo-private/localhost.pem',import.meta.url));
    spki=createHash('sha256').update(new X509Certificate(cert).publicKey.export({type:'spki',format:'der'})).digest('base64');
    browser=await chromium.launch({channel:'chrome',headless:true,args:['--ignore-certificate-errors-spki-list='+spki]});
    const {default:knex}=await import(new URL('../../../Saas-Marmitaria-Backend/node_modules/knex/knex.mjs',import.meta.url));
    db=knex({client:'pg',connection:{host:'127.0.0.1',port:55439,database:'infinitepay_phase1_test',user:'codex_test'},searchPath:['infinitepay_demo']});
    admin=await context({viewport:{width:1366,height:900}});operator=await admin.newPage();
    await operator.goto(shop+'/auth/login');
    await operator.waitForFunction(()=>Object.keys(document.querySelector('button[type=submit]')||{}).some(key=>key.startsWith('__reactProps')));
    await operator.getByLabel('E-mail de acesso').fill('admin@demo.invalid');await operator.getByLabel('Senha',{exact:true}).fill(profile.adminPassword);
    await operator.getByRole('button',{name:'Acessar Painel',exact:true}).click();
    await operator.waitForURL(shop+'/admin');
},{timeout:120000});
after(async()=>{await admin?.close();await browser?.close();await db?.destroy();});
async function cart(page,method,{common=false,complement=false,name='DEMO NAVEGADOR '+method}={}){
    await page.goto(shop+'/pedido');
    if(common){
        await page.getByRole('heading',{name:'Marmita M',exact:true}).click();
        for(const food of ['Arroz branco DEMO','Feijão DEMO','Frango DEMO','Salada DEMO'])await page.getByRole('button',{name:new RegExp(food)}).click();
        await page.getByRole('button',{name:'Avançar',exact:true}).click();await page.getByRole('button',{name:/Adicionar ao carrinho/}).click();
        await expect(page).toHaveURL(shop+'/pedido/complementos');
    }else{
        await page.getByRole('button',{name:'Adicionar DEMO Frango ao pedido',exact:true}).click();await page.getByRole('button',{name:/Avançar/}).click();
    }
    if(complement)await page.locator('article').filter({has:page.getByRole('heading',{name:'Água DEMO',exact:true})}).getByRole('button',{name:'Adicionar',exact:true}).click();
    await page.getByRole('button',{name:/Ir ao carrinho/}).click();
    await page.locator('[name=nome]').fill(name);await page.locator('input[type=tel]').fill('11999999999');
    await page.locator('[name=metodo_entrega]').selectOption('Retirada');await page.locator('[name=metodo_pagamento_id]').selectOption({label:method});
}
async function mode(value){
    await operator.goto(backend+'/__demo');await operator.locator('#mode').selectOption(value);await operator.getByRole('button',{name:'Aplicar ao próximo checkout'}).click();
    await expect(operator.getByRole('status')).toContainText('registrada');
}
test('persistent demo preserves normal screens, local-only security, admin, desktop and mobile',async()=>{
    const response=await operator.goto(shop+'/admin');const csp=response.headers()['content-security-policy'];
    await expect(operator.getByRole('note',{name:'Demonstração local'})).toContainText('Não cadastre API Key real');
    await expect(operator.getByRole('heading',{name:'Visão geral da marmitaria',exact:true})).toBeVisible();
    await expect(operator.getByRole('heading',{name:'Indicadores principais',exact:true})).toBeVisible();
    assert.ok(csp.includes('connect-src'));assert.ok(!csp.includes('allow-modals'));assert.ok(!csp.includes('8181'));
    await operator.screenshot({path:fileURLToPath(new URL('../../../../outputs/phase5b-demo-desktop.png',import.meta.url)),fullPage:true});
    await operator.goto(backend+'/__demo');
    assert.equal(await operator.evaluate(async()=>(await fetch('/qz/assinar',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'})).status),403);
    assert.equal(await operator.evaluate(async()=> (await fetch('/__demo/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'PENDING'})})).status),403);
    const ctx=await context(),page=await ctx.newPage();
    try{
        const unauthorized=await page.goto(backend+'/__demo');assert.equal(unauthorized.status(),401);
        await page.goto(shop+'/pedido');await expect(page.getByRole('heading',{name:'Marmita M',exact:true})).toBeVisible();
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await page.screenshot({path:fileURLToPath(new URL('../../../../outputs/phase5b-demo-mobile.png',import.meta.url)),fullPage:true});
    }finally{await ctx.close();}
},{timeout:90000});
test('manual Pix, credit, cash and debit work with common/special meals, complements, backend proof and synthetic receipts',async()=>{
    await mode('PENDING');
    for(const [index,method]of ['Pix','Cartão de Crédito','Dinheiro','Cartão de Débito'].entries()){
        const ctx=await context(),page=await ctx.newPage();
        try{
            await cart(page,method,{common:index===0,complement:index===0});await page.getByRole('button',{name:/Confirmar Pedido/}).click();
            if(index<2){
                await expect(page.getByRole('heading',{name:'Checkout simulado',exact:true})).toBeVisible();
                const token=new URL(page.url()).pathname.split('/').at(-1),link=await db('demo_checkout_links').where({token}).first();
                const payment=await db('pagamentos').where({order_nsu:link.order_nsu}).first();assert.equal(payment.status,'AGUARDANDO');
                assert.equal((await db('pedidos').where({id:payment.pedido_id}).first()).liberado_cozinha_em,null);
                assert.equal(await operator.evaluate(async url=>(await fetch(url,{credentials:'include'})).status,backend+'/pedidos/'+payment.pedido_id+'/operacao'),409);
                const checkout=page.url();await page.getByRole('link',{name:'Continuar aguardando',exact:true}).click();
                await expect(page.getByRole('heading',{name:'Aguardando pagamento',exact:true})).toBeVisible();
                await page.reload();await expect(page.getByRole('heading',{name:'Aguardando pagamento',exact:true})).toBeVisible();await page.goto(checkout);
                await page.getByRole('button',{name:index===0?'Simular aprovação Pix':'Simular aprovação Crédito',exact:true}).click();
                await expect.poll(async()=>(await db('pagamentos').where({id:payment.id}).first()).status).toBe('PAGA');
                await page.getByRole('link',{name:'Voltar ao acompanhamento',exact:true}).click();await expect(page.getByRole('heading',{name:'Pedido liberado',exact:true})).toBeVisible();
                await page.reload();await expect(page.getByRole('heading',{name:'Pedido liberado',exact:true})).toBeVisible();
                const [receipt]=await Promise.all([ctx.waitForEvent('page'),page.getByRole('link',{name:'Ver comprovante',exact:true}).click()]);
                await expect(receipt.getByRole('heading',{name:'Comprovante sintético',exact:true})).toBeVisible();await receipt.close();
                await expect.poll(async()=>Number((await db('infinitepay_entregas_homologacao').where({pedido_id:payment.pedido_id}).count('* as n').first()).n)).toBe(1);
                await operator.goto(shop+'/admin/pedidos');
                const row=operator.getByRole('row').filter({has:operator.getByRole('cell',{name:'#'+payment.pedido_id,exact:true})});
                await expect(row).toBeVisible();await expect(row).toContainText('DEMO NAVEGADOR '+method);
            }else await expect(page.getByRole('heading',{name:'Pedido liberado',exact:true})).toBeVisible();
        }finally{await ctx.close();}
    }
    await operator.goto(shop+'/admin/relatorios');await expect(operator.locator('body')).toContainText('Pagamentos InfinitePay');
},{timeout:180000});
test('pending and uncertain demo attempts survive browser recovery and do not dispatch a second checkout',async()=>{
    for(const scenario of ['UNCERTAIN','ERROR']){
        await mode(scenario);const before=(await db('demo_provider_settings').first()).dispatches;
        const ctx=await context(),page=await ctx.newPage();let storage;
        try{
            await cart(page,'Pix',{name:'DEMO '+scenario});await page.getByRole('button',{name:/Confirmar Pedido/}).click();
            await expect(page.getByRole('heading',{name:'Verificação inconclusiva',exact:true})).toBeVisible();
            await page.reload();await expect(page.getByRole('heading',{name:'Verificação inconclusiva',exact:true})).toBeVisible();
            storage=await ctx.storageState();
        }finally{await ctx.close();}
        const restored=await context({storageState:storage}),restoredPage=await restored.newPage();
        try{await restoredPage.goto(shop+'/pedido/sucesso');await expect(restoredPage.getByRole('heading',{name:'Verificação inconclusiva',exact:true})).toBeVisible();}
        finally{await restored.close();}
        assert.equal((await db('demo_provider_settings').first()).dispatches,before+1);
    }
    await mode('PENDING');
},{timeout:150000});
