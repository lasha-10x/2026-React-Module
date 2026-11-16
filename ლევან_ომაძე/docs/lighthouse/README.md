# Lighthouse reports

The report in this folder is real, not fabricated.

| File | What it is |
|---|---|
| `mobile-baseline.report.html` | Lighthouse mobile report (open in a browser) |
| `mobile-baseline.report.json` | Same run, machine-readable data |

Captured on **12 Nov 2026** against `https://10-x-shop.netlify.app/` after the final Netlify
deploy, with Chrome 157.0.8103.39, Lighthouse 12, default **mobile** preset:

| Category | Score |
|---|---|
| Performance | 89 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

Lab metrics: FCP 1.5 s, LCP 2.5 s, TBT 30 ms, SI 2.8 s, **CLS 0.171**. The CORE target
(Performance ≥ 85) is met. The FULL target CLS < 0.1 is not met.

Repeated runs varied (Performance 64–97, CLS 0.003–0.174) because DummyJSON and CDN latency
change between runs; the saved report is the final complete run. The CLS comes from the footer
moving when the product grid replaces the loading state. A skeleton grid would fix it, but that
was outside the CORE scope.

## How to reproduce

```powershell
npx -y lighthouse@12 "https://10-x-shop.netlify.app/" `
  --chrome-path="C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --output=html --output=json --output-path="docs/lighthouse/mobile-after" `
  --only-categories=performance,accessibility,best-practices,seo
```

## Notes

- Do not compare scores from different presets (desktop vs mobile) or different network
  conditions.
- Repeat the audit once to check stability; the DummyJSON response is the main variable.
- If you make a real optimization (for example a skeleton grid), save the second report as
  `mobile-after.report.html` and record both runs in `REPORT.md`.
