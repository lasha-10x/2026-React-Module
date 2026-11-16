# REPORT — 10X Shop (CORE)

## 1. Planned vs delivered

| Module | CORE requirement | Status | Where |
|---|---|---|---|
| React | Function components and typed props | Done | `src/components/**`, `src/pages/**` |
| React | `children` composition | Done | `PageContainer`, `EmptyState`, `CartSummary`, `Layout` via `<Outlet />` |
| React | `useState` and `useEffect` | Done | Catalog, Product, Cart, Checkout, Login, contexts |
| React | `map()` with stable `key` | Done | `ProductGrid`, `CartPage`, gallery thumbnails |
| React | Callback props | Done | `ProductCard` `onAdd`, `CartItemRow` `onQuantityChange` / `onRemove` |
| React | Controlled Login and Checkout forms | Done | `LoginPage`, `CheckoutPage` |
| React | React Router + one Layout route | Done | `src/routes/AppRoutes.tsx`, `src/components/layout/Layout.tsx` |
| React | Context for auth and cart | Done | `src/context/AuthContext.tsx`, `src/context/CartContext.tsx` |
| React | Immutable cart updates | Done | `CartContext.tsx` (`map`, `filter`, spread) |
| React | Error Boundary | Done | `src/components/ErrorBoundary.tsx` |
| TypeScript | Typed props, state and API data | Done | `src/types/**` |
| TypeScript | `strict`, no `any` | Done | `tsconfig.app.json`, `.oxlintrc.json` |
| TypeScript | Type guard for persisted cart | Done | `isCartState` in `src/utils/cart.ts` |
| TypeScript | `npm run typecheck` = 0 errors and really checks `src/` | Done | proven with a deliberate type error, see `DEBUG-LOG.md` |
| Tailwind | v4 integration without config file | Done | `vite.config.ts`, `src/index.css` |
| Tailwind | Utilities, grid/flex, hover/focus/disabled | Done | all pages and reusable components |
| Tailwind | Responsive grid at 480px / 1024px | Done | `ProductGrid.tsx` |
| Optimization | Responsive at 375px without horizontal scroll | Done | verified in headless Chromium, see section 3 |
| Optimization | Error Boundary + DEBUG-LOG | Done | `ErrorBoundary.tsx`, `DEBUG-LOG.md` |
| Optimization | Compatibility matrix + Lighthouse baseline | Done | `COMPATIBILITY.md`, `docs/lighthouse/mobile-baseline.report.html` |
| Practical | README, PLAN, REPORT, deploy config, Git history | Done | repository root, `vercel.json`, `public/_redirects` |

### Not done (on purpose)

FULL features are locked out of this scope: search, category filter, sorting, pagination, URL
state, reviews, related products, promo codes, dark mode, Orders, Profile, Formik/Yup, lazy
routes, `@theme`, generics, OOP models. CORE was completed first, as required.

**Tooling deviation:** the PRD names ESLint with `typescript-eslint`, but `typescript-eslint`
8.x declares `typescript >=4.8.4 <6.1.0` and this project is on **TypeScript 7.0.2**. The lint
gate therefore uses **Oxlint** with the same important rules (`rules-of-hooks` error,
`exhaustive-deps` warn, `no-explicit-any` error, `no-console` error). Forcing ESLint would mean
downgrading the compiler, which would weaken the strict TypeScript setup the same PRD asks for.
The `lint` script still exits 0 on the current source.

## 2. Metrics

| Metric | Value |
|---|---|
| `npm run build` output JS | 290.79 kB (89.31 kB gzip) |
| `npm run build` output CSS | 24.40 kB (5.66 kB gzip) |
| TypeScript / Oxlint errors | 0 / 0 |
| Chrome functional checks (current build) | 25 / 25 passed |
| Chrome responsive / screenshot checks | 15 / 15 passed |
| Firefox functional checks (current build) | 23 / 23 passed |
| Lighthouse mobile — Performance | 89 |
| Lighthouse mobile — Accessibility | 100 |
| Lighthouse mobile — Best Practices | 100 |
| Lighthouse mobile — SEO | 100 |
| Lighthouse mobile — CLS | 0.171 (FULL target < 0.1 not met) |
| Live URL | root ✓; direct routes ✓ (HTTP 200, Chrome + Firefox) |
| Commit count | 31 (24 on 5 Nov 2026, 7 on 12 Nov 2026) |
| Issues / pull requests | 0 / 0 in `Omadzelevan/10x-shop-levanomadze` |
| Repository name | `10x-shop-levanomadze` (matches `10x-shop-{name}`) |

The bundle numbers come from `npm run build` on 12 Nov 2026. The Lighthouse baseline is in
`docs/lighthouse/mobile-baseline.report.html` / `.report.json`: mobile preset, Chrome
157.0.8103.39, live URL, captured after the final deploy on 12 Nov 2026. DummyJSON latency
affects repeat runs; observed Performance ranged from 64 to 97 across five runs, and the saved
report is the final complete run (89). The live deploy now returns HTTP 200 for every direct
route and serves a valid `robots.txt`.

**Git history limitation:** of the 31 commits, 24 are dated 5 Nov 2026 inside a ~1h19m window
and the remaining 7 are dated 12 Nov 2026. They do not demonstrate the planned three-week
cadence. History cannot be backdated honestly; future work should use smaller, dated commits.

## 3. What was verified and what was not

### Verified with commands

- `npm install`, `npm run typecheck`, `npm run lint`, `npm run build` all exit successfully.
- `npm run typecheck` really covers `src/`: a deliberately invalid file failed the check and
  passed the root `tsc --noEmit` (which checks nothing because of project references).
- Automated browser flow in headless Chrome (`puppeteer-core` + system Chrome, kept outside the
  repository): catalog → product → cart → guest checkout → login → checkout → confirmation,
  badge updates, persistence, logout, malformed `localStorage`, invalid product ids, unknown
  routes, 375px overflow, mobile menu and stock limits.
- The same flows in headless Firefox (`playwright-core` + Playwright Firefox): 23/23 checks
  passed, including cart reload persistence and the in-memory login reset.
- Responsive checks in Chrome: 375px, 768px and 1280px; 1-, 2- and 4-column grids, no horizontal
  overflow, stacked checkout, 44px tap targets.
- Lighthouse mobile run against `https://10-x-shop.netlify.app/`: 89 / 100 / 100 / 100,
  after adding a valid `robots.txt`.
- Targeted failure checks: blocking `dummyjson.com` shows a readable error (not `Failed to
  fetch`), the discounted price matches the formula, and the checkout form has no horizontal
  overflow at 375px with 44px inputs.
- Error Boundary fallback: a temporary `throw` in `CatalogPage` showed
  "Something went wrong." and the "Reload" button; the throw was removed afterwards.

### Remaining external actions

- **Set the GitHub homepage** to `https://10-x-shop.netlify.app/` and add a short description;
  the homepage field was empty when checked on 12 Nov 2026. The repository is already renamed
  to `10x-shop-levanomadze`.
- Create real Issues/PRs only if the FULL scope requires them.
- A physical-device check (real phone, real touch) was not performed; mobile results are browser
  viewport emulation.
- Confirm the submission deadline with the lecturer: the PRD states **6 Nov 2026, 23:59 Georgia
  time**; changes after that date are outside the graded window.

## 4. Three hardest problems

1. **A typecheck that checked nothing.** The root `tsconfig.json` only contains project
   references. `tsc --noEmit` at the root exited 0 even with a broken file. The fix was to point
   the script at `tsconfig.app.json` and prove the failure with a temporary invalid file. This is
   a silent quality risk, not just a configuration detail.
2. **Login redirect race.** After logging in from `/checkout`, the URL became `/` instead of
   `/checkout`: the "already logged in" guard rendered `<Navigate to="/" />` while the submit
   handler tried to return to the protected page. The fix tracks whether the form was submitted
   and only auto-redirects before a submit. Reproduced and verified with a browser test.
3. **TypeScript narrowing across a closure.** `product` was checked for `null` in the render
   body, but `handleAdd` (a nested function) still saw `Product | null`. The fix captures a
   non-null `currentProduct` after the guard; the page was then split into a keyed
   `ProductDetails` child so changing `:id` resets the gallery, quantity and fetch state.

## 5. What I would do differently

- Set up the typecheck and lint gate before writing UI code, so configuration bugs are caught
  on an empty project.
- Write the browser smoke test at the start of the cart/checkout phase instead of after the
  first complete implementation; it found the redirect bug immediately.
- Add a small local JSON fallback for DummyJSON earlier, so the catalog demo does not depend on
  a third-party service during the defense.

## 6. AI usage summary

AI was used as a pair programmer for scaffolding, implementation drafts, test scripts and
documentation structure. I accepted its help for repetitive Tailwind markup and the initial
folder structure. I rejected suggestions to add FULL features (search, promo codes, reducer,
API client classes) because the scope was CORE only. I also rejected "just disable the rule"
workarounds: the redirect race and the effect warning were fixed in the code, not silenced.
Every command in the verification section was actually run in this repository, and no Lighthouse
score, commit hash, browser result or hour count was invented. The student still has to read,
understand and defend every file.

## 7. Student TODO list (exact order)

1. **Done:** public repository `Omadzelevan/10x-shop-levanomadze` exists and the code is pushed.
2. **Done:** deployed to Netlify at `https://10-x-shop.netlify.app/`.
3. **Done:** `public/_redirects` is deployed; `/products/5` opens and refreshes directly with
   HTTP 200 on the live URL.
4. **Done:** live URL is in `README.md`.
5. **Done:** Lighthouse mobile baseline saved in `docs/lighthouse/` and scores recorded above.
6. **Done:** `COMPATIBILITY.md` filled with real Chrome and Firefox desktop/mobile results.
7. **Done:** Lighthouse, commit, issue and PR counts recorded; no `TODO(student)` markers remain.
8. **Optional (FULL):** create real GitHub Issues/PRs if the course requires them.
9. **Done:** repository renamed to `10x-shop-levanomadze`, matching the PRD naming rule.
10. **Done:** validation text, `public/_redirects`, `public/robots.txt`, docs and screenshots
    committed and pushed.
11. Submit the repository link before **6 Nov 2026, 23:59 (Georgia time)**; confirm with the
    lecturer whether late changes are still accepted.

