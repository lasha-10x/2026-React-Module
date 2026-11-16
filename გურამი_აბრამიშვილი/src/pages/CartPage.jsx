import { useLocation, useNavigate } from "react-router-dom";
import CartLine from "@/components/cart/CartLine";
import DeliveryMethods from "@/components/cart/DeliveryMethods";
import OrderTotals from "@/components/cart/OrderTotals";
import PromoForm from "@/components/cart/PromoForm";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import PageHeading from "@/components/ui/PageHeading";
import { EmptyState } from "@/components/ui/StatusMessage";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { pluralize } from "@/utils/format";
import { getStringFlag } from "@/utils/routing";
export default function CartPage() {
    useDocumentTitle("Cart");
    const { cart, state, setQuantity, removeItem, clearCart, setDeliveryMethod } = useCart();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const notice = getStringFlag(location.state, "notice"); // e.g. sent here from an empty Checkout
    function handleRemove(productId) {
        removeItem(productId);
        toast("Removed from cart");
    }
    function handleClear() {
        if (window.confirm("Clear the cart? This cannot be undone."))
            clearCart();
    }
    if (cart.isEmpty) {
        return (<div>
        <PageHeading title="Your cart"/>
        {notice !== null && (<p role="status" className="mb-4 rounded-lg bg-warn/15 px-4 py-3 text-sm font-medium text-warn">
            {notice}
          </p>)}
        <EmptyState title="Your cart is empty.">
          <ButtonLink to="/">Browse products</ButtonLink>
        </EmptyState>
      </div>);
    }
    return (<div>
      <PageHeading title="Your cart" subtitle={pluralize(cart.itemCount, "item")}/>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <Card>
          <ul className="divide-y divide-line">
            {state.items.map((item) => (<CartLine key={item.productId} item={item} onQuantityChange={setQuantity} onRemove={handleRemove}/>))}
          </ul>
          <div className="mt-2 border-t border-line pt-4">
            <Button variant="danger" size="sm" onClick={handleClear}>
              Clear cart
            </Button>
          </div>
        </Card>

        {/* Summary: on mobile it sits under the list, on desktop it sticks to the right */}
        <Card className="space-y-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <PromoForm />
          <DeliveryMethods value={cart.deliveryMethod} amountAfterDiscount={cart.subtotal() - cart.discount()} onChange={setDeliveryMethod}/>
          <OrderTotals subtotal={cart.subtotal()} discount={cart.discount()} shipping={cart.shipping()} total={cart.total()} promoApplied={cart.hasPromo}/>
          <p className="text-xs text-muted">Free shipping with standard delivery on orders of $100 or more.</p>
          <Button className="w-full" onClick={() => navigate("/checkout")}>
            Proceed to checkout
          </Button>
        </Card>
      </div>
    </div>);
}
