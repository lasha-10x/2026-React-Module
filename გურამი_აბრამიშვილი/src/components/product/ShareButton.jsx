import { useState } from "react";
import { useToast } from "@/context/ToastContext";
// Uses the native share sheet when the browser has one (phones), otherwise copies the link.
export default function ShareButton({ title, text, className = "" }) {
    const { toast } = useToast();
    const [busy, setBusy] = useState(false);
    async function handleShare() {
        if (busy)
            return;
        setBusy(true);
        const url = window.location.href;
        try {
            if (typeof navigator.share === "function") {
                await navigator.share({ title, text, url });
                return;
            }
            await navigator.clipboard.writeText(url);
            toast("Link copied to clipboard ✓");
        }
        catch (error) {
            // The user closing the share sheet is not an error.
            if (error instanceof DOMException && error.name === "AbortError")
                return;
            if (copyWithFallback(url))
                toast("Link copied to clipboard ✓");
            else
                toast("Could not share. Copy the link from the address bar.", "error");
        }
        finally {
            setBusy(false);
        }
    }
    return (<button type="button" onClick={() => void handleShare()} aria-label={`Share ${title}`} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2 focus-ring ${className}`}>
      <span aria-hidden="true">↗</span>
      <span aria-hidden="true">Share</span>
    </button>);
}
// Old browsers / insecure origins have no async clipboard API: use a temporary textarea.
function copyWithFallback(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
        return document.execCommand("copy");
    }
    catch {
        return false;
    }
    finally {
        area.remove();
    }
}
