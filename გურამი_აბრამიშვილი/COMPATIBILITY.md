# COMPATIBILITY

How the app was checked on different browsers, devices and screen sizes. Only what was actually run is marked as checked.

## Environments

| Environment | Status | How it was checked |
| --- | --- | --- |
| Chromium 153, desktop 1280x900 | Checked | Playwright browser tests (114) and axe-core |
| Chromium 153, phone viewport 375x800 | Checked | Playwright: no horizontal scroll, touch targets, burger menu, layout |
| Chromium, widths 480 / 600 / 900 / 1024 / 1100 / 1280 | Checked | Playwright: number of catalog columns per width |
| Firefox (desktop) | Not tested | Not installed in the build environment; to do manually |
| Safari / WebKit (macOS, iPhone) | Not tested | Not available; to do manually |
| Edge | Not tested | To do manually (Chromium based, expected to behave like Chrome) |
| Real phone (touch, on-screen keyboard) | Not tested | To do manually |

Playwright drives a headless Chromium, so hover, focus and keyboard behaviour were exercised, but real touch gestures were not.

## Pages

| Page | Desktop 1280 (Chromium) | Phone 375 (Chromium) | Screenshots |
| --- | --- | --- | --- |
| Catalog `/` | Works; axe light + dark clean | No horizontal scroll; touch targets >= 44px; burger menu | [desktop](docs/compat/catalog-desktop.png), [dark](docs/compat/catalog-desktop-dark.png), [mobile](docs/compat/catalog-mobile.png) |
| Product `/products/:id` | Works; axe clean | No horizontal scroll; touch targets >= 44px | [desktop](docs/compat/product-desktop.png), [mobile](docs/compat/product-mobile.png) |
| Cart `/cart` | Works; axe clean | No horizontal scroll; touch targets >= 44px; summary under the list | [desktop](docs/compat/cart-desktop.png), [mobile](docs/compat/cart-mobile.png) |
| Login `/login` | Works; axe clean | No horizontal scroll; touch targets >= 44px | [desktop](docs/compat/login-desktop.png), [mobile](docs/compat/login-mobile.png) |
| Checkout `/checkout` | Works; axe clean | No horizontal scroll; touch targets >= 44px | [desktop](docs/compat/checkout-desktop.png), [mobile](docs/compat/checkout-mobile.png) |
| Orders `/orders` | Works; axe clean | No horizontal scroll | [desktop](docs/compat/orders-desktop.png), [mobile](docs/compat/orders-mobile.png) |
| Order details `/orders/:id` | Works | No horizontal scroll (items table scrolls inside its card) | [desktop](docs/compat/order-details-desktop.png), [mobile](docs/compat/order-details-mobile.png) |
| Profile `/profile` | Works; axe clean | No horizontal scroll; touch targets >= 44px | [desktop](docs/compat/profile-desktop.png), [mobile](docs/compat/profile-mobile.png) |
| Wishlist `/wishlist` | Works; axe clean | No horizontal scroll | [desktop](docs/compat/wishlist-desktop.png), [mobile](docs/compat/wishlist-mobile.png) |
| 404 | Works; axe clean | No horizontal scroll | [desktop](docs/compat/not-found-desktop.png), [mobile](docs/compat/not-found-mobile.png) |

The product API was mocked in these checks, so product photos in the screenshots are plain coloured squares.

## Catalog columns by width

| Width | Columns |
| --- | --- |
| 375, 480 | 1 |
| 600, 900 | 2 |
| 1024 | 3 |
| 1100, 1280 | 4 |

## Known issues and open items
- Order details on a phone: the items table is wider than the screen and scrolls sideways inside its card (intended; the page itself does not scroll).
- Open items: run the manual checklist in Firefox and Safari (login, add to cart, checkout, dark mode, refresh on `/products/5`) and on a real phone.
