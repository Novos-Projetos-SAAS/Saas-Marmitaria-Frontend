export async function runAsyncLoad(load, options, onSettled) {
    if (options.signal?.aborted) return;
    try {
        return await load(options);
    } finally {
        if (!options.signal?.aborted) onSettled();
    }
}

export function createAsyncLoadScope(load) {
    const controllers = new Set();
    let active = false;
    return {
        activate() { active = true; },
        isActive() { return active; },
        dispose() {
            active = false;
            for (const controller of controllers) controller.abort();
            controllers.clear();
        },
        run(options, onSettled) {
            if (!active) return Promise.resolve();
            const controller = new AbortController();
            controllers.add(controller);
            const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;
            return runAsyncLoad(load, { ...options, signal }, onSettled).finally(() => controllers.delete(controller));
        }
    };
}
