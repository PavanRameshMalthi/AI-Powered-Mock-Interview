# Performance Report

Date: 2026-06-18

## Build Result

The client production build completed successfully with Vite.

## Bundle Snapshot

| Asset | Gzip Size |
| --- | ---: |
| Main app bundle | 109.59 kB |
| jsPDF bundle | 129.50 kB |
| html2canvas bundle | 46.78 kB |
| CSS | 3.06 kB |

## Observations

- The app builds quickly and has moderate bundle sizes.
- PDF/certificate dependencies are the largest client-side payloads.
- No Lighthouse score was generated in this pass because a browser audit target was not launched.

## Recommendations

- Lazy-load PDF/certificate utilities only from the Results page.
- Add Lighthouse CI with target scores of 95+ for performance, accessibility, best practices, and SEO.
- Add route-level code splitting if the app grows further.
