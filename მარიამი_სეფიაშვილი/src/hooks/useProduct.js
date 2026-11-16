import { useEffect, useState } from "react";
import { isApiError } from "../api/ApiError";
import { getProductById } from "../components/product/productFetch";
// id === null means the URL id is invalid: nothing is requested and the state stays idle
export default function useProduct(id) {
    const [state, setState] = useState(() => (id === null ? { status: "idle" } : { status: "loading" }));
    // bumping this re-runs the request (Retry button)
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        if (id === null)
            return;
        const controller = new AbortController();
        async function loadProduct(productId) {
            setState({ status: "loading" });
            try {
                const data = await getProductById(productId, controller.signal);
                setState({ status: "success", data });
            }
            catch (err) {
                if (controller.signal.aborted)
                    return;
                setState({
                    status: "error",
                    message: err instanceof Error ? err.message : "Something went wrong",
                    httpStatus: isApiError(err) ? err.status : undefined,
                });
            }
        }
        loadProduct(id);
        return () => controller.abort();
    }, [id, attempt]);
    function retry() {
        setAttempt((count) => count + 1);
    }
    return { state, retry };
}
