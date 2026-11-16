import { useEffect, useState } from 'react';
export const useFetch = (fetcher) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetcher();
                setData(result);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            }
            finally {
                setIsLoading(false);
            }
        };
        load();
    }, [fetcher]);
    return { data, isLoading, error };
};
