import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import OrderTotals from "@/components/cart/OrderTotals";
import Button from "@/components/ui/Button";
import ButtonLink from "@/components/ui/ButtonLink";
import Card from "@/components/ui/Card";
import PageHeading from "@/components/ui/PageHeading";
import { SelectField, TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useForm } from "@/hooks/useForm";
import { Cart } from "@/models/Cart";
import { COUNTRIES, getDeliveryMethod } from "@/utils/constants";
import { formatPrice, pluralize } from "@/utils/format";
import { detectCardBrand, digitsOnly, formatCardNumber, formatExpiry } from "@/utils/luhn";
import { validateCheckout } from "@/utils/validation";
const PLACE_ORDER_DELAY_MS = 700; // makes the local simulation feel like a real request
export default function CheckoutPage() {
    useDocumentTitle("Checkout");
    const { user } = useAuth();
    const { cart, clearCart } = useCart();
    const { placeOrder } = useOrders();
    const [placing, setPlacing] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [placedOrder, setPlacedOrder] = useState(null);
    const timer = useRef(undefined);
    // Do not leave a pending timeout behind if the user leaves the page while the order is "processing".
    useEffect(() => () => window.clearTimeout(timer.current), []);
    const fullName = user === null ? "" : `${user.firstName} ${user.lastName}`.trim();
    const form = useForm({
        fullName,
        email: user?.email ?? "",
        address: "",
        city: "",
        phone: user?.phone ?? "",
        postalCode: "",
        country: "Georgia",
        cardNumber: "",
        cardExpiry: "",
        cardCvc: "",
    }, validateCheckout);
    // 1. Order placed: show the confirmation (the cart is already empty at this point).
    if (placedOrder !== null)
        return <Confirmation order={placedOrder}/>;
    // 2. Nothing to buy: back to the cart with an explanation.
    if (cart.isEmpty) {
        return <Navigate to="/cart" replace state={{ notice: "Your cart is empty. Add something before checking out." }}/>;
    }
    const submit = form.handleSubmit((values) => {
        setSubmitError(null);
        setPlacing(true); // disables the button: no double submit
        timer.current = window.setTimeout(() => {
            try {
                const order = placeOrder(cart, {
                    fullName: values.fullName.trim(),
                    email: values.email.trim(),
                    address: values.address.trim(),
                    city: values.city.trim(),
                    phone: values.phone.trim(),
                    postalCode: values.postalCode.trim(),
                    country: values.country,
                });
                clearCart(); // badge and cart page update immediately
                setPlacedOrder(order);
            }
            catch {
                // The form state is kept so the user can simply try again.
                setSubmitError("We could not place your order. Please try again.");
                setPlacing(false);
            }
        }, PLACE_ORDER_DELAY_MS);
    });
    const field = (name) => ({
        name,
        value: form.values[name],
        onChange: form.handleChange,
        onBlur: form.handleBlur,
        error: form.fieldError(name),
    });
    // Card inputs are reformatted while typing (4242 4242 …, MM/YY, digits only for CVC).
    const maskedField = (name, mask) => ({
        ...field(name),
        onChange: (e) => form.setFieldValue(name, mask(e.target.value)),
    });
    const cardBrand = detectCardBrand(form.values.cardNumber);
    const cardLooksValid = form.values.cardNumber !== "" && form.errors.cardNumber === undefined;
    const cardHint = cardLooksValid
        ? `${cardBrand === "Unknown" ? "Card" : cardBrand} number looks valid ✓`
        : cardBrand === "Unknown"
            ? "Test number: 4242 4242 4242 4242"
            : cardBrand;
    const delivery = getDeliveryMethod(cart.deliveryMethod);
    return (<div>
      <PageHeading title="Checkout" subtitle="Orders are simulated: your card is validated but never charged."/>

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-lg font-bold">Shipping details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField label="Full name" autoComplete="name" {...field("fullName")}/>
              </div>
              <div className="sm:col-span-2">
                <TextField label="Email" type="email" autoComplete="email" {...field("email")}/>
              </div>
              <div className="sm:col-span-2">
                <TextField label="Address" autoComplete="street-address" {...field("address")}/>
              </div>
              <TextField label="City" autoComplete="address-level2" {...field("city")}/>
              <SelectField label="Country" {...field("country")}>
                {COUNTRIES.map((c) => (<option key={c} value={c}>
                    {c}
                  </option>))}
              </SelectField>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-bold">
              Contact details <span className="text-sm font-normal text-muted">(optional)</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Phone" type="tel" autoComplete="tel" hint="9-15 digits, e.g. +995 555 123 456" {...field("phone")}/>
              <TextField label="Postal code" inputMode="numeric" autoComplete="postal-code" {...field("postalCode")}/>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-bold">Payment card</h2>
            <p className="text-sm text-muted">The card number is checked in your browser (Luhn algorithm). It is never stored or sent anywhere.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" maxLength={23} hint={cardHint} {...maskedField("cardNumber", formatCardNumber)}/>
              </div>
              <TextField label="Expiry date" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" maxLength={5} {...maskedField("cardExpiry", formatExpiry)}/>
              <TextField label="CVC" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} {...maskedField("cardCvc", (raw) => digitsOnly(raw).slice(0, 4))}/>
            </div>
          </Card>
        </div>

        <Card className="space-y-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <ul className="divide-y divide-line text-sm">
            {cart.lines.map((item) => (<li key={item.productId} className="flex justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.title}</span>
                  <span className="text-muted">× {item.quantity}</span>
                </span>
                <span className="shrink-0 tabular-nums">{formatPrice(Cart.lineTotal(item))}</span>
              </li>))}
          </ul>
          <p className="flex items-start justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2 text-sm">
            <span>
              <span className="block font-medium">{delivery.label}</span>
              <span className="text-muted">{delivery.eta}</span>
            </span>
            <Link to="/cart" className="shrink-0 rounded font-medium text-accent hover:underline focus-ring">
              Change
            </Link>
          </p>
          <OrderTotals subtotal={cart.subtotal()} discount={cart.discount()} shipping={cart.shipping()} total={cart.total()} promoApplied={cart.hasPromo}/>
          {submitError !== null && (<p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {submitError}
            </p>)}
          <Button type="submit" className="w-full" disabled={placing}>
            {placing ? "Placing order…" : "Place order"}
          </Button>
          <Link to="/cart" className="block rounded text-center text-sm font-medium text-accent hover:underline focus-ring">
            ← Back to cart
          </Link>
        </Card>
      </form>
    </div>);
}
function Confirmation({ order }) {
    return (<div className="mx-auto max-w-2xl">
      <Card className="space-y-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-3xl text-success" aria-hidden="true">
          ✓
        </div>
        <div role="status">
          <h1 className="text-2xl font-bold">Thank you! Your order has been placed.</h1>
          <p className="mt-2 text-muted">
            Order <span className="font-semibold text-ink">#{order.number}</span> · {pluralize(order.items.length, "product")} · Total{" "}
            <span className="font-semibold text-ink">{formatPrice(order.total)}</span>
          </p>
        </div>

        <ul className="divide-y divide-line rounded-lg border border-line text-left text-sm">
          {order.items.map((item) => (<li key={item.productId} className="flex justify-between gap-3 px-4 py-2">
              <span className="min-w-0 truncate">
                {item.title} <span className="text-muted">× {item.quantity}</span>
              </span>
              <span className="shrink-0 tabular-nums">{formatPrice(Cart.lineTotal(item))}</span>
            </li>))}
        </ul>

        <p className="text-sm text-muted">
          We will send a confirmation to <span className="font-medium text-ink">{order.shipping.email}</span> (simulated).
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink to={`/orders/${order.id}`} state={{ justPlaced: true }}>
            View order
          </ButtonLink>
          <ButtonLink to="/" variant="secondary">
            Continue shopping
          </ButtonLink>
        </div>
      </Card>
    </div>);
}
