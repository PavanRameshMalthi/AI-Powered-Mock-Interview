# AI Career Platform

🚀 **A premium AI-powered career preparation platform that helps users build professional resumes, analyze ATS compatibility, and practice mock interviews in a streamlined workspace.**

---

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Google-blue?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![JWT](https://img.shields.io/badge/JWT-Authorization-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [Workflow](#workflow)
8. [Roadmap](#roadmap)
9. [Contributing](#contributing)
10. [License](#license)
11. [Support](#support)
12. [Author](#author)

---

## Overview
Navigating the modern job market requires candidate preparation at multiple steps: crafting an ATS-optimized resume, highlighting core skills, and practicing interview communication. The **AI Career Platform** resolves these hurdles by consolidating a feature-rich resume builder, automated ATS scoring, and dynamic AI interview generation into a unified, responsive dark-themed workspace.

### Core Problems Solved
- **Resume-to-Interview Alignment**: The system automatically pulls details from the active resume to craft role-specific, context-aware mock questions.
- **ATS Disconnect**: Scans structure, sections, and keywords to calculate completeness metrics and identify missing elements.
- **Interactive Feedback Loop**: Detailed Gemini AI assessment evaluates correctness, relevance, and communication, displaying precise subscores out of 100.

---

## Workflow
```
    [ User Registration & Login ]
                 │
                 ▼
     [ Resume Builder / Profile ] ──────► [ Save & Version Resumes ]
                 │
                 ▼
    [ Select / Upload Resume PDF ]
                 │
                 ▼
       [ ATS Analysis Check ]
                 │
                 ▼
    [ Mock Interview Setup & Run ]
                 │
                 ▼
     [ AI Evaluation Feedback ]
                 │
                 ▼
   [ Analytics Dashboard Tracking ]
```

---

## Features

### Authentication & Security
- **Secure Register/Login**: Uses salted password hashing via BCrypt and explicit password strength checks during registration.
- **JWT Authorization**: Implements double JWT tokens (Access Tokens in headers and Cookie-based Refresh Tokens) with automated validation and silent token refresh.
- **Security Middleware**: Configured with Helmet security headers, CORS origins validation, and body rate-limiters.

### Resume Builder
- **Dynamic Formatting Templates**: Supports choosing from Modern, Minimal, Creative, and Academic resume templates.
- **Interactive Form Tabs**: Segmented workspaces for personal details, professional experience, academic history, projects, and technologies.
- **Interactive PDF Exporter**: Live client-side preview rendering and PDF generation.
- **Active State Sync**: Mark a resume as active to populate candidate context for subsequent ATS scans and AI interview sessions.

### Resume Upload & OCR
- **Multi-Format Uploads**: File drop zone supporting PDF uploads.
- **Extracted Text Parsing**: Extracted text parsing to parse uploaded files.
- **Version History**: Saves multiple resume configurations as separate documents.

### ATS Analysis Engine
- **Automated Score Gauge**: Scans resume layout, keyword densities, and categorization.
- **Section Detection**: Scans structure to verify existence of required categories (Summary, Experience, Projects).
- **Interactive Statistics**: Highlights details on keyword counts, statistics, and category-level scoring.

### AI Mock Interview
- **Dynamic Session Generator**: Uses Google Gemini models to generate technical and behavioral questions based on the candidate's chosen role, difficulty, and resume context.
- **Live Response Panel**: Interface for recording text answers, finishing sessions, or skipping questions.
- **AI Assessment Cards**: Feedback breaks down candidate answers, listing overall score, technical accuracy, relevance, and bullet-point suggestions.

---

## Technology Stack

| Frontend | Backend | Database | AI Integration |
| :--- | :--- | :--- | :--- |
| React 19 / ES6 | Node.js (Express 5.x) | MongoDB Atlas | Google Gemini AI |
| Tailwind CSS (v4) | Helmet / CORS / Cookie Parser | Mongoose ODM | PDF-Parse / Multer |
| Framer Motion | Express Validator | Indexed Collections | Axios Interceptors |
| Lucide Icons | BCrypt.js / JWT | | |

---

## Project Structure

```
ai-career-platform/
├── api/                    # Vercel Serverless Function entry point
│   └── index.js
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # AppLayout, Sidebar, ProtectedRoute, Topbar
│   │   │   └── UI/         # PasswordField, ChartPanel, Toast
│   │   ├── pages/          # Dashboard, ResumeBuilder, ResumeUpload, Settings
│   │   ├── services/       # axios unified client, API request methods
│   │   ├── routes/         # AppRoutes layout nested mappings
│   │   └── utils/          # Strength checker logic
│   └── package.json
├── server/                 # Express backend REST API
│   ├── config/             # DB settings
│   ├── controllers/        # Express route implementation logic
│   ├── middleware/         # Auth, Upload, rate limits, validators
│   ├── models/             # Mongoose collections (User, Resume, BuilderResume)
│   ├── routes/             # REST route files
│   └── utils/              # Gemini interfaces, ATS calculations
├── package.json            # Root workspace package.json
└── vercel.json             # Vercel deployment routing configuration
```

---

## Installation
Clone the repository:
```bash
git clone https://github.com/PavanRameshMalthi/AI-Mock-Interview.git
cd AI-Mock-Interview
```

### Option A: Local Workspace (Recommended)
This project uses npm workspaces to manage both frontend and backend dependencies in a single step:
```bash
# Install all dependencies (client and server) at the root level
npm install

# Start the backend in development (port 5001)
npm run dev --workspace=server

# Start the frontend in development (port 5173)
npm run dev --workspace=client
```

### Option B: Individual Folders
If you prefer running them separately:

#### Backend Setup:
```bash
cd server
npm install
# Create an .env file inside server/ directory (see configuration details below)
npm run dev
```

#### Frontend Setup:
```bash
cd ../client
npm install
# Create an .env file inside client/ directory
npm run dev
```

---

## Environment Variables

Create files named `.env` in both client and server directories (or use the root `.env.example` as a template):

### Backend Configuration (`server/.env`)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ai_career_platform
JWT_SECRET=your_jwt_auth_secret_key_minimum_32_chars
GEMINI_API_KEY=AIzaSyYourGeminiKeyHere
```

### Frontend Configuration (`client/.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

---

## Vercel Deployment

This project is 100% optimized for zero-config-style deployment on **Vercel** as a single application containing both React frontend and Express serverless backend.

### Project Settings on Vercel:
All build configuration settings (`buildCommand`, `outputDirectory`, and `framework`) are pre-configured in [vercel.json](file:///d:/PROJECTS/AI%20Mock%20Interview/vercel.json). When deploying:
1. Keep the **Root Directory** as `.` (the project root).
2. The **Framework Preset**, **Build Command**, and **Output Directory** will be **automatically overridden** by Vercel using the configuration from `vercel.json` (running `npm run build` and serving `client/dist` respectively).
3. Ensure the **Node.js Version** is set to `20.x` or `22.x`.

### Required Vercel Environment Variables:
Add these under **Settings > Environment Variables** in your Vercel Dashboard:
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key (min. 32 characters)
- `GEMINI_API_KEY`: Google Gemini API Key

*Optional variables for social auth / advanced logs:*
- `CLIENT_URL` / `SERVER_URL` (Not required. The system will automatically handle dynamic preview domain routing, CORS, and callback redirects on Vercel)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### Deployment Steps:
1. Go to the Vercel Dashboard and click **Add New > Project**.
2. Import this repository.
3. Configure the **Build & Development Settings**:
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
4. Add the **Environment Variables** listed above.
5. Click **Deploy**.

---

## Roadmap
- [ ] **ATS Job Description Matcher**: Paste target job specifications to evaluate contextual matching metrics.
- [ ] **Voice-to-Text Speech Practice**: Integrate browser speech recognition APIs for hands-free answering.
- [ ] **Coding Interview Console**: Interactive sandbox compiler for programming questions.

---

## Contributing
1. Fork the Project.
2. Create a Feature Branch (`git checkout -b feature/NewFeature`).
3. Commit Changes (`git commit -m 'Add NewFeature'`).
4. Push to Branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## Support
If you like this project, please consider:
- Starring the repository.
- Forking it to make your own custom modifications.
- Submitting pull requests or raising feature issues.

---

## Author
- **Author**: Pavan Ramesh Malthi
- **Email**: [pavanrameshmalthi886@gmail.com](mailto:pavanrameshmalthi886@gmail.com)
- **LinkedIn**: [linkedin.com/in/pavan-ramesh-malthi](https://www.linkedin.com/in/pavan-ramesh-malthi/)
- **GitHub**: [github.com/PavanRameshMalthi](https://github.com/PavanRameshMalthi)
