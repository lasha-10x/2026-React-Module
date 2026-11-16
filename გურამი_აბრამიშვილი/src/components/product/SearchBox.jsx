import { useEffect, useRef, useState } from "react";
import { TextField } from "@/components/ui/TextField";
// Search input that offers the previous searches when it is focused and empty.
export default function SearchBox({ value, onChange, history, onRemoveHistory, onClearHistory }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const showHistory = open && value === "" && history.length > 0;
    // Close when focus or a click leaves the whole widget.
    useEffect(() => {
        if (!open)
            return;
        function handlePointerDown(e) {
            if (rootRef.current !== null && e.target instanceof Node && !rootRef.current.contains(e.target))
                setOpen(false);
        }
        document.addEventListener("mousedown", handlePointerDown);
        return () => document.removeEventListener("mousedown", handlePointerDown);
    }, [open]);
    function handleKeyDown(e) {
        if (e.key === "Escape")
            setOpen(false);
    }
    function choose(query) {
        onChange(query);
        setOpen(false);
    }
    return (<div ref={rootRef} className="relative" onKeyDown={handleKeyDown} onBlur={(e) => {
            // Keyboard users tabbing out. (relatedTarget is null for mouse clicks: handled by the mousedown listener.)
            if (e.relatedTarget instanceof Node && rootRef.current !== null && !rootRef.current.contains(e.relatedTarget))
                setOpen(false);
        }}>
      <TextField label="Search" type="search" name="q" placeholder="Search products…" value={value} onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
        }} onFocus={() => setOpen(true)} onClick={() => setOpen(true)} autoComplete="off"/>

      {showHistory && (<div role="region" aria-label="Recent queries" className="card absolute inset-x-0 top-[4.25rem] z-30 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-3 py-1">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">Recent</p>
            <button type="button" onClick={onClearHistory} className="min-h-11 rounded px-2 text-sm font-medium text-accent hover:underline focus-ring">
              Clear history
            </button>
          </div>
          <ul>
            {history.map((query) => (<li key={query} className="flex items-center hover:bg-surface-2">
                <button type="button" onClick={() => choose(query)} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 px-3 text-left text-sm focus-ring">
                  <span aria-hidden="true" className="text-muted">
                    ↺
                  </span>
                  <span className="truncate">{query}</span>
                </button>
                <button type="button" onClick={() => onRemoveHistory(query)} aria-label={`Remove "${query}" from history`} className="inline-flex size-11 shrink-0 items-center justify-center text-muted hover:text-danger focus-ring">
                  <span aria-hidden="true">✕</span>
                </button>
              </li>))}
          </ul>
        </div>)}
    </div>);
}
