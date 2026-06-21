import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const [status, setStatus] = useState(token ? "ready" : "checking");

  useEffect(() => {
    if (token) return;

    let mounted = true;
    const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
    authService
      .refreshSession({ rememberMe: storage === localStorage })
      .then((response) => {
        if (!mounted) return;
        storage.setItem("token", response.token);
        storage.setItem("user", JSON.stringify(response.user));
        setStatus("ready");
      })
      .catch(() => {
        if (mounted) setStatus("signed-out");
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  if (token || status === "ready") return children;
  if (status === "checking") {
    return (
      <main className="app-shell narrow">
        <section className="panel empty-panel">
          <div className="loader" aria-hidden="true" />
          <p className="muted">Restoring your session...</p>
        </section>
      </main>
    );
  }

  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
