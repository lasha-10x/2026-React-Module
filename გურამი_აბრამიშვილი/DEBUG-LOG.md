# DEBUG-LOG

Real problems found while building and testing 10X Shop. They were found with a compiler, Playwright browser scripts and the axe-core accessibility engine. Replace `<commit>` with the hash of the commit that contains the fix, and add your own entries (for example from Chrome DevTools Network or React Profiler sessions).

## Bug 1: TypeScript rejected indexing a form with its own field names
- **Symptom:** `npm run typecheck` failed in the checkout page; the field name type was `string | number`, which cannot index the values object.
- **Reproduction:** declare the form type as `interface X extends Record<string, string> { ... }` and write `(name: keyof X) => form.values[name]`.
- **Tool:** TypeScript compiler (`tsc --noEmit`).
- **Root cause:** an index signature (`Record<string, string>`) widens `keyof` to `string | number`.
- **Fix:** the helper takes `Extract<keyof CheckoutFormValues, string>` (same in the profile page). Commit: c8fa51f.
- **Lesson:** an index signature changes what `keyof` means; narrow it explicitly.

## Bug 2: the first click on a submit button was lost
- **Symptom:** on the Profile page, after editing a field and clicking "Save changes", only that field showed an error; the other required fields showed theirs only after a second click. The same would happen on Checkout.
- **Reproduction:** open `/profile`, type in "First name", clear it and click "Save changes" right away.
- **Tool:** a Playwright test that printed all `[role=alert]` messages after the click.
- **Root cause:** validation runs on blur. The error text was inserted under the field, the layout moved the button down between mouse-down and mouse-up, so the browser never fired the click.
- **Fix:** the message line under every field always reserves its height (`min-h-5`), so nothing moves when an error appears. Commit: c8fa51f.
- **Lesson:** content that appears on blur can shift the layout and cancel the click that caused the blur.

## Bug 3: logging out of a protected page landed on /login instead of the catalog
- **Symptom:** "Log out" on `/profile` or `/orders` ended on the login page; the spec says the catalog.
- **Reproduction:** log in, open `/profile`, click "Log out" in the header.
- **Tool:** Playwright test plus a wrapper around `history.pushState` that logged every navigation.
- **Root cause:** after logout the guard (`ProtectedRoute`) saw a guest and redirected to `/login` before the logout handler's `navigate("/")` finished. A first fix with a `useRef` inside the guard failed when the click happened while the lazy page chunk was still loading, because the guard had not been mounted yet.
- **Fix:** `AuthContext` records that a logout is in progress (`isLoggingOut()`, cleared on the next navigation); the guard renders nothing in that moment, so `navigate("/")` wins. Guests are still redirected to `/login`. Commit: c8fa51f.
- **Lesson:** two things that react to the same state change can race; put the fact ("the user just logged out") in shared state, not in a component that may not exist yet.

## Bug 4: horizontal scroll on the order details page at 375px
- **Symptom:** the page could be dragged sideways on a phone.
- **Reproduction:** open an order at 375px width.
- **Tool:** Playwright check `scrollWidth <= clientWidth` on every page, plus a screenshot.
- **Root cause:** a grid column has `min-width: auto`, so it grew to the width of the items table (`min-w-[28rem]`) instead of letting the table scroll inside its own `overflow-x-auto` wrapper.
- **Fix:** `min-w-0` on the grid children that contain the table. Commit: c8fa51f.
- **Lesson:** `overflow-x-auto` only works when the parent is allowed to shrink.

## Bug 5: four product columns never appeared above 1024px
- **Symptom:** at 1100px the catalog showed 3 columns, the spec says 4.
- **Reproduction:** open the catalog at 1100px width.
- **Tool:** Playwright reading `grid-template-columns` at 375 / 480 / 600 / 900 / 1024 / 1100 / 1280px, then reading the built CSS in `dist/`.
- **Root cause:** Tailwind wrote `.desktop:grid-cols-4` before `.lg:grid-cols-3`; both match at 1100px and the later rule wins.
- **Fix:** the ranges are written as mutually exclusive (`xs:max-lg:grid-cols-2 lg:max-desktop:grid-cols-3 desktop:grid-cols-4`) with custom `xs` and `desktop` breakpoints in `@theme`. Commit: c8fa51f.
- **Lesson:** do not rely on the order of generated utility rules; make the conditions exclusive.

## Bug 6: low colour contrast on the green discount badge
- **Symptom:** the accessibility audit reported "color-contrast" (serious) on about 20 elements of the catalog and 10 on product pages.
- **Reproduction:** run axe-core on `/` in the light theme.
- **Tool:** axe-core injected through Playwright.
- **Root cause:** green text (`#15803d`) on a 15% green background is just under the 4.5:1 ratio.
- **Fix:** darker status colours in the light theme (`--success`, `--warn`, `--danger`). Commit: c8fa51f.
- **Lesson:** semi-transparent backgrounds change contrast; measure it instead of judging by eye.
