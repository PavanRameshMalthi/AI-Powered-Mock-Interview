# AI Mock Interview Platform

🚀 **An AI-powered career preparation platform that helps users build professional resumes, analyze ATS compatibility, and practice AI-powered mock interviews.**

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

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Workflow Flowchart](#-workflow-flowchart)
3. [Key Features](#-key-features)
4. [Tech Stack](#-tech-stack)
5. [Folder Structure](#-folder-structure)
6. [Installation & Setup](#-installation--setup)
7. [Environment Variables](#-environment-variables)
8. [Future Roadmap](#-future-roadmap)
9. [Contributing](#-contributing)
10. [License](#-license)
11. [Support & Author](#-support--author)

---

## 🎯 Project Overview
Navigating the modern job market requires candidate preparation at multiple steps: crafting an ATS-optimized resume, highlighting core skills, and practicing interview communication. This platform resolves these hurdles by consolidating a resume builder, automated ATS reporting, and dynamic AI interview generation into a unified, responsive career preparation workspace.

### Core Problems Solved
- **Resume-to-Interview Alignment**: AI creates role-specific mock questions matching the candidate's custom achievements.
- **ATS Disconnect**: Instant 12-category scanning evaluates resumes for keywords, formatting, and structural issues.
- **Interactive Feedback Loop**: Detailed AI assessment scores candidate responses on relevance, correctness, and communication.

---

## 🔄 Workflow Flowchart
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

## ✨ Key Features

### 🔐 Authentication & Security
- **Secure Register/Login**: Salted password hashing via BCrypt.
- **JWT Middleware**: Dual JWT sessions (Access Token headers & Cookie-based Refresh tokens) with automatic client-side token refresh.
- **Rate Limiting**: Request caps on login paths (10 queries/15m) and endpoints to protect against brute-force attacks.

### 📄 Resume Builder
- **Template Styles**: Choose from Professional, Student, Modern, Minimal, Creative, and ATS layouts.
- **Interactive Forms**: Modular form tabs for personal info, experience, education, skills, and projects.
- **PDF Exporter**: Live Client-side rendering and high-quality PDF downloads.
- **Active State Sync**: Mark a resume as Active to automatically build plain-text summaries, run ATS analytics, and populate interview setups.

### 📤 Resume Upload & OCR
- **Multi-Format Uploads**: Support for PDF and DOCX documents with size verification limits (5MB).
- **Extracted Text Parsing**: Extends OCR scanning to digest experiences, achievements, and keywords.
- **Version History**: Saves multiple resume variants as unique database versions instead of overwriting previous records.

### 📊 ATS Analysis Engine
- **Automated Score Gauge**: Shows formatting warnings, keyword counts, and critical recommendations.
- **Section Detection**: Scans structure to find missing categories (e.g. Summary, Experience, Projects).
- **Skill Extraction**: Merges resume parsed categories to index candidate strong and weak areas.

### 🎙️ AI Mock Interview
- **Dynamic Session Generator**: Dynamic Gemini models create technical, behavioral, and HR questions based on the candidate's chosen target role.
- **Context-Aware Prompts**: Aligns questions to experiences extracted from the candidate's resume context.
- **AI Assessment Cards**: Feedback breaks down score, communication strength, technical correctness, and bullet-point suggestions.

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | AI Integration |
| :--- | :--- | :--- | :--- |
| React 19 / ES6 | Node.js (Express 5.x) | MongoDB Atlas | Google Gemini AI |
| Tailwind CSS (v4) | Helmet / CORS / Cookie Parser | Mongoose ODM | PDF-Parse / Multer |
| Framer Motion | Express Validator | Indexed Collections | Axios Interceptors |

---

## 📂 Folder Structure

```
AI-Mock-Interview/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # AppLayout, Sidebar, ProtectedRoute
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
└── package.json
```

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js**: Installed (version 20+ recommended).
- **MongoDB**: Access to local instance or MongoDB Atlas.
- **Google Gemini API Key**: Acquired from Google AI Studio.

### 2. Step-by-Step Installation
Clone the repository:
```bash
git clone https://github.com/your-username/ai-mock-interview.git
cd ai-mock-interview
```

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

## ⚙️ Environment Variables

Create files named `.env` in both client and server directories:

### Backend Configuration (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_mock_interview
JWT_SECRET=your_jwt_auth_secret_key
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key
GEMINI_API_KEY=AIzaSyYourGeminiKeyHere
CLIENT_URL=http://localhost:5173
```

### Frontend Configuration (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗺️ Future Roadmap
- [ ] **ATS Resume Matcher**: Paste job descriptions to calculate contextual matching percentages.
- [ ] **Voice-to-Text Speech Practice**: Audio answer transcript inputs.
- [ ] **Coding Interview Console**: Interactive workspace for algorithms.
- [ ] **Custom Roadmaps**: Generates custom courses based on Weak Skill assessments.

---

## 🤝 Contributing
1. Fork the Project.
2. Create a Feature Branch (`git checkout -b feature/NewFeature`).
3. Commit Changes (`git commit -m 'Add NewFeature'`).
4. Push to Branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## 📄 License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## ✉️ Support & Author
- **Author**: Pavan Ramesh Malthi
- **Email**: pavanrameshmalthi886@gmail.com
- **LinkedIn**: [linkedin.com/in/pavan-malthi](https://linkedin.com/in/pavan-malthi)
- **GitHub**: [github.com/PavanRameshMalthi](https://github.com/PavanRameshMalthi)
