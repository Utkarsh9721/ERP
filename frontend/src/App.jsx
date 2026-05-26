import { Routes, Route } from "react-router-dom";
import React from "react";
import Navbar from "./Navbar/navbar";

import Home from "./home/home";
import Academics from "./accadamics/accadamics";
import Admission from "./Admission/admission";

import PublicAnnouncements from "./announcements/announcements";
import PublicPlacement from "./placements/placements";
import PublicEvents from "./event/publicEvents";

import AdminLogin from "./authontication/login/adminLogin";
import AdminDashboard from "./admin/adminDashboard/adminDashboard";
import Announcements from "./adminAnnouncement/announcements";
import AdminAddPlacement from "./adminPlacement/AdminPlacement";
import AdminEvents from "./admin/event/event";
import UploadStudents from "./admin/studentdata/UploadStudent";

import LoginOptions from "./ERP_login/loginOption";
import StudentLogin from "./students/studentLogin";
import ForgetPassword from "./students/studentForgetPassword";
import ResetPassword from "./students/ResetPassword";
import StudentDashboard from "./students/dashboard";

import AdminFaculty from "./adminFaculty/uploadFaculty";
import FacultyLogin from "./faculty/faculty";
import FacultyDashboard from "./faculty/dashboard";

import SuperAdmin from "./superAdmin/superAdmin";
import SuperLogin from "./superAdmin/superLogin";
import AddInstitute from "./superAdmin/addInstitute";
import FacultyAttendancePage from "./faculty/attendance";

import ProtectedRoute from "./protectedRoutes/ProtectedRoute";
import AdminClassSchedule from "./admin/adminSchdule";
import StudentAttendance from "./students/StudentAttendance";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: "2rem", 
          textAlign: "center", 
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fef2f2"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            maxWidth: "600px",
            width: "100%"
          }}>
            <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>⚠️ Something went wrong</h2>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              The application encountered an unexpected error.
            </p>
            <details style={{ 
              textAlign: "left", 
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              fontSize: "0.875rem"
            }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Error Details</summary>
              <pre style={{ marginTop: "0.5rem", overflow: "auto" }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem"
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                marginTop: "1rem",
                marginLeft: "1rem",
                padding: "0.5rem 1.5rem",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem"
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrapper for components with Navbar
const WithNavbar = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* 🌐 PUBLIC ROUTES */}
        <Route path="/super/login" element={<SuperLogin />} />
        <Route path="/" element={<WithNavbar><Home /></WithNavbar>} />
        <Route path="/login/option" element={<LoginOptions />} />
        <Route path="/academics" element={<WithNavbar><Academics /></WithNavbar>} />
        <Route path="/admissions" element={<WithNavbar><Admission /></WithNavbar>} />
        <Route path="/publicAnnouncement" element={<WithNavbar><PublicAnnouncements /></WithNavbar>} />
        <Route path="/publicPlacement" element={<WithNavbar><PublicPlacement /></WithNavbar>} />
        <Route path="/public/events" element={<WithNavbar><PublicEvents /></WithNavbar>} />

        {/* 🎓 STUDENT AUTH */}
        <Route path="/student/login" element={<WithNavbar><StudentLogin /></WithNavbar>} />
        <Route path="/forgot-password" element={<WithNavbar><ForgetPassword /></WithNavbar>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* 🔐 ADMIN AUTH */}
        <Route path="/adminLogin" element={<AdminLogin />} />

        {/* 🛡️ ADMIN PROTECTED ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute role="admin">
              <ErrorBoundary>
                <Announcements />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/student"
          element={
            <ProtectedRoute role="admin">
              <ErrorBoundary>
                <UploadStudents />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/placement"
          element={
            <ProtectedRoute role="admin">
              <ErrorBoundary>
                <AdminAddPlacement />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminEvent"
          element={
            <ProtectedRoute role="admin">
              <ErrorBoundary>
                <AdminEvents />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty"
          element={
            <ProtectedRoute role="admin">
              <ErrorBoundary>
                <AdminFaculty />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ClassSchedules"
          element={
            <ProtectedRoute role="admin">
              <ErrorBoundary>
                <AdminClassSchedule />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* 🎓 FACULTY AUTH */}
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute role="faculty">
              <ErrorBoundary>
                <FacultyDashboard />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/attendance"
          element={
            <ProtectedRoute role="faculty">
              <ErrorBoundary>
                <FacultyAttendancePage />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />

        {/* 👑 SUPER ADMIN */}
        <Route
          path="/super/dashboard"
          element={
            <ProtectedRoute role="super_admin">
              <ErrorBoundary>
                <SuperAdmin />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route
          path="/addInstitute"
          element={
            <ProtectedRoute role="super_admin">
              <ErrorBoundary>
                <AddInstitute />
              </ErrorBoundary>
            </ProtectedRoute>
          }
        />
        <Route 
        path="/student/attendance"
        element={
          <ProtectedRoute role="student">
            <StudentAttendance></StudentAttendance>
          </ProtectedRoute>
        }></Route>

        {/* 404 Not Found Route */}
        <Route
          path="*"
          element={
            <div style={{ 
              textAlign: "center", 
              padding: "4rem",
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <h1 style={{ fontSize: "4rem", color: "#667eea" }}>404</h1>
              <h2>Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1.5rem",
                  backgroundColor: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Go Home
              </button>
            </div>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;