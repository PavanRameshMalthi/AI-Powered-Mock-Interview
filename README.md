# 🎯 AI-Powered Mock Interview Platform

An AI-driven interview preparation platform built using the MERN Stack and Gemini AI that helps students and job seekers practice interviews, receive intelligent feedback, analyze resumes, track progress, and improve interview performance.

---

# 📖 Project Overview

The AI-Powered Mock Interview Platform simulates real-world technical and HR interviews using Artificial Intelligence.

Users can:

* Practice mock interviews
* Answer interview questions through text or speech
* Receive AI-generated feedback
* Analyze resume ATS compatibility
* Track performance through analytics
* Generate interview reports
* Download completion certificates

The platform is designed for:

* Final Year Projects
* College Demonstrations
* Placement Preparation
* Internship Preparation
* Recruiter Portfolio Showcases

---

# 🚀 Key Features

## 🔐 Authentication

* User Registration
* Secure Login
* Google OAuth Login
* LinkedIn OAuth Login
* Forgot Password
* Reset Password
* JWT Authentication
* Protected Routes
* Session Persistence

---

## 🤖 AI Mock Interview System

* Technical Interviews
* HR Interviews
* Resume-Aware Questions
* Speech-to-Text Support
* Gemini AI Evaluation
* Real-Time Feedback

---

## 🧠 AI Evaluation Engine

Every answer is evaluated using:

* Technical Accuracy
* Relevance
* Communication Skills
* Confidence
* Completeness

Feedback includes:

* What Was Correct
* What Was Incorrect
* Correct Answer
* Why It Is Wrong
* Improvement Suggestions
* Topics To Learn

---

## 📊 Analytics Dashboard

Track interview performance using:

* Total Interviews
* Average Score
* Best Score
* Strong Areas
* Weak Areas
* Interview Streak

Charts:

* Score Trend
* Weekly Progress
* Monthly Progress
* Skill Growth
* Interview Activity

---

## 📈 Improvement Tracker

The system automatically identifies:

* Mistakes Made
* Weak Topics
* Learning Recommendations
* Improvement Roadmap

Example:

React → Learn Hooks

Node.js → Improve REST API Concepts

MongoDB → Study Aggregation Pipeline

---

## 📄 ATS Resume Analyzer

Supports:

* PDF Upload
* DOCX Upload

Generates:

* ATS Score
* Keyword Analysis
* Missing Skills Detection
* Resume Suggestions

---

## 📑 Interview Reports

Generate:

Interview_Report.pdf

Includes:

* Questions
* Answers
* Scores
* Feedback
* Suggestions
* Improvement Areas

---

## 🏆 Certificate Generator

Generate:

Certificate of Completion

Includes:

* Candidate Name
* Interview Role
* Score
* Date
* QR Verification

Export:

* PDF
* Printable Certificate

---

## 📚 Interview History

Features:

* Search
* Filter
* Sort
* Delete
* Restore
* Detailed Reports

---

## 🎨 Modern UI/UX

* Responsive Design
* Mobile Friendly
* Tablet Friendly
* Desktop Friendly
* Dark Mode
* Light Mode
* System Theme
* Framer Motion Animations
* Toast Notifications

---

# 🏗️ System Architecture

```text
User
 │
 ▼
React Frontend
 │
 ├── Authentication
 ├── Dashboard
 ├── ATS Analyzer
 ├── Interview Module
 ├── Analytics
 └── Reports & Certificates
 │
 ▼
Express REST API
 │
 ├── Authentication APIs
 ├── Interview APIs
 ├── ATS APIs
 ├── Analytics APIs
 └── Report APIs
 │
 ▼
MongoDB Database
 │
 ├── Users
 ├── Interviews
 ├── Feedback
 ├── ATS Results
 ├── Reports
 └── Certificates
 │
 ▼
Gemini AI
 │
 ├── Question Generation
 ├── Answer Evaluation
 ├── Scoring
 ├── Feedback
 └── Improvement Suggestions
```

---

# 🔄 Project Workflow

```text
User Login
     │
     ▼
Select Interview Role
     │
     ▼
Generate Questions
     │
     ▼
Answer Questions
(Text / Speech)
     │
     ▼
Speech-To-Text
     │
     ▼
Gemini AI Evaluation
     │
     ▼
Detailed Feedback
     │
     ▼
Score Generation
     │
     ▼
Store Results
     │
     ▼
Update Analytics
     │
     ▼
Generate PDF Report
     │
     ▼
Generate Certificate
```

---

# 💻 Technology Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* Chart.js
* Axios

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## Authentication

* JWT
* bcrypt

## AI

* Gemini AI

## Testing

* Jest
* React Testing Library
* Supertest

---

# 🗄️ Database Collections

## Users

* Profile Information
* Authentication Data

## Interviews

* Questions
* Answers
* Scores
* Feedback

## ATSResults

* ATS Score
* Keywords
* Missing Skills

## Reports

* Interview Reports

## Certificates

* Completion Certificates

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/PavanRameshMalthi/AI-Mock-Interview.git
cd AI-Mock-Interview
```

## Backend Setup

```bash
cd server
npm install
npm run dev
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

# 🔑 Environment Variables

Server:

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

LINKEDIN_CLIENT_ID=

LINKEDIN_CLIENT_SECRET=
```

Client:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real API keys.

---

# 🧪 Testing

Run Backend Tests:

```bash
cd server
npm test
```

Run Frontend Tests:

```bash
cd client
npm test
```

Test Coverage:

* Authentication
* Interview Flow
* ATS Analyzer
* Dashboard
* Analytics
* Security
* API Endpoints

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Input Validation
* Rate Limiting
* Helmet Security
* XSS Protection
* NoSQL Injection Protection

---

# 📸 Screenshots

Add screenshots here:

```text
docs/screenshots/landing-page.png

docs/screenshots/dashboard.png

docs/screenshots/interview-page.png

docs/screenshots/results-page.png

docs/screenshots/history-page.png

docs/screenshots/certificate-page.png
```

---

# 🚀 Future Enhancements

* AI Career Guidance
* Video Interviews
* Voice Interviews
* Resume Builder
* Group Discussion Simulator
* Company-Specific Interview Preparation

---

# 👨‍💻 Author

Name: Pavan Ramesh Malthi

GitHub:
https://github.com/PavanRameshMalthi

LinkedIn:
https://linkedin.com/in/pavan-ramesh-malthi-8a8a232a5

---

# 📜 License

MIT License

---

⭐ If you found this project useful, consider giving it a star on GitHub.
