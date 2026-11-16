# PLAN

## 1. Goal
Build and deploy a working online store (10X Shop) with React, TypeScript and Tailwind CSS that a visitor can use from the first page to a confirmed order, on a phone and on a desktop.

## 2. Scope by module

| Module | CORE (must have) | FULL (extension) | BONUS |
| --- | --- | --- | --- |
| Auth | Simulated login, protected checkout, logout | Formik + Yup, profile page | - |
| Catalog | List with loading / error / empty states | Search, category, sort, pagination in the URL, skeleton, request cancellation | Grid / list switch |
| Product | Details page, stock rules, add to cart | Reviews, related products, gallery tabs | Wishlist |
| Cart | Quantity, remove, clear, persistence | Promo code, free shipping | - |
| Checkout | Validated form, confirmation | Extra shipping fields | - |
| Orders | - | List, details, time-based status, reorder | - |
| Quality | 404, Error Boundary, responsive UI | Code splitting, accessibility, tests | Dark mode |

## 3. Work breakdown — 28 steps, 3 weeks

Estimates are planning numbers (about 83 h). Replace them with the hours you actually spend. One step is one commit, with a short message in your own words (`feat:`, `fix:`, `docs:`, `test:`).

### Week 1 — skeleton through the cart (28 h)

Goal: a visitor can open the shop, read a product and keep a cart after reload.

| # | Epic | Task | Est. | Definition of Done |
| --- | --- | --- | --- | --- |
| 1 | Setup | Vite, strict TypeScript, Tailwind v4, ESLint, folders | 2 h | `npm run build` and `npm run lint` pass |
| 2 | Docs | This plan: scope, risks, definition of done | 2 h | `PLAN.md` is in the repo before feature work piles up |
| 3 | Setup | Router, header / main / footer, one home route | 2 h | `/` renders inside the layout |
| 4 | Catalog | Shared types, `ApiClient`, `ApiError` | 3 h | A products request comes back as typed data |
| 5 | Catalog | `useFetch`: loading, error, abort | 2 h | A failed request shows a message, not a blank crash |
| 6 | Catalog | Product cards and the grid | 4 h | Cards show image, title, price from the API |
| 7 | Catalog | Loading, error + Retry, empty state | 2 h | Retry fires the request again; an empty result has its own screen |
| 8 | Product | Details page, stock badge, quantity stepper | 4 h | A real id shows the product; a bad id shows Not Found |
| 9 | Cart | Reducer, context, cart page (qty, remove, clear) | 5 h | Totals match a hand calculation |
| 10 | Cart | `localStorage` plus a type guard | 2 h | Cart survives reload; broken JSON does not crash the app |

### Week 2 — login, checkout, search (25 h)

Goal: a guest can sign in, pay (simulated) and share a filtered catalog link.

| # | Epic | Task | Est. | Definition of Done |
| --- | --- | --- | --- | --- |
| 11 | Auth | Login form (Formik + Yup) and header state | 3 h | `emilys` / `emilyspass` shows the name in the header |
| 12 | Auth | `ProtectedRoute`, return to the page they wanted | 2 h | Guest on `/checkout` goes to login, then back to checkout |
| 13 | Checkout | Form and validation (4 required fields) | 4 h | An invalid form cannot be submitted |
| 14 | Checkout | Confirmation, save the order, clear the cart | 2 h | A new order appears and the cart is empty |
| 15 | Catalog | Debounced search stored in `?q=` | 3 h | Typing waits ~400 ms; the query is in the address bar |
| 16 | Catalog | Category, sort, pagination in the URL | 4 h | Back / Forward restores the same list |
| 17 | Catalog | Drop stale responses (`AbortController`) | 2 h | A slow old search cannot overwrite a newer one |
| 18 | Product | Reviews, newest first, saved locally | 3 h | A review you add is first and still there after reload |
| 19 | Product | Related products | 2 h | The block renders products from the same category |

### Week 3 — orders, quality, release (30 h)

Goal: finish the shop, write down real bugs, and ship a link that still works on refresh.

| # | Epic | Task | Est. | Definition of Done |
| --- | --- | --- | --- | --- |
| 20 | Orders | List, details, status from time, reorder | 5 h | Status changes on its own; reorder fills the cart |
| 21 | Profile | Edit details, clear local data, theme toggle | 3 h | A new first name shows in the header |
| 22 | Quality | Error Boundary (`getDerivedStateFromError` + `componentDidCatch`) and `/crash-test` | 2 h | The fallback says "Something went wrong." and Reload works; the header stays |
| 23 | Quality | 404 page and SPA rewrite for deep links | 2 h | Refresh on `/cart` still opens the cart |
| 24 | Quality | Layout at 375, 480–1024 and above 1024 | 3 h | No sideways scroll at 375 px; 1 / 2–3 / 4 columns; targets at least 44 px |
| 25 | Quality | Semantics, labels, visible focus, contrast | 3 h | Every field has a label; axe reports no serious issues |
| 26 | Bonus | Dark mode, wishlist, grid / list switch | 4 h | Each of the three survives reload |
| 27 | Quality | Unit and browser tests, `DEBUG-LOG.md` from failures you actually hit | 5 h | Tests you trust are green; each log entry names the tool and the fixing commit |
| 28 | Docs | README, REPORT, three progress notes, Lighthouse, deploy | 3 h | Live URL loads; report numbers match a command you ran |

## 4. Risks and mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| DummyJSON ignores some sort parameters | Wrong order in the list | Verify the order and sort the page on the client if needed |
| Slow responses overwrite newer ones when typing fast | Wrong results on screen | Cancel old requests with `AbortController`; tie each result to its request path |
| Corrupted or old `localStorage` data | App crash on load | Read through type guards; fall back to empty data |
| Search and category cannot be combined by the API | Confusing filters | Make them mutually exclusive and document it |
| Layout shifts or overflow on small screens | Unusable on phones | Test at 375px early; reserve space for error messages |
| Scope creep from bonus features | CORE not finished | Finish and test CORE first; bonus only afterwards |

## 5. Key decisions
- React Context + `useReducer` instead of an extra state library.
- The URL query string is the single source of truth for catalog filters.
- Order status is computed from time, never stored.
- When CORE and FULL disagree, CORE wins: checkout has 4 required fields; phone, postal code and country are optional.
