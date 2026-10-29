'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createAsyncLoadScope } from '@/services/asyncLoad.mjs';

// The current loader identifies its query. A changed query is loading during
// render; the effect only starts I/O and settles state after the response.
export function useAsyncLoad(load) {
    const [completedLoad, setCompletedLoad] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const scope = useMemo(() => createAsyncLoadScope(load), [load]);
    const execute = useCallback((options = {}) => scope.run(options, () => {
        setCompletedLoad(() => load);
        if (!options.silencioso) setRefreshing(false);
    }), [load, scope]);

    useEffect(() => {
        scope.activate();
        void execute({ initial: true });
        return () => scope.dispose();
    }, [execute, scope]);

    const refresh = useCallback((options = {}) => {
        if (!scope.isActive()) return Promise.resolve();
        if (!options.silencioso) setRefreshing(true);
        return execute(options);
    }, [execute, scope]);

    return { loading: completedLoad !== load || refreshing, refresh };
}
