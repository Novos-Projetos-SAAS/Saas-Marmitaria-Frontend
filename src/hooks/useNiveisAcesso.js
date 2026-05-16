import { useState, useCallback } from "react";

import { buscarNiveisAcesso } from "@/services/niveisAcessoService.js";

export function useNiveisAcesso() {
    const [niveisAcesso, setNiveisAcesso] = useState([]);
    const [loading, setLoading] = useState(true);

    const listarNiveisAcesso = useCallback(async () => {
        setLoading(true);
        try {
            const response = await buscarNiveisAcesso();
            setNiveisAcesso(response || []);
        }
        catch (error) {
            console.error("Erro no hook useNiveisAcesso:", error);
        }
        finally {
            setLoading(false);
        }
    }, []);

    return {
        niveisAcesso,
        loading,
        listarNiveisAcesso
    };
}