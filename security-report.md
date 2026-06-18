# Security Report

Date: 2026-06-18

## Implemented Protections

- Helmet is enabled with cross-origin resource policy configuration.
- CORS allows configured frontend origins and credentials.
- Global API rate limiting is enabled.
- Login-specific rate limiting is enabled.
- Request bodies, params, and query strings are sanitized against NoSQL operator keys.
- Auth routes use express-validator rules.
- JWT verification protects private routes.
- Refresh tokens are stored as hashes server-side and sent via HTTP-only cookies.
- Resume uploads are limited to one file, 5 MB max, PDF MIME type plus `.pdf` extension, and PDF signature validation.

## Fixes Verified

- NoSQL operator injection in login payloads is rejected before querying.
- Expired and tampered JWTs are rejected.
- Corrupted, TXT, DOCX, and oversized resume uploads are rejected.
- Wrong/irrelevant interview answers are capped in the low score band.

## Residual Risks

- The current tests do not run a real browser XSS probe against rendered pages.
- Rate limiter tests are not isolated in a dedicated app instance, so they are not exhaustively automated.
- Production secrets should be managed outside committed files and rotated if exposed.

## Recommendation

Add browser-based security regression tests for stored/reflected XSS and a dedicated rate-limiter integration test harness with isolated process state.
