import { useEffect } from "react";
export function useDocumentTitle(title) {
    useEffect(() => {
        document.title = title === "" ? "10X Shop" : `${title} · 10X Shop`;
    }, [title]);
}
