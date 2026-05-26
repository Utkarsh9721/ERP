import React, { useState } from "react";
import axios from "axios";
import './student.css';

const StudentLogin = () => {
  const [form, setForm] = useState({
    identifier: "", // email or studentId
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/login",
        form,
        { withCredentials: true }
      );

      alert("Login successful 🎉");
      console.log("Student:", res.data.student);

      // 👉 redirect to dashboard
      window.location.href = "/student/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-login-container">
      <form className="student-login-card" onSubmit={handleSubmit}>
        <h2>Student Login</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          name="identifier"
          placeholder="Email or Student ID"
          value={form.identifier}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="help-text">
          Forgot password? Contact Admin
        </p>
      </form>
    </div>
  );
};

export default StudentLogin;