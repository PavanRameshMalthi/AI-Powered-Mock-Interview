# Deployment Guide

## Production Environment

Backend variables:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.example.com
SERVER_URL=https://your-api.example.com
MONGO_URI=mongodb+srv://user:password@cluster/db
JWT_SECRET=use-a-32-plus-character-random-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.0-flash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
LOG_LEVEL=info
```

Frontend variables:

```env
VITE_API_URL=https://your-api.example.com/api
```

## Vercel or Netlify Frontend

1. Set the project root to `client`.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Set `VITE_API_URL` to the deployed backend `/api` URL.

## Render or Railway Backend

1. Set the service root to `server`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Add all backend environment variables in the provider dashboard.
5. Use MongoDB Atlas for `MONGO_URI`.

## Security Checklist

- Use HTTPS for both frontend and backend.
- Set `CLIENT_URL` to the exact frontend origin. Use comma-separated origins only when needed.
- Use a strong `JWT_SECRET` with at least 32 characters.
- Store provider secrets only in the hosting environment manager.
- Rotate secrets before public demos if they were ever used locally.
- Keep `.env` files out of git.
- Confirm uploads reject non-PDF files and files larger than 5 MB.
- Run `npm test` in both `server` and `client` before deployment.

## Post-Deploy Smoke Test

1. Register and log in.
2. Upload a small text-based PDF resume.
3. Generate an interview with a role and difficulty.
4. Complete the interview and download the PDF report.
5. Check dashboard analytics and history.
6. Log in as an admin user and verify `/admin` loads.
