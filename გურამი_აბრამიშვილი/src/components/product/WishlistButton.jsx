import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
export default function WishlistButton({ product, className = "", showLabel = false }) {
    const { has, toggle } = useWishlist();
    const { toast } = useToast();
    const saved = has(product.id);
    const shape = showLabel
        ? `min-h-11 gap-2 rounded-lg px-3 text-sm font-medium ${saved ? "border-danger/40" : ""}`
        : "size-11 rounded-full text-xl";
    return (<button type="button" aria-pressed={saved} aria-label={saved ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`} onClick={() => {
            const added = toggle(product);
            toast(added ? "Saved to wishlist ♥" : "Removed from wishlist");
        }} className={`inline-flex items-center justify-center border border-line bg-surface/90 backdrop-blur transition-colors hover:bg-surface-2 focus-ring ${shape} ${saved ? "text-danger" : showLabel ? "text-ink" : "text-muted"} ${className}`}>
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
      {showLabel && <span aria-hidden="true">{saved ? "Saved" : "Wishlist"}</span>}
    </button>);
}
