# 10X Shop

## About

10X Shop is a demo online store built as a graduation project. A visitor can browse a catalog, search and filter products, read product details and reviews, fill a cart, log in (simulated), check out and follow the status of their orders. Product data comes from the public [DummyJSON](https://dummyjson.com) API; login, payment and orders are simulated in the browser.

## Live Demo

- **Site:** https://10x-shop-gurami.netlify.app/
- **Repository:** https://github.com/GuramAbramishvili/10x-shop-gurami

## Features

**Core**
- Catalog with loading, error (with Retry) and empty states
- Product details (`/products/:id`) with invalid-id and 404 handling
- Cart (add, change quantity within stock, remove, clear), persisted in `localStorage`
- Simulated login; `/checkout` is protected and returns the user to the page they wanted
- Checkout with a validated controlled form and an order confirmation screen
- Error Boundary, 404 page, responsive layout from 375px, hover / focus / disabled states

**Full**
- Search (400 ms debounce), category filter, sorting and pagination, all stored in the URL (`?q=&category=&sort=&page=`)
- Skeleton loading and request cancellation with `AbortController`
- Reviews (from the API plus your own, saved locally) and related products
- Promo code `10X10` (10% off) and free shipping from $100
- Orders list and order details; the status (Processing, Shipped, Delivered) is computed from time
- Profile page (edit details, clear local data, theme)
- Formik + Yup login form, `useReducer` cart, custom hooks, route-level code splitting, toast notifications
- Design tokens with Tailwind v4 `@theme`

**Bonus**
- Dark mode (`data-theme` on `<html>`, saved, no flash on load)
- Wishlist page with heart buttons
- Grid / list view switch (`?view=list`)
- Custom Tailwind utilities (`@utility`), a custom `dark` variant and custom breakpoints
- `@/` path alias

## Tech Stack

React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS v4 · React Router 7 · Formik + Yup · DummyJSON API.
No other runtime libraries are used.

## Architecture

```
src/
  api/          ApiClient, ApiError, endpoint helpers
  types/        every domain type, declared once
  models/       Cart, Order, StorageService (business logic without UI)
  context/      Auth, Cart (+ reducer), Orders, Wishlist, Theme, Toast
  hooks/        useFetch, useDebounce, useForm, useLocalStorage, ...
  components/   ui, layout, product, cart, error
  pages/        one file per route
  routes/       route table and ProtectedRoute
  utils/        validation, formatting, type guards, URL helpers
```

**Data flow.** `main.tsx` wraps the app in the Router and the Context providers. The route table picks a page by URL; a page loads data with `useFetch` (API) or reads a Context (cart, user, orders) and renders small components. Actions flow back the other way: a button calls a Context function, the state changes, and every component that reads it re-renders.

- **URL as state:** catalog filters live in the query string, so links can be shared and Back/Forward work.
- **Cart:** `useReducer` with a pure reducer; saving to `localStorage` is a separate effect. All price maths lives in the `Cart` class and is rounded to cents.
- **Safe storage:** everything read from `localStorage` passes through a type guard, so corrupted data never crashes the app.
- **Order status** is never stored; it is computed from the order time.

## How to Run

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and create the production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Test Account

Login is a **local simulation**: no credentials are checked or sent anywhere. Any username with a password of at least 6 characters works, for example:

```
username: emilys
password: emilyspass
```

Promo code for the cart: `10X10`.

## Testing

Tests live in `tests/` and are described in `tests/README.md`. The results, mapped to the requirements, are in [docs/TEST-REPORT.md](docs/TEST-REPORT.md).

```bash
npx tsx --test tests/unit/logic.test.ts        # 55 unit tests of the business logic
npm run build && npx vite preview --port 4173 &  # then:
python3 tests/e2e_requirements.py all          # browser tests (Playwright, mocked API)
```

## Deployment

`vercel.json` and `public/_redirects` rewrite every path to `index.html`, so refreshing `/products/essence-mascara-lash-princess` or `/cart` works on Vercel and Netlify. Build command: `npm run build`, output directory: `dist`.

## Error Boundary demo

Open `/crash-test`. The page throws on purpose and the fallback "Something went wrong." appears while the header keeps working.

## localStorage keys

`shop_user`, `shop_cart`, `shop_orders`, `shop_reviews`, `shop_wishlist`, `shop_theme`.

## Known limitations

- Login, payment and orders are simulated; nothing is sent to a server.
- Data is stored per browser (`localStorage`).
- DummyJSON cannot combine search and category, so choosing one clears the other.
- Cross-browser checks beyond Chromium are listed as open items in [COMPATIBILITY.md](COMPATIBILITY.md).

## Credits

- Product data and images: [DummyJSON](https://dummyjson.com)
- Built with React, Vite, Tailwind CSS, React Router, Formik and Yup
- Developed with the help of an AI assistant (Claude by Anthropic); see the AI usage section in [REPORT.md](REPORT.md)

