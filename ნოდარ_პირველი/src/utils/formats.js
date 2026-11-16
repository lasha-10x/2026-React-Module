// ფასი → "$1,299.00". Intl.NumberFormat ბრაუზერის ჩაშენებული ფორმატერია
export function formatPrice(amount, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
// ფასდაკლებული ფასი = price × (1 − pct / 100), 2 ათწილადამდე.
// ერთ ადგილას ვითვლით, რომ ბარათი, დეტალები და კალათა ერთნაირ ციფრს აჩვენებდეს
export function discountedPrice(price, pct) {
    return Math.round(price * (1 - pct / 100) * 100) / 100;
}
