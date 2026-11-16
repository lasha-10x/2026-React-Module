# COMPATIBILITY — 10X Shop

Tested on **12 Nov 2026** against the deployed URL `https://10-x-shop.netlify.app/` after the
final Netlify redeploy, on Windows 10 Enterprise LTSC 21H2 (build 19044) with:

- **Chrome 157.0.8103.39** (headless, system Chrome)
- **Firefox 159.0** (headless, Playwright Firefox build)

Legend: `✓` works · `issue: … → fix: …` describes a real problem and its fix.

## Desktop

| Page / flow | Chrome (desktop) | Firefox (desktop) |
|---|---|---|
| `/` Catalog: load, 12 cards, add to cart | ✓ 12 cards, badge updates, no console errors | ✓ 12 cards, badge updates |
| `/products/:id`: gallery, stepper, add to cart | ✓ title, gallery, quantity, add to cart | ✓ title, add to cart, badge updates |
| `/cart`: quantity, remove, clear, totals | ✓ totals change and empty state works | ✓ totals change and empty state works |
| `/login`: validation errors, successful login | ✓ errors shown; `emilys` / `emilyspass` logs in | ✓ errors shown; login succeeds |
| `/checkout`: guard, validation, place order, confirmation | ✓ guest → login → checkout → confirmation | ✓ same flow; confirmation shown |
| `/products/abc`, `/products/999999`, `/whatever` → 404 | ✓ 404 page (client-side navigation) | ✓ 404 page (client-side navigation) |
| Direct refresh of `/products/5` on the deployed URL | ✓ HTTP 200 and the product page renders | ✓ HTTP 200 and the product page renders |
| Cart survives refresh; login does not | ✓ cart kept (`shop_cart`); auth is in-memory only, so refresh logs out | ✓ cart kept; refresh logs out |

## Mobile emulation (375 × 812)

| Page / flow | Chrome (mobile emulation) | Firefox (mobile emulation) |
|---|---|---|
| No horizontal scroll on any page | ✓ catalog, cart, login, checkout | ✓ catalog, cart, login, checkout |
| Burger menu opens/closes, `aria-expanded` changes | ✓ `false → true`, navigation visible | ✓ `false → true` |
| Tap targets ≥ 44px | ✓ no visible target under 44px high | ✓ no visible target under 44px high |
| Product grid is 1 column at 375px, 2 from 481px, 4 above 1024px | ✓ 1 / 2 / 4 columns measured | ✓ 1 column at 375px |
| Checkout form and summary stack vertically | ✓ summary below form | ✓ summary below form |

## Notes

- Automated runs on the live URL: Chrome **25/25** functional checks and **15/15**
  responsive/screenshot checks; Firefox **23/23** functional checks. All passed.
- Issue found during the audit: the first deploy returned **HTTP 404** for `/products/5`,
  `/cart`, `/login` and other direct routes because the Netlify SPA fallback was missing.
  **Fix:** added `public/_redirects` with `/* /index.html 200` and redeployed. Direct routes now
  return 200 in both browsers.
- Issue found by Lighthouse: `/robots.txt` was serving `index.html` (the SPA fallback), so the
  file was invalid. **Fix:** added `public/robots.txt` (`User-agent: *` / `Allow: /`); SEO is now
  100.
- Screenshots: `docs/compat/chrome-catalog.png`, `chrome-cart.png`,
  `chrome-mobile-catalog.png`, `chrome-mobile-cart.png`, `chrome-mobile-login.png`,
  `chrome-mobile-checkout.png`, `firefox-mobile-catalog.png`, `firefox-mobile-login.png`,
  `firefox-mobile-checkout.png`.
- A physical-device check (real phone, real touch) was **not** performed; mobile results above are
  browser viewport emulation.
