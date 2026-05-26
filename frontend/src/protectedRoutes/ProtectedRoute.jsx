// protectedRoutes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProtectedRoute = ({ role, children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/auth/me`, {
          withCredentials: true
        });
        
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setUserRole(response.data.user?.role);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login/option" replace />;
  }

  if (role && userRole !== role) {
    // Redirect to appropriate dashboard
    if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (userRole === "faculty") return <Navigate to="/faculty/dashboard" replace />;
    if (userRole === "student") return <Navigate to="/student/dashboard" replace />;
    if (userRole === "super_admin") return <Navigate to="/super/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;