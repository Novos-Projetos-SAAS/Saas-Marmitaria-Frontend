import api from "./api";

export async function buscarUsuarios(search = '', page = 1, status = 'all', sort = 'usuarios.id', order = 'ASC') {

    try {
        const response = await api.get('/usuarios', {
            params: {
                search,
                page,
                limit: 10,
                sort, 
                order,
                deletados: status
            }
        })

        return response.data.data;
    
    } catch (error) {
        
        console.error("Erro ao buscar usuários:", error);
        throw error;

    }
}

export const toggleUserStatus = async (id, status) => {
    try {
        let response;
        
        // Se status for true, bate na rota de reativar (PATCH)
        if (status === true) {
            response = await api.patch(`/usuarios/${id}/ativar`);
        } 
        // Se status for false, bate na rota de inativar/soft delete (DELETE)
        else {
            response = await api.delete(`/usuarios/${id}`);
        }

        return response.data;
    } catch (error) {
        console.error(`Erro ao ${status ? 'reativar' : 'inativar'} o usuário:`, error);
        throw error;
    }
};