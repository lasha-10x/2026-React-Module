import { Link } from "react-router-dom";
import ButtonLink from "@/components/ui/ButtonLink";
import PageHeading from "@/components/ui/PageHeading";
import { EmptyState } from "@/components/ui/StatusMessage";
import OrderStatusBadge from "@/components/cart/OrderStatusBadge";
import { useOrders } from "@/context/OrdersContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNow } from "@/hooks/useNow";
import { Order } from "@/models/Order";
import { formatDateTime, formatPrice, pluralize } from "@/utils/format";
export default function OrdersPage() {
    useDocumentTitle("Orders");
    const { orders } = useOrders();
    // Statuses are recomputed every 30 s, so an order "ships" in front of the user without a reload.
    const now = useNow(30_000);
    return (<div>
      <PageHeading title="My orders" subtitle={orders.length === 0 ? undefined : pluralize(orders.length, "order")}/>

      {orders.length === 0 ? (<EmptyState title="You have no orders yet.">
          <ButtonLink to="/">Browse products</ButtonLink>
        </EmptyState>) : (<ul className="space-y-3">
          {orders.map((order) => (<li key={order.id}>
              <Link to={`/orders/${order.id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md focus-ring">
                <div>
                  <p className="font-bold">#{order.number}</p>
                  <p className="text-sm text-muted">
                    {formatDateTime(order.placedAt)} · {pluralize(order.items.reduce((n, i) => n + i.quantity, 0), "item")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={Order.statusAt(order.placedAt, now)}/>
                  <p className="font-bold tabular-nums">{formatPrice(order.total)}</p>
                </div>
              </Link>
            </li>))}
        </ul>)}
    </div>);
}
