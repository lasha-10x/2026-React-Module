# TEST REPORT

Generated: 2026-11-11 · **191/191 checks pass, 0 fail**

Every row has an ID that points to the requirement it verifies: `STEP-n` = PRD step n, `Pn.n` / `Tn` / `On` / `TWn` = section of Appendix A, `BONUS` = bonus feature.

## Environment
- Browser tests: Playwright with headless Chromium 153 (desktop 1280x900 and phone viewport 375x800)
- The product API is **mocked** (`tests/mock_api.py`): the sandbox cannot reach dummyjson.com. Please also check the live API by hand (catalog, search, sort, product page) after deployment.
- Unit tests: Node test runner through `tsx`
- Accessibility: axe-core, light and dark theme, 9 pages each

## Summary

| Suite | Tests | Pass | Fail |
| --- | --- | --- | --- |
| Unit tests (`tests/unit/logic.test.ts`) | 55 | 55 | 0 |
| A: Routing, layout, header, authentication, login form | 21 | 21 | 0 |
| B: Catalog (search, filters, sort, pagination) and product page | 40 | 40 | 0 |
| C: Cart, checkout, orders, profile | 29 | 29 | 0 |
| D: Responsive layout, Tailwind, performance, Error Boundary, full user journey | 18 | 18 | 0 |
| E: Accessibility (axe-core, keyboard) | 6 | 6 | 0 |
| S: Static checks: build, lint, TypeScript rules, architecture, documents | 22 | 22 | 0 |

Browser and static checks by requirement level: BONUS 4/4, CORE 81/81, FULL 51/51

## Measured bundle size

Main JS chunk: **87.8 kB gzip**; 27 JS chunks in total (limit in the spec: 250 kB).

## A. Routing, layout, header, authentication, login form

| ID | Level | What is verified | Result |
| --- | --- | --- | --- |
| STEP-4 | CORE | Routes /, /login, /products/:id, /cart, /checkout (guarded) and * all render | PASS |
| STEP-4 | CORE | Navigation does not reload the page (SPA) | PASS |
| P0.1 | CORE | One shared Layout: exactly one header / main / footer on every page | PASS |
| P0.1 | CORE | Current page link is visually marked (NavLink active -> aria-current) | PASS |
| P0.1 | CORE | ScrollToTop: a new route starts at the top | PASS |
| P0.1 | CORE | 404 page: exact title/text and 'Go to catalog' link (also for /products/999999, /products/abc) | PASS |
| P3.2 | CORE | /products/abc shows NotFound WITHOUT any API request | PASS |
| STEP-6 | CORE | Guest /checkout -> /login, after login returns to /checkout | PASS |
| P1.3 | CORE | Login opened from the header returns to the catalog (not checkout) | PASS |
| P0.3 | CORE | Logout -> guest state, navigates to '/', cart is NOT cleared | PASS |
| P0.3 | CORE | Header: logo, badge hidden at 0, Orders/Profile only when logged in | PASS |
| P0.3 | CORE | Cart badge = sum of quantities (3 + 1 = 4) | PASS |
| P1.2 | CORE | Empty Username/Password -> exact errors, form does not submit | PASS |
| P1.2 | CORE | Username is trimmed; Password < 6 chars -> exact message | PASS |
| P0.5 | CORE | Field error is attached to its field (aria-describedby) | PASS |
| P1.3 | CORE | Valid login: no reload, Context updated, password never stored | PASS |
| P1 | CORE | '← Back to catalog' link on the login page | PASS |
| P1 | FULL | Logged-in user opening /login is sent away | PASS |
| STEP-18 | FULL | Formik + Yup installed and used in Login (useFormik + Yup schema) | PASS |
| P1 | FULL | Login has a loading/disabled submit state | PASS |
| O2 | CORE | No unexpected console errors or warnings during all browser tests | PASS |

## B. Catalog (search, filters, sort, pagination) and product page

| ID | Level | What is verified | Result |
| --- | --- | --- | --- |
| STEP-7 | CORE | Catalog: GET /products?limit=12&skip=0, 12 cards, title + result count | PASS |
| P2.3 | CORE | Card shows thumbnail (lazy, width/height, alt), category · brand, rating, Add to cart | PASS |
| P2.3 | CORE | Discount badge only when discount >= 1; original price struck through | PASS |
| P3.3 | CORE | Stock badge: In stock / Only N left! / Out of stock (stepper + button disabled) | PASS |
| P2.3 | CORE | Low-stock threshold is exactly stock <= 5 | PASS |
| P2.4/④ | CORE | Card click opens details; the Add to cart button does not navigate (toast 'Added to cart ✓') | PASS |
| P2 | CORE | Out-of-stock card: button disabled with 'Out of stock' | PASS |
| STEP-8 | CORE | map() renders with stable keys (no React key warnings in console) | PASS |
| STEP-7 | CORE | API error shows a message (app does not crash); Retry recovers | PASS |
| P2.2 | FULL | Skeleton cards are shown while loading | PASS |
| P2.3 | CORE | Empty result: 'No products found.' + 'Clear filters' clears the URL | PASS |
| P2.4 | FULL | Typing 5 letters fast sends exactly ONE search request (400 ms debounce) | PASS |
| P2.4 | FULL | Search clears category and resets page to 1 (sort is kept) | PASS |
| P2.4 | FULL | Input is prefilled from the URL; clearing it returns the full list | PASS |
| P2.5 | FULL | Categories loaded from API; selecting filters, 'All categories' removes the filter | PASS |
| P2.5 | FULL | Choosing a category clears q (URL and input) | PASS |
| P2.6 | FULL | Sort: 5 exact options; price / rating / name order is correct | PASS |
| P2.6 | FULL | Sort parameters are added to the category endpoint too | PASS |
| P2.7 | FULL | Pagination: skip=(N-1)x12, ‹ › disabled at the edges, 'Showing 13–24 of 30', scroll to top | PASS |
| P2.7/P2.8 | FULL | Page change keeps other params; changing a filter resets page to 1; sort + page combine with any filter | PASS |
| P2.8 | FULL | Refresh, Back/Forward and shared links restore the filter state from the URL | PASS |
| P2.8 | FULL | ?q and ?category together: search wins (mutually exclusive) | PASS |
| P2.2 | FULL | AbortController: the old request is cancelled and can never overwrite the new result | PASS |
| BONUS | BONUS | Grid / list view switch (kept in the URL) | PASS |
| P3.1 | CORE | /products/1: title, image(alt), description, price and discounted price = price x (1 - pct/100) | PASS |
| P3 | CORE | Discounted price matches the formula for several products | PASS |
| P3.2 | CORE | Unknown / invalid id -> NotFound, no crash | PASS |
| P3.2 | FULL | Server error on the product page -> message + Retry (not NotFound) | PASS |
| P3 | CORE | Stepper bounds 1 <= qty <= stock with disabled edges | PASS |
| P3 | CORE | Gallery: thumbnail click changes the main photo (local state) | PASS |
| STEP-11 | CORE | Add to cart with quantity 2: inline message + header badge | PASS |
| P3.3 | CORE | Adding beyond stock is rejected with an exact message; cart stays at 3 | PASS |
| P3 | CORE | Description / Reviews tabs; review count shown in the tab title | PASS |
| P3 | CORE | '← Back to catalog' returns with filters intact (navigate(-1)) | PASS |
| P3.1 | CORE | Category in the product info links to /?category=slug | PASS |
| P3.4 | FULL | Reviews: validation texts, 'Review added ✓', Guest name, order, average changes, survives reload | PASS |
| P3.4 | FULL | Reviewer name = logged-in user's first + last name | PASS |
| P3.5 | FULL | Related: category?limit=5, current excluded, 4 shown, same ProductCard; click loads NEW product data | PASS |
| BONUS | BONUS | Wishlist: heart toggles, persisted, dedicated page with empty state | PASS |
| O2 | CORE | No unexpected console errors or warnings during all browser tests | PASS |

## C. Cart, checkout, orders, profile

| ID | Level | What is verified | Result |
| --- | --- | --- | --- |
| STEP-13 | CORE | Cart page lists items; Subtotal / Shipping / Total match independent calculation | PASS |
| STEP-13 | CORE | Quantity change updates totals + badge; Remove updates list ('Removed from cart') | PASS |
| P4.2 | CORE | Cart quantity cannot go below 1 (disabled) and above stock | PASS |
| P4.2 | CORE | Cart survives reload (shop_cart = { items, promoCode }) | PASS |
| P4.4 | FULL | Promo: 'abc' -> Invalid promo code; 10x10 (any case) -> -10%, persists, removable | PASS |
| P4.3 | FULL | Shipping $10 under $100, 'Free' from $100 | PASS |
| P4.1 | CORE | Clear cart: exact confirm() text, then empty state without summary | PASS |
| P4 | CORE | Cancelling the confirm keeps the cart | PASS |
| P5.1 | CORE | Empty cart + /checkout -> redirect to /cart with an explanation | PASS |
| P5.2 | CORE | Empty required fields: exact messages, submit blocked, no order created | PASS |
| P0.5 | FULL | Validation on blur | PASS |
| P5.2 | FULL | Extra shipping fields: phone / postal code messages, Country select (>=5, default Georgia) | PASS |
| P5 | CORE | Order summary on checkout shows items and the same totals | PASS |
| STEP-15 | CORE | Place order: disabled while placing, Thank you + total + order number, cart cleared, no reload | PASS |
| A1.5 | FULL | Order object: id=Date.now(), 10X-00001, ISO date, totals, shipping; no card data | PASS |
| P6.1 | FULL | Orders list: newest first (#10X-00002), number/date/items/total/status badge, click -> details | PASS |
| P6.3 | FULL | Order details: timeline, items table, delivery address, totals, Reorder | PASS |
| P6.3 | FULL | state.justPlaced: green banner only right after the order | PASS |
| P6.3 | FULL | /orders/123456 (unknown) -> NotFound | PASS |
| P6.1 | FULL | Orders/Profile are protected; empty list message + Browse products | PASS |
| P6.3 | FULL | Reorder adds exactly the same products and quantities to the cart | PASS |
| P6.2 | FULL | Status changes Processing -> Shipped -> Delivered by itself (30 s interval, no reload) | PASS |
| P6.2 | FULL | setInterval(30 000) is cleaned up on unmount (clearInterval) | PASS |
| P7 | FULL | Profile: username + order count, exact validation texts, save -> Header shows new name | PASS |
| P0.4/P7 | FULL | Theme toggle: data-theme + shop_theme, one ThemeContext for Header and Profile, survives reload | PASS |
| P7 | FULL | Clear local data clears cart, orders, reviews but keeps session and theme | PASS |
| P0.3 | CORE | Logout from a protected page (/profile, /orders) lands on the catalog; the guard still redirects guests | PASS |
| A1.3 | FULL | Happy path step 6: logout -> login -> orders and cart are still there | PASS |
| O2 | CORE | No unexpected console errors or warnings during all browser tests | PASS |

## D. Responsive layout, Tailwind, performance, Error Boundary, full user journey

| ID | Level | What is verified | Result |
| --- | --- | --- | --- |
| O3/STEP-19 | CORE | 375px: no horizontal scroll on every page (incl. checkout, orders, order details, profile, 404) | PASS |
| O3 | CORE | 375px: every button / input / select / tab is >= 44x44 px | PASS |
| P0.3 | CORE | Mobile: links collapse into a burger menu that closes after navigation | PASS |
| TW3/O3 | CORE | Grid columns per breakpoint: <=480:1, 481-1024:2-3, >1024:4 (mobile-first) | PASS |
| P4.1 | CORE | Cart layout: summary under the list on mobile, to the right on desktop | PASS |
| TW1/TW2 | CORE | Tailwind v4: @import + @tailwindcss/vite, no v3 config/directives, utilities change the real UI | PASS |
| TW4/STEP-20 | CORE | hover / focus / disabled variants really change button + input styles | PASS |
| O3 | CORE | Keyboard focus is visible (focus-visible outline) | PASS |
| TW5 | FULL | @theme design token (--color-brand) is defined and used by a real component | PASS |
| TW6/P0.4 | BONUS | Dark mode changes page and card colours (CSS variables), custom variant + utilities defined | PASS |
| TW6 | BONUS | Saved theme is applied on load (inline script in index.html) | PASS |
| O1/① | FULL | Route-level code splitting: catalog chunk first, other pages' chunks only when opened | PASS |
| O1/② | FULL | All images: alt, width/height (CLS), loading=lazy on grid thumbnails | PASS |
| O1/③ | FULL | Pagination: the full product list is never loaded at once | PASS |
| O2 | CORE | Error Boundary: crash -> 'Something went wrong.' + Reload; navigation recovers | PASS |
| STEP-24 | CORE | Direct open / refresh of /products/5 works (SPA fallback); Vercel + Netlify rewrite files present | PASS |
| STEP-21 | CORE | Full happy path: search -> sort -> product -> cart -> login -> checkout -> confirmation -> order -> profile -> logout | PASS |
| O2 | CORE | No unexpected console errors or warnings during all browser tests | PASS |

## E. Accessibility (axe-core, keyboard)

| ID | Level | What is verified | Result |
| --- | --- | --- | --- |
| A11Y | FULL | axe-core (light theme): no serious/critical violations on 9 pages (incl. colour contrast) | PASS |
| A11Y | FULL | axe-core (dark theme): no serious/critical violations on 9 pages (incl. colour contrast) | PASS |
| O3/a11y | CORE | Every form field has a <label for=id> (or aria-label) | PASS |
| O3/a11y | CORE | Semantic header / nav / main / footer, html lang, skip link | PASS |
| O3/a11y | FULL | Keyboard only: Tab to a product -> Enter -> Add to cart -> login -> fill checkout -> place order | PASS |
| O2 | CORE | No unexpected console errors or warnings during all browser tests | PASS |

## S. Static checks: build, lint, TypeScript rules, architecture, documents

| ID | Level | What is verified | Result |
| --- | --- | --- | --- |
| STEP-1/23 | CORE | npm run typecheck (tsc --noEmit) finishes with 0 errors | PASS |
| T1 | CORE | npm run lint finishes with 0 errors and 0 warnings | PASS |
| STEP-23 | CORE | npm run build succeeds | PASS |
| A1.7 | CORE | package.json scripts: dev, build, preview, typecheck (tsc --noEmit), lint | PASS |
| T1 | CORE | tsconfig: strict, noUnusedLocals/Parameters, noFallthroughCasesInSwitch, jsx react-jsx, @/* alias (+ vite alias) | PASS |
| T1 | CORE | ESLint really rejects `any` (probe file with `: any` fails with no-explicit-any) | PASS |
| T1 | CORE | eslint-plugin-react-hooks: rules-of-hooks = error, exhaustive-deps = warn | PASS |
| T1 | CORE | No `any` anywhere in src/ | PASS |
| O2 | CORE | No console.log / debug / info left in production code | PASS |
| T3 | FULL | Only one `as` cast (ApiClient res.json()); JSON.parse only in StorageService, result is `unknown` + type guard | PASS |
| T3 | FULL | No non-null assertions (!) in src/ | PASS |
| T2 | CORE | Every domain model is declared exactly once, inside src/types/ | PASS |
| T2 | FULL | Discriminated unions (AsyncState, CartAction + never), literal unions, Pick utility types, STORAGE_KEYS as const | PASS |
| T3 | FULL | Generics (ApiClient.get<T>, useFetch<T>, useLocalStorage<T>, StorageService<T>) and guards (isApiError, isProduct) | PASS |
| T4 | FULL | OOP: ApiClient, ApiError extends Error, Cart implements ICart (static/getter), Order (static factory, toJSON), StorageService<T> | PASS |
| A1.4 | CORE | Layered folder structure from the spec exists; App.tsx stays tiny | PASS |
| STEP-16 | CORE | React concepts visible: props.children, map + key, typed props, callback props, useEffect cleanup, controlled forms | PASS |
| TW1/TW5 | CORE | Tailwind v4 set-up: @import, vite plugin, @theme/@utility/@custom-variant, no v3 config or wrong directives | PASS |
| RULES | CORE | No libraries beyond the allowed ones (react, router, formik, yup) | PASS |
| O1/⑥ | FULL | Main JS chunk <= 250 kB gzip (measured from dist/) | PASS |
| O1/① | FULL | Pages are React.lazy; one Suspense with a spinner in Layout | PASS |
| D3/O2 | CORE | Required documents exist; README has every required section + test account; DEBUG-LOG has >= 5 entries in the required format | PASS |

## Unit tests

| Requirement and check | Result |
| --- | --- |
| P2.3 discountedPrice = price x (1 - pct/100), 2 decimals | PASS |
| P2.3 formatPrice -> $1,299.00 | PASS |
| round2 avoids float drift | PASS |
| P4.3 subtotal = sum(discounted unit price x quantity) | PASS |
| T4 itemCount getter = sum of quantities; isEmpty | PASS |
| P4.4 promo 10X10 gives 10% discount | PASS |
| P4.4 unknown promo code gives no discount | PASS |
| P4.3 shipping: $10 under $100, free from $100 (boundary) | PASS |
| P4.3 free-shipping threshold is checked AFTER the promo discount | PASS |
| P4.1 empty cart: everything is 0 | PASS |
| T4 static constants | PASS |
| ADD_ITEM adds a new line | PASS |
| ADD_ITEM on an existing product increases quantity | PASS |
| ADD_ITEM never exceeds stock (state is returned unchanged) | PASS |
| ADD_ITEM ignores qty < 1 and non-integers | PASS |
| SET_QTY clamps to 1..stock | PASS |
| REMOVE_ITEM filters the line out | PASS |
| CLEAR empties items AND promoCode | PASS |
| APPLY_PROMO is case-insensitive; invalid code leaves state unchanged | PASS |
| REMOVE_PROMO clears the code | PASS |
| immutability: frozen input state is never mutated and a new object is returned | PASS |
| P6.2 status < 1 min = Processing | PASS |
| P6.2 status 1-3 min = Shipped (boundaries) | PASS |
| P6.2 status > 3 min = Delivered | PASS |
| T4 Order.create: number format 10X-00002, totals from Cart, no payment data | PASS |
| T4 Order copies the cart lines (later cart changes do not affect the order) | PASS |
| T4 getStatus(now) is an instance method that does not mutate | PASS |
| A1.6 default list: limit=12&skip=0 | PASS |
| P2.7 skip = (page-1) x 12 | PASS |
| P2.4 search endpoint | PASS |
| P2.5 category endpoint | PASS |
| P2.8 search and category are mutually exclusive (search wins) | PASS |
| P2.6 all four sort options map to sortBy and order | PASS |
| P2.8 parseCatalogParams: invalid page -> 1, invalid sort -> empty, q wins over category, trims | PASS |
| P2.6 ensureSorted: re-sorts only when the server ignored the sort | PASS |
| P3.2 parsePositiveInt rejects abc, -1, 1.5, 0, empty | PASS |
| P1.3 getFromPath: only app-internal paths are accepted | PASS |
| P5.2 valid core form passes (4 core fields) | PASS |
| P5.2 empty core fields give the exact messages | PASS |
| P5.2 boundaries: name 3, address 5 | PASS |
| P5.2 email formats | PASS |
| P5.2 phone: 9-15 digits, + and spaces allowed | PASS |
| P5.2 postal code 4-10 digits and country | PASS |
| P7.2 profile messages | PASS |
| P3.4 review messages | PASS |
| P1.2 Yup login schema: exact messages | PASS |
| T3 isCartState / isOrderList / isProduct / isAuthUser reject junk | PASS |
| T4 StorageService: get() returns null for corrupted JSON, wrong shape, or missing key | PASS |
| T4 StorageService: set() does not throw when storage is full/unavailable | PASS |
| T4 get<T> returns parsed JSON and does not send Content-Type on GET | PASS |
| T4 non-2xx -> ApiError with status (404) | PASS |
| T4 network failure -> ApiError(0) | PASS |
| P2.2 AbortError is passed through (not converted to ApiError) | PASS |
| T4 post sends JSON with Content-Type | PASS |
| T4 describeError gives human messages | PASS |

## Mutation check
To prove that the unit tests are not empty, two bugs were introduced on purpose (free shipping from `>` instead of `>=`, order status boundary `<` instead of `<=`). The suite failed on exactly those cases and passed again after the code was restored.

## Not covered by automation (to do by hand)
| Item | Why | Status |
| --- | --- | --- |
| Real DummyJSON API (catalog, search, sort, categories, product 404) | Not reachable from the build sandbox | To do before the demo |
| Firefox, Safari, Edge, real phone | Only Chromium was available | See COMPATIBILITY.md |
| Lighthouse on the deployed site | Needs the live URL | See docs/lighthouse/README.md |
| Page refresh on the deployed site (`/products/5`) | Needs the live URL; rewrite files exist and local refresh works | To do after deployment |
| Checkout error path ("We could not place your order") | The order step cannot fail in normal use, so the UI branch is only reviewed in code | Reviewed, not triggered |
| Git history, Issues, PRs, weekly notes with real hours | Belong to the author's own workflow | To do |
| Demo video and the 5-slide presentation | Presentation text is in docs/PRESENTATION.md | To do |
