import { useEffect, useEffectEvent, useState } from 'react';
export function useRequest(key, load) {
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState();
    const request = useEffectEvent(load);
    useEffect(() => {
        const controller = new AbortController();
        void request(controller.signal).then((data) => {
            if (!controller.signal.aborted)
                setResult({ key, attempt, state: { status: 'success', data } });
        }, (error) => {
            if (!controller.signal.aborted)
                setResult({ key, attempt, state: { status: 'error', error } });
        });
        return () => controller.abort();
    }, [key, attempt]);
    const state = result?.key === key && result.attempt === attempt
        ? result.state
        : { status: 'loading' };
    return { state, retry: () => setAttempt((previous) => previous + 1) };
}
