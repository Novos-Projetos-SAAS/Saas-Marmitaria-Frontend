export function hojeSaoPaulo(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now).map(({ type, value }) => [type, value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
}
export function calcularDatasPeriodo(period, start, end, now = new Date()) {
    if (period === 'personalizado') return { dataInicio: start, dataFim: end };
    const today = hojeSaoPaulo(now);
    const calendar = new Date(today + 'T12:00:00Z');
    if (period === 'semana') calendar.setUTCDate(calendar.getUTCDate() - ((calendar.getUTCDay() + 6) % 7));
    if (period === 'mes') calendar.setUTCDate(1);
    if (period === 'ultimos7dias') calendar.setUTCDate(calendar.getUTCDate() - 6);
    if (period === 'ultimos30dias') calendar.setUTCDate(calendar.getUTCDate() - 29);
    return { dataInicio: calendar.toISOString().slice(0, 10), dataFim: today };
}
