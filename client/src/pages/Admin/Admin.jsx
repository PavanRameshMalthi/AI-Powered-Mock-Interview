import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { showError, showSuccess } from "../../components/UI/Toast";
import adminService from "../../services/adminService";

const Admin = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(currentUser?.role === "admin");

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      return;
    }

    adminService
      .getSummary()
      .then(setData)
      .catch((error) =>
        showError(error.response?.data?.message || "Unable to load admin dashboard")
      )
      .finally(() => setLoading(false));
  }, [currentUser?.role]);

  const exportReports = async () => {
    try {
      const report = await adminService.exportReports();
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ai-mock-interview-reports.json";
      link.click();
      URL.revokeObjectURL(url);
      showSuccess("Reports exported");
    } catch (error) {
      showError(error.response?.data?.message || "Export failed");
    }
  };

  const deleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      setData((current) => ({
        ...current,
        users: current.users.filter((user) => user._id !== userId),
      }));
      showSuccess("User deleted");
    } catch (error) {
      showError(error.response?.data?.message || "Delete failed");
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <main className="app-shell narrow">
        <section className="panel empty-panel">
          <h1>Admin access required</h1>
          <p className="muted">Use an admin account to view platform analytics.</p>
          <Link className="btn btn-primary" to="/dashboard">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="app-shell narrow">
        <section className="panel empty-panel">
          <div className="loader" aria-hidden="true" />
          <h1>Loading admin dashboard</h1>
        </section>
      </main>
    );
  }

  const summary = data?.summary || {};

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Platform dashboard</h1>
          <p className="muted">Monitor users, interviews, ATS reports, and recent activity.</p>
        </div>
        <button className="btn btn-primary" onClick={exportReports} type="button">
          Export reports
        </button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total users</span>
          <strong>{summary.totalUsers || 0}</strong>
        </article>
        <article className="stat-card">
          <span>Total interviews</span>
          <strong>{summary.totalInterviews || 0}</strong>
        </article>
        <article className="stat-card">
          <span>ATS reports</span>
          <strong>{summary.totalAtsReports || 0}</strong>
        </article>
        <article className="stat-card">
          <span>Active users</span>
          <strong>{summary.activeUsers || 0}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>User management</h2>
          <span>{data?.users?.length || 0} latest users</span>
        </div>
        {data?.users?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Provider</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.authProvider}</td>
                    <td>{user.role}</td>
                    <td>{user.isEmailVerified ? "Email" : "Pending"}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        disabled={user._id === currentUser?._id}
                        onClick={() => deleteUser(user._id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No users found.</p>
        )}
      </section>
    </main>
  );
};

export default Admin;
