# Week 2

**Goal:** a guest can sign in, place a simulated order, and share a filtered catalog link.

**Steps from PLAN.md:** 11–19 (about 25 h planned). Fill the hours from the days you actually worked.

| Step | What | Hours |
| --- | --- | --- |
| 11 | Login form and header | |
| 12 | Protected checkout, return after login | |
| 13 | Checkout validation | |
| 14 | Confirmation, save order, clear cart | |
| 15 | Debounced search in the URL | |
| 16 | Category, sort, pagination in the URL | |
| 17 | Cancel a slow search that arrives late | |
| 18 | Reviews | |
| 19 | Related products | |

**Done in the codebase**
- Formik + Yup login, protected `/checkout`, checkout and confirmation.
- Search, category, sort and pagination in the query string.
- Reviews and related products.

**Blockers**
- A slow search could replace a newer result. `useFetch` aborts the old request and keeps the path beside the result.
- The first click on Save was lost because the error line pushed the button down (DEBUG-LOG, bug 2). The message row keeps a fixed height.

**Next:** orders, profile, small screens, tests, deploy (steps 20–28).
