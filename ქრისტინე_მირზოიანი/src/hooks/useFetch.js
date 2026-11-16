import { useCallback, useEffect, useState } from 'react';
export function useFetch(url, fetcher) {
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState({
        key: url,
        attempt,
        state: { status: 'loading' },
    });
    useEffect(() => {
        const controller = new AbortController();
        fetcher(controller.signal).then((data) => {
            if (!controller.signal.aborted) {
                setResult({ key: url, attempt, state: { status: 'success', data } });
            }
        }, (error) => {
            if (controller.signal.aborted)
                return;
            const message = error instanceof Error ? error.message : 'Request failed';
            setResult({ key: url, attempt, state: { status: 'error', message } });
        });
        return () => controller.abort();
    }, [attempt, fetcher, url]);
    const retry = useCallback(() => setAttempt((current) => current + 1), []);
    const state = result.key === url && result.attempt === attempt
        ? result.state
        : { status: 'loading' };
    return { state, retry };
}
