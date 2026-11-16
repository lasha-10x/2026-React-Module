import { discountedPrice, formatPrice } from "@/utils/format";
export default function PriceBlock({ price, discountPercentage, size = "md" }) {
    const hasDiscount = discountPercentage >= 1;
    const final = discountedPrice(price, discountPercentage);
    return (<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-bold tabular-nums ${size === "lg" ? "text-3xl" : "text-lg"}`}>{formatPrice(final)}</span>
      {hasDiscount && (<>
          <span className={`text-muted line-through tabular-nums ${size === "lg" ? "text-lg" : "text-sm"}`}>
            <span className="sr-only">Original price </span>
            {formatPrice(price)}
          </span>
          <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-xs font-bold text-success">
            −{Math.round(discountPercentage)}%
          </span>
        </>)}
    </div>);
}
