import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ─────────────────────────────────────────
   Updated API endpoint map (matches new backend)
   OLD → NEW
   /api/student/home       → /api/student/home       ✓ (unchanged)
   /api/student/attendance → /api/student/attendance ✓ (unchanged)
   /api/student/logout     → /api/student/logout     ✓ (unchanged)
   /api/student/upload-profile → /api/student/upload-profile ✓
   /api/student/delete-profile → /api/student/delete-profile ✓
   public announcements    → /api/public/announcements (NEW)
   public events           → /api/public/events       (NEW)
───────────────────────────────────────── */

const ENDPOINTS = {
  home:          "/api/student/home",
  attendance:    "/api/student/attendance",
  logout:        "/api/student/logout",
  uploadProfile: "/api/student/upload-profile",
  deleteProfile: "/api/student/delete-profile",
  // public
  announcements: "/api/public/announcements",
  events:        "/api/public/events",
};

const NAV_ITEMS = [
  { path: "/student/dashboard",   icon: "⊞",  label: "Dashboard"   },
  { path: "/student/attendance",  icon: "◎",  label: "Attendance"  },
  { path: "/student/notices",     icon: "⊟",  label: "Notices"     },
  { path: "/student/assignments", icon: "✎",  label: "Assignments" },
  { path: "/student/results",     icon: "◈",  label: "Results"     },
  { path: "/student/timetable",   icon: "▦",  label: "Timetable"   },
  { path: "/student/fees",        icon: "◇",  label: "Fees"        },
  { path: "/student/syllabus",    icon: "≡",  label: "Syllabus"    },
  { path: "/student/profile",     icon: "◉",  label: "Profile"     },
];

export default function StudentDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fileRef   = useRef(null);

  const [student,        setStudent]        = useState(null);
  const [todayClasses,   setTodayClasses]   = useState([]);
  const [attendance,     setAttendance]     = useState({ percentage: 0, present: 0, absent: 0, total: 0 });
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [selectedFile,   setSelectedFile]   = useState(null);
  const [previewUrl,     setPreviewUrl]     = useState("");
  const [uploading,      setUploading]      = useState(false);
  const [uploadMsg,      setUploadMsg]      = useState({ type: "", text: "" });
  const [activeCard,     setActiveCard]     = useState(null);

  /* ── fetch ── */
  useEffect(() => { fetchHome(); fetchAttendance(); }, []);

  const fetchHome = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}${ENDPOINTS.home}`, { withCredentials: true });
      if (data.success && data.student) {
        setStudent(data.student);
        setTodayClasses(data.todayClasses || []);
        if (data.student.profilePic) setPreviewUrl(data.student.profilePic);
      } else {
        setError(data.message || "No student data received");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load student data");
      if (err.response?.status === 401) navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}${ENDPOINTS.attendance}`, { withCredentials: true });
      if (data.success) {
        setAttendance({
          percentage: data.percentage || 0,
          present:    data.present    || 0,
          absent:     data.absent     || 0,
          total:      data.total      || 0,
        });
      }
    } catch {
      setAttendance({ percentage: 85, present: 68, absent: 12, total: 80 });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const valid = ["image/jpeg","image/png","image/jpg","image/gif","image/webp"];
    if (!valid.includes(file.type)) return setUploadMsg({ type:"error", text:"Invalid file type." });
    if (file.size > 5 * 1024 * 1024) return setUploadMsg({ type:"error", text:"File must be < 5 MB." });
    setSelectedFile(file);
    setUploadMsg({ type:"", text:"" });
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return setUploadMsg({ type:"error", text:"Select a file first." });
    const form = new FormData();
    form.append("profilePic", selectedFile);
    try {
      setUploading(true);
      const { data } = await axios.post(`${API_BASE}${ENDPOINTS.uploadProfile}`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.message) {
        setUploadMsg({ type:"success", text:"Profile updated!" });
        setStudent(p => ({ ...p, profilePic: data.profilePic }));
        setPreviewUrl(data.profilePic);
        if (fileRef.current) fileRef.current.value = "";
        setTimeout(() => { setShowModal(false); setSelectedFile(null); setUploadMsg({ type:"", text:"" }); }, 1800);
      }
    } catch (err) {
      setUploadMsg({ type:"error", text: err.response?.data?.message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Remove your profile picture?")) return;
    try {
      await axios.delete(`${API_BASE}${ENDPOINTS.deleteProfile}`, { withCredentials: true });
      setStudent(p => ({ ...p, profilePic: null }));
      setPreviewUrl(""); setSelectedFile(null); setShowModal(false);
    } catch { setUploadMsg({ type:"error", text:"Failed to remove photo." }); }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}${ENDPOINTS.logout}`, {}, { withCredentials: true });
      navigate("/student/login");
    } catch { navigate("/student/login"); }
  };

  const closeModal = () => {
    setShowModal(false); setSelectedFile(null);
    setPreviewUrl(student?.profilePic || "");
    setUploadMsg({ type:"", text:"" });
  };

  const attendancePct = attendance.percentage || student?.attendance || 0;
  const attColor = attendancePct >= 75 ? "#22c55e" : attendancePct >= 60 ? "#f59e0b" : "#ef4444";
  const profileImg = student?.profilePic || previewUrl;

  /* ── loading / error states ── */
  if (loading) return (
    <div style={styles.center}>
      <div style={styles.spinner} />
      <p style={{ color:"#64748b", marginTop:16, fontFamily:"'DM Sans', sans-serif" }}>Loading…</p>
    </div>
  );

  if (error || !student) return (
    <div style={styles.center}>
      <div style={{ fontSize:48 }}>⚠️</div>
      <h3 style={{ color:"#1e293b", fontFamily:"'DM Sans', sans-serif" }}>Error Loading Dashboard</h3>
      <p style={{ color:"#64748b" }}>{error || "No student data found"}</p>
      <button style={styles.retryBtn} onClick={fetchHome}>Retry</button>
    </div>
  );

  /* ── render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'DM Sans', sans-serif; }

        .sd-layout { display: flex; min-height: 100vh; background: #f0f4f8; }

        /* ── Sidebar ── */
        .sd-sidebar {
          width: var(--sw);
          background: #0f172a;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: width .3s cubic-bezier(.4,0,.2,1);
          position: relative;
          z-index: 50;
          flex-shrink: 0;
        }

        .sd-toggle {
          position: absolute;
          right: -13px;
          top: 24px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #3b82f6;
          border: 3px solid #0f172a;
          color: #fff;
          font-size: 9px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .2s;
          z-index: 60;
        }
        .sd-toggle:hover { background: #2563eb; }

        .sd-brand {
          padding: 28px 20px 20px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .sd-avatar-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #fff; font-weight: 700;
          flex-shrink: 0; overflow: hidden;
        }
        .sd-avatar-wrap img { width:100%; height:100%; object-fit:cover; }

        .sd-brand-info { text-align: center; overflow: hidden; }
        .sd-brand-name { color: #f1f5f9; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sd-brand-roll { color: #64748b; font-size: 11px; font-family: 'DM Mono', monospace; margin-top: 3px; }

        .sd-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }

        .sd-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          transition: all .18s;
          white-space: nowrap;
          overflow: hidden;
        }
        .sd-nav-item:hover { background: #1e293b; color: #e2e8f0; }
        .sd-nav-item.active { background: #1d4ed8; color: #fff; }
        .sd-nav-icon { font-size: 16px; flex-shrink: 0; width: 20px; text-align: center; }

        .sd-logout {
          margin: 12px 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          background: transparent;
          color: #ef4444;
          border: 1px solid #1e293b;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          width: calc(100% - 20px);
          transition: all .18s;
          white-space: nowrap;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .sd-logout:hover { background: #ef44441a; border-color: #ef4444; }

        /* ── Main ── */
        .sd-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        .sd-topbar {
          background: #fff;
          padding: 14px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .sd-topbar-greet { font-size: 18px; font-weight: 700; color: #0f172a; }
        .sd-topbar-sub { font-size: 12.5px; color: #64748b; margin-top: 2px; font-family: 'DM Mono', monospace; }

        .sd-topbar-right { display: flex; align-items: center; gap: 12px; }

        .sd-topbar-avatar {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: #fff; font-weight: 700;
          overflow: hidden; cursor: pointer;
          transition: opacity .2s;
        }
        .sd-topbar-avatar:hover { opacity: .85; }
        .sd-topbar-avatar img { width:100%; height:100%; object-fit:cover; }

        .sd-photo-btn {
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          transition: all .18s;
        }
        .sd-photo-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

        /* ── Content ── */
        .sd-content { flex: 1; overflow-y: auto; padding: 24px 28px; }

        /* ── Info strip ── */
        .sd-info-strip {
          background: #fff;
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
          margin-bottom: 22px;
          border: 1px solid #e2e8f0;
        }

        .sd-info-name { font-size: 20px; font-weight: 700; color: #0f172a; }
        .sd-info-meta { font-size: 12.5px; color: #64748b; margin-top: 4px; font-family: 'DM Mono', monospace; }

        .sd-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        .sd-badge.active { background: #dcfce7; color: #16a34a; }
        .sd-badge.inactive { background: #fee2e2; color: #dc2626; }

        .sd-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px 24px;
          flex: 1;
        }
        .sd-info-pair { font-size: 13px; color: #475569; }
        .sd-info-pair strong { color: #1e293b; }

        /* ── Stats grid ── */
        .sd-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 22px; }

        .sd-stat-card {
          background: #fff;
          border-radius: 14px;
          padding: 22px;
          border: 1px solid #e2e8f0;
          transition: transform .18s, box-shadow .18s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .sd-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.06); }
        .sd-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent);
        }

        .sd-stat-icon { font-size: 28px; margin-bottom: 12px; }
        .sd-stat-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
        .sd-stat-value { font-size: 38px; font-weight: 700; color: var(--accent); line-height: 1.1; margin: 6px 0; font-family: 'DM Mono', monospace; }
        .sd-stat-sub { font-size: 12px; color: #94a3b8; }

        .sd-progress-track { width:100%; height:6px; background:#e2e8f0; border-radius:3px; margin-top:14px; overflow:hidden; }
        .sd-progress-fill  { height:100%; border-radius:3px; transition: width .6s cubic-bezier(.4,0,.2,1); }

        /* ── Classes ── */
        .sd-classes-section {
          background: #fff;
          border-radius: 14px;
          padding: 20px 24px;
          border: 1px solid #e2e8f0;
        }
        .sd-section-title {
          font-size: 15px; font-weight: 700; color: #0f172a;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
        }

        .sd-class-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 16px;
          border-radius: 10px;
          background: #f8fafc;
          border-left: 4px solid var(--stripe);
          margin-bottom: 10px;
          transition: background .15s;
        }
        .sd-class-item:last-child { margin-bottom: 0; }
        .sd-class-item:hover { background: #f1f5f9; }

        .sd-class-subject { font-size: 14px; font-weight: 600; color: #1e293b; }
        .sd-class-faculty  { font-size: 12px; color: #64748b; margin-top: 3px; }
        .sd-class-time     { font-size: 13px; color: #475569; font-family: 'DM Mono', monospace; text-align: right; }
        .sd-class-room     { font-size: 11px; color: #94a3b8; margin-top: 3px; text-align: right; }

        .sd-empty {
          text-align: center;
          padding: 48px 0;
          color: #94a3b8;
          font-size: 14px;
        }
        .sd-empty-icon { font-size: 44px; margin-bottom: 12px; }

        /* ── Modal ── */
        .sd-overlay {
          position: fixed; inset: 0;
          background: rgba(15,23,42,.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
          animation: fadeIn .2s;
        }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }

        .sd-modal {
          background: #fff;
          border-radius: 18px;
          width: 380px;
          max-width: calc(100vw - 32px);
          box-shadow: 0 24px 64px rgba(0,0,0,.18);
          animation: slideUp .25s cubic-bezier(.4,0,.2,1);
          overflow: hidden;
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }

        .sd-modal-head {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sd-modal-title { font-size: 16px; font-weight: 700; color: #0f172a; }
        .sd-modal-close { background:none; border:none; font-size:22px; color:#94a3b8; cursor:pointer; line-height:1; }
        .sd-modal-close:hover { color:#0f172a; }

        .sd-modal-body { padding: 24px; }

        .sd-preview {
          width: 110px; height: 110px; border-radius: 16px;
          background: linear-gradient(135deg,#e0e7ff,#ede9fe);
          display: flex; align-items: center; justify-content: center;
          font-size: 40px;
          margin: 0 auto 20px;
          overflow: hidden;
          border: 3px solid #e2e8f0;
        }
        .sd-preview img { width:100%; height:100%; object-fit:cover; }

        .sd-modal-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }

        .sd-btn {
          padding: 9px 18px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: 'DM Sans', sans-serif;
          transition: all .18s;
        }
        .sd-btn:disabled { opacity:.5; cursor:not-allowed; }
        .sd-btn-primary { background: #2563eb; color:#fff; }
        .sd-btn-primary:hover:not(:disabled) { background: #1d4ed8; }
        .sd-btn-ghost { background: #f1f5f9; color: #475569; }
        .sd-btn-ghost:hover:not(:disabled) { background: #e2e8f0; }
        .sd-btn-danger { background: #fee2e2; color: #ef4444; }
        .sd-btn-danger:hover:not(:disabled) { background: #fecaca; }

        .sd-msg { font-size: 13px; border-radius: 8px; padding: 9px 14px; margin-top: 14px; text-align: center; }
        .sd-msg.error   { background: #fee2e2; color: #dc2626; }
        .sd-msg.success { background: #dcfce7; color: #16a34a; }

        .sd-modal-foot {
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <input type="file" ref={fileRef} onChange={handleFileSelect} accept="image/*" style={{ display:"none" }} />

      {/* Upload Modal */}
      {showModal && (
        <div className="sd-overlay">
          <div className="sd-modal">
            <div className="sd-modal-head">
              <span className="sd-modal-title">Update Profile Photo</span>
              <button className="sd-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="sd-modal-body">
              <div className="sd-preview">
                {previewUrl
                  ? <img src={previewUrl} alt="preview" />
                  : "📷"
                }
              </div>
              <div className="sd-modal-actions">
                <button className="sd-btn sd-btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {student.profilePic ? "Change" : "Select"} Photo
                </button>
                {selectedFile && (
                  <button className="sd-btn sd-btn-ghost" onClick={() => { setSelectedFile(null); setPreviewUrl(student.profilePic || ""); }} disabled={uploading}>Clear</button>
                )}
                {student.profilePic && !selectedFile && (
                  <button className="sd-btn sd-btn-danger" onClick={handleRemovePhoto} disabled={uploading}>Remove</button>
                )}
              </div>
              {uploadMsg.text && <div className={`sd-msg ${uploadMsg.type}`}>{uploadMsg.text}</div>}
            </div>
            <div className="sd-modal-foot">
              <button className="sd-btn sd-btn-ghost" onClick={closeModal} disabled={uploading}>Cancel</button>
              <button className="sd-btn sd-btn-primary" onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? "Uploading…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sd-layout" style={{ "--sw": sidebarOpen ? "240px" : "68px" }}>

        {/* ── Sidebar ── */}
        <aside className="sd-sidebar">
          <button className="sd-toggle" onClick={() => setSidebarOpen(o => !o)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <div className="sd-brand">
            <div className="sd-avatar-wrap">
              {profileImg ? <img src={profileImg} alt={student.name} /> : student.firstName?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="sd-brand-info">
                <div className="sd-brand-name">{student.name}</div>
                <div className="sd-brand-roll">{student.rollNumber}</div>
              </div>
            )}
          </div>

          <nav className="sd-nav">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`sd-nav-item${location.pathname === item.path ? " active" : ""}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="sd-nav-icon">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <button className="sd-logout" onClick={handleLogout} title={!sidebarOpen ? "Logout" : undefined}>
            <span className="sd-nav-icon">⏻</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </aside>

        {/* ── Main area ── */}
        <main className="sd-main">
          {/* Top bar */}
          <div className="sd-topbar">
            <div>
              <div className="sd-topbar-greet">Good day, {student.firstName} 👋</div>
              <div className="sd-topbar-sub">{student.department} · Semester {student.semester}</div>
            </div>
            <div className="sd-topbar-right">
              <div className="sd-topbar-avatar" onClick={() => setShowModal(true)}>
                {profileImg ? <img src={profileImg} alt={student.name} /> : student.firstName?.charAt(0)}
              </div>
              <button className="sd-photo-btn" onClick={() => setShowModal(true)}>Update Photo</button>
            </div>
          </div>

          <div className="sd-content">

            {/* Student info strip */}
            <div className="sd-info-strip">
              <div>
                <div className="sd-info-name">{student.name}</div>
                <div className="sd-info-meta">ID: {student.studentId} · {student.email}</div>
                <span className={`sd-badge ${student.status === "active" ? "active" : "inactive"}`}>
                  {student.status || "active"}
                </span>
              </div>
              <div className="sd-info-grid">
                <div className="sd-info-pair"><strong>Department</strong><br />{student.department}</div>
                <div className="sd-info-pair"><strong>Section</strong><br />{student.section || "N/A"}</div>
                <div className="sd-info-pair"><strong>Roll No.</strong><br />{student.rollNumber}</div>
                <div className="sd-info-pair"><strong>Semester</strong><br />{student.semester}</div>
                <div className="sd-info-pair"><strong>Phone</strong><br />{student.phone || "—"}</div>
                <div className="sd-info-pair"><strong>Batch</strong><br />{student.batch || "—"}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="sd-stats">
              {/* Attendance */}
              <div className="sd-stat-card" style={{ "--accent": attColor }}>
                <div className="sd-stat-icon">📊</div>
                <div className="sd-stat-label">Attendance</div>
                <div className="sd-stat-value">{attendancePct}%</div>
                <div className="sd-stat-sub">Present {attendance.present} · Absent {attendance.absent} · Total {attendance.total}</div>
                <div className="sd-progress-track">
                  <div className="sd-progress-fill" style={{ width:`${attendancePct}%`, background: attColor }} />
                </div>
              </div>

              {/* CGPA */}
              <div className="sd-stat-card" style={{ "--accent":"#8b5cf6" }}>
                <div className="sd-stat-icon">🎓</div>
                <div className="sd-stat-label">CGPA</div>
                <div className="sd-stat-value">{student.cgpa ?? "8.5"}</div>
                <div className="sd-stat-sub">Current semester</div>
              </div>

              {/* Credits */}
              <div className="sd-stat-card" style={{ "--accent":"#3b82f6" }}>
                <div className="sd-stat-icon">📖</div>
                <div className="sd-stat-label">Credits Earned</div>
                <div className="sd-stat-value">{student.credits ?? 42}</div>
                <div className="sd-stat-sub">out of 160 total</div>
                <div className="sd-progress-track">
                  <div className="sd-progress-fill" style={{ width:`${((student.credits ?? 42)/160)*100}%`, background:"#3b82f6" }} />
                </div>
              </div>
            </div>

            {/* Today's classes */}
            <div className="sd-classes-section">
              <div className="sd-section-title">
                <span>▦</span> Today's Classes
              </div>

              {todayClasses.length === 0 ? (
                <div className="sd-empty">
                  <div className="sd-empty-icon">📅</div>
                  No classes scheduled for today. Enjoy your day!
                </div>
              ) : (
                todayClasses.map((cls, i) => {
                  const stripes = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444"];
                  return (
                    <div key={i} className="sd-class-item" style={{ "--stripe": stripes[i % stripes.length] }}>
                      <div>
                        <div className="sd-class-subject">{cls.subject}</div>
                        <div className="sd-class-faculty">👨‍🏫 {cls.faculty_name || "Faculty"}</div>
                      </div>
                      <div>
                        <div className="sd-class-time">
                          {cls.start_time?.substring(0,5) ?? "09:00"} – {cls.end_time?.substring(0,5) ?? "10:30"}
                        </div>
                        <div className="sd-class-room">Room: {cls.room || "Online"}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

/* ── inline style helpers for loading / error screens ── */
const styles = {
  center: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#f0f4f8", gap: 8,
  },
  spinner: {
    width: 36, height: 36, border: "3px solid #e2e8f0",
    borderTop: "3px solid #3b82f6", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  retryBtn: {
    marginTop: 12, padding: "9px 22px", borderRadius: 9,
    background: "#2563eb", color: "#fff", border: "none",
    cursor: "pointer", fontWeight: 600, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
};