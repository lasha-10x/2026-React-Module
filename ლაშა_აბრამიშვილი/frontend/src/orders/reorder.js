import { validateOrderItems } from '../api/orders.js';
import { getProductDetails } from '../api/products.js';
function historicalLines(lines) {
    try {
        if (!Array.isArray(lines))
            return null;
        // Also reject sparse arrays and invalid titles before any product requests.
        for (const line of lines) {
            if (!line || typeof line.title !== 'string' || !line.title.trim() || line.title.length > 500)
                return null;
        }
        validateOrderItems(lines);
        return lines.map(({ productId, quantity, title }) => ({ productId, quantity, title }));
    }
    catch {
        return null;
    }
}
function waitForLookups(work, signal) {
    return new Promise((resolve, reject) => {
        function cleanup() { signal.removeEventListener('abort', cancel); }
        function cancel() { cleanup(); reject(signal.reason); }
        if (signal.aborted)
            cancel();
        else
            signal.addEventListener('abort', cancel, { once: true });
        // Still observe work after cancellation, including fetch implementations that ignore abort.
        void work.then(() => {
            cleanup();
            if (signal.aborted)
                reject(signal.reason);
            else
                resolve();
        }, (error) => { cleanup(); reject(error); });
    });
}
export async function prepareReorder(lines, signal) {
    signal.throwIfAborted();
    const validated = historicalLines(lines);
    if (!validated)
        return { status: 'invalid-input', inputs: [], outcomes: [] };
    const history = validated;
    const controller = new AbortController();
    const cancel = () => controller.abort(signal.reason);
    signal.addEventListener('abort', cancel, { once: true });
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort(new DOMException('Reorder preparation timed out.', 'TimeoutError'));
    }, 20_000);
    const outcomes = history.map((historical) => ({ historical, status: 'excluded', reason: 'timeout' }));
    const inputs = new Array(history.length);
    let queued = 0;
    async function worker() {
        while (queued < history.length) {
            controller.signal.throwIfAborted();
            const index = queued++;
            const historical = history[index];
            let outcome;
            try {
                // This API function validates product fields AND the returned identity against the requested ID.
                const product = await getProductDetails(String(historical.productId), controller.signal);
                controller.signal.throwIfAborted();
                if (!product)
                    outcome = { historical, status: 'excluded', reason: 'missing' };
                else if (product.stock === 0)
                    outcome = { historical, status: 'excluded', reason: 'out-of-stock' };
                else if (product.stock < historical.quantity)
                    outcome = { historical, status: 'excluded', reason: 'insufficient-stock' };
                else {
                    inputs[index] = { product, quantity: historical.quantity };
                    outcome = { historical, status: 'prepared' };
                }
            }
            catch (error) {
                controller.signal.throwIfAborted();
                // products.ts currently reports JSON/shape/identity failures as plain Errors with this prefix.
                const invalid = error instanceof Error && error.message.startsWith('The catalog service returned ');
                outcome = { historical, status: 'excluded', reason: invalid ? 'invalid-response' : 'request-failed' };
            }
            controller.signal.throwIfAborted();
            outcomes[index] = outcome;
        }
    }
    try {
        signal.throwIfAborted();
        await waitForLookups(Promise.all(Array.from({ length: Math.min(3, history.length) }, worker)), controller.signal);
        signal.throwIfAborted();
        controller.signal.throwIfAborted();
        return { status: 'complete', inputs: inputs.flatMap((line) => line ? [line] : []), outcomes };
    }
    catch (error) {
        signal.throwIfAborted();
        if (timedOut)
            return { status: 'timeout', inputs: [], outcomes: outcomes.slice() };
        throw error;
    }
    finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', cancel);
    }
}
