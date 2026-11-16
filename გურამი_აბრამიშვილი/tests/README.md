# Tests

| File | What it checks | Needs |
| --- | --- | --- |
| `unit/logic.test.ts` | Cart maths, reducer rules, order status, URL building, validation texts, type guards, storage, API client | Node (`npx tsx`) |
| `e2e_requirements.py` | Real-browser behaviour, grouped A-E, every test tagged with the requirement it verifies | Python + Playwright + Chromium, preview server on :4173 |
| `static_checks.py` | typecheck, lint, build, tsconfig flags, `any` ban, architecture rules, bundle size, documents | Node + Python |
| `mock_api.py` | A local copy of the DummyJSON endpoints used by the browser tests | - |
| `screenshots.py` | Creates `docs/compat/*.png` | same as browser tests |
| `make_report.py` | Merges all results into `docs/TEST-REPORT.md` | run after the tests |

## Run everything

```bash
npm install
pip install playwright && playwright install chromium
mkdir -p /tmp/axe && (cd /tmp/axe && npm init -y && npm i axe-core)   # accessibility audit

npm run build
npx vite preview --port 4173 &          # keep it running

npx tsx --test tests/unit/logic.test.ts
for g in A B C D E; do python3 tests/e2e_requirements.py $g; done
python3 tests/static_checks.py
python3 tests/make_report.py
```

The browser tests use a mock API (the real DummyJSON API is not needed). Set `BASE_URL` to test another address, `AXE_PATH` to point to `axe.min.js`.
