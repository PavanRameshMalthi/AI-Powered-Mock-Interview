# AI Mock Interview

AI Mock Interview is a full-stack MERN-style web application for practicing role-specific interviews. Users can register, upload a PDF resume, generate AI-assisted interview questions, answer them in a guided session, receive an evaluation scorecard, export a PDF report, and review interview history.

## Features

- JWT-based registration and login
- Protected dashboard and interview workflows
- PDF resume upload with server-side file validation
- AI question generation with a local fallback when the AI provider is unavailable
- Guided interview session with answer persistence
- AI evaluation with saved interview history
- PDF scorecard export
- Default dark mode UI
- Responsive layouts for mobile, tablet, and desktop
- Security middleware: Helmet, CORS allowlist, rate limiting, upload size/type limits

## Tech Stack

**Frontend**
- React 19
- Vite
- React Router
- Axios
- React Hot Toast
- React Icons
- jsPDF

**Backend**
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- pdf-parse
- Google Gemini API

## Folder Structure

```text
AI Mock Interview/
  client/
    public/
    src/
      components/
      pages/
      routes/
      services/
      index.css
      main.jsx
    package.json
  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    server.js
    package.json
  postman/
  README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/PavanRameshMalthi/AI-Mock-Interview.git
cd AI-Mock-Interview
```

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## Environment Variables

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/ai_mock_interview
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=replace-with-your-gemini-api-key
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files or API keys.

## Running The Project

Start MongoDB locally, then start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Open:

```text
http://localhost:5173
```

## Build Instructions

Frontend production build:

```bash
cd client
npm run build
```

Backend production start:

```bash
cd server
npm start
```

## API Documentation

Base URL:

```text
http://localhost:5000/api
```

### Auth

`POST /auth/register`

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "Password123"
}
```

`POST /auth/login`

```json
{
  "email": "alex@example.com",
  "password": "Password123"
}
```

### Resume

`POST /resume/upload`

- Protected route
- Multipart form field: `resume`
- PDF only
- Max size: 5 MB

### Interview

`POST /interview/generate`

- Protected route

```json
{
  "role": "Frontend Developer",
  "experience": "Entry level",
  "difficulty": "Beginner",
  "questionCount": 5,
  "resumeText": "Optional resume text"
}
```

### Evaluation

`POST /evaluation/evaluate`

- Protected route

```json
{
  "role": "Frontend Developer",
  "questions": ["Question 1"],
  "answers": ["Answer 1"]
}
```

### History

`GET /history`

- Protected route
- Returns the latest 25 saved interview evaluations for the current user.

## Screenshots

Add screenshots after deployment:

- Landing page
- Dashboard
- Resume upload
- Interview setup
- Interview session
- Results page

## Deployment Guide

Frontend deployment options:

- Vercel
- Netlify
- Render static site

Backend deployment options:

- Render
- Railway
- Fly.io
- Node-capable VPS

Production checklist:

- Use MongoDB Atlas or a managed MongoDB instance
- Set `FRONTEND_URL` to the deployed frontend URL
- Set `VITE_API_URL` to the deployed backend API URL
- Rotate and store secrets in the hosting provider's environment manager
- Enable HTTPS
- Configure CORS for production domains only
- Monitor server logs and API errors

## Future Enhancements

- Speech-to-text answer capture
- Text-to-speech interviewer
- Webcam mock interview recording
- Admin dashboard
- Role-based access control
- ATS keyword scoring dashboard
- Performance charts and progress trends
- Search, filter, sort, and pagination for history
- Automated test suite
- CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit focused changes
4. Run lint/build checks
5. Open a pull request with a clear summary

## License

This project is currently marked as ISC in the backend package metadata. Add a root `LICENSE` file before public production release.
