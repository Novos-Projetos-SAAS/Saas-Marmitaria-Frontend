export function paymentOrigin(kind, { environment = process.env.NODE_ENV, demo = process.env.NEXT_PUBLIC_INFINITEPAY_DEMO } = {}) {
    if (demo && demo !== 'local-only') throw new Error('Perfil de demonstração desconhecido.');
    if (demo === 'local-only') {
        if (environment !== 'development') throw new Error('Simulação disponível somente em desenvolvimento local.');
        return 'https://localhost:55446';
    }
    return kind === 'receipt' ? 'https://recibo.infinitepay.io' : 'https://checkout.infinitepay.io';
}
