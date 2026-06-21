import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Static lazy imports — Vite requires literal string paths inside import()
const Landing         = lazy(() => import("../pages/Landing/Landing"));
const Login           = lazy(() => import("../pages/Login/Login"));
const Register        = lazy(() => import("../pages/Register/Register"));
const ForgotPassword  = lazy(() => import("../pages/ForgotPassword/ForgotPassword"));
const ResetPassword   = lazy(() => import("../pages/ResetPassword/ResetPassword"));
const Dashboard       = lazy(() => import("../pages/Dashboard/Dashboard"));
const ResumeUpload    = lazy(() => import("../pages/ResumeUpload/ResumeUpload"));
const InterviewSetup  = lazy(() => import("../pages/InterviewSetup/InterviewSetup"));
const InterviewSession = lazy(() => import("../pages/InterviewSession/InterviewSession"));
const Results         = lazy(() => import("../pages/Results/Results"));
const History         = lazy(() => import("../pages/History/History"));
const Admin           = lazy(() => import("../pages/Admin/Admin"));
const Profile         = lazy(() => import("../pages/Profile/Profile"));
const Certificate     = lazy(() => import("../pages/Certificate/Certificate"));

const AppRoutes = () => (
  <Suspense fallback={<div className="app-shell narrow" style={{ paddingTop: "80px", textAlign: "center", color: "var(--muted)" }}>Loading…</div>}>
    <Routes>
      <Route path="/"                element={<Landing />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/resume-upload"   element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
      <Route path="/interview-setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
      <Route path="/interview-session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
      <Route path="/results"         element={<ProtectedRoute><Results /></ProtectedRoute>} />
      <Route path="/history"         element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/admin"           element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/certificate"     element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
