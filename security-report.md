# Security Report

Audit date: 2026-06-19

## Automated Dependency Security

- Client npm audit: 0 vulnerabilities after `npm audit fix`.
- Server npm audit: 0 vulnerabilities.
- Fixed moderate DOMPurify advisory by updating transitive dependency to `3.4.11`.

## Implemented Security Controls

- JWT bearer authentication for protected routes.
- Password hashing with bcrypt.
- Password strength validation on registration/change/reset flows.
- Helmet security headers.
- CORS allowlist using `CLIENT_URL` or `FRONTEND_URL`.
- Rate limiting on all API routes and stricter login rate limiting.
- Request body/query/param sanitization against NoSQL operator injection.
- Express-validator rules on auth, resume, interview, history, and admin operations.
- Upload size limit of 5 MB and single-file enforcement.
- PDF MIME, extension, and file-signature validation.
- Uploaded resume files are removed after parsing or parse failure.
- Secrets are excluded through `.gitignore`; `.env.example` documents required variables.

## Threat Checks

- XSS: No `dangerouslySetInnerHTML`, `innerHTML`, or direct DOM injection found in source.
- NoSQL injection: `$` and dotted keys are stripped from request inputs before route handlers.
- JWT tampering: tokens are verified with `JWT_SECRET`; invalid/expired tokens return 401.
- Sensitive data exposure: user password fields are excluded by schema defaults and auth responses do not return passwords.
- CSRF: API primarily uses bearer tokens; cookies are enabled for compatibility, so production deployments should keep strict CORS and SameSite cookie settings if cookie auth is expanded.

## Recommendations

- Use a 32+ character `JWT_SECRET` in all non-test environments.
- Rotate secrets before public deployment.
- Add centralized security logging for repeated failed logins and upload failures.
- Add SAST/DAST scans in CI for ongoing releases.
