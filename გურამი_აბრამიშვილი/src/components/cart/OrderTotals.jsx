import { formatPrice } from "@/utils/format";
import { PROMO_CODE, PROMO_PERCENT } from "@/utils/constants";
// Shared by the Cart summary, the Checkout summary and the Order details page.
export default function OrderTotals({ subtotal, discount, shipping, total, promoApplied }) {
    return (<dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted">Subtotal</dt>
        <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
      </div>
      {promoApplied && (<div className="flex justify-between text-success">
          <dt>
            Discount ({PROMO_CODE} −{PROMO_PERCENT}%)
          </dt>
          <dd className="tabular-nums">−{formatPrice(discount)}</dd>
        </div>)}
      <div className="flex justify-between">
        <dt className="text-muted">Shipping</dt>
        <dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
      </div>
      <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatPrice(total)}</dd>
      </div>
    </dl>);
}
