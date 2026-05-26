import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './faculty.css'

const FacultyLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return alert("All fields are required");
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/faculty/login",
        { email, password },
        { withCredentials: true }
      );

      alert("Login successful");
      navigate("/faculty/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faculty-login-container">
      <form className="faculty-login-card" onSubmit={handleLogin}>
        <h2>👨‍🏫 Faculty Login</h2>

        <input
          type="email"
          placeholder="Faculty Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="hint">
          You can change your password anytime from dashboard.
        </p>
      </form>
    </div>
  );
};

export default FacultyLogin;
