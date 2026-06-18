# Performance Report

Audit date: 2026-06-19

## Build Performance

`npm.cmd run build` completed successfully for the client.

Key production assets:

- CSS bundle: about 13.73 kB raw, 3.66 kB gzip.
- Main app bundle: about 350.41 kB raw, 111.41 kB gzip.
- PDF export chunks are split through dynamic `import("jspdf")`.
- jsPDF/html2canvas-related chunks remain the largest assets and load only when export actions are used.

## Backend Performance Controls

- MongoDB indexes exist for user/history lookup and score/date sorting.
- History endpoints limit returned records.
- Analytics endpoints limit source collections to recent 100 records.
- Upload processing removes files after parse completion/failure.
- JSON/urlencoded payloads are capped at 1 MB.
- Resume uploads are capped at 5 MB.

## Frontend Performance Controls

- Vite production bundling.
- Route-level pages are compact and mostly data-driven.
- PDF/certificate library is dynamically imported.
- Empty states avoid unnecessary repeated requests when no data exists.
- Dashboard analytics are fetched together with summary data.

## Remaining Optimizations

- Add route-level lazy loading for large page chunks.
- Consider a dedicated chart library only if richer charts are needed; current CSS charts keep bundle size lower.
- Add API caching headers where responses are safe to cache.
- Add Lighthouse CI after deployment to measure Performance, Accessibility, Best Practices, and SEO against real hosted URLs.
