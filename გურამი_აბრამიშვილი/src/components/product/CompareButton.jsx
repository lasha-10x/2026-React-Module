import { useCompare } from "@/context/CompareContext";
import { useToast } from "@/context/ToastContext";
import { COMPARE_LIMIT } from "@/utils/constants";
export default function CompareButton({ product, className = "" }) {
    const { has, toggle } = useCompare();
    const { toast } = useToast();
    const selected = has(product.id);
    function handleClick() {
        const result = toggle(product);
        if (result === "added")
            toast("Added to compare");
        else if (result === "removed")
            toast("Removed from compare");
        else
            toast(`You can compare up to ${COMPARE_LIMIT} products`, "error");
    }
    return (<button type="button" aria-pressed={selected} aria-label={selected ? `Remove ${product.title} from compare` : `Compare ${product.title}`} onClick={handleClick} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-ring ${selected ? "border-brand bg-brand-soft text-brand dark:bg-surface-2 dark:text-accent" : "border-line bg-surface text-ink hover:bg-surface-2"} ${className}`}>
      <span aria-hidden="true">{selected ? "✓" : "⇄"}</span>
      Compare
    </button>);
}
