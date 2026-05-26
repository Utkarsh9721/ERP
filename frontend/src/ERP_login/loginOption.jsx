// LoginOptions.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./loginOption.css";

const LoginOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1 className="title">Select Your Login</h1>
      <div className="options">
        <div
          className="option"
          onClick={() => navigate("/adminLogin")}
        >
          Admin Login
        </div>
        <div
          className="option"
          onClick={() => navigate("/student/login")}
        >
          Student Login
        </div>
        <div
          className="option"
          onClick={() => navigate("/faculty/login")}
        >
          Faculty Login
        </div>
         <div
          className="option"
          onClick={() => navigate("/super/login")}
        >
          Super Admin Login
        </div>
      </div>
    </div>
  );
};

export default LoginOptions;
