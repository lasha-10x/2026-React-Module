# Compatibility screenshots

Real screenshots from the 12 Nov 2026 runs (Chrome 157.0.8103.39, Firefox 159.0):

- `chrome-catalog.png` — Chrome desktop, catalog
- `chrome-cart.png` — Chrome desktop, cart
- `chrome-mobile-catalog.png` — Chrome 375px, catalog
- `chrome-mobile-cart.png` — Chrome 375px, cart
- `chrome-mobile-login.png` — Chrome 375px, login
- `chrome-mobile-checkout.png` — Chrome 375px, checkout
- `firefox-mobile-catalog.png` — Firefox 375px, catalog
- `firefox-mobile-login.png` — Firefox 375px, login
- `firefox-mobile-checkout.png` — Firefox 375px, checkout

Regression scripts live outside the repository (`puppeteer-core` for Chrome,
`playwright` for Firefox). See `../COMPATIBILITY.md` for the checked flows and the one
deployment defect (direct URLs return 404 until Netlify is redeployed).
