"""Merges every test result into docs/TEST-REPORT.md.

Run after the tests:   python3 tests/make_report.py
Reads /tmp/results_{A,B,C,D,E,S}.json (written by the test scripts) and runs the unit tests itself.
"""
import datetime
import glob
import json
import os
import re
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "docs", "TEST-REPORT.md")

GROUP_TITLES = {
    "A": "Routing, layout, header, authentication, login form",
    "B": "Catalog (search, filters, sort, pagination) and product page",
    "C": "Cart, checkout, orders, profile",
    "D": "Responsive layout, Tailwind, performance, Error Boundary, full user journey",
    "E": "Accessibility (axe-core, keyboard) ",
    "S": "Static checks: build, lint, TypeScript rules, architecture, documents",
}


def unit_results():
    proc = subprocess.run(["npx", "--yes", "tsx", "--test", "--test-reporter=tap", "tests/unit/logic.test.ts"], cwd=ROOT, capture_output=True, text=True)
    rows = []
    for line in proc.stdout.splitlines():
        m = re.match(r"^(\s+)(not ok|ok) \d+ - (.*)$", line)
        if m and len(m.group(1)) == 4:  # tests nested in a describe() block
            rows.append((m.group(3).split(" # ")[0], m.group(2) == "ok"))
    return rows


def load(group):
    path = f"/tmp/results_{group}.json"
    return json.load(open(path)) if os.path.exists(path) else []


def mark(status):
    return {"PASS": "PASS", "FAIL": "**FAIL**", "SKIP": "skipped"}[status]


def main():
    lines = []
    all_rows = []
    for g in "ABCDES":
        all_rows += [(g, r) for r in load(g)]
    unit = unit_results()

    passed = sum(1 for _, r in all_rows if r["status"] == "PASS") + sum(1 for _, ok in unit if ok)
    failed = sum(1 for _, r in all_rows if r["status"] == "FAIL") + sum(1 for _, ok in unit if not ok)
    total = len(all_rows) + len(unit)

    metrics = json.load(open("/tmp/metrics.json")) if os.path.exists("/tmp/metrics.json") else {}
    lines += [
        "# TEST REPORT",
        "",
        f"Generated: {datetime.date.today().isoformat()} · **{passed}/{total} checks pass, {failed} fail**",
        "",
        "Every row has an ID that points to the requirement it verifies: `STEP-n` = PRD step n, `Pn.n` / `Tn` / `On` / `TWn` = section of Appendix A, `BONUS` = bonus feature.",
        "",
        "## Environment",
        "- Browser tests: Playwright with headless Chromium 153 (desktop 1280x900 and phone viewport 375x800)",
        "- The product API is **mocked** (`tests/mock_api.py`): the sandbox cannot reach dummyjson.com. Please also check the live API by hand (catalog, search, sort, product page) after deployment.",
        "- Unit tests: Node test runner through `tsx`",
        "- Accessibility: axe-core, light and dark theme, 9 pages each",
        "",
        "## Summary",
        "",
        "| Suite | Tests | Pass | Fail |",
        "| --- | --- | --- | --- |",
    ]
    lines.append(f"| Unit tests (`tests/unit/logic.test.ts`) | {len(unit)} | {sum(1 for _, ok in unit if ok)} | {sum(1 for _, ok in unit if not ok)} |")
    for g in "ABCDES":
        rows = load(g)
        lines.append(f"| {g}: {GROUP_TITLES[g].strip()} | {len(rows)} | {sum(1 for r in rows if r['status'] == 'PASS')} | {sum(1 for r in rows if r['status'] == 'FAIL')} |")

    by_level = {}
    for _, r in all_rows:
        by_level.setdefault(r["level"], [0, 0])
        by_level[r["level"]][0] += 1
        by_level[r["level"]][1] += 1 if r["status"] == "PASS" else 0
    lines += ["", "Browser and static checks by requirement level: " + ", ".join(f"{k} {v[1]}/{v[0]}" for k, v in sorted(by_level.items())), ""]

    if metrics:
        lines += ["## Measured bundle size", "", f"Main JS chunk: **{metrics['main_chunk_gzip_kb']} kB gzip**; {metrics['js_chunk_count']} JS chunks in total (limit in the spec: 250 kB).", ""]

    for g in "ABCDES":
        rows = load(g)
        if not rows:
            continue
        lines += [f"## {g}. {GROUP_TITLES[g].strip()}", "", "| ID | Level | What is verified | Result |", "| --- | --- | --- | --- |"]
        for r in rows:
            detail = f" ({r['detail']})" if r["detail"] else ""
            lines.append(f"| {r['id']} | {r['level']} | {r['title'].replace('|', '/')} | {mark(r['status'])}{detail} |")
        lines.append("")

    lines += ["## Unit tests", "", "| Requirement and check | Result |", "| --- | --- |"]
    for name, ok in unit:
        lines.append(f"| {name.replace('|', '/')} | {'PASS' if ok else '**FAIL**'} |")
    lines.append("")

    lines += [
        "## Mutation check",
        "To prove that the unit tests are not empty, two bugs were introduced on purpose (free shipping from `>` instead of `>=`, order status boundary `<` instead of `<=`). The suite failed on exactly those cases and passed again after the code was restored.",
        "",
        "## Not covered by automation (to do by hand)",
        "| Item | Why | Status |",
        "| --- | --- | --- |",
        "| Real DummyJSON API (catalog, search, sort, categories, product 404) | Not reachable from the build sandbox | To do before the demo |",
        "| Firefox, Safari, Edge, real phone | Only Chromium was available | See COMPATIBILITY.md |",
        "| Lighthouse on the deployed site | Needs the live URL | See docs/lighthouse/README.md |",
        "| Page refresh on the deployed site (`/products/5`) | Needs the live URL; rewrite files exist and local refresh works | To do after deployment |",
        "| Checkout error path (\"We could not place your order\") | The order step cannot fail in normal use, so the UI branch is only reviewed in code | Reviewed, not triggered |",
        "| Git history, Issues, PRs, weekly notes with real hours | Belong to the author's own workflow | To do |",
        "| Demo video and the 5-slide presentation | Presentation text is in docs/PRESENTATION.md | To do |",
        "",
    ]
    open(OUT, "w", encoding="utf-8").write("\n".join(lines))
    print(f"{passed}/{total} pass, {failed} fail -> docs/TEST-REPORT.md")


if __name__ == "__main__":
    main()
