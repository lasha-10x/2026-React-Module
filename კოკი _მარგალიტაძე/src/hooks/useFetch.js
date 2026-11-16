import { useEffect, useState } from 'react';
export function useFetch(fetcher, arg) {
    const [result, setResult] = useState({
        state: { status: 'loading' },
        error: null,
    });
    useEffect(() => {
        let ignore = false;
        fetcher(arg)
            .then((data) => {
            if (!ignore)
                setResult({ state: { status: 'success', data }, error: null });
        })
            .catch((err) => {
            if (ignore)
                return;
            setResult({
                state: {
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Something went wrong',
                },
                error: err,
            });
        });
        return () => {
            ignore = true;
        };
    }, [fetcher, arg]);
    return result;
}
