import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
      }}
    >
      <h1>AI Mock Interview Platform</h1>

      <p>Practice interviews with AI and improve your skills.</p>

      <div style={{ marginTop: "20px" }}>
        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/register">
          <button style={{ marginLeft: "10px" }}>
            Register
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Landing;