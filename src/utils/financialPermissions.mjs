export const FINANCIAL_PERMISSION_DESCRIPTIONS = Object.freeze({
    'pagamentos.configurar': 'Configurar InfiniteTag, credenciais e regras de pagamento.',
    'pagamentos.visualizar': 'Consultar pedidos e informações financeiras.',
    'pagamentos.conciliar': 'Executar operações de conciliação financeira.',
    'pagamentos.ativar_producao': 'Aprovar e revogar capacidades financeiras em produção.'
});

// Display metadata only. Permissions must come from the backend catalogue;
// this file never fabricates roles, grants or permission identifiers.
export const SENSITIVE_FINANCIAL_PERMISSIONS = Object.freeze([
    'pagamentos.configurar',
    'pagamentos.conciliar',
    'pagamentos.ativar_producao'
]);

export function groupPermissionsByModule(permissions) {
    if (!Array.isArray(permissions)) throw new TypeError('Catálogo de permissões inválido.');
    const modules = new Map();
    for (const permission of permissions) {
        if (!permission || !Number.isSafeInteger(permission.id) || permission.id <= 0 ||
            typeof permission.nome !== 'string' || !permission.nome.includes('.')) {
            throw new TypeError('Permissão recebida do servidor inválida.');
        }
        const moduleName = permission.nome.split('.')[0];
        if (!modules.has(moduleName)) modules.set(moduleName, []);
        modules.get(moduleName).push(permission);
    }
    return Object.fromEntries([...modules].sort(([left],[right]) =>
        left === 'pagamentos' ? -1 : right === 'pagamentos' ? 1 : left.localeCompare(right, 'pt-BR')));
}

export function getMissingFinancialPermissions(permissions) {
    const names = new Set(permissions.map(permission => permission.nome));
    return ['pagamentos.configurar', 'pagamentos.ativar_producao'].filter(name => !names.has(name));
}

export function getNewSensitiveFinancialGrants(initial, selected) {
    return SENSITIVE_FINANCIAL_PERMISSIONS.filter(name => selected.has(name) && !initial.has(name));
}

export function labelFinancialPermission(permission) {
    return FINANCIAL_PERMISSION_DESCRIPTIONS[permission.nome] || permission.descricao || permission.nome;
}
