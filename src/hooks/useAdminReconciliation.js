'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { createAdminReconciliation } from '@/services/adminReconciliation.mjs';

export function useAdminReconciliation(permitted) {
    const [controller] = useState(() => createAdminReconciliation(api));
    const [pendingId, setPendingId] = useState(null);
    const busy = useRef(false);
    async function request(order) {
        if (!permitted || busy.current || !['INCERTA', 'DIVERGENTE'].includes(order.pagamento_status)) return false;
        busy.current = true;
        setPendingId(order.pedido_id);
        try {
            const result = await controller.request(order.pedido_id);
            if (result.status === 'SOLICITADA') toast.success('Verificação solicitada. Aguarde a confirmação pelo servidor.');
            else if (result.status === 'SEM_IDENTIFICADORES') toast.error('Não há identificadores suficientes para verificar este pagamento. Consulte o suporte.');
            else toast.success('O servidor já registrou a confirmação deste pagamento.');
            return true;
        } catch {
            toast.error('Não foi possível confirmar a solicitação. Tente novamente; a mesma solicitação será preservada.');
            return false;
        } finally {
            busy.current = false;
            setPendingId(null);
        }
    }
    return { request, pendingId };
}
