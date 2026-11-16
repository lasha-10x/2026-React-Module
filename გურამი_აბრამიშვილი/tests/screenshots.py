"""Takes one screenshot of every page at desktop (1280px) and mobile (375px) size into docs/compat/.

The product API is mocked (see mock_api.py), so product photos are plain coloured squares.
Usage (preview server running on :4173):  python3 tests/screenshots.py
"""
import os
import re
import sys

from playwright.sync_api import sync_playwright

sys.path.insert(0, os.path.dirname(__file__))
from mock_api import MockApi  # noqa: E402

BASE = os.environ.get("BASE_URL", "http://localhost:4173")
OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "compat")
API = MockApi()

PAGES = [
    ("catalog", "/"),
    ("product", "/products/1"),
    ("cart", "/cart"),
    ("login", "/login"),
    ("checkout", "/checkout"),
    ("orders", "/orders"),
    ("order-details", None),  # opened from the orders list
    ("profile", "/profile"),
    ("wishlist", "/wishlist"),
    ("not-found", "/nope"),
]


def seed(browser):
    ctx = browser.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page.route("https://dummyjson.com/**", API.handler)
    page.goto(BASE + "/login")
    page.get_by_label("Username").fill("emilys")
    page.get_by_label("Password").fill("emilyspass")
    page.get_by_role("button", name="Log In").click()
    page.wait_for_selector("article")
    for pid in (2, 3):
        page.goto(BASE + f"/products/{pid}")
        page.wait_for_selector("h1")
        page.get_by_role("button", name="Add to cart").first.click()
        page.wait_for_selector("text=Added to cart")
    page.goto(BASE + "/checkout")
    page.wait_for_selector("text=Shipping details")
    page.get_by_label("Full name").fill("Emily Stone")
    page.get_by_label("Email").fill("emily@example.com")
    page.get_by_label("Address").fill("1 Rustaveli Avenue")
    page.get_by_label("City").fill("Tbilisi")
    page.get_by_role("button", name="Place order").click()
    page.wait_for_selector("text=Thank you! Your order has been placed.")
    page.goto(BASE + "/")
    page.wait_for_selector("article")
    page.get_by_role("button", name=re.compile("^Add .* to wishlist")).first.click()
    page.goto(BASE + "/products/6")
    page.wait_for_selector("h1")
    page.get_by_role("button", name="Add to cart").first.click()
    page.wait_for_selector("text=Added to cart")
    ctx.storage_state(path="/tmp/shot_state.json")
    ctx.close()


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        seed(browser)
        for label, (w, h) in (("desktop", (1280, 900)), ("mobile", (375, 800))):
            ctx = browser.new_context(viewport={"width": w, "height": h}, storage_state="/tmp/shot_state.json")
            page = ctx.new_page()
            page.route("https://dummyjson.com/**", API.handler)
            for name, path in PAGES:
                if path is None:
                    page.goto(BASE + "/orders")
                    page.wait_for_selector("main ul li a")
                    page.locator("main ul li a").first.click()
                    page.wait_for_selector("h1:has-text('Order #')")
                else:
                    page.goto(BASE + path)
                    page.wait_for_selector("main")
                page.wait_for_timeout(700)
                page.screenshot(path=os.path.join(OUT, f"{name}-{label}.png"), full_page=False)
            if label == "desktop":  # one dark-theme sample
                page.goto(BASE + "/")
                page.wait_for_selector("article")
                page.get_by_role("button", name="Switch to dark theme").first.click()
                page.wait_for_timeout(500)
                page.screenshot(path=os.path.join(OUT, "catalog-desktop-dark.png"))
            ctx.close()
        browser.close()
    print("screenshots saved to docs/compat")


if __name__ == "__main__":
    main()
