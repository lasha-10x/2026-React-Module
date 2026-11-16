// Unit tests for the pure business logic. Run with:  npx tsx --test tests/unit/logic.test.ts
// Each test name starts with the requirement it checks (see docs/TEST-REPORT.md).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiClient } from "@/api/ApiClient";
import { ApiError, describeError, isApiError } from "@/api/ApiError";
import { cartReducer, emptyCart } from "@/context/cart.reducer";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { StorageService } from "@/models/StorageService";
import { isCartState, isOrderList, isProduct, isAuthUser } from "@/utils/guards";
import { parseCatalogParams } from "@/utils/catalogParams";
import { discountedPrice, formatPrice, round2 } from "@/utils/format";
import { loginSchema } from "@/utils/loginSchema";
import { detectCardBrand, formatCardNumber, formatExpiry, isValidLuhn } from "@/utils/luhn";
import { getFromPath, parsePositiveInt } from "@/utils/routing";
import { ensureSorted } from "@/utils/sort";
import { buildProductsUrl } from "@/utils/url";
import { validateCheckout, validateProfile, validateReview } from "@/utils/validation";
function item(over = {}) {
    return { productId: 1, title: "P", thumbnail: "t", price: 100, discountPercentage: 0, stock: 10, quantity: 1, ...over };
}
function prod(over = {}) {
    return { id: 1, title: "P", thumbnail: "t", price: 100, discountPercentage: 0, stock: 5, ...over };
}
function deepFreeze(value) {
    if (typeof value === "object" && value !== null) {
        Object.values(value).forEach(deepFreeze);
        Object.freeze(value);
    }
    return value;
}
describe("A1.6/P2.3 price helpers", () => {
    it("P2.3 discountedPrice = price x (1 - pct/100), 2 decimals", () => {
        assert.equal(discountedPrice(100, 10), 90);
        assert.equal(discountedPrice(9.99, 7.17), 9.27);
        assert.equal(discountedPrice(50, 0), 50);
    });
    it("P2.3 formatPrice -> $1,299.00", () => {
        assert.equal(formatPrice(1299), "$1,299.00");
        assert.equal(formatPrice(0.5), "$0.50");
    });
    it("round2 avoids float drift", () => {
        assert.equal(round2(1.005), 1.01);
        assert.equal(round2(0.1 + 0.2), 0.3);
    });
});
describe("P4.3/T4 Cart class", () => {
    it("P4.3 subtotal = sum(discounted unit price x quantity)", () => {
        const cart = new Cart([item({ price: 100, discountPercentage: 10, quantity: 2 }), item({ productId: 2, price: 20, quantity: 3 })], null);
        assert.equal(cart.subtotal(), 240);
    });
    it("T4 itemCount getter = sum of quantities; isEmpty", () => {
        const cart = new Cart([item({ quantity: 2 }), item({ productId: 2, quantity: 5 })], null);
        assert.equal(cart.itemCount, 7);
        assert.equal(new Cart([], null).isEmpty, true);
    });
    it("P4.4 promo 10X10 gives 10% discount", () => {
        const cart = new Cart([item({ price: 200 })], "10X10");
        assert.equal(cart.discount(), 20);
        assert.equal(cart.total(), 180);
    });
    it("P4.4 unknown promo code gives no discount", () => {
        assert.equal(new Cart([item()], "ABC").discount(), 0);
    });
    it("P4.3 shipping: $10 under $100, free from $100 (boundary)", () => {
        assert.equal(new Cart([item({ price: 99.99 })], null).shipping(), Cart.SHIPPING_COST);
        assert.equal(new Cart([item({ price: 100 })], null).shipping(), 0);
    });
    it("P4.3 free-shipping threshold is checked AFTER the promo discount", () => {
        const cart = new Cart([item({ price: 105 })], "10X10"); // 105 - 10.5 = 94.5
        assert.equal(cart.shipping(), 10);
        assert.equal(cart.total(), 104.5);
    });
    it("P4.1 empty cart: everything is 0", () => {
        const cart = new Cart([], "10X10");
        assert.deepEqual([cart.subtotal(), cart.discount(), cart.shipping(), cart.total()], [0, 0, 0, 0]);
    });
    it("T4 static constants", () => {
        assert.equal(Cart.FREE_SHIPPING_FROM, 100);
        assert.equal(Cart.SHIPPING_COST, 10);
    });
});
describe("P4.2 cartReducer (pure, immutable, stock-safe)", () => {
    it("ADD_ITEM adds a new line", () => {
        const next = cartReducer(emptyCart, { type: "ADD_ITEM", product: prod(), qty: 2 });
        assert.equal(next.items.length, 1);
        assert.equal(next.items[0].quantity, 2);
    });
    it("ADD_ITEM on an existing product increases quantity", () => {
        const a = cartReducer(emptyCart, { type: "ADD_ITEM", product: prod(), qty: 2 });
        const b = cartReducer(a, { type: "ADD_ITEM", product: prod(), qty: 1 });
        assert.equal(b.items.length, 1);
        assert.equal(b.items[0].quantity, 3);
    });
    it("ADD_ITEM never exceeds stock (state is returned unchanged)", () => {
        const a = cartReducer(emptyCart, { type: "ADD_ITEM", product: prod({ stock: 3 }), qty: 3 });
        const b = cartReducer(a, { type: "ADD_ITEM", product: prod({ stock: 3 }), qty: 1 });
        assert.equal(b, a);
        const c = cartReducer(emptyCart, { type: "ADD_ITEM", product: prod({ stock: 3 }), qty: 4 });
        assert.equal(c, emptyCart);
    });
    it("ADD_ITEM ignores qty < 1 and non-integers", () => {
        assert.equal(cartReducer(emptyCart, { type: "ADD_ITEM", product: prod(), qty: 0 }), emptyCart);
        assert.equal(cartReducer(emptyCart, { type: "ADD_ITEM", product: prod(), qty: 1.5 }), emptyCart);
    });
    it("SET_QTY clamps to 1..stock", () => {
        const a = cartReducer(emptyCart, { type: "ADD_ITEM", product: prod({ stock: 4 }), qty: 2 });
        assert.equal(cartReducer(a, { type: "SET_QTY", productId: 1, qty: 99 }).items[0].quantity, 4);
        assert.equal(cartReducer(a, { type: "SET_QTY", productId: 1, qty: 0 }).items[0].quantity, 1);
        assert.equal(cartReducer(a, { type: "SET_QTY", productId: 1, qty: -5 }).items[0].quantity, 1);
    });
    it("REMOVE_ITEM filters the line out", () => {
        const a = cartReducer(emptyCart, { type: "ADD_ITEM", product: prod(), qty: 1 });
        assert.equal(cartReducer(a, { type: "REMOVE_ITEM", productId: 1 }).items.length, 0);
    });
    it("CLEAR empties items AND promoCode", () => {
        const a = { items: [item()], promoCode: "10X10" };
        assert.deepEqual(cartReducer(a, { type: "CLEAR" }), { items: [], promoCode: null });
    });
    it("APPLY_PROMO is case-insensitive; invalid code leaves state unchanged", () => {
        const a = cartReducer(emptyCart, { type: "APPLY_PROMO", code: " 10x10 " });
        assert.equal(a.promoCode, "10X10");
        assert.equal(cartReducer(emptyCart, { type: "APPLY_PROMO", code: "abc" }), emptyCart);
    });
    it("REMOVE_PROMO clears the code", () => {
        assert.equal(cartReducer({ items: [], promoCode: "10X10" }, { type: "REMOVE_PROMO" }).promoCode, null);
    });
    it("immutability: frozen input state is never mutated and a new object is returned", () => {
        const frozen = deepFreeze({ items: [item({ quantity: 1 })], promoCode: null });
        const a = cartReducer(frozen, { type: "ADD_ITEM", product: prod({ stock: 9 }), qty: 1 });
        const b = cartReducer(frozen, { type: "SET_QTY", productId: 1, qty: 3 });
        const c = cartReducer(frozen, { type: "REMOVE_ITEM", productId: 1 });
        assert.notEqual(a, frozen);
        assert.notEqual(b, frozen);
        assert.notEqual(c, frozen);
        assert.equal(frozen.items[0].quantity, 1);
    });
});
describe("P6.2/T4 Order", () => {
    const placed = "2026-01-01T10:00:00.000Z";
    const at = (ms) => new Date(new Date(placed).getTime() + ms);
    it("P6.2 status < 1 min = Processing", () => {
        assert.equal(Order.statusAt(placed, at(0)), "Processing");
        assert.equal(Order.statusAt(placed, at(59_999)), "Processing");
    });
    it("P6.2 status 1-3 min = Shipped (boundaries)", () => {
        assert.equal(Order.statusAt(placed, at(60_000)), "Shipped");
        assert.equal(Order.statusAt(placed, at(180_000)), "Shipped");
    });
    it("P6.2 status > 3 min = Delivered", () => {
        assert.equal(Order.statusAt(placed, at(180_001)), "Delivered");
        assert.equal(Order.statusAt(placed, at(3_600_000)), "Delivered");
    });
    it("T4 Order.create: number format 10X-00002, totals from Cart, no payment data", () => {
        const cart = new Cart([item({ price: 200 })], "10X10");
        const shipping = { fullName: "Ann Smith", email: "a@b.co", address: "1 Main St", city: "Tbilisi", phone: "", postalCode: "", country: "Georgia" };
        const data = Order.create(cart, shipping, 2, new Date(placed)).toJSON();
        assert.equal(data.number, "10X-00002");
        assert.equal(data.id, new Date(placed).getTime());
        assert.equal(data.total, cart.total());
        assert.equal(data.promoCode, "10X10");
        assert.equal(data.placedAt, placed);
        assert.equal(JSON.stringify(data).toLowerCase().includes("card"), false);
    });
    it("T4 Order copies the cart lines (later cart changes do not affect the order)", () => {
        const line = item({ quantity: 2 });
        const data = Order.create(new Cart([line], null), { fullName: "A B C", email: "a@b.co", address: "12345", city: "X", phone: "", postalCode: "", country: "Georgia" }, 1).toJSON();
        line.quantity = 99;
        assert.equal(data.items[0].quantity, 2);
    });
    it("T4 getStatus(now) is an instance method that does not mutate", () => {
        const o = Order.from(Order.create(new Cart([item()], null), { fullName: "A B C", email: "a@b.co", address: "12345", city: "X", phone: "", postalCode: "", country: "Georgia" }, 1, new Date(placed)).toJSON());
        assert.equal(o.getStatus(at(120_000)), "Shipped");
        assert.equal(o.getStatus(at(120_000)), "Shipped");
    });
});
describe("P2/A1.6 URL building and parsing", () => {
    it("A1.6 default list: limit=12&skip=0", () => {
        assert.equal(buildProductsUrl({ q: "", category: "", sort: "", page: 1 }), "/products?limit=12&skip=0");
    });
    it("P2.7 skip = (page-1) x 12", () => {
        assert.match(buildProductsUrl({ q: "", category: "", sort: "", page: 3 }), /skip=24/);
    });
    it("P2.4 search endpoint", () => {
        assert.equal(buildProductsUrl({ q: "phone", category: "", sort: "", page: 1 }), "/products/search?limit=12&skip=0&q=phone");
    });
    it("P2.5 category endpoint", () => {
        assert.equal(buildProductsUrl({ q: "", category: "smartphones", sort: "", page: 1 }), "/products/category/smartphones?limit=12&skip=0");
    });
    it("P2.8 search and category are mutually exclusive (search wins)", () => {
        assert.match(buildProductsUrl({ q: "x", category: "laptops", sort: "", page: 1 }), /^\/products\/search/);
    });
    it("P2.6 all four sort options map to sortBy and order", () => {
        const f = (sort) => buildProductsUrl({ q: "", category: "", sort, page: 1 });
        assert.match(f("price-asc"), /sortBy=price&order=asc/);
        assert.match(f("price-desc"), /sortBy=price&order=desc/);
        assert.match(f("rating-desc"), /sortBy=rating&order=desc/);
        assert.match(f("title-asc"), /sortBy=title&order=asc/);
    });
    it("P2.8 parseCatalogParams: invalid page -> 1, invalid sort -> empty, q wins over category, trims", () => {
        assert.deepEqual(parseCatalogParams(new URLSearchParams("page=abc&sort=evil")), { q: "", category: "", sort: "", page: 1 });
        assert.equal(parseCatalogParams(new URLSearchParams("page=-2")).page, 1);
        assert.equal(parseCatalogParams(new URLSearchParams("page=2.5")).page, 1);
        assert.deepEqual(parseCatalogParams(new URLSearchParams("q=%20phone%20&category=laptops")), { q: "phone", category: "", sort: "", page: 1 });
        assert.equal(parseCatalogParams(new URLSearchParams("page=4&sort=price-asc")).page, 4);
    });
    it("P2.6 ensureSorted: re-sorts only when the server ignored the sort", () => {
        const p = (id, price) => ({ id, price });
        const wrong = [p(1, 30), p(2, 10), p(3, 20)];
        assert.deepEqual(ensureSorted(wrong, "price-asc").map((x) => x.id), [2, 3, 1]);
        const right = [p(1, 1), p(2, 2)];
        assert.equal(ensureSorted(right, "price-asc"), right);
        assert.equal(ensureSorted(wrong, ""), wrong);
    });
    it("P3.2 parsePositiveInt rejects abc, -1, 1.5, 0, empty", () => {
        for (const bad of ["abc", "-1", "1.5", "0", "", "1e3", undefined])
            assert.equal(parsePositiveInt(bad), null);
        assert.equal(parsePositiveInt("5"), 5);
    });
    it("P1.3 getFromPath: only app-internal paths are accepted", () => {
        assert.equal(getFromPath({ from: "/checkout" }), "/checkout");
        assert.equal(getFromPath({ from: "https://evil.com" }), "/");
        assert.equal(getFromPath(null), "/");
        assert.equal(getFromPath(undefined), "/");
    });
});
describe("Luhn card number check", () => {
    it("accepts well-known valid test numbers, with or without spaces", () => {
        for (const n of ["4242424242424242", "4242 4242 4242 4242", "5555555555554444", "378282246310005", "6011111111111117"]) {
            assert.equal(isValidLuhn(n), true, n);
        }
    });
    it("rejects a changed digit, swapped digits and non-digits", () => {
        for (const n of ["4242424242424241", "4242424242424243", "5555555555554445", "abcd", "", "4242-4242-4242-424x"]) {
            assert.equal(isValidLuhn(n), false, n);
        }
    });
    it("checkout card messages", () => {
        const base = { fullName: "Ann Smith", email: "a@b.co", address: "1 Main St", city: "T", phone: "", postalCode: "", country: "Georgia", cardExpiry: "12/99", cardCvc: "123" };
        assert.equal(validateCheckout({ ...base, cardNumber: "" }).cardNumber, "Card number is required");
        assert.equal(validateCheckout({ ...base, cardNumber: "4242" }).cardNumber, "Card number must be 13-19 digits");
        assert.equal(validateCheckout({ ...base, cardNumber: "4242 4242 4242 4241" }).cardNumber, "Card number is invalid, please check the digits");
        assert.equal(validateCheckout({ ...base, cardNumber: "4242 4242 4242 4242" }).cardNumber, undefined);
        assert.equal(validateCheckout({ ...base, cardNumber: "4242424242424242", cardCvc: "12" }).cardCvc, "CVC must be 3 or 4 digits");
        assert.equal(validateCheckout({ ...base, cardNumber: "4242424242424242", cardExpiry: "01/20" }).cardExpiry, "Enter a valid future date as MM/YY");
    });
    it("brand detection and formatting", () => {
        assert.equal(detectCardBrand("4242"), "Visa");
        assert.equal(detectCardBrand("5555"), "Mastercard");
        assert.equal(detectCardBrand("3782"), "American Express");
        assert.equal(formatCardNumber("4242424242424242"), "4242 4242 4242 4242");
        assert.equal(formatExpiry("1228"), "12/28");
    });
});
describe("Delivery methods", () => {
    it("standard is free from $100, express never, pickup always", () => {
        assert.equal(new Cart([item({ price: 50 })], null, "standard").shipping(), 10);
        assert.equal(new Cart([item({ price: 100 })], null, "standard").shipping(), 0);
        assert.equal(new Cart([item({ price: 500 })], null, "express").shipping(), 25);
        assert.equal(new Cart([item({ price: 5 })], null, "pickup").shipping(), 0);
    });
    it("reducer SET_DELIVERY stores the method; CLEAR resets it", () => {
        const s = cartReducer(emptyCart, { type: "SET_DELIVERY", method: "express" });
        assert.equal(s.deliveryMethod, "express");
        assert.equal(cartReducer(s, { type: "CLEAR" }).deliveryMethod, undefined);
    });
});
describe("Validation texts are exactly as in the spec", () => {
    const ok = {
        fullName: "Ann Smith",
        email: "a@b.co",
        address: "1 Main St",
        city: "Tbilisi",
        phone: "",
        postalCode: "",
        country: "Georgia",
        cardNumber: "4242 4242 4242 4242",
        cardExpiry: "12/99",
        cardCvc: "123",
    };
    it("P5.2 valid core form passes (4 core fields)", () => {
        assert.deepEqual(validateCheckout(ok), {});
    });
    it("P5.2 empty core fields give the exact messages", () => {
        const e = validateCheckout({ ...ok, fullName: "  ", email: "", address: "", city: " " });
        assert.equal(e.fullName, "Full name must be at least 3 characters");
        assert.equal(e.email, "Please enter a valid email address");
        assert.equal(e.address, "Address must be at least 5 characters");
        assert.equal(e.city, "City is required");
    });
    it("P5.2 boundaries: name 3, address 5", () => {
        assert.equal(validateCheckout({ ...ok, fullName: "Ann" }).fullName, undefined);
        assert.equal(validateCheckout({ ...ok, fullName: "An" }).fullName !== undefined, true);
        assert.equal(validateCheckout({ ...ok, address: "12345" }).address, undefined);
        assert.equal(validateCheckout({ ...ok, address: "1234" }).address !== undefined, true);
    });
    it("P5.2 email formats", () => {
        for (const bad of ["a", "a@", "a@b", "@b.co", "a b@c.co"])
            assert.equal(validateCheckout({ ...ok, email: bad }).email, "Please enter a valid email address");
        assert.equal(validateCheckout({ ...ok, email: "x.y@z.org" }).email, undefined);
    });
    it("P5.2 phone: 9-15 digits, + and spaces allowed", () => {
        const phone = (v) => validateCheckout({ ...ok, phone: v }).phone;
        assert.equal(phone("12345678"), "Please enter a valid phone number");
        assert.equal(phone("123456789"), undefined);
        assert.equal(phone("+995 555 123 456"), undefined);
        assert.equal(phone("123456789012345"), undefined);
        assert.equal(phone("1234567890123456"), "Please enter a valid phone number");
        assert.equal(phone("12ab56789"), "Please enter a valid phone number");
    });
    it("P5.2 postal code 4-10 digits and country", () => {
        assert.equal(validateCheckout({ ...ok, postalCode: "123" }).postalCode, "Postal code must be 4-10 digits");
        assert.equal(validateCheckout({ ...ok, postalCode: "0105" }).postalCode, undefined);
        assert.equal(validateCheckout({ ...ok, country: "" }).country, "Please select a country");
    });
    it("P7.2 profile messages", () => {
        const e = validateProfile({ firstName: "A", lastName: "", email: "x", phone: "12" });
        assert.equal(e.firstName, "First name must be at least 2 characters");
        assert.equal(e.lastName, "Last name must be at least 2 characters");
        assert.equal(e.email, "Please enter a valid email address");
        assert.equal(e.phone, "Please enter a valid phone number");
        assert.deepEqual(validateProfile({ firstName: "Em", lastName: "St", email: "e@s.co", phone: "" }), {});
    });
    it("P3.4 review messages", () => {
        const e = validateReview({ rating: "", comment: "short" });
        assert.equal(e.rating, "Please select a rating");
        assert.equal(e.comment, "Comment must be at least 10 characters");
        assert.deepEqual(validateReview({ rating: "5", comment: "0123456789" }), {});
        assert.equal(validateReview({ rating: "6", comment: "0123456789" }).rating, "Please select a rating");
        assert.equal(validateReview({ rating: "4", comment: "         x         " }).comment !== undefined, true);
    });
    it("P1.2 Yup login schema: exact messages", async () => {
        await assert.rejects(loginSchema.validate({ username: "", password: "" }, { abortEarly: false }), (err) => {
            const msgs = err.errors;
            return msgs.includes("Username is required") && msgs.includes("Password is required");
        });
        await assert.rejects(loginSchema.validate({ username: "  ", password: "123456" }), /Username is required/);
        await assert.rejects(loginSchema.validate({ username: "a", password: "12345" }), /Password must be at least 6 characters/);
        await loginSchema.validate({ username: "emilys", password: "emilyspass" });
    });
});
describe("T3 type guards and StorageService<T>", () => {
    it("T3 isCartState / isOrderList / isProduct / isAuthUser reject junk", () => {
        assert.equal(isCartState({ items: [{ productId: "1" }] }), false);
        assert.equal(isCartState({ items: [item()], promoCode: 5 }), false);
        assert.equal(isCartState({ items: [item()], promoCode: null }), true);
        assert.equal(isCartState(null), false);
        assert.equal(isOrderList([{ id: 1 }]), false);
        assert.equal(isOrderList([]), true);
        assert.equal(isProduct({ id: 1 }), false);
        assert.equal(isAuthUser({ username: "a", isLoggedIn: "yes" }), false);
    });
    it("T4 StorageService: get() returns null for corrupted JSON, wrong shape, or missing key", () => {
        const store = new Map();
        Object.assign(globalThis, {
            localStorage: {
                getItem: (k) => store.get(k) ?? null,
                setItem: (k, v) => void store.set(k, v),
                removeItem: (k) => void store.delete(k),
            },
        });
        const svc = new StorageService("shop_cart", isCartState);
        assert.equal(svc.get(), null);
        store.set("shop_cart", "{not json");
        assert.equal(svc.get(), null);
        store.set("shop_cart", JSON.stringify({ items: "nope" }));
        assert.equal(svc.get(), null);
        svc.set({ items: [item()], promoCode: "10X10" });
        assert.equal(svc.get()?.promoCode, "10X10");
        svc.remove();
        assert.equal(svc.get(), null);
    });
    it("T4 StorageService: set() does not throw when storage is full/unavailable", () => {
        Object.assign(globalThis, {
            localStorage: {
                getItem: () => {
                    throw new Error("denied");
                },
                setItem: () => {
                    throw new Error("quota");
                },
                removeItem: () => {
                    throw new Error("denied");
                },
            },
        });
        const svc = new StorageService("k", isCartState);
        assert.doesNotThrow(() => svc.set(emptyCart));
        assert.doesNotThrow(() => svc.remove());
        assert.equal(svc.get(), null);
    });
});
describe("T4 ApiClient / ApiError", () => {
    const realFetch = globalThis.fetch;
    function stubFetch(impl) {
        globalThis.fetch = ((url, init) => impl(url, init));
    }
    it("T4 get<T> returns parsed JSON and does not send Content-Type on GET", async () => {
        let seen;
        stubFetch(async (_u, init) => {
            seen = init;
            return new Response(JSON.stringify({ ok: 1 }), { status: 200 });
        });
        const data = await new ApiClient("https://x.test").get("/a");
        assert.equal(data.ok, 1);
        assert.deepEqual(seen?.headers, {});
    });
    it("T4 non-2xx -> ApiError with status (404)", async () => {
        stubFetch(async () => new Response("nope", { status: 404 }));
        await assert.rejects(new ApiClient("https://x.test").get("/a"), (e) => isApiError(e) && e.status === 404 && e instanceof Error);
    });
    it("T4 network failure -> ApiError(0)", async () => {
        stubFetch(async () => {
            throw new TypeError("Failed to fetch");
        });
        await assert.rejects(new ApiClient("https://x.test").get("/a"), (e) => isApiError(e) && e.status === 0);
    });
    it("P2.2 AbortError is passed through (not converted to ApiError)", async () => {
        stubFetch(async () => {
            throw new DOMException("aborted", "AbortError");
        });
        await assert.rejects(new ApiClient("https://x.test").get("/a"), (e) => !isApiError(e) && e instanceof DOMException && e.name === "AbortError");
    });
    it("T4 post sends JSON with Content-Type", async () => {
        let seen;
        stubFetch(async (_u, init) => {
            seen = init;
            return new Response("{}", { status: 200 });
        });
        await new ApiClient("https://x.test").post("/a", { a: 1 });
        assert.equal(seen?.method, "POST");
        assert.equal(seen?.body, '{"a":1}');
        assert.deepEqual(seen?.headers, { "Content-Type": "application/json" });
        globalThis.fetch = realFetch;
    });
    it("T4 describeError gives human messages", () => {
        assert.match(describeError(new ApiError(0, "x")), /Network error/);
        assert.match(describeError(new ApiError(500, "x")), /server/i);
        assert.match(describeError(new ApiError(404, "x")), /could not find/i);
        assert.equal(describeError("weird"), "Something unexpected happened.");
    });
});
