import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { PROMO_CODE, PROMO_PERCENT } from "@/utils/constants";
import Button from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
export default function PromoForm() {
    const { cart, applyPromo, removePromo } = useCart();
    const { toast } = useToast();
    const [code, setCode] = useState("");
    const [error, setError] = useState(undefined);
    function handleSubmit(e) {
        e.preventDefault();
        if (applyPromo(code)) {
            setError(undefined);
            setCode("");
            toast(`Promo ${PROMO_CODE} applied ✓`);
        }
        else {
            setError("Invalid promo code");
        }
    }
    if (cart.hasPromo) {
        return (<div className="flex items-center justify-between gap-3 rounded-lg bg-success/10 px-3 py-2 text-sm">
        <span>
          Discount ({PROMO_CODE} −{PROMO_PERCENT}%) applied
        </span>
        <button type="button" onClick={removePromo} className="rounded font-semibold text-accent underline focus-ring">
          Remove
        </button>
      </div>);
    }
    return (<form onSubmit={handleSubmit} noValidate className="flex items-start gap-2">
      <div className="flex-1">
        <TextField label="Promo code" name="promo" value={code} onChange={(e) => {
            setCode(e.target.value);
            setError(undefined);
        }} error={error} placeholder="Try 10X10" autoComplete="off"/>
      </div>
      <Button type="submit" variant="secondary" className="mt-6">
        Apply
      </Button>
    </form>);
}
