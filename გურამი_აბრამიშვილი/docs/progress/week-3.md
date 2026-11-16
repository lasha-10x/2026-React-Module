# Week 3

**Goal:** orders and profile, a layout that works at 375 px, notes from real bugs, and a live link.

**Steps from PLAN.md:** 20–28 (about 30 h planned). Fill the hours yourself.

| Step | What | Hours |
| --- | --- | --- |
| 20 | Orders, status from time, reorder | |
| 21 | Profile | |
| 22 | Error Boundary and `/crash-test` | |
| 23 | 404 and refresh on a deep link | |
| 24 | 375 / tablet / desktop layout | |
| 25 | Labels, focus, contrast | |
| 26 | Dark mode, wishlist, grid / list | |
| 27 | Tests and `DEBUG-LOG.md` | |
| 28 | README, REPORT, Lighthouse, deploy | |

**Done in the codebase**
- Orders, profile, Error Boundary, 404, responsive layout, dark mode, wishlist, grid / list.
- Unit, browser and static tests; `docs/TEST-REPORT.md`.

**Blockers**
- Logout from a protected page opened `/login` (bug 3).
- Order details scrolled sideways at 375 px (bug 4).
- Above 1024 px the grid stayed at 3 columns (bug 5).
- The green discount badge failed contrast (bug 6).

Details and the lesson from each one are in `DEBUG-LOG.md`. The fix line still says `<commit>` until that commit exists.

**Still open for you to do by hand**
- Deploy, then run Lighthouse on the live site and paste the scores.
- Firefox or Edge, and a real phone if you have one.
- A 2–3 minute screen recording, linked from `README.md`.
- Hours in the tables above, then the same totals in `REPORT.md`.
