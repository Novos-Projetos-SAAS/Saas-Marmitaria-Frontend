import test from 'node:test';
import assert from 'node:assert/strict';
import {
    FINANCIAL_PERMISSION_DESCRIPTIONS,
    groupPermissionsByModule,
    getMissingFinancialPermissions,
    getNewSensitiveFinancialGrants,
    labelFinancialPermission
} from '../src/utils/financialPermissions.mjs';

const entries=[
    {id:8,nome:'usuarios.listar',descricao:'Listar usuários'},
    {id:14,nome:'pagamentos.configurar',descricao:'InfinitePay: pagamentos.configurar'},
    {id:15,nome:'pagamentos.ativar_producao',descricao:'Autorizar capacidade de produção'},
    {id:9,nome:'permissoes.editar',descricao:'Editar permissões'}
];

test('financial permissions are grouped first with the identifiers provided by the backend',()=>{
    const grouped=groupPermissionsByModule(entries);
    assert.equal(Object.keys(grouped)[0],'pagamentos');
    assert.deepEqual(grouped.pagamentos.map(p=>p.id),[14,15]);
    assert.equal(grouped.usuarios[0].nome,'usuarios.listar');
    assert.equal(labelFinancialPermission(entries[1]),FINANCIAL_PERMISSION_DESCRIPTIONS['pagamentos.configurar']);
    assert.equal(labelFinancialPermission(entries[0]),'Listar usuários');
});

test('missing production permissions are reported without inventing options',()=>{
    assert.deepEqual(getMissingFinancialPermissions(entries),[]);
    assert.deepEqual(getMissingFinancialPermissions([entries[0]]),[
        'pagamentos.configurar','pagamentos.ativar_producao'
    ]);
    assert.deepEqual(groupPermissionsByModule([]),{});
});

test('only new sensitive grants trigger confirmation',()=>{
    const original=new Set(['usuarios.listar','pagamentos.configurar']);
    const newGrants=new Set([...original,'pagamentos.ativar_producao','pagamentos.visualizar']);
    assert.deepEqual(getNewSensitiveFinancialGrants(original,newGrants),['pagamentos.ativar_producao']);
    assert.deepEqual(getNewSensitiveFinancialGrants(original,new Set(['usuarios.listar'])),[]);
});

test('invalid catalog data fails closed',()=>{
    assert.throws(()=>groupPermissionsByModule([{id:1,nome:'pagamentos'}]),TypeError);
    assert.throws(()=>groupPermissionsByModule([{id:0,nome:'pagamentos.ativar_producao'}]),TypeError);
    assert.throws(()=>groupPermissionsByModule(undefined),TypeError);
});
