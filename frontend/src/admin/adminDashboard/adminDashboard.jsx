import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Dashboard.module.css"; // Import as 'styles'

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  /* 🔒 Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* 🚪 Logout */
  const handleLogout = async () => {
  try {
    await axios.post(
      "http://localhost:5000/api/admin/logout",
      {},
      { withCredentials: true }
    );

    navigate("/adminLogin"); // 🔥 IMPORTANT
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className={styles["admin-dashboard"]}>
      {/* 🔹 TOP NAVBAR */}
      <div className={styles["admin-navbar"]}>
        <h2>College ERP – Admin</h2>

        {/* 👤 PROFILE ICON */}
        <div className={styles.profile} ref={menuRef}>
          <div className={styles.avatar} onClick={() => setOpen(!open)}>
            A
          </div>

          {open && (
            <div className={styles.dropdown}>
              <p className={styles.email}>Admin</p>
              <Link to="/admin/profile">Profile</Link>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 BODY */}
      <div className={styles["admin-body"]}>
        <aside className={styles.sidebar}>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/announcements">Announcements</Link>
          <Link to="/admin/student">Upload Students</Link>
          <Link to="/admin/placement">Placements</Link>
          <Link to="/admissions">Admissions</Link>
          <Link to="/faculty">Faculty</Link>
          <Link to="/ClassSchedules">Classes</Link>
          <Link to="/adminEvent">Events</Link>
        </aside>

        <main className={styles.content}>
          <h1>Welcome Admin 👋</h1>
          <p>Select a section from the sidebar.</p>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;