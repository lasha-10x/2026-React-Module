"""Static / build checks that do not need a browser. Writes /tmp/results_S.json.

Run from the project root after `npm install`:   python3 tests/static_checks.py
"""
import glob
import gzip
import json
import os
import re
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RESULTS = []
METRICS = {}


def sh(cmd, check=False):
    return subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True, text=True)


def run(test_id, level, title, fn):
    try:
        fn()
        RESULTS.append({"id": test_id, "level": level, "title": title, "status": "PASS", "detail": ""})
        print(f"PASS {test_id:<10} {title}")
    except Exception as e:  # noqa: BLE001
        detail = (str(e).strip().split("\n")[0] or e.__class__.__name__)[:300]
        RESULTS.append({"id": test_id, "level": level, "title": title, "status": "FAIL", "detail": detail})
        print(f"FAIL {test_id:<10} {title}  [{detail}]")


def read(*parts):
    return open(os.path.join(ROOT, *parts), encoding="utf-8").read()


def src_files():
    return [f for f in glob.glob(os.path.join(ROOT, "src", "**", "*.ts*"), recursive=True)]


def cmd_ok(cmd):
    def _f():
        r = sh(cmd)
        assert r.returncode == 0, (r.stdout + r.stderr)[-300:]
    return _f


pkg = json.loads(read("package.json"))
tsconfig = json.loads(read("tsconfig.json"))["compilerOptions"]

run("STEP-1/23", "CORE", "npm run typecheck (tsc --noEmit) finishes with 0 errors", cmd_ok("npm run typecheck"))
run("T1", "CORE", "npm run lint finishes with 0 errors and 0 warnings", lambda: (lambda r: (_ for _ in ()).throw(AssertionError(r.stdout[-300:])) if r.returncode != 0 or "warning" in r.stdout.lower() else None)(sh("npm run lint")))
run("STEP-23", "CORE", "npm run build succeeds", cmd_ok("npm run build"))


def scripts():
    for name in ("dev", "build", "preview", "typecheck", "lint"):
        assert name in pkg["scripts"], name
    assert pkg["scripts"]["typecheck"] == "tsc --noEmit"


run("A1.7", "CORE", "package.json scripts: dev, build, preview, typecheck (tsc --noEmit), lint", scripts)


def tsconfig_flags():
    for flag in ("strict", "noUnusedLocals", "noUnusedParameters", "noFallthroughCasesInSwitch"):
        assert tsconfig.get(flag) is True, flag
    assert tsconfig["jsx"] == "react-jsx"
    assert "@/*" in tsconfig["paths"]
    assert "alias" in read("vite.config.ts")


run("T1", "CORE", "tsconfig: strict, noUnusedLocals/Parameters, noFallthroughCasesInSwitch, jsx react-jsx, @/* alias (+ vite alias)", tsconfig_flags)


def eslint_blocks_any():
    probe = os.path.join(ROOT, "src", "__any_probe.ts")
    open(probe, "w").write("export const x: any = 1;\n")
    try:
        r = sh("npx eslint src/__any_probe.ts")
        assert r.returncode != 0 and "no-explicit-any" in r.stdout, "ESLint did not reject `any`"
    finally:
        os.remove(probe)


run("T1", "CORE", "ESLint really rejects `any` (probe file with `: any` fails with no-explicit-any)", eslint_blocks_any)


def eslint_hooks_rules():
    cfg = read("eslint.config.js")
    assert '"react-hooks/rules-of-hooks": "error"' in cfg and '"react-hooks/exhaustive-deps": "warn"' in cfg


run("T1", "CORE", "eslint-plugin-react-hooks: rules-of-hooks = error, exhaustive-deps = warn", eslint_hooks_rules)


def no_any_in_src():
    bad = []
    for f in src_files():
        for i, line in enumerate(open(f, encoding="utf-8"), 1):
            code = line.split("//")[0]
            if re.search(r":\s*any\b|\bas any\b|<any>", code):
                bad.append(f"{os.path.relpath(f, ROOT)}:{i}")
    assert not bad, bad


run("T1", "CORE", "No `any` anywhere in src/", no_any_in_src)


def no_console_log():
    bad = [f for f in src_files() if re.search(r"console\.(log|debug|info)\(", open(f, encoding="utf-8").read())]
    assert not bad, bad


run("O2", "CORE", "No console.log / debug / info left in production code", no_console_log)


def casts_and_json():
    casts = []
    for f in src_files():
        for i, line in enumerate(open(f, encoding="utf-8"), 1):
            code = line.split("//")[0]
            if re.search(r"\bas [A-Za-z\[]", code) and not re.search(r"as const|import .* as |export .* as ", code):
                casts.append(f"{os.path.relpath(f, ROOT)}:{i}")
    assert casts == ["src/api/ApiClient.ts:21"], f"unexpected `as` casts: {casts}"
    parse_users = [os.path.relpath(f, ROOT) for f in src_files() if "JSON.parse" in open(f, encoding="utf-8").read()]
    assert parse_users == ["src/models/StorageService.ts"], parse_users
    assert "const parsed: unknown = JSON.parse" in read("src", "models", "StorageService.ts")


run("T3", "FULL", "Only one `as` cast (ApiClient res.json()); JSON.parse only in StorageService, result is `unknown` + type guard", casts_and_json)


def no_non_null_assertions():
    bad = []
    for f in src_files():
        for i, line in enumerate(open(f, encoding="utf-8"), 1):
            code = re.sub(r'"[^"]*"|`[^`]*`', "", line.split("//")[0])
            if re.search(r"[\w\)\]]!(\.|;|\)|,)", code):
                bad.append(f"{os.path.relpath(f, ROOT)}:{i}")
    assert not bad, bad


run("T3", "FULL", "No non-null assertions (!) in src/", no_non_null_assertions)


def domain_types_once():
    for name in ("Product", "ProductsResponse", "CartItem", "CartState", "AuthUser", "LoginFormValues", "Review", "Category", "ShippingInfo"):
        hits = [f for f in src_files() if re.search(rf"export (interface|type) {name}\b", open(f, encoding='utf-8').read())]
        assert len(hits) == 1 and "/types/" in hits[0].replace("\\", "/"), (name, hits)
    assert "OrderStatus" in read("src", "types", "order.ts") and "AsyncState" in read("src", "types", "api.ts")


run("T2", "CORE", "Every domain model is declared exactly once, inside src/types/", domain_types_once)


def unions_utility_types():
    assert re.search(r"type AsyncState<T>\s*=", read("src", "types", "api.ts")) and '"loading"' in read("src", "types", "api.ts")
    assert "const _exhaustive: never" in read("src", "context", "cart.reducer.ts")
    assert 'Pick<' in read("src", "types", "user.ts") and "Pick<" in read("src", "types", "cart.ts")
    assert "as const" in read("src", "utils", "constants.ts") and "STORAGE_KEYS" in read("src", "utils", "constants.ts")
    assert 'type SortOption' in read("src", "types", "catalog.ts") and 'type OrderStatus = "Processing" | "Shipped" | "Delivered"' in read("src", "types", "order.ts")


run("T2", "FULL", "Discriminated unions (AsyncState, CartAction + never), literal unions, Pick utility types, STORAGE_KEYS as const", unions_utility_types)


def generics_and_guards():
    assert "get<T>" in read("src", "api", "ApiClient.ts") and "private async request<T>" in read("src", "api", "ApiClient.ts")
    assert "useFetch<T>" in read("src", "hooks", "useFetch.ts") and "useLocalStorage<T>" in read("src", "hooks", "useLocalStorage.ts")
    assert "class StorageService<T>" in read("src", "models", "StorageService.ts")
    assert "e is ApiError" in read("src", "api", "ApiError.ts") and "x is Product" in read("src", "utils", "guards.ts")
    assert "useForm<T extends" in read("src", "hooks", "useForm.ts")


run("T3", "FULL", "Generics (ApiClient.get<T>, useFetch<T>, useLocalStorage<T>, StorageService<T>) and guards (isApiError, isProduct)", generics_and_guards)


def oop():
    api = read("src", "api", "ApiClient.ts")
    assert "private readonly baseUrl" in api and "private async request<T>" in api
    err = read("src", "api", "ApiError.ts")
    assert "extends Error" in err and "public readonly status: number" in err and "super(message)" in err
    cart = read("src", "models", "Cart.ts")
    assert "implements ICart" in cart and "static readonly FREE_SHIPPING_FROM = 100" in cart and "get itemCount()" in cart and "private readonly items" in cart
    order = read("src", "models", "Order.ts")
    assert "static create(" in order and "getStatus(" in order and "toJSON()" in order
    storage = read("src", "models", "StorageService.ts")
    assert "private readonly key" in storage and "get(): T | null" in storage and "set(value: T)" in storage and "remove()" in storage
    ctx = read("src", "context", "CartContext.tsx")
    assert "new StorageService<CartState>(STORAGE_KEYS.cart" in ctx


run("T4", "FULL", "OOP: ApiClient, ApiError extends Error, Cart implements ICart (static/getter), Order (static factory, toJSON), StorageService<T>", oop)


def architecture_folders():
    for d in ("api", "types", "models", "context", "hooks", "components/ui", "components/layout", "components/product", "components/cart", "pages", "routes", "utils"):
        assert os.path.isdir(os.path.join(ROOT, "src", d)), d
    for f in ("pages/CatalogPage.tsx", "pages/ProductPage.tsx", "pages/CartPage.tsx", "routes/AppRoutes.tsx", "routes/ProtectedRoute.tsx", "context/AuthContext.tsx", "context/CartContext.tsx", "context/ThemeContext.tsx", "utils/format.ts", "utils/validation.ts"):
        assert os.path.exists(os.path.join(ROOT, "src", f)), f
    assert len(read("src", "App.tsx").splitlines()) < 15, "the whole UI must not pile up in App"


run("A1.4", "CORE", "Layered folder structure from the spec exists; App.tsx stays tiny", architecture_folders)


def react_concepts():
    assert "children" in read("src", "components", "ui", "Card.tsx") and "children" in read("src", "components", "ui", "PageHeading.tsx")
    assert "key={product.id}" in read("src", "components", "product", "ProductGrid.tsx")
    assert "export interface" in read("src", "components", "ui", "Pagination.tsx") or "interface PaginationProps" in read("src", "components", "ui", "Pagination.tsx")
    assert "onAdd: (product: Product) => void" in read("src", "components", "product", "ProductCard.tsx")
    assert "useEffect" in read("src", "hooks", "useFetch.ts") and "controller.abort()" in read("src", "hooks", "useFetch.ts")
    assert "preventDefault" in read("src", "hooks", "useForm.ts") and "useState" in read("src", "hooks", "useForm.ts")


run("STEP-16", "CORE", "React concepts visible: props.children, map + key, typed props, callback props, useEffect cleanup, controlled forms", react_concepts)


def tailwind_policy():
    css = read("src", "index.css")
    assert css.lstrip().startswith('@import "tailwindcss"') and "@theme" in css and "@utility" in css and "@custom-variant dark" in css
    assert "@tailwindcss/vite" in read("vite.config.ts")
    assert not os.path.exists(os.path.join(ROOT, "tailwind.config.js")) and not os.path.exists(os.path.join(ROOT, "tailwind.config.ts"))
    assert "@base" not in css and "@components" not in css


run("TW1/TW5", "CORE", "Tailwind v4 set-up: @import, vite plugin, @theme/@utility/@custom-variant, no v3 config or wrong directives", tailwind_policy)


def dependencies_policy():
    allowed = {"react", "react-dom", "react-router-dom", "formik", "yup"}
    assert set(pkg["dependencies"]) == allowed, set(pkg["dependencies"]) ^ allowed


run("RULES", "CORE", "No libraries beyond the allowed ones (react, router, formik, yup)", dependencies_policy)


def bundle_size():
    files = glob.glob(os.path.join(ROOT, "dist", "assets", "*.js"))
    sizes = {os.path.basename(f): len(gzip.compress(open(f, "rb").read())) for f in files}
    main = next(v for k, v in sizes.items() if k.startswith("index-"))
    METRICS["main_chunk_gzip_kb"] = round(main / 1024, 1)
    METRICS["chunks"] = {k: round(v / 1024, 1) for k, v in sorted(sizes.items())}
    METRICS["js_chunk_count"] = len(sizes)
    assert main / 1024 <= 250, f"main chunk {main / 1024:.1f} kB gzip"


run("O1/⑥", "FULL", "Main JS chunk <= 250 kB gzip (measured from dist/)", bundle_size)


def lazy_routes():
    routes = read("src", "routes", "AppRoutes.tsx")
    assert routes.count("lazy(() => import(") >= 9
    assert "<Suspense" in read("src", "components", "layout", "Layout.tsx")


run("O1/①", "FULL", "Pages are React.lazy; one Suspense with a spinner in Layout", lazy_routes)


def docs_exist():
    for f in ("README.md", "PLAN.md", "REPORT.md", "DEBUG-LOG.md", "COMPATIBILITY.md", "docs/progress/week-1.md", "docs/progress/week-2.md", "docs/progress/week-3.md", "docs/TEST-REPORT.md"):
        assert os.path.exists(os.path.join(ROOT, f)), f
    readme = read("README.md")
    for section in ("About", "Features", "Tech Stack", "Architecture", "How to Run", "Scripts", "Live Demo", "Test Account", "Credits"):
        assert re.search(rf"^##\s+{section}\b", readme, re.M), f"README section missing: {section}"
    assert "emilys" in readme and "emilyspass" in readme
    log = read("DEBUG-LOG.md")
    assert len(re.findall(r"^## Bug \d+", log, re.M)) >= 5
    for key in ("Symptom", "Reproduction", "Tool", "Root cause", "Fix", "Lesson"):
        assert log.count(f"**{key}") >= 5, key


run("D3/O2", "CORE", "Required documents exist; README has every required section + test account; DEBUG-LOG has >= 5 entries in the required format", docs_exist)

json.dump(RESULTS, open("/tmp/results_S.json", "w"), indent=1)
json.dump(METRICS, open("/tmp/metrics.json", "w"), indent=1)
print(json.dumps(METRICS))
sys.exit(0)
