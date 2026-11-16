import { useLocation, useNavigate, useParams } from "react-router-dom";
import OrderStatusBadge from "@/components/cart/OrderStatusBadge";
import OrderTotals from "@/components/cart/OrderTotals";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNow } from "@/hooks/useNow";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { DEFAULT_DELIVERY_METHOD, getDeliveryMethod } from "@/utils/constants";
import { formatDateTime, formatPrice } from "@/utils/format";
import { getBooleanFlag, parsePositiveInt } from "@/utils/routing";
import NotFoundPage from "./NotFoundPage";
const STEPS = ["Processing", "Shipped", "Delivered"];
export default function OrderDetailsPage() {
    const { id } = useParams();
    const { orders } = useOrders();
    const orderId = parsePositiveInt(id);
    const order = orderId === null ? undefined : orders.find((o) => o.id === orderId);
    return order === undefined ? <NotFoundPage /> : <OrderDetails order={order}/>;
}
function OrderDetails({ order }) {
    useDocumentTitle(`Order ${order.number}`);
    const now = useNow(30_000);
    const location = useLocation();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { toast } = useToast();
    const deliveryMethod = getDeliveryMethod(order.deliveryMethod ?? DEFAULT_DELIVERY_METHOD);
    const status = Order.statusAt(order.placedAt, now);
    const reached = STEPS.indexOf(status);
    const justPlaced = getBooleanFlag(location.state, "justPlaced");
    function handleReorder() {
        let added = 0;
        let skipped = 0;
        for (const item of order.items) {
            const result = addItem({
                id: item.productId,
                title: item.title,
                thumbnail: item.thumbnail,
                price: item.price,
                discountPercentage: item.discountPercentage,
                stock: item.stock,
            }, item.quantity);
            if (result.ok)
                added += 1;
            else
                skipped += 1;
        }
        toast(skipped === 0 ? "Items added to cart ✓" : `${added} added, ${skipped} skipped (not enough stock)`, skipped === 0 ? "success" : "error");
        navigate("/cart");
    }
    return (<div className="space-y-6">
      {justPlaced && (<p role="status" className="rounded-lg bg-success/15 px-4 py-3 font-medium text-success">
          Thank you! Your order has been placed.
        </p>)}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Order #{order.number}</h1>
          <p className="text-sm text-muted">Placed on {formatDateTime(order.placedAt)}</p>
        </div>
        <OrderStatusBadge status={status}/>
      </div>

      <Card>
        <ol className="flex items-center justify-between gap-2 text-sm" aria-label="Order progress">
          {STEPS.map((step, i) => (<li key={step} className="flex flex-1 flex-col items-center gap-1 text-center">
              <span className={`flex size-8 items-center justify-center rounded-full font-bold ${i <= reached ? "bg-success text-white" : "bg-surface-2 text-muted"}`} aria-hidden="true">
                {i <= reached ? "✓" : "○"}
              </span>
              <span className={i <= reached ? "font-semibold" : "text-muted"}>
                {step}
                <span className="sr-only">{i <= reached ? " (done)" : " (pending)"}</span>
              </span>
            </li>))}
        </ol>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <Card className="min-w-0">
          <h2 className="mb-2 text-lg font-bold">Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="py-2 pr-3 font-medium">Product</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Price</th>
                  <th className="py-2 pl-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((item) => (<tr key={item.productId}>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <img src={item.thumbnail} alt="" width={48} height={48} loading="lazy" className="size-12 rounded bg-surface-2 object-contain"/>
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{item.quantity}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatPrice(Cart.unitPrice(item))}</td>
                    <td className="py-3 pl-3 text-right font-semibold tabular-nums">{formatPrice(Cart.lineTotal(item))}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card className="space-y-3">
            <h2 className="text-lg font-bold">Delivery</h2>
            <p className="text-sm">
              <span className="font-medium">{deliveryMethod.label}</span>
              <span className="text-muted"> · {deliveryMethod.eta}</span>
            </p>
            <address className="text-sm not-italic leading-relaxed">
              {order.shipping.fullName}
              <br />
              {order.shipping.address}
              <br />
              {order.shipping.postalCode !== "" && `${order.shipping.postalCode} `}
              {order.shipping.city}, {order.shipping.country}
              <br />
              <span className="text-muted">{order.shipping.email}</span>
              {order.shipping.phone !== "" && (<>
                  <br />
                  <span className="text-muted">{order.shipping.phone}</span>
                </>)}
            </address>
            <p className="text-xs text-muted">Payment: simulated, no card or bank data is stored.</p>
          </Card>

          <Card className="space-y-4">
            <OrderTotals subtotal={order.subtotal} discount={order.discount} shipping={order.shippingCost} total={order.total} promoApplied={order.promoCode !== null}/>
            <Button className="w-full" onClick={handleReorder}>
              Reorder
            </Button>
          </Card>
        </div>
      </div>

      <ButtonLink to="/orders" variant="secondary">
        ← All orders
      </ButtonLink>
    </div>);
}
