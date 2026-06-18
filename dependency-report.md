# Dependency Report

Audit date: 2026-06-19

## Security Audit

- Client: `npm.cmd audit --audit-level=moderate` initially found one moderate DOMPurify advisory.
- Fix applied: `npm.cmd audit fix` in `client`.
- Client after fix: 0 vulnerabilities.
- Server: 0 vulnerabilities.

## Changed Dependency State

- `client/package-lock.json` now resolves `dompurify` to `3.4.11`.
- No direct client dependency version changes were required.

## Outdated Check

Client packages with newer major/minor releases available:

- `@babel/core`: current `7.29.7`, latest `8.0.1`
- `@babel/preset-env`: current `7.29.7`, latest `8.0.2`
- `@babel/preset-react`: current `7.28.5`, wanted `7.29.7`, latest `8.0.1`

Server packages with newer patch release available:

- `mongoose`: current `9.7.0`, latest `9.7.1`

## Unused Dependency Review

Direct dependencies are in active use:

- Client: `axios`, `jspdf`, `react`, `react-dom`, `react-hot-toast`, `react-icons`, `react-router-dom`
- Server: Gemini SDK, auth/security middleware, validation, MongoDB/Mongoose, upload/PDF parsing, logging, and test tooling

## Recommendations

- Upgrade Mongoose patch version in a dedicated dependency update PR.
- Keep Babel 8 upgrades for a planned maintenance pass because they may require config/test compatibility checks.
