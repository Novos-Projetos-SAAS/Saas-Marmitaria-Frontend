const monetaryFields = new Set([
    'valor', 'valor_total', 'total', 'total_faturado', 'ticket_medio', 'preco', 'subtotal',
    'desconto', 'acrescimo', 'troco', 'faturamento', 'preco_base', 'preco_adicional',
    'faturamento_tamanho', 'valor_gasto', 'valor_original', 'valor_considerado',
    'valor_confirmado', 'valor_pago_comprador', 'valor_estornado', 'taxas', 'valor_liquido'
]);
export const ehCampoDinheiro = key => monetaryFields.has(key);
export function formatarValor(value, key) {
    if (ehCampoDinheiro(key)) {
        if (value == null || value === '' || !Number.isFinite(Number(value))) return 'Não informado';
        return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    }
    return value ?? '';
}
export function calcularTotais(columns, rows) {
    if (!rows?.length || !columns.some(col => col.totalizar)) return null;
    return Object.fromEntries(columns.map((col, index) => {
        if (index === 0) return [col.label, 'TOTAL:'];
        if (!col.totalizar) return [col.label, '-'];
        const values = rows.map(row => row[col.chave]);
        if (values.some(value => value == null || value === '' || !Number.isFinite(Number(value)))) return [col.label, 'Não informado'];
        return [col.label, formatarValor(values.reduce((sum, value) => sum + Number(value), 0), col.chave)];
    }));
}
