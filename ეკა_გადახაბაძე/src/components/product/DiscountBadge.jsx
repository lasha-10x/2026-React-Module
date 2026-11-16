import { hasVisibleDiscount } from '../../utils/format';
/** Green "−9%" badge, only for discounts of 1% or more. */
export default function DiscountBadge({ discountPercentage }) {
    if (!hasVisibleDiscount(discountPercentage))
        return null;
    return (<span className="rounded-full bg-sage px-2.5 py-1 text-xs font-bold text-white tabular-nums">
      −{Math.round(discountPercentage)}%
    </span>);
}
