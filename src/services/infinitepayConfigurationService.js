import api from './api';
export async function readInfinitepayConfiguration() {
    return (await api.get('/configuracoes/infinitepay')).data;
}
export async function saveInfinitepayConfiguration(input, csrf) {
    return (await api.put('/configuracoes/infinitepay',input,{headers:{'X-Infinitepay-CSRF':csrf}})).data;
}
