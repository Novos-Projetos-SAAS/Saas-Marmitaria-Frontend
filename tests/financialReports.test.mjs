import { test } from 'node:test';
import assert from 'node:assert/strict';

test('report money formatting covers legacy and financial values without mistaking dates or states for currency', async () => {
    const { formatarValor } = await import('../src/utils/reportFormatting.mjs');
    for (const key of ['valor_total','faturamento_tamanho','valor_gasto','valor_confirmado','valor_pago_comprador','valor_considerado']) assert.equal(formatarValor('21.10', key), 'R$ 21,10');
    assert.equal(formatarValor('25/10/2026', 'data_faturamento'), '25/10/2026');
    assert.equal(formatarValor('INCERTA', 'situacao_financeira'), 'INCERTA');
    for (const key of ['taxas','valor_liquido','valor_estornado']) assert.equal(formatarValor(null, key), 'Não informado');
    assert.equal(formatarValor(0, 'valor_considerado'), 'R$ 0,00');
    assert.equal(formatarValor(null, 'data_estorno'), '');
});
test('report totals never turn missing money into zero or silently total partial evidence', async () => {
    const { calcularTotais } = await import('../src/utils/reportFormatting.mjs');
    const columns = [{ chave: 'pedido', label: 'Pedido' }, { chave: 'valor_considerado', label: 'Venda', totalizar: true }, { chave: 'taxas', label: 'Taxas', totalizar: true }];
    assert.deepEqual(calcularTotais(columns, [{ valor_considerado: 20, taxas: null }, { valor_considerado: 0, taxas: null }]), { Pedido: 'TOTAL:', Venda: 'R$ 20,00', Taxas: 'Não informado' });
    assert.equal(calcularTotais(columns, [{ valor_considerado: 20, taxas: 1 }, { valor_considerado: 20, taxas: null }]).Taxas, 'Não informado');
    assert.equal(calcularTotais(columns, []), null);
});
test('dashboard periods use Sao Paulo calendar at UTC midnight and week/month boundaries', async () => {
    const { calcularDatasPeriodo, hojeSaoPaulo } = await import('../src/utils/dashboardDates.mjs');
    const instant = new Date('2026-11-01T01:30:00Z');
    assert.equal(hojeSaoPaulo(instant), '2026-10-31');
    assert.deepEqual(calcularDatasPeriodo('mes', '', '', instant), { dataInicio: '2026-10-01', dataFim: '2026-10-31' });
    assert.deepEqual(calcularDatasPeriodo('semana', '', '', new Date('2026-10-26T01:00:00Z')), { dataInicio: '2026-10-19', dataFim: '2026-10-25' });
    assert.deepEqual(calcularDatasPeriodo('ultimos7dias', '', '', instant), { dataInicio: '2026-10-25', dataFim: '2026-10-31' });
    assert.deepEqual(calcularDatasPeriodo('personalizado', '2025-01-01', '2025-02-01', instant), { dataInicio: '2025-01-01', dataFim: '2025-02-01' });
});
