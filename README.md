# 🎯 AI-Powered Mock Interview Platform

An AI-driven interview preparation platform built using the MERN Stack (MongoDB, Express, React, Node.js) and Gemini AI. This workspace helps students and job seekers practice mock interviews with real-time feedback, analyze resume ATS compatibility, track historical progress, generate comprehensive feedback reports, and obtain completion certificates.

---

## 📖 Project Overview

Preparing for technical and HR interviews is often stressful and unstructured. The **AI-Powered Mock Interview Platform** solves this by providing a realistic, private, and highly detailed mock workspace. Users configure interviews by target role and difficulty, answer questions using text or voice, and receive itemized feedback on correctness, relevance, technical accuracy, and communication.

### Problems Solved:
* **Preparation Anxiety**: Practice in a simulated, low-stakes workspace.
* **Vague Feedback**: Get precise coaching on exactly what concepts were correct, what was incorrect, and how to improve.
* **Resume Gaps**: Extract keywords from your resume and measure ATS compatibility against target positions.
* **Scattered Progress**: Store interview history, trend charts, and score analytics in a single unified dashboard.

---

## 🚀 Key Features

### 🔐 Authentication
* **Email & Password Registration**: Register safely with custom input validation.
* **Password Strength Checker**: Real-time feedback on uppercase, lowercase, numeric, and special character rules.
* **Secure Email Login**: Fast session authentication issuing cookies.
* **Forgot & Reset Password**: Secure token-based password recovery flow.
* **JWT & Refresh Sessions**: Access tokens stored in memory and HTTP-only cookie-based refresh tokens.
* **Protected Routes**: Middleware routing ensures dashboards and sessions are restricted to logged-in users.

### 🤖 AI Mock Interview System
* **Dynamic Setup**: Configure interviews for roles like Frontend, Backend, Data Science, or General fields with custom difficulty levels (Beginner, Intermediate, Advanced).
* **Question Generation**: Leverages Gemini AI to generate role-specific questions.
* **Speech-to-Text Integration**: Speak responses naturally using Web Speech API microphone transcripts.
* **Resume Context Integration**: Optional text parsing to check for role-keyword gaps.
* **Local Evaluation Fallback**: If the Gemini API key is missing or fails, the platform automatically switches to a robust, local deterministic text-analysis and keyword-matching evaluation engine.

### 🧠 Evaluation Engine Metric Scoring
Every answer is parsed across four key metrics:
1. **Correctness (30%)**: Compares keywords against expected concepts.
2. **Relevance (25%)**: Measures alignment with the question topic.
3. **Technical Accuracy (25%)**: Calculates technical vocabulary density and correctness indicators.
4. **Communication (20%)**: Checks answer length, paragraph structure, and example utilization.

### 📊 Dashboard & Analytics
* **Summary Stats**: View total interviews taken, aggregate scores, best score, and interview streak.
* **Strong Areas**: Automatically identifies skills you're proficient in by combining ATS resume analysis with interview performance. Displayed as green success cards.
* **Weak Areas**: Identifies skill gaps — missing resume keywords and low-scoring interview topics. Displayed as warning cards.
* **Skill Scores**: Visualises your average performance across Technical, Communication, Problem Solving, and Confidence dimensions with animated progress bars.
* **Improvement Recommendations**: Generates actionable study suggestions derived from your weakest skill areas.
* **Dynamic Updates**: Recalculated after every completed interview so the dashboard evolves with your progress.
* **Growth Charts**: Visual canvas elements mapping score improvement trends — line, bar (weekly), and monthly views.
* **Interview History**: Search, sort (by score or date), soft-delete, and restore completed interview scorecards.

### 📄 ATS Resume Intelligence
* **Resume Upload**: Upload resumes in PDF or DOCX formats.
* **ATS Compatibility Score**: Overall match score with animated gradient progress bar (0–100).
* **Score Breakdown**: Granular sub-scores for Technical Skills, Projects, Education, Certifications, and Resume Completeness.
* **Strong Areas Analysis**: Identifies and labels actual resume strengths with human-readable skill names (e.g., "React Development", "Git & GitHub", "SQL Database Knowledge") — not raw tokens.
* **Weak Areas Analysis**: Flags missing industry skills (e.g., "TypeScript", "Docker", "CI/CD Pipelines") derived from your role's expected skill set.
* **Skill Gap Analysis**: Side-by-side view of detected skills (green) vs recommended skills to learn (amber).
* **Resume + Interview Combined Analysis**: The dashboard merges ATS data with interview scoring for a holistic skill picture.
* **Improvement Recommendations**: Actionable tips to add keywords, projects, certifications, or impact statements.

---

* **PDF Report Generation**: Export interview results to a readable PDF document.
* **Completion Certificates**: Generate certificate documents detailing the target role, average score, and date of completion.

---

## 🏗️ System Architecture

```text
       ┌────────────────────────┐
       │   React SPA (Vite)     │
       └───────────┬────────────┘
                   │ HTTPS Requests (CORS, JWT)
                   ▼
       ┌────────────────────────┐
       │  Express REST API      │
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│ MongoDB (Atlas) │ │    Gemini AI    │
│  (Mongoose)     │ │ (Local Fallback)│
└─────────────────┘ └─────────────────┘
```

---

## 💻 Tech Stack

* **Frontend**: React 19, Vite, Vanilla CSS (Premium theme/animations), Framer Motion, Chart.js, Axios.
* **Backend**: Node.js, Express.js, helmet, cors, express-rate-limit.
* **Database**: MongoDB, Mongoose.
* **Testing**: Jest, Supertest, React Testing Library.

---

## 🔑 Environment Variables

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
GEMINI_API_KEY=your_gemini_api_key_here
ALLOW_DEV_AUTH_SECRETS=true
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚙️ Installation & Running

### 1. Clone the Repository
```bash
git clone https://github.com/PavanRameshMalthi/AI-Mock-Interview.git
cd AI-Mock-Interview
```

### 2. Run Database
Ensure MongoDB is running locally on port `27017` or update the `MONGO_URI` in `server/.env`.

### 3. Install & Start Backend Server
```bash
cd server
npm install
npm run dev
```

### 4. Install & Start Frontend Client
```bash
cd ../client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

The codebase includes comprehensive backend and frontend test coverage.

### Run Backend API & Engine Tests:
```bash
cd server
npm test
```

### Run Frontend Component & Route Tests:
```bash
cd client
npm test
```

---

## 🔒 Security Features
* **Rate Limiting**: Protects general API routes and locks login attempts (max 10 within 15 mins) to prevent brute-force attacks.
* **XSS Scrubbing**: Sanitizes HTML payload injections.
* **NoSQL Injection Guard**: Middleware recursively filters out MongoDB query operators (starting with `$` or `.`).
* **HTTP-Only Cookies**: Stores session refresh tokens securely.
* **Helmet Middleware**: Configures HTTP headers for web protection.
