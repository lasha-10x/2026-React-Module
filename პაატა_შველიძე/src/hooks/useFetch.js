import { useCallback, useEffect, useRef, useState } from 'react';
// One hook for "load something when the page needs it": loading / error / success, the
// request is cancelled when `key` changes or the component goes away, and `reload` repeats it.
// `key` names the request (for example the URL); the fetcher itself is always the newest one.
export function useFetch(key, fetcher, enabled = true) {
    const [state, setState] = useState({ status: 'loading' });
    const [reloadCount, setReloadCount] = useState(0);
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    });
    useEffect(() => {
        if (!enabled) {
            return;
        }
        const controller = new AbortController();
        setState({ status: 'loading' });
        fetcherRef
            .current(controller.signal)
            .then((data) => {
            if (!controller.signal.aborted) {
                setState({ status: 'success', data });
            }
        })
            .catch((error) => {
            if (controller.signal.aborted) {
                return;
            }
            setState({
                status: 'error',
                error: error instanceof Error ? error : new Error('Something went wrong'),
            });
        });
        // An answer to an outdated request must never replace the current one.
        return () => controller.abort();
    }, [key, enabled, reloadCount]);
    const reload = useCallback(() => setReloadCount((count) => count + 1), []);
    return { state, reload };
}
