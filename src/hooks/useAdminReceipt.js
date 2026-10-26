'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { buscarComprovanteAdmin } from '@/services/pedidosService.js';
import { openAdminReceipt } from '@/services/adminReceipt.mjs';

export function useAdminReceipt() {
    const [opening, setOpening] = useState(null);
    async function open(id) {
        if (opening !== null) return;
        setOpening(id);
        try { await openAdminReceipt(id, buscarComprovanteAdmin); }
        catch { toast.error('Comprovante indisponível. Confira sua permissão e permita abrir uma nova aba.'); }
        finally { setOpening(null); }
    }
    return { open, opening };
}
