# Bug Fix Report

Audit date: 2026-06-19

## Bugs Fixed

### Production Frontend Origin Warning

Issue:

- `server/server.js` production runtime validation only checked `CLIENT_URL`, while the app also supports `FRONTEND_URL` and documents it in environment guidance.

Fix:

- Runtime validation now accepts either `CLIENT_URL` or `FRONTEND_URL` as the deployed frontend origin.

Verification:

- Backend test suite passed after the change.

### Vulnerable Client Transitive Dependency

Issue:

- Client npm audit reported one moderate DOMPurify advisory through the PDF export dependency chain.

Fix:

- Ran `npm audit fix`, updating the lockfile so DOMPurify resolves to `3.4.11`.

Verification:

- Client npm audit now reports 0 vulnerabilities.
- Client tests, lint, and production build passed after the fix.

## Reviewed Bug Classes

- Authentication bugs: protected routes and bearer token handling verified.
- Routing bugs: client routes and API route mounts verified.
- API bugs: validation middleware and route wiring verified.
- Database bugs: model indexes and ownership-scoped queries reviewed.
- State bugs: local/session auth persistence and result/history state reviewed.
- Validation bugs: upload, auth, history, interview, and resume validation reviewed.
- Responsive bugs: grid breakpoints and table overflow reviewed.
- ATS bugs: PDF-only validation, signature check, scoring, and cleanup reviewed.
- Dashboard bugs: analytics endpoint and dashboard rendering reviewed.

## Remaining Limitations

- DOCX upload is rejected by design because the current product is PDF-only and no DOCX parser is installed.
- Full user-journey browser E2E tests are recommended for future regression coverage.
