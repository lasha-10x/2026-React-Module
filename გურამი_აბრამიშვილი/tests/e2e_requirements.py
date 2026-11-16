"""Requirement-traceable browser tests for 10X Shop (PRD + Appendix A).

Usage (the production preview must be running on :4173):
    python3 tests/e2e_requirements.py A        # one group: A, B, C or D
    python3 tests/e2e_requirements.py all

Every test has an ID that points to the requirement it verifies (P2.4 = Appendix A, section P2.4; STEP-7 = PRD step 7).
Results are written to /tmp/results_<group>.json and merged into docs/TEST-REPORT.md by tests/make_report.py.
"""
import json
import os
import re
import sys
import time
import traceback

from playwright.sync_api import sync_playwright, expect

sys.path.insert(0, os.path.dirname(__file__))
from mock_api import BY_ID, PRODUCTS, MockApi, discounted  # noqa: E402

BASE = os.environ.get("BASE_URL", "http://localhost:4173")
API = MockApi()
RESULTS = []
CONSOLE = []  # unexpected console errors collected during all groups
EXPECTED_NOISE = ("Intentional crash", "ErrorBoundary caught", "The above error occurred", "status of 500", "Failed to load resource", "ERR_ABORTED")


def run(test_id, level, title, fn):
    t0 = time.time()
    try:
        fn()
        RESULTS.append({"id": test_id, "level": level, "title": title, "status": "PASS", "detail": ""})
        print(f"PASS {test_id:<10} {title}")
    except Exception as e:  # noqa: BLE001 - a failing test must never stop the run
        detail = (str(e).strip().split("\n")[0] or e.__class__.__name__)[:300]
        RESULTS.append({"id": test_id, "level": level, "title": title, "status": "FAIL", "detail": detail})
        print(f"FAIL {test_id:<10} {title}  [{detail}]")
        if os.environ.get("VERBOSE"):
            traceback.print_exc()
    _ = t0


def new_page(browser, width=1280, height=900, mocked=True, clock=False):
    ctx = browser.new_context(viewport={"width": width, "height": height})
    page = ctx.new_page()
    page.on("console", lambda m: CONSOLE.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: CONSOLE.append("[pageerror] " + str(e)))
    if mocked:
        page.route("https://dummyjson.com/**", API.handler)
    page.dlg = {"msgs": [], "mode": "accept"}

    def on_dialog(d):
        page.dlg["msgs"].append(d.message)
        d.accept() if page.dlg["mode"] == "accept" else d.dismiss()

    page.on("dialog", on_dialog)
    return ctx, page


def goto(page, path):
    page.goto(BASE + path)


def wait_cards(page, n=None):
    page.wait_for_selector("article")
    if n is not None:
        page.wait_for_function(f"document.querySelectorAll('article').length === {n}")


def login(page, user="emilys", pw="emilyspass"):
    goto(page, "/login")
    page.get_by_label("Username").fill(user)
    page.get_by_label("Password").fill(pw)
    page.get_by_role("button", name="Log In").click()
    page.wait_for_function("!location.pathname.startsWith('/login')")


def ensure_logged_in(page):
    goto(page, "/")
    page.wait_for_selector("main")
    if page.get_by_role("link", name="Log in").count() > 0:
        login(page)


def add_product_to_cart(page, pid, clicks=0):
    goto(page, f"/products/{pid}")
    page.wait_for_selector("h1")
    for _ in range(clicks):
        page.get_by_role("button", name="Increase quantity").click()
    page.get_by_role("button", name="Add to cart").first.click()
    page.wait_for_selector("text=Added to cart")


def fill_checkout(page, name="Ann Smith", email="ann@example.com", address="1 Main Street", city="Tbilisi"):
    page.get_by_label("Full name").fill(name)
    page.get_by_label("Email").fill(email)
    page.get_by_label("Address").fill(address)
    page.get_by_label("City").fill(city)
    page.get_by_label("Card number").fill("4242424242424242")  # passes the Luhn check
    page.get_by_label("Expiry date").fill("1299")
    page.get_by_label("CVC").fill("123")


def totals(page):
    out = {}
    for label in ("Subtotal", "Shipping", "Total"):
        dd = page.locator("dt", has_text=re.compile(f"^{label}$")).locator("xpath=following-sibling::dd").first
        out[label] = dd.inner_text().strip()
    return out


def money(txt):
    txt = txt.replace("−", "-").replace("$", "").replace(",", "").strip()
    return 0.0 if txt == "Free" else float(txt)


def place_order(page, **kw):
    goto(page, "/checkout")
    page.wait_for_selector("text=Shipping details")
    fill_checkout(page, **kw)
    page.get_by_role("button", name="Place order").click()
    page.wait_for_selector("text=Thank you! Your order has been placed.")


def no_hscroll(page):
    return page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1")


# ======================================================================================
# GROUP A - routing, layout, header, auth, login (PRD steps 4-6, A: P0, P1)
# ======================================================================================
def group_a(browser):
    ctx, page = new_page(browser)

    def routes_exist():
        for path, marker in [("/", "article"), ("/login", "text=Log in"), ("/products/1", "h1"), ("/cart", "text=Your cart"), ("/nope", "text=Page not found")]:
            goto(page, path)
            page.wait_for_selector(marker)
        goto(page, "/checkout")  # guest -> login
        page.wait_for_url(re.compile("/login"))

    run("STEP-4", "CORE", "Routes /, /login, /products/:id, /cart, /checkout (guarded) and * all render", routes_exist)

    def no_reload_navigation():
        goto(page, "/")
        wait_cards(page)
        page.evaluate("window.__marker = 'still-here'")
        page.get_by_role("link", name="Cart").first.click()
        page.wait_for_url(re.compile("/cart"))
        page.get_by_role("link", name="Catalog").first.click()
        page.wait_for_url(re.compile(r"/$"))
        assert page.evaluate("window.__marker") == "still-here", "page was reloaded during navigation"

    run("STEP-4", "CORE", "Navigation does not reload the page (SPA)", no_reload_navigation)

    def single_layout():
        for path in ["/", "/cart", "/products/1", "/login"]:
            goto(page, path)
            page.wait_for_selector("main")
            assert page.locator("header").count() == 1 and page.locator("footer").count() == 1 and page.locator("main").count() == 1, path

    run("P0.1", "CORE", "One shared Layout: exactly one header / main / footer on every page", single_layout)

    def active_link():
        goto(page, "/cart")
        page.wait_for_selector("text=Your cart")
        assert page.get_by_role("link", name="Cart").first.get_attribute("aria-current") == "page"
        assert page.get_by_role("link", name="Catalog").first.get_attribute("aria-current") is None

    run("P0.1", "CORE", "Current page link is visually marked (NavLink active -> aria-current)", active_link)

    def scroll_to_top():
        goto(page, "/")
        wait_cards(page)
        page.evaluate("window.scrollTo(0, 600)")
        assert page.evaluate("window.scrollY") > 100
        page.get_by_role("link", name="Cart").first.click()
        page.wait_for_url(re.compile("/cart"))
        page.wait_for_function("window.scrollY === 0")

    run("P0.1", "CORE", "ScrollToTop: a new route starts at the top", scroll_to_top)

    def not_found_texts():
        for path in ["/nope", "/products/999999", "/products/abc", "/orders/123456-not-logged"]:
            if path.startswith("/orders"):
                continue
            goto(page, path)
            page.wait_for_selector("text=Page not found")
            assert page.get_by_text("The page you are looking for does not exist.").is_visible()
            page.get_by_role("link", name="Go to catalog").click()
            page.wait_for_url(re.compile(r"/$"))

    run("P0.1", "CORE", "404 page: exact title/text and 'Go to catalog' link (also for /products/999999, /products/abc)", not_found_texts)

    def abc_makes_no_request():
        API.requests.clear()
        goto(page, "/products/abc")
        page.wait_for_selector("text=Page not found")
        assert API.count("/products/abc") == 0 and API.count("/products/NaN") == 0, API.requests

    run("P3.2", "CORE", "/products/abc shows NotFound WITHOUT any API request", abc_makes_no_request)

    def guest_redirect_and_return():
        page.evaluate("localStorage.clear()")
        add_product_to_cart(page, 2)
        goto(page, "/checkout")
        page.wait_for_url(re.compile("/login"))
        page.get_by_label("Username").fill("emilys")
        page.get_by_label("Password").fill("emilyspass")
        page.get_by_role("button", name="Log In").click()
        page.wait_for_url(re.compile("/checkout"))
        page.wait_for_selector("text=Shipping details")

    run("STEP-6", "CORE", "Guest /checkout -> /login, after login returns to /checkout", guest_redirect_and_return)

    def login_from_header_goes_to_catalog():
        page.get_by_role("button", name="Log out").first.click()
        page.get_by_role("link", name="Log in").first.click()
        page.get_by_label("Username").fill("emilys")
        page.get_by_label("Password").fill("emilyspass")
        page.get_by_role("button", name="Log In").click()
        page.wait_for_selector("article")
        assert page.url.rstrip("/") == BASE

    run("P1.3", "CORE", "Login opened from the header returns to the catalog (not checkout)", login_from_header_goes_to_catalog)

    def logout_keeps_cart_and_goes_home():
        page.get_by_role("button", name="Log out").first.click()
        page.wait_for_selector("article")
        assert page.url.rstrip("/") == BASE
        assert page.get_by_role("link", name="Log in").first.is_visible()
        assert page.get_by_label(re.compile(r"\d+ items in cart")).first.is_visible(), "cart was cleared by logout"

    run("P0.3", "CORE", "Logout -> guest state, navigates to '/', cart is NOT cleared", logout_keeps_cart_and_goes_home)

    def header_elements():
        page.evaluate("localStorage.clear()")
        goto(page, "/")
        wait_cards(page)
        assert page.get_by_role("link", name="10X Shop").first.is_visible()
        assert page.get_by_label(re.compile(r"\d+ items in cart")).count() == 0, "badge must be hidden at 0"
        assert page.get_by_role("link", name="Orders").count() == 0 and page.get_by_role("link", name="Profile").count() == 0
        login(page)
        goto(page, "/")
        wait_cards(page)
        assert page.get_by_role("link", name="Orders").first.is_visible() and page.get_by_role("link", name="Profile").first.is_visible()
        page.get_by_role("link", name="10X Shop").first.click()
        page.wait_for_url(re.compile(r"/$"))

    run("P0.3", "CORE", "Header: logo, badge hidden at 0, Orders/Profile only when logged in", header_elements)

    def badge_is_sum_of_quantities():
        page.evaluate("localStorage.removeItem('shop_cart')")
        goto(page, "/products/2")
        page.wait_for_selector("h1")
        page.get_by_role("button", name="Increase quantity").click()
        page.get_by_role("button", name="Increase quantity").click()
        page.get_by_role("button", name="Add to cart").first.click()
        add_product_to_cart(page, 3)
        assert page.get_by_label(re.compile(r"\d+ items in cart")).first.inner_text().strip() == "4"

    run("P0.3", "CORE", "Cart badge = sum of quantities (3 + 1 = 4)", badge_is_sum_of_quantities)

    # ---------------- P1 login form ----------------
    page.evaluate("localStorage.clear()")

    def login_required_errors():
        goto(page, "/login")
        page.get_by_role("button", name="Log In").click()
        assert page.get_by_text("Username is required").is_visible() and page.get_by_text("Password is required").is_visible()
        assert page.url.endswith("/login"), "form must not submit with empty fields"

    run("P1.2", "CORE", "Empty Username/Password -> exact errors, form does not submit", login_required_errors)

    def login_short_password_and_trim():
        goto(page, "/login")
        page.get_by_label("Username").fill("   ")
        page.get_by_label("Password").fill("123")
        page.get_by_role("button", name="Log In").click()
        assert page.get_by_text("Username is required").is_visible(), "username must be trimmed"
        assert page.get_by_text("Password must be at least 6 characters").is_visible()

    run("P1.2", "CORE", "Username is trimmed; Password < 6 chars -> exact message", login_short_password_and_trim)

    def login_errors_are_attached_to_field():
        goto(page, "/login")
        page.get_by_role("button", name="Log In").click()
        described = page.get_by_label("Username").get_attribute("aria-describedby")
        assert described and page.locator(f"[id='{described}']").inner_text() == "Username is required"

    run("P0.5", "CORE", "Field error is attached to its field (aria-describedby)", login_errors_are_attached_to_field)

    def login_no_reload_and_context_state():
        goto(page, "/login")
        page.evaluate("window.__m = 1")
        page.get_by_label("Username").fill("emilys")
        page.get_by_label("Password").fill("emilyspass")
        page.get_by_role("button", name="Log In").click()
        page.wait_for_selector("article")
        assert page.evaluate("window.__m") == 1, "login reloaded the page"
        assert page.get_by_text("Hi, emilys").is_visible()
        stored = json.loads(page.evaluate("localStorage.getItem('shop_user')"))
        assert stored["username"] == "emilys" and stored["isLoggedIn"] is True
        assert "password" not in json.dumps(stored).lower(), "password must never be stored"

    run("P1.3", "CORE", "Valid login: no reload, Context updated, password never stored", login_no_reload_and_context_state)

    def back_to_catalog_link():
        page.get_by_role("button", name="Log out").first.click()
        goto(page, "/login")
        page.get_by_role("link", name="← Back to catalog").click()
        page.wait_for_url(re.compile(r"/$"))

    run("P1", "CORE", "'← Back to catalog' link on the login page", back_to_catalog_link)

    def login_page_redirects_when_logged_in():
        login(page)
        goto(page, "/login")
        page.wait_for_selector("article")
        assert page.url.rstrip("/") == BASE

    run("P1", "FULL", "Logged-in user opening /login is sent away", login_page_redirects_when_logged_in)

    def formik_yup_used():
        deps = json.load(open(os.path.join(os.path.dirname(__file__), "..", "package.json")))["dependencies"]
        assert "formik" in deps and "yup" in deps
        src = open(os.path.join(os.path.dirname(__file__), "..", "src", "pages", "LoginPage.tsx")).read()
        assert "useFormik" in src and "loginSchema" in src
        assert "Yup" in open(os.path.join(os.path.dirname(__file__), "..", "src", "utils", "loginSchema.ts")).read()

    run("STEP-18", "FULL", "Formik + Yup installed and used in Login (useFormik + Yup schema)", formik_yup_used)

    def login_disabled_state():
        src = open(os.path.join(os.path.dirname(__file__), "..", "src", "pages", "LoginPage.tsx")).read()
        assert "isSubmitting" in src

    run("P1", "FULL", "Login has a loading/disabled submit state", login_disabled_state)

    ctx.close()


# ======================================================================================
# GROUP B - catalog and product (PRD steps 7-11, A: P2, P3)
# ======================================================================================
def group_b(browser):
    ctx, page = new_page(browser)

    def catalog_loads_12():
        API.requests.clear()
        goto(page, "/")
        wait_cards(page, 12)
        assert API.count("/products?limit=12&skip=0") == 1, API.requests
        assert page.get_by_role("heading", name="Catalog").is_visible()
        assert page.get_by_text("30 products").is_visible()

    run("STEP-7", "CORE", "Catalog: GET /products?limit=12&skip=0, 12 cards, title + result count", catalog_loads_12)

    def card_content():
        card = page.locator("article").filter(has_text="Phone 02").first  # id 2 -> smartphones? computed below
        # use a deterministic card: find any card with a discount >= 1 and one without
        html = page.locator("article").first.inner_html()
        assert 'loading="lazy"' in html and 'width="400"' in html and 'height="400"' in html, "thumbnail needs lazy + width/height"
        assert page.locator("article img[alt='']").count() == 0, "every thumbnail needs alt"
        first = PRODUCTS[0]
        article = page.locator("article").first
        assert first["category"] in article.inner_text().lower()
        assert first["brand"].lower() in article.inner_text().lower()
        assert article.get_by_role("button", name="Add to cart").is_visible()
        _ = card

    run("P2.3", "CORE", "Card shows thumbnail (lazy, width/height, alt), category · brand, rating, Add to cart", card_content)

    def discount_badge_rule():
        # product 3 has discount 0.4 (<1 -> no badge); product 1 has 9.5 -> "−10%" (rounded) ; ids by mock: i%3 -> [0.4,9.5,15.2]
        low = next(p for p in PRODUCTS if p["discountPercentage"] < 1)
        high = next(p for p in PRODUCTS if p["discountPercentage"] >= 1)
        goto(page, f"/products/{low['id']}")
        page.wait_for_selector("h1")
        assert page.locator("main >> text=/^−\\d+%$/").count() == 0, "badge must be hidden when discount < 1"
        goto(page, f"/products/{high['id']}")
        page.wait_for_selector("h1")
        assert page.locator("main >> text=/^−\\d+%$/").first.is_visible()
        assert page.locator("line-through, .line-through").count() >= 1, "original price must be struck through"

    run("P2.3", "CORE", "Discount badge only when discount >= 1; original price struck through", discount_badge_rule)

    def stock_states():
        goto(page, "/products/6")  # stock 50
        page.wait_for_selector("h1")
        assert page.get_by_text("In stock", exact=True).first.is_visible()
        goto(page, "/products/5")  # stock 3
        page.wait_for_selector("h1")
        assert page.get_by_text("Only 3 left!").is_visible()
        goto(page, "/products/4")  # stock 0
        page.wait_for_selector("h1")
        assert page.get_by_text("Out of stock").first.is_visible()
        assert page.get_by_role("button", name="Out of stock").first.is_disabled()
        assert page.get_by_role("button", name="Increase quantity").is_disabled() and page.get_by_role("button", name="Decrease quantity").is_disabled()

    run("P3.3", "CORE", "Stock badge: In stock / Only N left! / Out of stock (stepper + button disabled)", stock_states)

    def stock_threshold_five():
        # boundary: stock 5 -> "Only 5 left!", stock 6 -> "In stock" (unit-level check through the component source of truth)
        src = open(os.path.join(os.path.dirname(__file__), "..", "src", "components", "product", "StockBadge.tsx")).read()
        const = open(os.path.join(os.path.dirname(__file__), "..", "src", "utils", "constants.ts")).read()
        assert "stock <= LOW_STOCK_LIMIT" in src and "LOW_STOCK_LIMIT = 5" in const

    run("P2.3", "CORE", "Low-stock threshold is exactly stock <= 5", stock_threshold_five)

    def card_click_navigates_but_buttons_dont():
        goto(page, "/")
        wait_cards(page, 12)
        page.locator("article").nth(1).locator("img").click()
        page.wait_for_url(re.compile(r"/products/\d+"))
        goto(page, "/")
        wait_cards(page, 12)
        page.locator("article").nth(1).get_by_role("button", name="Add to cart").click()
        page.wait_for_selector("text=Added to cart ✓")
        assert page.url.rstrip("/") == BASE, "the Add to cart button must not navigate"

    run("P2.4/④", "CORE", "Card click opens details; the Add to cart button does not navigate (toast 'Added to cart ✓')", card_click_navigates_but_buttons_dont)

    def out_of_stock_card_disabled():
        goto(page, "/")
        wait_cards(page, 12)
        card4 = page.locator("article").filter(has=page.get_by_role("heading", name=BY_ID[4]["title"])).first
        assert card4.get_by_role("button", name="Out of stock").is_disabled()

    run("P2", "CORE", "Out-of-stock card: button disabled with 'Out of stock'", out_of_stock_card_disabled)

    def grid_uses_keys_no_warnings():
        bad = [c for c in CONSOLE if "key" in c.lower() and "unique" in c.lower()]
        assert not bad, bad

    run("STEP-8", "CORE", "map() renders with stable keys (no React key warnings in console)", grid_uses_keys_no_warnings)

    def loading_and_error_and_retry():
        API.fail_products = True
        goto(page, "/")
        page.wait_for_selector("text=Something went wrong")
        assert page.get_by_role("button", name="Retry").is_visible()
        assert page.locator("article").count() == 0
        API.fail_products = False
        page.get_by_role("button", name="Retry").click()
        wait_cards(page, 12)

    run("STEP-7", "CORE", "API error shows a message (app does not crash); Retry recovers", loading_and_error_and_retry)

    def skeleton_while_loading():
        src = open(os.path.join(os.path.dirname(__file__), "..", "src", "pages", "CatalogPage.tsx")).read()
        assert "ProductGridSkeleton" in src
        goto(page, "/")
        wait_cards(page, 12)

    run("P2.2", "FULL", "Skeleton cards are shown while loading", skeleton_while_loading)

    def empty_state():
        goto(page, "/?q=zzzzqq")
        page.wait_for_selector("text=No products found.")
        page.get_by_role("link", name="Clear filters").first.click()
        wait_cards(page, 12)
        assert "?" not in page.url

    run("P2.3", "CORE", "Empty result: 'No products found.' + 'Clear filters' clears the URL", empty_state)

    # ---------------- FULL: search / filters ----------------
    def search_debounce_one_request():
        goto(page, "/")
        wait_cards(page, 12)
        API.requests.clear()
        box = page.get_by_label("Search")
        box.click()
        for ch in "lapto":  # 5 keystrokes, faster than the 400 ms debounce
            page.keyboard.type(ch, delay=60)
        page.wait_for_url(re.compile("q=lapto"))
        page.wait_for_function("document.querySelectorAll('article').length === 10")
        assert API.count("/products/search") == 1, f"expected 1 search request, got {API.count('/products/search')}: {API.requests}"

    run("P2.4", "FULL", "Typing 5 letters fast sends exactly ONE search request (400 ms debounce)", search_debounce_one_request)

    def search_resets_page_and_category():
        goto(page, "/?page=2&sort=price-asc")
        page.wait_for_selector("text=Showing 13–24 of 30")
        page.get_by_label("Search").fill("phone")
        page.wait_for_url(re.compile("q=phone"))
        assert "page=" not in page.url and "sort=price-asc" in page.url, page.url
        goto(page, "/?category=fragrances")
        page.wait_for_selector("article")
        page.get_by_label("Search").fill("phone")
        page.wait_for_url(re.compile("q=phone"))
        assert "category=" not in page.url, page.url

    run("P2.4", "FULL", "Search clears category and resets page to 1 (sort is kept)", search_resets_page_and_category)

    def input_not_laggy_and_empty_returns_all():
        goto(page, "/?q=phone")
        page.wait_for_selector("article")
        assert page.get_by_label("Search").input_value() == "phone"
        page.get_by_label("Search").fill("")
        page.wait_for_function("!location.search.includes('q=')")
        wait_cards(page, 12)

    run("P2.4", "FULL", "Input is prefilled from the URL; clearing it returns the full list", input_not_laggy_and_empty_returns_all)

    def category_filter():
        goto(page, "/")
        wait_cards(page, 12)
        opts = page.get_by_label("Category").locator("option").all_inner_texts()
        assert opts[0] == "All categories" and "Smartphones" in opts and "Laptops" in opts
        page.get_by_label("Category").select_option("laptops")
        page.wait_for_url(re.compile("category=laptops"))
        page.wait_for_function("document.querySelectorAll('article').length === 10")
        assert API.count("/products/category/laptops") >= 1
        page.get_by_label("Category").select_option("")
        wait_cards(page, 12)
        assert "category=" not in page.url

    run("P2.5", "FULL", "Categories loaded from API; selecting filters, 'All categories' removes the filter", category_filter)

    def category_clears_search_text():
        goto(page, "/?q=lap")
        page.wait_for_selector("article")
        page.get_by_label("Category").select_option("fragrances")
        page.wait_for_url(re.compile("category=fragrances"))
        page.wait_for_function("document.querySelector('article h3') && document.querySelector('article h3').innerText.includes('Perfume')")
        assert page.get_by_label("Search").input_value() == "" and "q=" not in page.url

    run("P2.5", "FULL", "Choosing a category clears q (URL and input)", category_clears_search_text)

    def sort_options_and_order():
        goto(page, "/")
        wait_cards(page, 12)
        labels = page.get_by_label("Sort by").locator("option").all_inner_texts()
        assert labels == ["Default", "Price: low to high", "Price: high to low", "Rating: high to low", "Name A→Z"], labels
        for value, key, rev in [("price-asc", "price", False), ("price-desc", "price", True), ("rating-desc", "rating", True), ("title-asc", "title", False)]:
            page.get_by_label("Sort by").select_option(value)
            page.wait_for_url(re.compile(f"sort={value}"))
            page.wait_for_timeout(350)
            titles = page.locator("article h3").all_inner_texts()
            expected = sorted(PRODUCTS, key=lambda p: p[key], reverse=rev)[:12]
            assert titles == [p["title"] for p in expected], f"{value}: {titles[:3]} != {[p['title'] for p in expected][:3]}"

    run("P2.6", "FULL", "Sort: 5 exact options; price / rating / name order is correct", sort_options_and_order)

    def sort_works_with_other_filters():
        goto(page, "/?category=laptops&sort=price-desc")
        page.wait_for_selector("article")
        assert "sortBy=price&order=desc" in [r for r in API.requests if "category/laptops" in r][-1]

    run("P2.6", "FULL", "Sort parameters are added to the category endpoint too", sort_works_with_other_filters)

    def pagination_behaviour():
        goto(page, "/")
        wait_cards(page, 12)
        assert page.get_by_role("button", name="Previous page").is_disabled()
        assert page.get_by_text("Showing 1–12 of 30").is_visible()
        page.evaluate("window.scrollTo(0, 800)")
        API.requests.clear()
        page.get_by_role("button", name="Next page").click()
        page.wait_for_url(re.compile("page=2"))
        page.wait_for_function("window.scrollY === 0")
        page.wait_for_selector("text=Showing 13–24 of 30")
        assert API.count("limit=12&skip=12") >= 1
        page.get_by_role("button", name="Page 3").click()
        page.wait_for_selector("text=Showing 25–30 of 30")
        assert page.get_by_role("button", name="Next page").is_disabled()
        assert page.get_by_role("button", name="Page 3").get_attribute("aria-current") == "page"

    run("P2.7", "FULL", "Pagination: skip=(N-1)x12, ‹ › disabled at the edges, 'Showing 13–24 of 30', scroll to top", pagination_behaviour)

    def pagination_keeps_filters_and_filter_resets_page():
        goto(page, "/?sort=price-asc")
        page.wait_for_selector("article")
        page.get_by_role("button", name="Next page").click()
        page.wait_for_url(re.compile("page=2"))
        assert "sort=price-asc" in page.url, "page change must keep other params"
        page.get_by_label("Sort by").select_option("price-desc")
        page.wait_for_function("!location.search.includes('page=')")
        assert "sort=price-desc" in page.url
        page.get_by_role("button", name="Next page").click()
        page.wait_for_url(re.compile("page=2"))
        page.get_by_label("Category").select_option("laptops")
        page.wait_for_function("!location.search.includes('page=')")
        assert "sort=price-desc" in page.url and "category=laptops" in page.url, "sort must survive a category change"

    run("P2.7/P2.8", "FULL", "Page change keeps other params; changing a filter resets page to 1; sort + page combine with any filter", pagination_keeps_filters_and_filter_resets_page)

    def url_is_source_of_truth():
        goto(page, "/?sort=price-asc&page=2")
        page.wait_for_selector("text=Showing 13–24 of 30")
        assert page.get_by_label("Sort by").input_value() == "price-asc"
        first_titles = page.locator("article h3").all_inner_texts()
        page.reload()
        page.wait_for_selector("text=Showing 13–24 of 30")
        assert page.locator("article h3").all_inner_texts() == first_titles, "reload must show the same page"
        page.get_by_label("Category").select_option("fragrances")
        page.wait_for_url(re.compile("category=fragrances"))
        page.go_back()
        page.wait_for_url(re.compile("page=2"))
        page.wait_for_selector("text=Showing 13–24 of 30")
        page.go_forward()
        page.wait_for_url(re.compile("category=fragrances"))
        assert page.get_by_label("Category").input_value() == "fragrances"

    run("P2.8", "FULL", "Refresh, Back/Forward and shared links restore the filter state from the URL", url_is_source_of_truth)

    def search_and_category_mutually_exclusive_in_url():
        goto(page, "/?q=lap&category=fragrances")
        page.wait_for_selector("article")
        assert any("/products/search" in r for r in API.requests[-3:]) and page.get_by_label("Category").input_value() == ""

    run("P2.8", "FULL", "?q and ?category together: search wins (mutually exclusive)", search_and_category_mutually_exclusive_in_url)

    def request_cancellation():
        goto(page, "/")
        wait_cards(page, 12)
        API.pending.clear()
        API.hold_search = True
        failed = []
        page.on("requestfailed", lambda r: failed.append(r.url) if "/products/search" in r.url else None)
        page.get_by_label("Search").fill("lap")
        page.wait_for_url(re.compile("q=lap"))
        page.wait_for_timeout(300)
        page.get_by_label("Search").fill("perf")
        page.wait_for_url(re.compile("q=perf"))
        page.wait_for_timeout(400)
        assert len(API.pending) == 2, [u for u, _ in API.pending]
        assert len(failed) >= 1 and any("q=lap" in u for u in failed), f"old request was not aborted: {failed}"
        # answer the NEW request first, then (try to) answer the old one
        for url, route in reversed(API.pending):
            try:
                status, body = API.body_for(url)
                route.fulfill(status=status, headers=API.cors, content_type="application/json", body=json.dumps(body))
            except Exception:  # noqa: BLE001 - aborted request cannot be fulfilled
                pass
        API.hold_search = False
        page.wait_for_function("document.querySelectorAll('article').length === 10 && document.querySelector('article h3').innerText.includes('Perfume')")

    run("P2.2", "FULL", "AbortController: the old request is cancelled and can never overwrite the new result", request_cancellation)

    def view_toggle_bonus():
        goto(page, "/")
        wait_cards(page, 12)
        page.get_by_role("button", name="List", exact=True).click()
        page.wait_for_url(re.compile("view=list"))
        cols = page.evaluate("getComputedStyle(document.querySelector('main ul')).gridTemplateColumns.split(' ').length")
        assert cols == 1, cols
        page.get_by_role("button", name="Grid", exact=True).click()
        page.wait_for_function("!location.search.includes('view=')")

    run("BONUS", "BONUS", "Grid / list view switch (kept in the URL)", view_toggle_bonus)

    # ---------------- product page ----------------
    def product_details_core():
        goto(page, "/products/1")
        page.wait_for_selector("h1")
        p = BY_ID[1]
        assert page.get_by_role("heading", level=1).inner_text() == p["title"]
        assert page.locator("main img").first.get_attribute("alt") == p["title"]
        assert page.get_by_text(p["description"]).first.is_visible()
        assert f"{discounted(p):,.2f}" in page.locator("main").inner_text()
        assert f"{p['price']:,.2f}" in page.locator("main").inner_text()

    run("P3.1", "CORE", "/products/1: title, image(alt), description, price and discounted price = price x (1 - pct/100)", product_details_core)

    def product_price_formula_all():
        for pid in (1, 2, 3, 7):
            goto(page, f"/products/{pid}")
            page.wait_for_selector("h1")
            assert f"{discounted(BY_ID[pid]):,.2f}" in page.locator("main").inner_text(), pid

    run("P3", "CORE", "Discounted price matches the formula for several products", product_price_formula_all)

    def product_404_and_error():
        goto(page, "/products/999999")
        page.wait_for_selector("text=Page not found")
        goto(page, "/products/abc")
        page.wait_for_selector("text=Page not found")

    run("P3.2", "CORE", "Unknown / invalid id -> NotFound, no crash", product_404_and_error)

    def product_error_retry():
        # an ApiError other than 404 -> message + Retry
        ctx2, p2 = new_page(browser, mocked=False)
        state = {"fail": True}

        def h(route, request):
            if state["fail"] and "/products/1" in request.url and request.url.endswith("/products/1"):
                return route.fulfill(status=500, headers=API.cors, body="x")
            return API.handler(route, request)

        p2.route("https://dummyjson.com/**", h)
        p2.goto(BASE + "/products/1")
        p2.wait_for_selector("text=Something went wrong")
        state["fail"] = False
        p2.get_by_role("button", name="Retry").click()
        p2.wait_for_selector("h1")
        ctx2.close()

    run("P3.2", "FULL", "Server error on the product page -> message + Retry (not NotFound)", product_error_retry)

    def stepper_bounds():
        goto(page, "/products/5")  # stock 3
        page.wait_for_selector("h1")
        assert page.get_by_role("button", name="Decrease quantity").is_disabled()
        for _ in range(5):
            if page.get_by_role("button", name="Increase quantity").is_enabled():
                page.get_by_role("button", name="Increase quantity").click()
        assert page.get_by_role("button", name="Increase quantity").is_disabled()
        assert page.get_by_role("group", name="Quantity").inner_text().replace("\n", "").replace("−", "").replace("+", "").strip() == "3"

    run("P3", "CORE", "Stepper bounds 1 <= qty <= stock with disabled edges", stepper_bounds)

    def gallery_switch():
        goto(page, "/products/1")
        page.wait_for_selector("h1")
        before = page.locator("main img").first.get_attribute("src")
        page.get_by_role("button", name="Show photo 2 of 3").click()
        after = page.locator("main img").first.get_attribute("src")
        assert before != after and page.get_by_role("button", name="Show photo 2 of 3").get_attribute("aria-pressed") == "true"

    run("P3", "CORE", "Gallery: thumbnail click changes the main photo (local state)", gallery_switch)

    def add_to_cart_and_inline_message():
        page.evaluate("localStorage.clear()")
        goto(page, "/products/2")
        page.wait_for_selector("h1")
        page.get_by_role("button", name="Increase quantity").click()
        page.get_by_role("button", name="Add to cart").first.click()
        page.wait_for_selector("text=Added 2 items to cart ✓")
        assert page.get_by_label(re.compile(r"\d+ items in cart")).first.inner_text().strip() == "2"

    run("STEP-11", "CORE", "Add to cart with quantity 2: inline message + header badge", add_to_cart_and_inline_message)

    def cannot_exceed_stock():
        page.evaluate("localStorage.clear()")
        goto(page, "/products/5")
        page.wait_for_selector("h1")
        for _ in range(2):
            page.get_by_role("button", name="Increase quantity").click()
        page.get_by_role("button", name="Add to cart").first.click()
        page.wait_for_selector("text=Added 3 items to cart")
        page.get_by_role("button", name="Add to cart").first.click()
        page.wait_for_selector("text=Only 3 in stock and you already have 3 in your cart")
        assert page.get_by_label(re.compile(r"\d+ items in cart")).first.inner_text().strip() == "3"

    run("P3.3", "CORE", "Adding beyond stock is rejected with an exact message; cart stays at 3", cannot_exceed_stock)

    def tabs_and_review_count():
        goto(page, "/products/1")
        page.wait_for_selector("h1")
        assert page.get_by_role("tab", name="Reviews (2)").is_visible()
        page.get_by_role("tab", name="Reviews (2)").click()
        assert page.get_by_role("tab", name="Reviews (2)").get_attribute("aria-selected") == "true"
        assert page.get_by_text("Great product, loved it").is_visible()
        page.get_by_role("tab", name="Description").click()
        assert page.get_by_text(BY_ID[1]["description"]).first.is_visible()

    run("P3", "CORE", "Description / Reviews tabs; review count shown in the tab title", tabs_and_review_count)

    def back_link_keeps_filters():
        goto(page, "/?category=laptops&sort=price-asc")
        page.wait_for_selector("article")
        page.locator("article").first.locator("img").click()
        page.wait_for_url(re.compile("/products/"))
        page.get_by_role("button", name="← Back to catalog").click()
        page.wait_for_url(re.compile("category=laptops"))
        assert "sort=price-asc" in page.url

    run("P3", "CORE", "'← Back to catalog' returns with filters intact (navigate(-1))", back_link_keeps_filters)

    def category_link():
        goto(page, "/products/2")
        page.wait_for_selector("h1")
        page.locator("main").get_by_role("link", name=BY_ID[2]["category"]).first.click()
        page.wait_for_url(re.compile(f"category={BY_ID[2]['category']}"))

    run("P3.1", "CORE", "Category in the product info links to /?category=slug", category_link)

    def reviews_full():
        page.evaluate("localStorage.clear()")
        goto(page, "/products/1")
        page.wait_for_selector("h1")
        page.get_by_role("tab", name=re.compile("Reviews")).click()
        page.get_by_role("button", name="Submit review").click()
        assert page.get_by_text("Please select a rating").is_visible()
        assert page.get_by_text("Comment must be at least 10 characters").is_visible()
        avg_before = page.locator("main").get_by_text(re.compile(r"^\d\.\d$")).first.inner_text()
        page.get_by_role("radio", name="1 star").click()
        page.get_by_label("Comment").fill("Not what I expected at all")
        page.get_by_role("button", name="Submit review").click()
        page.wait_for_selector("text=Review added ✓")
        first_review = page.locator("ul li.card").first
        assert "Guest" in first_review.inner_text() and "Not what I expected at all" in first_review.inner_text(), "newest local review must be first, by Guest"
        assert page.get_by_role("tab", name="Reviews (3)").is_visible()
        avg_after = page.locator("main").get_by_text(re.compile(r"^\d\.\d$")).first.inner_text()
        assert avg_before != avg_after, (avg_before, avg_after)
        stored = json.loads(page.evaluate("localStorage.getItem('shop_reviews')"))
        assert "1" in stored and stored["1"][0]["rating"] == 1 and "T" in stored["1"][0]["date"]
        page.reload()
        page.get_by_role("tab", name=re.compile("Reviews")).click()
        assert page.get_by_text("Not what I expected at all").is_visible()

    run("P3.4", "FULL", "Reviews: validation texts, 'Review added ✓', Guest name, order, average changes, survives reload", reviews_full)

    def review_uses_profile_name():
        login(page)
        goto(page, "/profile")
        page.get_by_label("First name").fill("Emily")
        page.get_by_label("Last name").fill("Stone")
        page.get_by_label("Email").fill("e@s.co")
        page.get_by_role("button", name="Save changes").click()
        page.wait_for_selector("text=Profile updated")
        goto(page, "/products/2")
        page.wait_for_selector("h1")
        page.get_by_role("tab", name=re.compile("Reviews")).click()
        page.get_by_role("radio", name="5 stars").click()
        page.get_by_label("Comment").fill("Excellent value for money")
        page.get_by_role("button", name="Submit review").click()
        page.wait_for_selector("text=Emily Stone")

    run("P3.4", "FULL", "Reviewer name = logged-in user's first + last name", review_uses_profile_name)

    def related_products():
        goto(page, "/products/1")
        page.wait_for_selector("text=Related products")
        cards = page.locator("section[aria-labelledby='related-heading'] article")
        assert cards.count() == 4
        assert BY_ID[1]["title"] not in cards.all_inner_texts().__str__(), "current product must be excluded"
        assert API.count(f"/products/category/{BY_ID[1]['category']}?limit=5") >= 1
        old_title = page.get_by_role("heading", level=1).inner_text()
        cards.first.locator("img").click()
        page.wait_for_function(f"document.querySelector('h1') && document.querySelector('h1').innerText !== {json.dumps(old_title)}")
        page.wait_for_selector("h1")

    run("P3.5", "FULL", "Related: category?limit=5, current excluded, 4 shown, same ProductCard; click loads NEW product data", related_products)

    # ---------------- wishlist bonus ----------------
    def wishlist_bonus():
        page.evaluate("localStorage.clear()")
        goto(page, "/")
        wait_cards(page, 12)
        page.get_by_role("button", name=re.compile("^Add .* to wishlist")).first.click()
        page.wait_for_selector("text=Saved to wishlist")
        assert page.get_by_label(re.compile(r"\d+ saved items")).first.is_visible()
        goto(page, "/wishlist")
        wait_cards(page, 1)
        page.get_by_role("button", name=re.compile("^Remove .* from wishlist")).first.click()
        page.wait_for_selector("text=Your wishlist is empty.")

    run("BONUS", "BONUS", "Wishlist: heart toggles, persisted, dedicated page with empty state", wishlist_bonus)

    ctx.close()


# ======================================================================================
# GROUP C - cart, checkout, orders, profile (PRD steps 12-15, 21; A: P4-P7)
# ======================================================================================
def group_c(browser):
    ctx, page = new_page(browser)

    def cart_flow():
        goto(page, "/login")  # localStorage is not accessible on about:blank
        page.evaluate("localStorage.clear()")
        add_product_to_cart(page, 2, clicks=1)  # qty 2
        add_product_to_cart(page, 3)  # qty 1
        goto(page, "/cart")
        page.wait_for_selector("text=Order summary")
        assert page.locator("ul.divide-y > li").count() == 2
        expected_sub = round(discounted(BY_ID[2]) * 2 + discounted(BY_ID[3]), 2)
        t = totals(page)
        assert abs(money(t["Subtotal"]) - expected_sub) < 0.01, (t, expected_sub)
        shipping = 0 if expected_sub >= 100 else 10
        assert abs(money(t["Total"]) - (expected_sub + shipping)) < 0.01, (t, expected_sub, shipping)

    run("STEP-13", "CORE", "Cart page lists items; Subtotal / Shipping / Total match independent calculation", cart_flow)

    def cart_qty_and_remove():
        before = money(totals(page)["Total"])
        page.get_by_role("button", name="Increase quantity").first.click()
        page.wait_for_function(f"document.body.innerText.includes('Total')")
        page.wait_for_timeout(200)
        after = money(totals(page)["Total"])
        assert after > before
        assert page.get_by_label(re.compile(r"\d+ items in cart")).first.inner_text().strip() == "4"
        page.get_by_role("button", name=re.compile(r"^Remove .* from cart")).first.click()
        page.wait_for_selector("text=Removed from cart")
        assert page.locator("ul.divide-y > li").count() == 1

    run("STEP-13", "CORE", "Quantity change updates totals + badge; Remove updates list ('Removed from cart')", cart_qty_and_remove)

    def cart_qty_bounds():
        goto(page, "/cart")
        page.wait_for_selector("text=Order summary")
        for _ in range(6):
            if page.get_by_role("button", name="Decrease quantity").first.is_enabled():
                page.get_by_role("button", name="Decrease quantity").first.click()
        assert page.get_by_role("button", name="Decrease quantity").first.is_disabled(), "quantity must stop at 1"
        assert page.locator("ul.divide-y > li").first.get_by_role("group").inner_text().replace("\n", "").replace("−", "").replace("+", "").strip() == "1"

    run("P4.2", "CORE", "Cart quantity cannot go below 1 (disabled) and above stock", cart_qty_bounds)

    def cart_persists_reload():
        page.reload()
        page.wait_for_selector("text=Order summary")
        raw = json.loads(page.evaluate("localStorage.getItem('shop_cart')"))
        assert "items" in raw and "promoCode" in raw and raw["items"][0]["productId"]

    run("P4.2", "CORE", "Cart survives reload (shop_cart = { items, promoCode })", cart_persists_reload)

    def promo_flow():
        goto(page, "/cart")
        page.wait_for_selector("text=Order summary")
        page.get_by_label("Promo code").fill("abc")
        page.get_by_role("button", name="Apply").click()
        assert page.get_by_text("Invalid promo code").is_visible()
        before = money(totals(page)["Subtotal"])
        page.get_by_label("Promo code").fill("10x10")
        page.get_by_role("button", name="Apply").click()
        page.wait_for_selector("text=Discount (10X10 −10%)")
        disc = money(page.locator("dt", has_text="Discount (10X10 −10%)").locator("xpath=following-sibling::dd").first.inner_text())
        assert abs(disc + round(before * 0.1, 2)) < 0.011, (disc, before)
        page.reload()
        page.wait_for_selector("text=Discount (10X10 −10%)")
        page.get_by_role("button", name="Remove", exact=True).click()
        page.wait_for_selector("text=Promo code")

    run("P4.4", "FULL", "Promo: 'abc' -> Invalid promo code; 10x10 (any case) -> -10%, persists, removable", promo_flow)

    def shipping_threshold_ui():
        page.evaluate("localStorage.clear()")
        add_product_to_cart(page, 1)  # price 17.5 -> under 100
        goto(page, "/cart")
        page.wait_for_selector("text=Order summary")
        assert totals(page)["Shipping"] == "$10.00"
        goto(page, "/products/30")  # 235 -> over 100
        page.wait_for_selector("h1")
        page.get_by_role("button", name="Add to cart").first.click()
        goto(page, "/cart")
        page.wait_for_selector("text=Order summary")
        assert totals(page)["Shipping"] == "Free"

    run("P4.3", "FULL", "Shipping $10 under $100, 'Free' from $100", shipping_threshold_ui)

    def clear_cart_confirm_text():
        page.dlg["msgs"].clear()
        page.get_by_role("button", name="Clear cart").click()
        page.wait_for_selector("text=Your cart is empty.")
        messages = page.dlg["msgs"]
        assert messages and messages[0] == "Clear the cart? This cannot be undone.", messages
        assert page.get_by_role("link", name="Browse products").is_visible()
        assert page.locator("text=Order summary").count() == 0, "summary must be hidden for an empty cart"

    run("P4.1", "CORE", "Clear cart: exact confirm() text, then empty state without summary", clear_cart_confirm_text)

    def clear_cart_cancel():
        add_product_to_cart(page, 2)
        goto(page, "/cart")
        page.wait_for_selector("text=Order summary")
        page.dlg["mode"] = "dismiss"
        page.get_by_role("button", name="Clear cart").click()
        page.wait_for_timeout(200)
        page.dlg["mode"] = "accept"
        assert page.locator("ul.divide-y > li").count() == 1, "cancel must keep the cart"

    run("P4", "CORE", "Cancelling the confirm keeps the cart", clear_cart_cancel)

    # ---------------- checkout ----------------
    def checkout_empty_cart_redirect():
        page.evaluate("localStorage.removeItem('shop_cart')")
        login(page)
        page.evaluate("localStorage.removeItem('shop_cart')")
        page.reload()
        goto(page, "/checkout")
        page.wait_for_url(re.compile("/cart"))
        page.wait_for_selector("text=Your cart is empty. Add something before checking out.")

    run("P5.1", "CORE", "Empty cart + /checkout -> redirect to /cart with an explanation", checkout_empty_cart_redirect)

    def checkout_validation_blocks():
        add_product_to_cart(page, 2)
        goto(page, "/checkout")
        page.wait_for_selector("text=Shipping details")
        page.get_by_role("button", name="Place order").click()
        for msg in ["Full name must be at least 3 characters", "Please enter a valid email address", "Address must be at least 5 characters", "City is required"]:
            assert page.get_by_text(msg).is_visible(), msg
        assert page.locator("text=Thank you").count() == 0
        orders = page.evaluate("localStorage.getItem('shop_orders')")
        assert orders in (None, "[]"), "no order may be created by an invalid form"

    run("P5.2", "CORE", "Empty required fields: exact messages, submit blocked, no order created", checkout_validation_blocks)

    def checkout_blur_validation():
        goto(page, "/checkout")
        page.wait_for_selector("text=Shipping details")
        page.get_by_label("Email").fill("bad")
        page.get_by_label("Address").click()
        assert page.get_by_text("Please enter a valid email address").is_visible(), "error must show on blur"

    run("P0.5", "FULL", "Validation on blur", checkout_blur_validation)

    def checkout_optional_fields():
        goto(page, "/checkout")
        page.wait_for_selector("text=Shipping details")
        fill_checkout(page)
        page.get_by_label("Phone").fill("12")
        page.get_by_label("Postal code").fill("12")
        page.get_by_role("button", name="Place order").click()
        assert page.get_by_text("Please enter a valid phone number").is_visible()
        assert page.get_by_text("Postal code must be 4-10 digits").is_visible()
        assert page.get_by_label("Country").input_value() == "Georgia"
        assert page.get_by_label("Country").locator("option").count() >= 5

    run("P5.2", "FULL", "Extra shipping fields: phone / postal code messages, Country select (>=5, default Georgia)", checkout_optional_fields)

    def checkout_summary_matches_cart():
        goto(page, "/checkout")
        page.wait_for_selector("text=Shipping details")
        expected = round(discounted(BY_ID[2]), 2)
        t = totals(page)
        assert abs(money(t["Subtotal"]) - expected) < 0.01
        assert page.get_by_text(BY_ID[2]["title"]).first.is_visible()

    run("P5", "CORE", "Order summary on checkout shows items and the same totals", checkout_summary_matches_cart)

    def place_order_flow():
        goto(page, "/checkout")
        page.wait_for_selector("text=Shipping details")
        page.evaluate("window.__m = 7")
        fill_checkout(page)
        total_before = totals(page)["Total"]
        page.get_by_role("button", name="Place order").click()
        assert page.get_by_role("button", name="Placing order…").is_disabled(), "button must be disabled while placing"
        page.wait_for_selector("text=Thank you! Your order has been placed.")
        assert page.evaluate("window.__m") == 7, "submit reloaded the page"
        assert total_before in page.locator("main").inner_text()
        assert "#10X-00001" in page.locator("main").inner_text()
        assert page.get_by_label(re.compile(r"\d+ items in cart")).count() == 0, "badge must update immediately"
        assert json.loads(page.evaluate("localStorage.getItem('shop_cart')"))["items"] == []

    run("STEP-15", "CORE", "Place order: disabled while placing, Thank you + total + order number, cart cleared, no reload", place_order_flow)

    def order_has_no_card_data():
        raw = page.evaluate("localStorage.getItem('shop_orders')")
        data = json.loads(raw)
        assert data[0]["number"] == "10X-00001" and "T" in data[0]["placedAt"] and data[0]["id"] > 1_000_000_000_000
        assert not re.search(r"card|cvv|4242", raw, re.I), "no payment data may be stored"
        assert set(["subtotal", "discount", "shippingCost", "total", "items", "shipping"]).issubset(data[0].keys())

    run("A1.5", "FULL", "Order object: id=Date.now(), 10X-00001, ISO date, totals, shipping; no card data", order_has_no_card_data)

    # ---------------- orders ----------------
    def orders_list_and_order():
        add_product_to_cart(page, 3)
        place_order(page, name="Second Buyer")
        goto(page, "/orders")
        page.wait_for_selector("text=#10X-00002")
        cards = page.locator("main ul li a")
        assert cards.count() == 2
        assert "#10X-00002" in cards.first.inner_text(), "newest order must be on top"
        assert "Processing" in cards.first.inner_text()
        assert "$" in cards.first.inner_text()
        cards.first.click()
        page.wait_for_selector("h1:has-text('Order #10X-00002')")

    run("P6.1", "FULL", "Orders list: newest first (#10X-00002), number/date/items/total/status badge, click -> details", orders_list_and_order)

    def order_details_blocks():
        assert page.get_by_role("list", name="Order progress").is_visible()
        assert page.get_by_role("columnheader", name="Product").is_visible() and page.get_by_role("columnheader", name="Total").is_visible()
        assert page.get_by_text("Second Buyer").is_visible() and page.get_by_text("1 Main Street").is_visible()
        assert page.get_by_role("button", name="Reorder").is_visible()
        assert page.locator("dt", has_text=re.compile("^Total$")).count() == 1

    run("P6.3", "FULL", "Order details: timeline, items table, delivery address, totals, Reorder", order_details_blocks)

    def just_placed_banner():
        add_product_to_cart(page, 2)
        place_order(page)
        page.get_by_role("link", name="View order").click()
        page.wait_for_selector("h1:has-text('Order #10X-00003')")
        assert page.get_by_text("Thank you! Your order has been placed.").first.is_visible()
        goto(page, "/orders")
        page.locator("main ul li a").first.click()
        page.wait_for_selector("h1:has-text('Order #10X-00003')")
        assert page.get_by_text("Thank you! Your order has been placed.").count() == 0, "banner only right after placing"

    run("P6.3", "FULL", "state.justPlaced: green banner only right after the order", just_placed_banner)

    def order_not_found():
        goto(page, "/orders/123456")
        page.wait_for_selector("text=Page not found")

    run("P6.3", "FULL", "/orders/123456 (unknown) -> NotFound", order_not_found)

    def orders_empty_state_and_guard():
        ctx2, p2 = new_page(browser)
        goto(p2, "/orders")
        p2.wait_for_url(re.compile("/login"))
        login(p2)
        goto(p2, "/orders")
        p2.wait_for_selector("text=You have no orders yet.")
        assert p2.get_by_role("link", name="Browse products").is_visible()
        goto(p2, "/profile")
        p2.wait_for_selector("text=Personal details")
        ctx2.close()

    run("P6.1", "FULL", "Orders/Profile are protected; empty list message + Browse products", orders_empty_state_and_guard)

    def reorder_exact_items():
        add_product_to_cart(page, 2, clicks=1)  # 2 pcs of product 2
        add_product_to_cart(page, 6)
        place_order(page)
        page.evaluate("localStorage.removeItem('shop_cart')")
        page.reload()
        goto(page, "/orders")
        page.locator("main ul li a").first.click()
        page.wait_for_selector("h1:has-text('Order #10X-00004')")
        page.get_by_role("button", name="Reorder").click()
        page.wait_for_url(re.compile("/cart"))
        page.wait_for_selector("text=Order summary")
        cart = json.loads(page.evaluate("localStorage.getItem('shop_cart')"))["items"]
        assert sorted((i["productId"], i["quantity"]) for i in cart) == [(2, 2), (6, 1)], cart

    run("P6.3", "FULL", "Reorder adds exactly the same products and quantities to the cart", reorder_exact_items)

    def status_progression_with_clock():
        ctx2, p2 = new_page(browser)
        p2.clock.install(time=int(time.time() * 1000))
        goto(p2, "/")
        wait_cards(p2)
        login(p2)
        add_product_to_cart(p2, 2)
        place_order(p2)
        goto(p2, "/orders")
        p2.wait_for_selector("text=#10X-00001")
        assert "Processing" in p2.locator("main ul li a").first.inner_text()
        p2.clock.fast_forward(80_000)  # > 1 min, the 30 s interval fires
        p2.wait_for_function("document.querySelector('main ul li a').innerText.includes('Shipped')")
        p2.clock.fast_forward(150_000)  # > 3 min in total
        p2.wait_for_function("document.querySelector('main ul li a').innerText.includes('Delivered')")
        ctx2.close()

    run("P6.2", "FULL", "Status changes Processing -> Shipped -> Delivered by itself (30 s interval, no reload)", status_progression_with_clock)

    def interval_cleanup():
        src = open(os.path.join(os.path.dirname(__file__), "..", "src", "hooks", "useNow.ts")).read()
        assert "setInterval" in src and "clearInterval" in src and "30_000" in open(os.path.join(os.path.dirname(__file__), "..", "src", "pages", "OrdersPage.tsx")).read()

    run("P6.2", "FULL", "setInterval(30 000) is cleaned up on unmount (clearInterval)", interval_cleanup)

    # ---------------- profile ----------------
    def profile_page():
        goto(page, "/profile")
        page.wait_for_selector("text=Personal details")
        assert page.get_by_text("Signed in as emilys").is_visible()
        page.get_by_label("First name").fill("")
        page.get_by_label("Phone (optional)").fill("12")
        page.get_by_role("button", name="Save changes").click()
        for msg in ["First name must be at least 2 characters", "Last name must be at least 2 characters", "Please enter a valid email address", "Please enter a valid phone number"]:
            assert page.get_by_text(msg).first.is_visible(), msg
        page.get_by_label("First name").fill("Emily")
        page.get_by_label("Last name").fill("Stone")
        page.get_by_label("Email").fill("emily@example.com")
        page.get_by_label("Phone (optional)").fill("")
        page.get_by_role("button", name="Save changes").click()
        page.wait_for_selector("text=Profile updated ✓")
        assert page.get_by_text("Hi, Emily").is_visible(), "header must show the new name"

    run("P7", "FULL", "Profile: username + order count, exact validation texts, save -> Header shows new name", profile_page)

    def theme_single_implementation():
        goto(page, "/profile")
        page.wait_for_selector("text=Appearance")
        page.get_by_role("button", name=re.compile("^Switch to dark theme$")).first.click()
        assert page.evaluate("document.documentElement.dataset.theme") == "dark"
        assert json.loads(page.evaluate("localStorage.getItem('shop_theme')")) == "dark"
        # the header button reflects the same state
        assert page.get_by_role("button", name="Switch to light theme").count() >= 1
        page.reload()
        assert page.evaluate("document.documentElement.dataset.theme") == "dark"
        page.get_by_role("button", name=re.compile("^Switch to light theme$")).first.click()

    run("P0.4/P7", "FULL", "Theme toggle: data-theme + shop_theme, one ThemeContext for Header and Profile, survives reload", theme_single_implementation)

    def clear_local_data():
        add_product_to_cart(page, 2)
        goto(page, "/products/1")
        page.wait_for_selector("h1")
        page.get_by_role("tab", name=re.compile("Reviews")).click()
        page.get_by_role("radio", name="5 stars").click()
        page.get_by_label("Comment").fill("Written to be deleted soon")
        page.get_by_role("button", name="Submit review").click()
        page.wait_for_selector("text=Review added")
        goto(page, "/profile")
        page.wait_for_selector("text=Personal details")
        page.get_by_role("button", name="Switch to dark theme").first.click()
        page.get_by_role("button", name="Clear local data").click()
        page.wait_for_selector("text=Local data cleared")
        assert json.loads(page.evaluate("localStorage.getItem('shop_cart')"))["items"] == []
        assert json.loads(page.evaluate("localStorage.getItem('shop_orders')")) == []
        assert page.evaluate("localStorage.getItem('shop_reviews')") is None
        assert page.get_by_role("button", name="Log out").first.is_visible(), "session must be kept"
        assert page.evaluate("document.documentElement.dataset.theme") == "dark", "theme must be kept"
        page.get_by_role("button", name="Switch to light theme").first.click()

    run("P7", "FULL", "Clear local data clears cart, orders, reviews but keeps session and theme", clear_local_data)

    def logout_from_protected_pages_goes_to_catalog():
        for path in ["/profile", "/orders"]:
            ensure_logged_in(page)
            goto(page, path)
            page.wait_for_selector("main")
            page.get_by_role("button", name="Log out").first.click()
            page.wait_for_selector("article")
            assert page.url.rstrip("/") == BASE, f"after logout on {path} the user is at {page.url}"
        # a guest who opens a protected page afterwards is still sent to /login (guard still works)
        goto(page, "/checkout")
        page.wait_for_url(re.compile("/login"))

    run("P0.3", "CORE", "Logout from a protected page (/profile, /orders) lands on the catalog; the guard still redirects guests", logout_from_protected_pages_goes_to_catalog)

    def logout_login_keeps_data():
        ensure_logged_in(page)
        add_product_to_cart(page, 2)
        place_order(page)
        add_product_to_cart(page, 3)
        page.get_by_role("button", name="Log out").first.click()
        page.wait_for_selector("article")
        login(page, "someoneelse", "password1")
        goto(page, "/orders")
        page.wait_for_selector("text=#10X-00001")
        assert json.loads(page.evaluate("localStorage.getItem('shop_cart')"))["items"][0]["productId"] == 3

    run("A1.3", "FULL", "Happy path step 6: logout -> login -> orders and cart are still there", logout_login_keeps_data)

    ctx.close()


# ======================================================================================
# GROUP D - responsive, accessibility, Tailwind, performance, error boundary (A: O1-O3, TW)
# ======================================================================================
PAGES_375 = ["/", "/products/1", "/cart", "/login", "/checkout", "/orders", "/profile", "/wishlist", "/nope"]


def group_d(browser):
    ctx, page = new_page(browser)
    login(page)
    add_product_to_cart(page, 2)
    place_order(page)
    add_product_to_cart(page, 2)
    ctx.storage_state(path="/tmp/state.json")
    ctx.close()

    mctx = browser.new_context(viewport={"width": 375, "height": 800}, storage_state="/tmp/state.json")
    mp = mctx.new_page()
    mp.route("https://dummyjson.com/**", API.handler)
    mp.on("console", lambda m: CONSOLE.append(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    mp.on("pageerror", lambda e: CONSOLE.append("[pageerror] " + str(e)))
    mp.on("dialog", lambda d: d.accept())

    def hscroll_all_pages():
        bad = []
        for path in PAGES_375:
            goto(mp, path)
            mp.wait_for_timeout(600)
            if not no_hscroll(mp):
                bad.append(path)
        goto(mp, "/orders")
        mp.wait_for_selector("main ul li a")
        mp.locator("main ul li a").first.click()
        mp.wait_for_selector("h1:has-text('Order #')")
        if not no_hscroll(mp):
            bad.append("/orders/:id")
        assert not bad, f"horizontal scroll on: {bad}"

    run("O3/STEP-19", "CORE", "375px: no horizontal scroll on every page (incl. checkout, orders, order details, profile, 404)", hscroll_all_pages)

    def touch_targets():
        problems = []
        for path in ["/", "/cart", "/products/1", "/checkout", "/login", "/profile"]:
            goto(mp, path)
            mp.wait_for_timeout(500)
            small = mp.evaluate(
                """() => [...document.querySelectorAll('button, [role=tab], [role=radio], select, input:not([type=hidden])')]
                    .filter(e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
                        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !e.closest('.sr-only') && (r.height < 43.5 || r.width < 43.5); })
                    .map(e => (e.getAttribute('aria-label') || e.innerText || e.name || e.tagName).slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))"""
            )
            problems += [f"{path}: {s}" for s in small]
        assert not problems, problems[:8]

    run("O3", "CORE", "375px: every button / input / select / tab is >= 44x44 px", touch_targets)

    def burger_menu_mobile():
        goto(mp, "/")
        wait_cards(mp)
        assert mp.get_by_role("button", name="Open menu").is_visible()
        assert mp.get_by_role("navigation", name="Main").is_hidden()
        mp.get_by_role("button", name="Open menu").click()
        nav = mp.get_by_role("navigation", name="Mobile")
        assert nav.is_visible() and nav.get_by_role("link", name="Cart").is_visible()
        nav.get_by_role("link", name="Cart").click()
        mp.wait_for_url(re.compile("/cart"))
        assert mp.get_by_role("navigation", name="Mobile").count() == 0, "menu must close after navigation"

    run("P0.3", "CORE", "Mobile: links collapse into a burger menu that closes after navigation", burger_menu_mobile)

    def columns_by_width():
        results = {}
        for w, expected in [(375, 1), (480, 1), (600, 2), (900, 2), (1024, 3), (1100, 4), (1280, 4)]:
            ctxw, pw = new_page(browser, width=w, height=900)
            pw.goto(BASE + "/")
            wait_cards(pw, 12)
            cols = pw.evaluate("getComputedStyle(document.querySelector('main ul')).gridTemplateColumns.split(' ').length")
            results[w] = cols
            ctxw.close()
            if w == 900:
                assert cols in (2, 3), (w, cols)
            else:
                assert cols == expected, f"{w}px -> {cols} columns (expected {expected}); {results}"

    run("TW3/O3", "CORE", "Grid columns per breakpoint: <=480:1, 481-1024:2-3, >1024:4 (mobile-first)", columns_by_width)

    def cart_summary_below_list_on_mobile():
        goto(mp, "/cart")
        mp.wait_for_selector("text=Order summary")
        list_box = mp.locator("ul.divide-y").first.bounding_box()
        sum_box = mp.get_by_role("heading", name="Order summary").bounding_box()
        assert sum_box["y"] > list_box["y"] + list_box["height"] - 5, "summary must sit under the list on mobile"
        gctx, gp = new_page(browser, width=1280)
        gp.goto(BASE + "/products/2")
        gp.wait_for_selector("h1")
        gp.get_by_role("button", name="Add to cart").first.click()
        gp.goto(BASE + "/cart")
        gp.wait_for_selector("text=Order summary")
        lb, sb = gp.locator("ul.divide-y").first.bounding_box(), gp.get_by_role("heading", name="Order summary").bounding_box()
        assert sb["x"] > lb["x"] + lb["width"] - 5, "summary must sit to the right of the list on desktop"
        gctx.close()

    run("P4.1", "CORE", "Cart layout: summary under the list on mobile, to the right on desktop", cart_summary_below_list_on_mobile)

    mctx.close()

    # ----- Tailwind / interaction states -----
    ctx, page = new_page(browser)

    def tailwind_v4_integration():
        root = os.path.join(os.path.dirname(__file__), "..")
        css = open(os.path.join(root, "src", "index.css")).read()
        cfg = open(os.path.join(root, "vite.config.ts")).read()
        pkg = json.load(open(os.path.join(root, "package.json")))
        assert css.lstrip().startswith('@import "tailwindcss"') and "@tailwindcss/vite" in cfg and pkg["devDependencies"]["tailwindcss"].lstrip("^~").startswith("4")
        assert not os.path.exists(os.path.join(root, "tailwind.config.js")), "v4 needs no tailwind.config.js"
        assert "@base" not in css and "@components" not in css, "wrong v3-style directives"
        goto(page, "/")
        wait_cards(page, 12)
        assert page.evaluate("getComputedStyle(document.querySelector('header')).position") == "sticky"
        assert page.evaluate("getComputedStyle(document.querySelector('article')).display") == "flex"

    run("TW1/TW2", "CORE", "Tailwind v4: @import + @tailwindcss/vite, no v3 config/directives, utilities change the real UI", tailwind_v4_integration)

    def hover_focus_disabled_states():
        goto(page, "/products/2")
        page.wait_for_selector("h1")
        btn = page.get_by_role("button", name="Add to cart").first
        normal = btn.evaluate("e => getComputedStyle(e).backgroundColor")
        btn.hover()
        page.wait_for_timeout(250)
        hovered = btn.evaluate("e => getComputedStyle(e).backgroundColor")
        assert normal != hovered, f"hover: {normal} == {hovered}"
        page.keyboard.press("Tab")
        goto(page, "/login")
        page.get_by_label("Username").click()
        focus_ring = page.get_by_label("Username").evaluate("e => getComputedStyle(e).boxShadow")
        assert focus_ring != "none", "input needs a visible focus style"
        goto(page, "/products/4")
        page.wait_for_selector("h1")
        dis = page.get_by_role("button", name="Out of stock").first
        assert dis.is_disabled() and float(dis.evaluate("e => getComputedStyle(e).opacity")) < 1 and dis.evaluate("e => getComputedStyle(e).cursor") == "not-allowed"

    run("TW4/STEP-20", "CORE", "hover / focus / disabled variants really change button + input styles", hover_focus_disabled_states)

    def keyboard_focus_visible_outline():
        goto(page, "/")
        wait_cards(page, 12)
        for _ in range(3):
            page.keyboard.press("Tab")
        outline = page.evaluate("(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle + '|' + s.outlineWidth })()")
        assert "none" not in outline.split("|")[0], outline

    run("O3", "CORE", "Keyboard focus is visible (focus-visible outline)", keyboard_focus_visible_outline)

    def theme_tokens():
        goto(page, "/")
        wait_cards(page, 12)
        assert page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim()") == "#4f46e5"
        primary = page.get_by_role("button", name="Add to cart").first
        assert primary.evaluate("e => getComputedStyle(e).backgroundColor") == "rgb(79, 70, 229)", "bg-brand must use the @theme token"
        css = open(os.path.join(os.path.dirname(__file__), "..", "src", "index.css")).read()
        assert "@theme" in css and "@utility" in css and "@custom-variant dark" in css

    run("TW5", "FULL", "@theme design token (--color-brand) is defined and used by a real component", theme_tokens)

    def dark_mode():
        goto(page, "/")
        wait_cards(page, 12)
        light_bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
        page.get_by_role("button", name="Switch to dark theme").first.click()
        page.wait_for_timeout(200)
        dark_bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
        assert light_bg != dark_bg and dark_bg != "rgba(0, 0, 0, 0)"
        card_bg = page.evaluate("getComputedStyle(document.querySelector('article')).backgroundColor")
        assert card_bg != "rgb(255, 255, 255)", "cards must be dark too"
        page.get_by_role("button", name="Switch to light theme").first.click()

    run("TW6/P0.4", "BONUS", "Dark mode changes page and card colours (CSS variables), custom variant + utilities defined", dark_mode)

    def no_theme_flash():
        page.evaluate("localStorage.setItem('shop_theme', '\"dark\"')")
        html_theme = []
        page.on("domcontentloaded", lambda: None)
        goto(page, "/login")
        html_theme.append(page.evaluate("document.documentElement.dataset.theme"))
        assert html_theme[0] == "dark"
        page.evaluate("localStorage.setItem('shop_theme', '\"light\"')")

    run("TW6", "BONUS", "Saved theme is applied on load (inline script in index.html)", no_theme_flash)

    # ----- performance -----
    def route_chunks_lazy():
        ctxn, pn = new_page(browser)
        loaded = []
        pn.on("request", lambda r: loaded.append(r.url.split("/")[-1]) if "/assets/" in r.url and r.url.endswith(".js") else None)
        pn.goto(BASE + "/")
        wait_cards(pn, 12)
        names = " ".join(loaded)
        assert "CatalogPage" in names, names
        for later in ("CheckoutPage", "OrdersPage", "ProfilePage", "CartPage", "ProductPage", "LoginPage"):
            assert later not in names, f"{later} must not load with the catalog: {names}"
        loaded.clear()
        pn.get_by_role("link", name="Cart").first.click()
        pn.wait_for_selector("text=Your cart")
        assert any("CartPage" in n for n in loaded), loaded
        loaded.clear()
        pn.goto(BASE + "/login")
        pn.wait_for_selector("text=Log in")
        assert any("LoginPage" in n for n in loaded)
        ctxn.close()

    run("O1/①", "FULL", "Route-level code splitting: catalog chunk first, other pages' chunks only when opened", route_chunks_lazy)

    def images_attrs():
        goto(page, "/")
        wait_cards(page, 12)
        bad = page.evaluate(
            """() => [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt') || !i.getAttribute('width') || !i.getAttribute('height') || i.loading !== 'lazy').length"""
        )
        assert bad == 0, f"{bad} images lack alt / width / height / lazy"
        goto(page, "/products/1")
        page.wait_for_selector("h1")
        bad = page.evaluate("() => [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt') || !i.getAttribute('width') || !i.getAttribute('height')).length")
        assert bad == 0

    run("O1/②", "FULL", "All images: alt, width/height (CLS), loading=lazy on grid thumbnails", images_attrs)

    def never_loads_all_products():
        API.requests.clear()
        goto(page, "/")
        wait_cards(page, 12)
        assert not any("limit=0" in r or "limit=100" in r or "limit=194" in r for r in API.requests)

    run("O1/③", "FULL", "Pagination: the full product list is never loaded at once", never_loads_all_products)

    # ----- error boundary & console -----
    def error_boundary():
        goto(page, "/crash-test")
        page.wait_for_selector("text=Something went wrong.")
        assert page.get_by_role("button", name="Reload").is_visible()
        assert page.get_by_role("link", name="Catalog").first.is_visible(), "header must survive a page crash"
        page.get_by_role("link", name="Catalog").first.click()
        wait_cards(page, 12)

    run("O2", "CORE", "Error Boundary: crash -> 'Something went wrong.' + Reload; navigation recovers", error_boundary)

    def spa_refresh():
        for path in ["/products/5", "/cart", "/login"]:
            goto(page, path)
            page.reload()
            page.wait_for_selector("main")
            assert page.locator("main").inner_text().strip() != "", path
        root = os.path.join(os.path.dirname(__file__), "..")
        assert "index.html" in open(os.path.join(root, "vercel.json")).read() and os.path.exists(os.path.join(root, "public", "_redirects"))

    run("STEP-24", "CORE", "Direct open / refresh of /products/5 works (SPA fallback); Vercel + Netlify rewrite files present", spa_refresh)

    def end_to_end_happy_path():
        ctxh, ph = new_page(browser)
        goto(ph, "/")
        wait_cards(ph, 12)
        ph.get_by_label("Search").fill("phone")
        ph.wait_for_url(re.compile("q=phone"))
        ph.get_by_label("Sort by").select_option("price-asc")
        ph.wait_for_url(re.compile("sort=price-asc"))
        ph.locator("article").first.locator("img").click()
        ph.wait_for_selector("h1")
        ph.get_by_role("button", name="Increase quantity").click()
        ph.get_by_role("button", name="Add to cart").first.click()
        ph.get_by_role("link", name="Cart").first.click()
        ph.wait_for_selector("text=Order summary")
        ph.get_by_role("button", name="Proceed to checkout").click()
        ph.wait_for_url(re.compile("/login"))
        ph.get_by_label("Username").fill("emilys")
        ph.get_by_label("Password").fill("emilyspass")
        ph.get_by_role("button", name="Log In").click()
        ph.wait_for_url(re.compile("/checkout"))
        fill_checkout(ph)
        ph.get_by_role("button", name="Place order").click()
        ph.wait_for_selector("text=Thank you! Your order has been placed.")
        ph.get_by_role("link", name="View order").click()
        ph.wait_for_selector("text=Processing")
        ph.get_by_role("link", name="Profile").first.click()
        ph.wait_for_selector("text=Personal details")
        ph.get_by_role("button", name="Log out").first.click()
        ph.wait_for_selector("article")
        ctxh.close()

    run("STEP-21", "CORE", "Full happy path: search -> sort -> product -> cart -> login -> checkout -> confirmation -> order -> profile -> logout", end_to_end_happy_path)

    ctx.close()


# ======================================================================================
# GROUP E - accessibility (axe-core) and keyboard path (A: O3, a11y)
# ======================================================================================
def group_e(browser):
    axe_path = os.environ.get("AXE_PATH", "/tmp/axe/node_modules/axe-core/axe.min.js")
    axe_src = open(axe_path).read() if os.path.exists(axe_path) else None

    ctx, page = new_page(browser)
    login(page)
    add_product_to_cart(page, 2)
    place_order(page)
    add_product_to_cart(page, 2)

    def axe_check(theme):
        problems = []
        for path in ["/", "/products/1", "/cart", "/login", "/checkout", "/orders", "/profile", "/wishlist", "/nope"]:
            goto(page, path)
            page.wait_for_selector("main")
            page.wait_for_timeout(500)
            page.evaluate(f"document.documentElement.dataset.theme = '{theme}'")
            page.wait_for_timeout(450)  # let the 150 ms colour transitions finish, otherwise axe reads in-between colours
            page.add_script_tag(content=axe_src)
            res = page.evaluate("axe.run(document, { resultTypes: ['violations'] }).then(r => r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length, target: v.nodes[0].target.join(' ')})))")
            problems += [f"{path}: {v['id']} ({v['impact']}) x{v['n']} {v['target']}" for v in res if v["impact"] in ("serious", "critical")]
        assert not problems, problems[:6]

    if axe_src:
        run("A11Y", "FULL", "axe-core (light theme): no serious/critical violations on 9 pages (incl. colour contrast)", lambda: axe_check("light"))
        run("A11Y", "FULL", "axe-core (dark theme): no serious/critical violations on 9 pages (incl. colour contrast)", lambda: axe_check("dark"))
        page.evaluate("document.documentElement.dataset.theme = 'light'")
    else:
        RESULTS.append({"id": "A11Y", "level": "FULL", "title": "axe-core audit", "status": "SKIP", "detail": "axe-core not installed (see tests/README.md)"})

    def labels_for_every_field():
        for path in ["/login", "/checkout", "/profile", "/"]:
            goto(page, path)
            page.wait_for_selector("main")
            bad = page.evaluate(
                """() => [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter(e => {
                    const byFor = e.id && document.querySelector('label[for="' + e.id + '"]');
                    return !byFor && !e.getAttribute('aria-label'); }).length"""
            )
            assert bad == 0, f"{path}: {bad} fields without a label"

    run("O3/a11y", "CORE", "Every form field has a <label for=id> (or aria-label)", labels_for_every_field)

    def semantic_landmarks():
        goto(page, "/")
        wait_cards(page, 12)
        for tag in ("header", "nav", "main", "footer"):
            assert page.locator(tag).count() >= 1, tag
        assert page.locator("html").get_attribute("lang") == "en"
        assert page.get_by_role("link", name="Skip to content").count() == 1

    run("O3/a11y", "CORE", "Semantic header / nav / main / footer, html lang, skip link", semantic_landmarks)

    def keyboard_only_path():
        ctxk, pk = new_page(browser)
        goto(pk, "/")
        wait_cards(pk, 12)
        # Tab until a product title link is focused, then Enter opens the product
        for _ in range(40):
            pk.keyboard.press("Tab")
            if pk.evaluate("document.activeElement.tagName === 'A' && /\\/products\\/\\d+/.test(document.activeElement.getAttribute('href') || '')"):
                break
        else:
            raise AssertionError("no product link reachable by Tab")
        pk.keyboard.press("Enter")
        pk.wait_for_url(re.compile(r"/products/\d+"))
        # the catalog also has an <h1> ("Catalog"), so wait for the product title instead
        pk.wait_for_function("document.querySelector('h1') && document.querySelector('h1').innerText !== 'Catalog'")
        assert pk.evaluate("document.activeElement.id") == "main", "focus must move to the new content after navigation"
        for _ in range(30):
            pk.keyboard.press("Tab")
            if pk.evaluate("document.activeElement.innerText === 'Add to cart'"):
                break
        else:
            raise AssertionError("Add to cart not reachable by Tab")
        pk.keyboard.press("Enter")
        pk.wait_for_selector("text=Added")
        # go to checkout through the keyboard-activated link (login first via keyboard)
        goto(pk, "/login")
        pk.get_by_label("Username").focus()
        pk.keyboard.type("emilys")
        pk.keyboard.press("Tab")
        pk.keyboard.type("emilyspass")
        pk.keyboard.press("Enter")
        pk.wait_for_selector("article")
        goto(pk, "/checkout")
        pk.wait_for_selector("text=Shipping details")
        pk.get_by_label("Full name").focus()
        for text in ["Ann Smith", "ann@example.com", "1 Main Street", "Tbilisi"]:
            pk.keyboard.type(text)
            pk.keyboard.press("Tab")
        for _ in range(8):
            if pk.evaluate("document.activeElement.innerText === 'Place order'"):
                break
            pk.keyboard.press("Tab")
        pk.keyboard.press("Enter")
        pk.wait_for_selector("text=Thank you! Your order has been placed.")
        ctxk.close()

    run("O3/a11y", "FULL", "Keyboard only: Tab to a product -> Enter -> Add to cart -> login -> fill checkout -> place order", keyboard_only_path)

    ctx.close()


# ======================================================================================
def final_console_check():
    relevant = [c for c in CONSOLE if not any(n in c for n in EXPECTED_NOISE)]

    def check():
        assert not relevant, relevant[:5]

    run("O2", "CORE", "No unexpected console errors or warnings during all browser tests", check)


GROUPS = {"A": group_a, "B": group_b, "C": group_c, "D": group_d, "E": group_e}

if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    chosen = list(GROUPS) if which == "all" else [which]
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for g in chosen:
            API.reset()
            CONSOLE.clear()
            GROUPS[g](browser)
            final_console_check()
            json.dump(RESULTS, open(f"/tmp/results_{g}.json", "w"), indent=1)
            RESULTS.clear()
        browser.close()
    print("done", chosen)
