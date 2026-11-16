# Week 1

**Goal:** a visitor can open the shop, open a product and keep a cart after reload.

**Steps from PLAN.md:** 1–10 (about 28 h planned). Write the real hours next to each step when you finish it. Do not copy the estimate if the day went differently.

| Step | What | Hours |
| --- | --- | --- |
| 1 | Vite, strict TypeScript, Tailwind, ESLint | |
| 2 | `PLAN.md` | |
| 3 | Router and page shell | |
| 4 | Types, `ApiClient`, `ApiError` | |
| 5 | `useFetch` | |
| 6 | Catalog cards and grid | |
| 7 | Loading, error + Retry, empty state | |
| 8 | Product page, stock, stepper | |
| 9 | Cart reducer, context, cart page | |
| 10 | Cart saved in `localStorage` | |

**Done in the codebase**
- Setup, typed API client, catalog with loading / error / empty states.
- Product page and cart with persistence.

**Blockers**
- `keyof` on a form type became `string | number` (DEBUG-LOG, bug 1). Narrowed with `Extract<keyof T, string>`. Put the fixing commit hash in `DEBUG-LOG.md` after you commit it.

**Next:** login, checkout, search in the URL (steps 11–19).
