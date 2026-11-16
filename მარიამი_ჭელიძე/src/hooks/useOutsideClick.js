import { useEffect } from "react";
export function useOutsideClick(ref, onOutsideClick, enabled) {
    useEffect(() => {
        if (!enabled)
            return;
        const handlePointerDown = (event) => {
            const target = event.target;
            if (target instanceof Node && !ref.current?.contains(target))
                onOutsideClick();
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown, { passive: true });
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, [enabled, onOutsideClick, ref]);
}
