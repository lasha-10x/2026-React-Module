import { discountedPrice } from "./formats";
// კალათის ჯამი ფასდაკლებით. ერთი ფორმულა Cart-ისთვის, Checkout-ისთვის და შეკვეთისთვის
export function cartTotal(items) {
    return items.reduce((sum, item) => sum +
        discountedPrice(item.price, item.discountPercentage) * item.quantity, 0);
}
