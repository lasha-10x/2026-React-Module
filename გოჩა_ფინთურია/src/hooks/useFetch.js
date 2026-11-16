import { useState, useEffect } from "react";
import { apiClient } from "../api/ApiClient.js";
export function useFetch(url) {
    const [state, setState] = useState({ status: "loading" });
    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        setState({ status: "loading" });
        apiClient
            .get(url, controller.signal)
            .then((data) => {
            if (isMounted) {
                setState({ status: "success", data });
            }
        })
            .catch((err) => {
            if (isMounted) {
                const msg = err instanceof Error ? err.message : "Failed to load data";
                setState({ status: "error", message: msg });
            }
        });
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [url]);
    return state;
}
