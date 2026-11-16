import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
// A new route should start at the top of the page AND keyboard focus should move to the new content.
// Without the focus step, a keyboard user who pressed Enter on a link keeps a "ghost" focus position
// where the old link used to be, and the next Tab key lands somewhere unexpected.
export default function ScrollToTop() {
    const { pathname } = useLocation();
    const isFirstRender = useRef(true);
    useEffect(() => {
        window.scrollTo(0, 0);
        if (isFirstRender.current) {
            isFirstRender.current = false; // do not steal focus on the initial page load
            return;
        }
        document.getElementById("main")?.focus({ preventScroll: true });
    }, [pathname]);
    return null;
}
