import api from './api.js';

export const buscarDadosEmpresaPublicos = async () => {
    const response = await api.get('/configuracoes/empresa/publico');
    return response.data;
};

export const buscarDadosEmpresa = async () => {
    const response = await api.get('/configuracoes/empresa');
    return response.data;
};

export const atualizarDadosEmpresa = async (payload) => {
    const response = await api.put('/configuracoes/empresa', payload);
    return response.data;
};