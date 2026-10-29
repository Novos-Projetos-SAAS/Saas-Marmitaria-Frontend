export async function logoutWithFinancialRevocation(api) {
    try{return (await api.post('/auth/logout')).data;}
    catch(error) {
        if(error?.response?.status!==409 || error.response.data?.code!=='FINANCIAL_SESSION_CSRF_REQUIRED')throw error;
        const response=await api.get('/pagamentos/controle-producao/session/logout-csrf');
        const csrf=response.data?.data?.csrfToken;
        if(response.data?.status!=='success' || typeof csrf!=='string' || !/^[A-Za-z0-9_-]{43}$/.test(csrf))throw new Error('Encerramento seguro indisponível.');
        return (await api.post('/auth/logout',{}, {headers:{'X-Infinitepay-CSRF':csrf}})).data;
    }
}
