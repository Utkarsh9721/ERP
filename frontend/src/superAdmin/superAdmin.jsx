import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SuperAdmin.css";

const SuperAdmin = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="super-admin-container">
      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Super Admin</h2>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="toggle-sidebar">
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/superadmin/home">
                <span className="nav-icon">🏠</span>
                {isSidebarOpen && <span>Home</span>}
              </Link>
            </li>
            <li>
              <Link to="/addInstitute">
                <span className="nav-icon">🏛️</span>
                {isSidebarOpen && <span>Add Institution</span>}
              </Link>
            </li>
            <li>
              <Link to="/superadmin/add-industry">
                <span className="nav-icon">🏭</span>
                {isSidebarOpen && <span>Add Industry</span>}
              </Link>
            </li>
            <li>
              <Link to="/superadmin/college-allotment">
                <span className="nav-icon">🎓</span>
                {isSidebarOpen && <span>College Allotment</span>}
              </Link>
            </li>
            <li>
              <Link to="/superadmin/industry-allotment">
                <span className="nav-icon">⚙️</span>
                {isSidebarOpen && <span>Industry Allotment</span>}
              </Link>
            </li>
            <li>
              <Link to="/superadmin/payments">
                <span className="nav-icon">💰</span>
                {isSidebarOpen && <span>Payments</span>}
              </Link>
            </li>
            <li>
              <Link to="/superadmin/edit-admin">
                <span className="nav-icon">👥</span>
                {isSidebarOpen && <span>Edit Admin</span>}
              </Link>
            </li>
            <li>
              <Link to="/superadmin/settings">
                <span className="nav-icon">⚙️</span>
                {isSidebarOpen && <span>Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <Link to="/logout">
            <span className="nav-icon">🚪</span>
            {isSidebarOpen && <span>Logout</span>}
          </Link>
        </div>
      </div>

      {/* Main Content Area - Empty except for welcome message */}
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="top-bar">
          <div className="top-bar-left">
            <h1>Super Admin Panel</h1>
          </div>
          <div className="top-bar-right">
            <div className="admin-profile">
              <span className="admin-name">Admin User</span>
              <div className="admin-avatar">AU</div>
            </div>
          </div>
        </div>

        <div className="content-area">
          <div className="welcome-message">
            <h2>Welcome to Super Admin Dashboard</h2>
            <p>Select an option from the navigation menu to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;