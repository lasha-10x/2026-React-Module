import { useState } from "react";
import ImageLightbox from "./ImageLightbox";
const HOVER_ZOOM = 2;
export default function ProductGallery({ title, images, thumbnail }) {
    const photos = images.length > 0 ? images : [thumbnail];
    const [index, setIndex] = useState(0); // local UI state: which photo is the big one
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [zoomPoint, setZoomPoint] = useState(null); // hover zoom, % of the image box
    const safeIndex = Math.min(index, photos.length - 1);
    const current = photos[safeIndex];
    // Hover zoom is for mouse pointers only; on touch screens a tap opens the full-screen viewer instead.
    function handlePointerMove(e) {
        if (e.pointerType !== "mouse")
            return;
        const rect = e.currentTarget.getBoundingClientRect();
        setZoomPoint({
            x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
            y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
        });
    }
    return (<div>
      <div className="card relative overflow-hidden bg-surface-2">
        <button type="button" onClick={() => {
            setZoomPoint(null);
            setLightboxOpen(true);
        }} onPointerMove={handlePointerMove} onPointerLeave={() => setZoomPoint(null)} aria-label="Open photo full size" className="block w-full cursor-zoom-in overflow-hidden focus-ring">
          <img src={current} alt={title} width={800} height={800} draggable={false} className="aspect-square w-full object-contain transition-transform duration-150 ease-out" style={zoomPoint === null
            ? undefined
            : { transform: `scale(${HOVER_ZOOM})`, transformOrigin: `${zoomPoint.x}% ${zoomPoint.y}%` }}/>
        </button>
        <span aria-hidden="true" className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          Hover to zoom · click to enlarge
        </span>
      </div>
      {photos.length > 1 && (<ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">
          {photos.map((src, i) => (<li key={src} className="shrink-0">
              <button type="button" onClick={() => setIndex(i)} aria-pressed={i === safeIndex} aria-label={`Show photo ${i + 1} of ${photos.length}`} className={`block size-16 overflow-hidden rounded-lg border-2 bg-surface-2 transition-colors focus-ring sm:size-20 ${i === safeIndex ? "border-brand" : "border-transparent hover:border-line"}`}>
                <img src={src} alt="" loading="lazy" width={80} height={80} className="size-full object-contain"/>
              </button>
            </li>))}
        </ul>)}

      {lightboxOpen && (<ImageLightbox title={title} photos={photos} index={safeIndex} onIndexChange={setIndex} onClose={() => setLightboxOpen(false)}/>)}
    </div>);
}
