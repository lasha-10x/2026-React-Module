import { Link } from "react-router-dom";
import { Cart } from "@/models/Cart";
import { formatPrice } from "@/utils/format";
import { productUrl } from "@/utils/slug";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
export default function CartLine({ item, onQuantityChange, onRemove }) {
    return (<li className="flex gap-3 py-4 sm:gap-4">
      <Link to={productUrl(item)} className="shrink-0 rounded-lg focus-ring" aria-label={`View ${item.title}`}>
        <img src={item.thumbnail} alt="" width={96} height={96} loading="lazy" className="size-20 rounded-lg bg-surface-2 object-contain sm:size-24"/>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <Link to={productUrl(item)} className="font-semibold hover:text-accent focus-ring rounded">
            {item.title}
          </Link>
          <p className="font-bold tabular-nums">{formatPrice(Cart.lineTotal(item))}</p>
        </div>
        <p className="text-sm text-muted">{formatPrice(Cart.unitPrice(item))} each</p>

        <div className="mt-auto flex flex-wrap items-center gap-3">
          <QuantityStepper value={item.quantity} max={item.stock} onChange={(next) => onQuantityChange(item.productId, next)} label={`Quantity of ${item.title}`}/>
          <Button variant="ghost" size="sm" onClick={() => onRemove(item.productId)} aria-label={`Remove ${item.title} from cart`}>
            Remove
          </Button>
          {item.quantity >= item.stock && <span className="text-xs text-warn">Max stock reached</span>}
        </div>
      </div>
    </li>);
}
