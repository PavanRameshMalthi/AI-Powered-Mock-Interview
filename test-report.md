# Test Report

Date: 2026-06-18

## Commands Run

| Command | Result |
| --- | --- |
| `npm.cmd test -- --runInBand` in `server` | PASS |
| `npm.cmd test -- --runInBand` in `client` | PASS |
| `npm.cmd run build` in `client` | PASS |

## Results

| Suite | Tests | Status |
| --- | ---: | --- |
| Server Jest/Supertest | 35 passed | PASS |
| Client Jest/React Testing Library | 30 passed | PASS |
| Vite production build | Build completed | PASS |

## Coverage Highlights

- Authentication: signup validation, duplicate signup, login success, invalid login, malformed login, weak password.
- JWT: missing token, invalid token, expired token, tampered token.
- Resume upload: missing file, PDF upload, DOCX rejection, TXT rejection, corrupted PDF rejection, large file rejection.
- Interview: generation fallback, Gemini parsing, invalid evaluation payload, missing/invalid interview input.
- History: list, delete, plural delete API, bulk delete, restore.
- Security: NoSQL injection rejection and protected admin route checks.
- AI scoring: wrong answers remain capped even if Gemini returns high scores.

## Skipped Or Not Fully Automated

- Full browser E2E signup/login/logout/refresh journey.
- Lighthouse performance/accessibility audits.
- Real Gemini API scoring quality tests.
- Rate limiter threshold test with isolated process state.
