"""Mock of the DummyJSON endpoints used by 10X Shop (the real API is not reachable from the sandbox).

Fields follow the spec (A1.5 / A1.6). Products 1..30; product 4 is out of stock, product 5 has stock 3.
"""
import json
import re
from urllib.parse import parse_qs, unquote, urlparse

SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='%23ccd'/></svg>"
CATS = [
    {"slug": "smartphones", "name": "Smartphones", "url": "x"},
    {"slug": "laptops", "name": "Laptops", "url": "x"},
    {"slug": "fragrances", "name": "Fragrances", "url": "x"},
]
LABEL = {"smartphones": "Phone", "laptops": "Laptop", "fragrances": "Perfume"}


def make_products():
    items = []
    for i in range(1, 31):
        cat = CATS[i % 3]["slug"]
        items.append(
            {
                "id": i,
                "title": f"{LABEL[cat]} {i:02d}",
                "description": f"Description of {LABEL[cat]} {i}. Really useful thing.",
                "category": cat,
                "brand": "Brand" + str(i % 4),
                "price": round(10 + i * 7.5, 2),
                "discountPercentage": [0.4, 9.5, 15.2][i % 3],
                "rating": round(3 + (i % 20) / 10, 1),
                "stock": 0 if i == 4 else (3 if i == 5 else 50),
                "thumbnail": SVG,
                "images": [SVG, SVG.replace("ccd", "dcc"), SVG.replace("ccd", "cdc")],
                "reviews": [
                    {"rating": 5, "comment": "Great product, loved it", "date": "2025-01-02T10:00:00.000Z", "reviewerName": "Ann"},
                    {"rating": 3, "comment": "It is okay I guess", "date": "2025-02-02T10:00:00.000Z", "reviewerName": "Bob"},
                ],
            }
        )
    return items


PRODUCTS = make_products()
BY_ID = {p["id"]: p for p in PRODUCTS}


def discounted(p):
    return round(p["price"] * (1 - p["discountPercentage"] / 100) + 1e-9, 2)


class MockApi:
    def __init__(self):
        self.requests = []
        self.fail_products = False
        self.hold_search = False
        self.pending = []  # held route objects (to test request cancellation)
        self.cors = {"access-control-allow-origin": "*", "access-control-allow-headers": "*"}

    def reset(self):
        self.requests.clear()
        self.fail_products = False
        self.hold_search = False
        self.pending.clear()

    def count(self, fragment):
        return len([r for r in self.requests if fragment in r])

    def _page(self, items, q):
        limit = int(q.get("limit", ["30"])[0])
        skip = int(q.get("skip", ["0"])[0])
        sort_by, order = q.get("sortBy", [""])[0], q.get("order", ["asc"])[0]
        if sort_by:
            key = (lambda p: p["title"]) if sort_by == "title" else (lambda p: p[sort_by])
            items = sorted(items, key=key, reverse=(order == "desc"))
        return {"products": items[skip : skip + limit], "total": len(items), "skip": skip, "limit": limit}

    def body_for(self, request_url):
        url = urlparse(request_url)
        path, q = url.path, parse_qs(url.query)
        if path == "/products":
            return 200, self._page(PRODUCTS, q)
        if path == "/products/search":
            term = q.get("q", [""])[0].lower()
            return 200, self._page([p for p in PRODUCTS if term in p["title"].lower()], q)
        if path == "/products/categories":
            return 200, CATS
        m = re.match(r"^/products/category/(.+)$", path)
        if m:
            slug = unquote(m.group(1))
            return 200, self._page([p for p in PRODUCTS if p["category"] == slug], q)
        m = re.match(r"^/products/(\d+)$", path)
        if m:
            found = BY_ID.get(int(m.group(1)))
            return (200, found) if found else (404, {"message": "Product not found"})
        return 404, {"message": "unknown"}

    def handler(self, route, request):
        self.requests.append(request.url)
        if request.method == "OPTIONS":
            return route.fulfill(status=204, headers=self.cors)
        path = urlparse(request.url).path
        if path == "/products" and self.fail_products:
            return route.fulfill(status=500, headers=self.cors, body="boom")
        if path == "/products/search" and self.hold_search:
            self.pending.append((request.url, route))
            return None
        status, body = self.body_for(request.url)
        return route.fulfill(status=status, headers=self.cors, content_type="application/json", body=json.dumps(body))
