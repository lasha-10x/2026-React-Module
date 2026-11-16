import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { describeError, isApiError } from "@/api/ApiError";
// Generic data hook: one request per `path`. Pass null to skip the request.
// - AbortController cancels the previous request when the path changes or the component unmounts,
//   so a slow old response can never overwrite a newer one.
// - The result remembers which path it belongs to, so a stale result is never shown for a new path.
export function useFetch(path) {
    const [attempt, setAttempt] = useState(0);
    const [result, setResult] = useState(null);
    useEffect(() => {
        if (path === null)
            return;
        const controller = new AbortController();
        api
            .get(path, controller.signal)
            .then((data) => setResult({ path, attempt, state: { status: "success", data } }))
            .catch((e) => {
            if (controller.signal.aborted)
                return;
            setResult({
                path,
                attempt,
                state: {
                    status: "error",
                    message: describeError(e),
                    statusCode: isApiError(e) ? e.status : undefined,
                },
            });
        });
        return () => controller.abort();
    }, [path, attempt]);
    let state;
    if (path === null)
        state = { status: "idle" };
    else if (result !== null && result.path === path && result.attempt === attempt)
        state = result.state;
    else
        state = { status: "loading" };
    return { state, retry: () => setAttempt((n) => n + 1) };
}
