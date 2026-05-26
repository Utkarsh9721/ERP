import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SuperLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/super/login",
        { email, password },
        { withCredentials: true }
      );

      alert("Login successful ✅");

      navigate("/super/dashboard");

    } catch (err) {
      console.error("Server error:", err);

      setError(
        err.response?.data?.message || "Login failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <h2>Super Admin Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default SuperLogin;