# REPORT

## Project
10X Shop: a React + TypeScript + Tailwind online store that uses the DummyJSON API for products.
Live: _add URL_ · Repository: _add URL_

## Planned vs delivered

| Module | CORE | FULL | BONUS |
| --- | --- | --- | --- |
| Auth and routing (React) | Done | Done (Formik + Yup, profile) | - |
| Catalog | Done | Done (search, category, sort, pagination, URL state, skeleton, cancellation) | Grid / list switch done |
| Product | Done | Done (reviews, related products) | Wishlist done |
| Cart | Done | Done (promo code, free shipping, `useReducer`) | - |
| Checkout | Done | Done (extra shipping fields, optional) | - |
| Orders and profile | - | Done (list, details, time-based status, reorder, clear local data) | - |
| TypeScript | Strict mode, no `any`, typed props and API | Generics, type guards, discriminated unions, utility types, OOP classes | - |
| Tailwind | v4 set-up, responsive, hover / focus / disabled | `@theme` tokens | Dark mode, `@utility`, `@custom-variant`, custom breakpoints |
| Optimization | Error Boundary, 404 | Code splitting, lazy images with width / height, pagination | - |

**Not done, and why**
- Lighthouse before / after numbers: they must be measured on the deployed site (see `docs/lighthouse/README.md`).
- Firefox, Safari and a real phone: not available while building; listed as open items in `COMPATIBILITY.md`.
- Deployment, Git history, GitHub Issues / Projects / PRs, weekly hours, demo video: these belong to the author's own workflow.
- `React.memo` / `useCallback` tuning and a React Profiler analysis: not applied because nothing was measured that needed it.
- Payment method row on the order page: the spec removed payments from scope.
- Phone, postal code and country at checkout are optional, not required: the CORE spec defines a four-field form, and CORE wins when specs disagree.

## Metrics

| Item | Value | Source |
| --- | --- | --- |
| Main JS chunk (gzip) | 87.8 kB | measured from `dist/` by `tests/static_checks.py` |
| JS chunks (route and shared) | 27 | same |
| Login page chunk (Formik + Yup) | 23.0 kB gzip, loaded only on `/login` | same |
| Unit tests | 55 passing | `tests/unit/logic.test.ts` |
| Browser tests | 114 passing | `tests/e2e_requirements.py` (Chromium, mocked API) |
| Static / build checks | 22 passing | `tests/static_checks.py` |
| Accessibility | no serious or critical axe-core issues on 9 pages, light and dark | `tests/e2e_requirements.py E` |
| Lighthouse (mobile) before / after | _fill in after deployment_ | `docs/lighthouse/` |
| Commits / PRs / closed issues | _fill in from GitHub_ | |
| Hours per epic | Planned 83 h in `PLAN.md` (week 1: 28, week 2: 25, week 3: 30). Actual hours are still blank in `docs/progress/` until you log the days you worked | `PLAN.md`, `docs/progress/` |

## Three hardest problems
1. **Stale responses while typing.** A slow answer for an old search could replace the newer result. Solved with `AbortController` in `useFetch` and by storing the request path next to its result, so a result is shown only for the path currently requested.
2. **Logout racing with the route guard.** Logging out of a protected page ended on the login page instead of the catalog. The fact "the user just logged out" now lives in `AuthContext`, so the guard no longer fights the logout navigation (DEBUG-LOG, bug 3).
3. **Layout shift that swallowed a click.** An error message appearing on blur moved the submit button and the first click was lost. The message line now reserves its height (DEBUG-LOG, bug 2).

## What I would do differently
Write the browser tests together with each feature instead of at the end, deploy a first version in week 1 so Lighthouse and cross-browser checks start early, and replace the simulated login with a real API call.

## AI usage
- I used an AI assistant (Claude) to generate most of the source code, the tests and these documents from the PRD.
- I delegated: project structure, components, hooks, contexts, validation, tests and documentation drafts.
- I decided myself: the requirements, including the bonus features and the CORE-over-FULL rule for the checkout fields.
- I did not accept: extra libraries, payment fields, and any claim that could not be measured (numbers for Lighthouse, hours and commits are left for me to fill in from real data).
- Everything was checked with `tsc`, ESLint, unit tests, browser tests and an accessibility audit; the problems they found are in `DEBUG-LOG.md`.
- The AI could not reach the real DummyJSON API or deploy the site; those steps are mine.
