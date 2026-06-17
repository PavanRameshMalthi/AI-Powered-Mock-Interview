import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import historyService from "../../services/historyService";

const History = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyService
      .getHistory()
      .then((data) => setInterviews(data.interviews || []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Progress</p>
        <h1>Interview history</h1>
        <p className="muted">Your latest 25 saved interview evaluations.</p>
      </header>

      <section className="panel">
        {loading ? (
          <p className="empty-state">Loading interview history...</p>
        ) : interviews.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Score</th>
                  <th>ATS</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((item) => (
                  <tr key={item._id}>
                    <td>{item.role}</td>
                    <td>{item.score || 0}%</td>
                    <td>{item.atsScore?.score ?? "N/A"}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-panel">
            <h2>No interviews saved yet</h2>
            <p className="muted">
              Complete a mock interview to see your scores here.
            </p>
            <Link className="btn btn-primary" to="/interview-setup">
              Start interview
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

export default History;
