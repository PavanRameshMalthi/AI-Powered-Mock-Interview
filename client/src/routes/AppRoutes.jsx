import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/AppLayout";

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
const ResumeBuilder   = lazy(() => import("../pages/ResumeBuilder/ResumeBuilder"));
const Settings        = lazy(() => import("../pages/Settings/Settings"));

const AppRoutes = () => (
  <Suspense fallback={<div className="app-shell narrow" style={{ paddingTop: "80px", textAlign: "center", color: "var(--muted)" }}>Loading…</div>}>
    <Routes>
      <Route path="/"                element={<Landing />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* Sidebar Layout Navigation wrapper */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"       element={<Dashboard />} />
        <Route path="/resume-upload"   element={<ResumeUpload />} />
        <Route path="/interview-setup" element={<InterviewSetup />} />
        <Route path="/results"         element={<Results />} />
        <Route path="/history"         element={<History />} />
        <Route path="/admin"           element={<Admin />} />
        <Route path="/profile"         element={<Profile />} />
        <Route path="/resume-builder"  element={<ResumeBuilder />} />
        <Route path="/settings"        element={<Settings />} />
      </Route>

      {/* Fullscreen focus views */}
      <Route path="/interview-session" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
      <Route path="/certificate"     element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
