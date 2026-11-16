import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
const ZOOM_SCALE = 2.5;
function percentWithin(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clamp = (n) => Math.min(100, Math.max(0, n));
    return { x: clamp(((e.clientX - rect.left) / rect.width) * 100), y: clamp(((e.clientY - rect.top) / rect.height) * 100) };
}
// Full-screen viewer: click (or tap) the photo to zoom in, move the pointer to pan, Esc closes, arrows switch photos.
export default function ImageLightbox({ title, photos, index, onIndexChange, onClose }) {
    const dialogRef = useRef(null);
    const closeRef = useRef(null);
    const [zoomed, setZoomed] = useState(false);
    const [origin, setOrigin] = useState({ x: 50, y: 50 });
    const hasMany = photos.length > 1;
    const go = (step) => {
        setZoomed(false);
        onIndexChange((index + step + photos.length) % photos.length);
    };
    // Lock page scroll while open and give focus back to the element that opened the viewer.
    useEffect(() => {
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            opener?.focus();
        };
    }, []);
    function handleKeyDown(e) {
        if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
        }
        else if (e.key === "ArrowLeft" && hasMany)
            go(-1);
        else if (e.key === "ArrowRight" && hasMany)
            go(1);
        else if (e.key === "Tab") {
            // Keep Tab inside the dialog.
            const focusable = dialogRef.current?.querySelectorAll("button:not([disabled])");
            if (focusable === undefined || focusable.length === 0)
                return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
            else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
    const navButton = "absolute top-1/2 z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-2xl text-white " +
        "hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
    return createPortal(<div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${title} photo viewer`} onKeyDown={handleKeyDown} onClick={(e) => {
            if (e.target === e.currentTarget)
                onClose();
        }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 sm:p-10">
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo viewer" className="absolute top-3 right-3 z-10 inline-flex size-12 items-center justify-center rounded-full bg-black/60 text-2xl text-white hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        <span aria-hidden="true">✕</span>
      </button>

      {hasMany && (<>
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={`${navButton} left-3`}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" className={`${navButton} right-3`}>
            <span aria-hidden="true">›</span>
          </button>
        </>)}

      <div className={`relative h-full max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`} onClick={(e) => {
            setOrigin(percentWithin(e));
            setZoomed((z) => !z);
        }} onMouseMove={(e) => {
            if (zoomed)
                setOrigin(percentWithin(e));
        }}>
        <img src={photos[index]} alt={`${title}, photo ${index + 1} of ${photos.length}`} draggable={false} className="size-full select-none object-contain transition-transform duration-200" style={{ transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)", transformOrigin: `${origin.x}% ${origin.y}%` }}/>
      </div>

      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white" aria-live="polite">
        {index + 1} / {photos.length} · {zoomed ? "Click to zoom out" : "Click to zoom in"}
      </p>
    </div>, document.body);
}
