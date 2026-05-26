import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import {
  Calendar, Clock, Users, BookOpen, AlertCircle, CheckCircle,
  TrendingUp, FileText, ClipboardList, Bell, Upload,
  Download, Edit, Trash2, Eye, PlusCircle, Send,
  UserCheck, UserX, Award, MessageCircle, Settings, LogOut,
  ChevronRight, Menu, X, Search, Filter, RefreshCw,
  ChevronDown, MoreVertical, AlertTriangle, Info, Loader,
  GraduationCap, BarChart2, Target, Zap
} from "lucide-react";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000";

// ─── Axios instance with interceptors ──────────────────────────────────────
const api = axios.create({ baseURL: API_BASE, withCredentials: true, timeout: 15000 });
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.location.href = "/faculty/login";
    return Promise.reject(err);
  }
);

// ─── Toast System ───────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  return { toasts, add, remove };
};

const ToastContainer = ({ toasts, remove }) => (
  <div style={s.toastContainer}>
    {toasts.map((t) => (
      <div key={t.id} style={{ ...s.toast, ...s[`toast_${t.type}`] }}>
        <span>
          {t.type === "success" && <CheckCircle size={15} style={{ marginRight: 8 }} />}
          {t.type === "error" && <AlertTriangle size={15} style={{ marginRight: 8 }} />}
          {t.type === "info" && <Info size={15} style={{ marginRight: 8 }} />}
          {t.message}
        </span>
        <button onClick={() => remove(t.id)} style={s.toastClose}>×</button>
      </div>
    ))}
  </div>
);

// ─── Confirmation Dialog ─────────────────────────────────────────────────────
const ConfirmDialog = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={s.modalOverlay}>
      <div style={{ ...s.modal, maxWidth: 400 }}>
        <div style={s.modalHeader}>
          <AlertTriangle size={20} color="#f59e0b" />
          <h3 style={s.modalTitle}>Confirm Action</h3>
        </div>
        <p style={{ padding: "16px 24px", color: "#94a3b8", lineHeight: 1.6 }}>{message}</p>
        <div style={s.modalFooter}>
          <button style={s.btnSecondary} onClick={onCancel}>Cancel</button>
          <button style={{ ...s.btnPrimary, background: "linear-gradient(135deg,#ef4444,#dc2626)" }} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Loading Spinner ─────────────────────────────────────────────────────────
const Spinner = ({ size = 20 }) => (
  <span style={{ display: "inline-flex", animation: "spin 0.8s linear infinite" }}>
    <Loader size={size} />
  </span>
);

// ─── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div style={s.emptyState}>
    <div style={s.emptyIcon}><Icon size={36} color="#475569" /></div>
    <h3 style={s.emptyTitle}>{title}</h3>
    <p style={s.emptySubtitle}>{subtitle}</p>
    {action && <button style={s.btnPrimary} onClick={action.onClick}>{action.label}</button>}
  </div>
);

// ─── Section Header ──────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, action }) => (
  <div style={s.sectionHeader}>
    <div style={s.sectionTitle}>
      <div style={s.sectionIcon}><Icon size={20} /></div>
      <h2 style={s.sectionTitleText}>{title}</h2>
    </div>
    {action && (
      <button style={s.btnPrimary} onClick={action.onClick}>
        <PlusCircle size={15} style={{ marginRight: 6 }} />
        {action.label}
      </button>
    )}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
const Badge = ({ label, variant = "default" }) => {
  const colors = {
    active: { bg: "#052e16", color: "#4ade80" },
    upcoming: { bg: "#1e1b4b", color: "#a5b4fc" },
    completed: { bg: "#0f172a", color: "#64748b" },
    ongoing: { bg: "#431407", color: "#fb923c" },
    cancelled: { bg: "#450a0a", color: "#f87171" },
    default: { bg: "#1e293b", color: "#94a3b8" },
  };
  const c = colors[variant] || colors.default;
  return (
    <span style={{ ...s.badge, background: c.bg, color: c.color }}>{label}</span>
  );
};

// ─── Custom Tooltip for Charts ────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.chartTooltip}>
      <p style={{ color: "#94a3b8", marginBottom: 6, fontSize: 12 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600, fontSize: 14 }}>
          {p.name}: {p.value}{p.name === "percentage" ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { toasts, add: toast, remove: removeToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [facultyData, setFacultyData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [todayClasses, setTodayClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  
  // Attendance marking states
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: "", onConfirm: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  // ── Data Fetching ────────────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      setInitialLoading(true);
      const response = await api.get("/api/faculty/dashboard");
      setFacultyData(response.data.faculty);
      setNotificationCount(response.data.notification_count || 0);
    } catch (err) {
      toast("Failed to load dashboard data", "error");
    } finally {
      setInitialLoading(false);
    }
  }, [toast]);

  const withSectionLoading = async (fn) => {
    setSectionLoading(true);
    try { await fn(); }
    finally { setSectionLoading(false); }
  };

  const fetchTodayClasses = useCallback(() =>
    withSectionLoading(async () => {
      try {
        const res = await api.get("/api/faculty/today-classes");
        setTodayClasses(res.data.data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
        toast("Failed to load today's classes", "error");
      }
    }), [toast]);

  const fetchAssignments = useCallback(() =>
    withSectionLoading(async () => {
      const res = await api.get("/api/faculty/assignments");
      setAssignments(res.data.data || []);
    }), []);

  const fetchNotices = useCallback(() =>
    withSectionLoading(async () => {
      const res = await api.get("/api/faculty/notices");
      setNotices(res.data.data || []);
    }), []);

  const fetchTests = useCallback(() =>
    withSectionLoading(async () => {
      const res = await api.get("/api/faculty/tests");
      setTests(res.data.data || []);
    }), []);

  const fetchStudents = useCallback(() =>
    withSectionLoading(async () => {
      const res = await api.get("/api/faculty/students");
      setStudents(res.data.data || []);
    }), []);

  // FIXED: Handle attendance stats properly
  const fetchAttendanceStats = useCallback(() =>
    withSectionLoading(async () => {
      try {
        const res = await api.get("/api/faculty/attendance-stats");
        let statsData = res.data.data || [];
        // Ensure it's an array
        if (!Array.isArray(statsData)) {
          statsData = [];
        }
        // Ensure each item has required properties
        statsData = statsData.map(item => ({
          week: item.week || 'Week 1',
          percentage: item.percentage || 0
        }));
        setAttendanceStats(statsData);
      } catch (err) {
        console.error("Error fetching attendance stats:", err);
        setAttendanceStats([]);
      }
    }), []);

  // Fetch students for a specific class
  const fetchClassStudents = useCallback(async (classId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/faculty/class/${classId}/students`);
      const studentsData = response.data.data?.students || response.data.data || [];
      setClassStudents(studentsData);
      
      const initialAttendance = {};
      studentsData.forEach(student => {
        initialAttendance[student.id] = "present";
      });
      setAttendanceData(initialAttendance);
    } catch (err) {
      console.error("Error fetching class students:", err);
      toast(err.response?.data?.message || "Failed to load class students", "error");
      setClassStudents([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  useEffect(() => {
    const sectionMap = {
      "today-classes": fetchTodayClasses,
      assignments: fetchAssignments,
      notices: fetchNotices,
      tests: fetchTests,
      students: fetchStudents,
      attendance: fetchAttendanceStats,
    };
    if (sectionMap[activeSection]) sectionMap[activeSection]();
    setSearchQuery("");
  }, [activeSection, fetchTodayClasses, fetchAssignments, fetchNotices, fetchTests, fetchStudents, fetchAttendanceStats]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (modalType === "assignment") {
      if (!formData.title?.trim()) errors.title = "Title is required";
      if (!formData.due_date) errors.due_date = "Due date is required";
      if (!formData.total_marks) errors.total_marks = "Total marks required";
      if (!formData.course_code) errors.course_code = "Please select a course";
    }
    if (modalType === "notice") {
      if (!formData.title?.trim()) errors.title = "Title is required";
      if (!formData.content?.trim()) errors.content = "Content is required";
    }
    if (modalType === "test") {
      if (!formData.title?.trim()) errors.title = "Title is required";
      if (!formData.test_date) errors.test_date = "Test date is required";
      if (!formData.duration) errors.duration = "Duration is required";
      if (!formData.total_marks) errors.total_marks = "Total marks required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── CRUD Operations ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (modalType === "assignment") {
        if (editingItem) {
          await api.put(`/api/faculty/assignments/${editingItem.id}`, formData);
          toast("Assignment updated successfully", "success");
        } else {
          await api.post("/api/faculty/assignments", formData);
          toast("Assignment created successfully", "success");
        }
        await fetchAssignments();
      } else if (modalType === "notice") {
        await api.post("/api/faculty/notices", formData);
        toast("Notice published successfully", "success");
        await fetchNotices();
      } else if (modalType === "test") {
        await api.post("/api/faculty/tests", formData);
        toast("Test created successfully", "success");
        await fetchTests();
      }
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${editingItem ? "update" : "create"} ${modalType}`;
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (message, onConfirm) =>
    setConfirmDialog({ open: true, message, onConfirm });

  const deleteItem = async (endpoint, id, refresh, label) => {
    confirmDelete(`Are you sure you want to delete this ${label}? This cannot be undone.`, async () => {
      setConfirmDialog({ open: false });
      try {
        await api.delete(`${endpoint}/${id}`);
        toast(`${label} deleted successfully`, "success");
        await refresh();
      } catch {
        toast(`Failed to delete ${label}`, "error");
      }
    });
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/faculty/logout");
      navigate("/faculty/login");
    } catch {
      toast("Logout failed. Please try again.", "error");
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setFormErrors({});
    setShowModal(true);
  };

  // ── Attendance Marking Functions ─────────────────────────────────────────
  const openAttendanceModal = async (classItem) => {
    setSelectedClass(classItem);
    await fetchClassStudents(classItem.id);
    setShowAttendanceModal(true);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllPresent = () => {
    const allPresent = {};
    classStudents.forEach(student => {
      allPresent[student.id] = "present";
    });
    setAttendanceData(allPresent);
  };

  const markAllAbsent = () => {
    const allAbsent = {};
    classStudents.forEach(student => {
      allAbsent[student.id] = "absent";
    });
    setAttendanceData(allAbsent);
  };

  const submitAttendance = async () => {
    if (!selectedClass) return;
    
    setSubmittingAttendance(true);
    try {
      const attendanceList = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        status: status
      }));
      
      const response = await api.post(`/api/faculty/attendance/${selectedClass.id}`, {
        attendance: attendanceList,
        date: new Date().toISOString().split('T')[0]
      });
      
      if (response.data.success) {
        toast("Attendance saved successfully!", "success");
        setShowAttendanceModal(false);
        setSelectedClass(null);
        setClassStudents([]);
        setAttendanceData({});
        await fetchAttendanceStats();
        await fetchTodayClasses();
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      toast(err.response?.data?.message || "Failed to save attendance", "error");
    } finally {
      setSubmittingAttendance(false);
    }
  };

  // ── Filter helpers ────────────────────────────────────────────────────────
  const filtered = (arr, keys) =>
    (arr || []).filter((item) =>
      keys.some((k) => String(item[k] || "").toLowerCase().includes(searchQuery.toLowerCase()))
    );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER SECTIONS
  // ─────────────────────────────────────────────────────────────────────────

  // Attendance Modal
  const renderAttendanceModal = () => {
    if (!showAttendanceModal) return null;
    
    const presentCount = Object.values(attendanceData).filter(s => s === "present").length;
    const absentCount = classStudents.length - presentCount;
    
    return (
      <div style={s.modalOverlay} onClick={() => setShowAttendanceModal(false)}>
        <div style={{ ...s.modal, maxWidth: 800 }} onClick={(e) => e.stopPropagation()}>
          <div style={s.modalHeader}>
            <h3 style={s.modalTitle}>
              📝 Take Attendance - {selectedClass?.subject}
            </h3>
            <button style={s.modalClose} onClick={() => setShowAttendanceModal(false)}>
              <X size={18} />
            </button>
          </div>
          
          <div style={s.modalBody}>
            <div style={s.attendanceSummary}>
              <div style={s.summaryStats}>
                <div style={s.summaryStat}>
                  <span style={{ color: "#4ade80" }}>✓ Present</span>
                  <strong>{presentCount}</strong>
                </div>
                <div style={s.summaryStat}>
                  <span style={{ color: "#f87171" }}>✗ Absent</span>
                  <strong>{absentCount}</strong>
                </div>
                <div style={s.summaryStat}>
                  <span>Total</span>
                  <strong>{classStudents.length}</strong>
                </div>
              </div>
              <div style={s.bulkActions}>
                <button style={s.btnSuccess} onClick={markAllPresent}>
                  <CheckCircle size={14} /> Mark All Present
                </button>
                <button style={s.btnDanger} onClick={markAllAbsent}>
                  <UserX size={14} /> Mark All Absent
                </button>
              </div>
            </div>
            
            <div style={s.studentsTableWrapper}>
              {classStudents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No students found for this class
                </div>
              ) : (
                <table style={s.attendanceTable}>
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((student) => (
                      <tr key={student.id}>
                        <td style={{ padding: "10px 12px" }}>{student.roll_number || student.roll_no}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={s.studentNameCell}>
                            <div style={s.avatarSmall}>{(student.full_name || student.name)?.charAt(0)}</div>
                            {student.full_name || student.name}
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={s.statusButtons}>
                            <button
                              style={{
                                ...s.statusBtn,
                                background: attendanceData[student.id] === "present" ? "#10b981" : "#1e293b",
                                color: attendanceData[student.id] === "present" ? "#fff" : "#94a3b8"
                              }}
                              onClick={() => handleAttendanceChange(student.id, "present")}
                            >
                              <CheckCircle size={14} /> Present
                            </button>
                            <button
                              style={{
                                ...s.statusBtn,
                                background: attendanceData[student.id] === "absent" ? "#ef4444" : "#1e293b",
                                color: attendanceData[student.id] === "absent" ? "#fff" : "#94a3b8"
                              }}
                              onClick={() => handleAttendanceChange(student.id, "absent")}
                            >
                              <UserX size={14} /> Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div style={s.modalFooter}>
            <button style={s.btnSecondary} onClick={() => setShowAttendanceModal(false)}>
              Cancel
            </button>
            <button 
              style={s.btnPrimary} 
              onClick={submitAttendance}
              disabled={submittingAttendance || classStudents.length === 0}
            >
              {submittingAttendance ? <><Spinner size={14} /> Saving...</> : "Save Attendance"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const statCards = [
      { label: "Total Students", value: facultyData?.total_students || 0, icon: Users, color: "#3b82f6" },
      { label: "Active Courses", value: facultyData?.total_courses || 0, icon: BookOpen, color: "#10b981" },
      { label: "Active Assignments", value: assignments.filter((a) => a.status === "active").length, icon: ClipboardList, color: "#f59e0b" },
      { label: "Upcoming Tests", value: tests.filter((t) => t.status === "upcoming").length, icon: Award, color: "#8b5cf6" },
    ];

    return (
      <div>
        <div style={s.statsGrid}>
          {statCards.map((card, i) => (
            <div key={i} style={s.statCard}>
              <div style={{ ...s.statIconWrap, background: card.color + "1a", color: card.color }}>
                <card.icon size={22} />
              </div>
              <div style={s.statInfo}>
                <p style={s.statLabel}>{card.label}</p>
                <p style={s.statValue}>{card.value}</p>
              </div>
              <div style={{ ...s.statAccent, background: card.color }} />
            </div>
          ))}
        </div>

        <div style={s.chartsRow}>
          <div style={{ ...s.chartCard, flex: 2 }}>
            <div style={s.chartHeader}>
              <h3 style={s.chartTitle}>Attendance Trends</h3>
              <span style={s.chartSubtitle}>Past 8 weeks</span>
            </div>
            {attendanceStats && attendanceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={attendanceStats}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="percentage" stroke="#3b82f6" fill="url(#aGrad)" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                No attendance data available yet
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTodayClasses = () => (
    <div>
      <SectionHeader icon={Calendar} title="Today's Classes" />
      {sectionLoading ? (
        <div style={s.loadingSection}><Spinner size={28} /></div>
      ) : todayClasses.length === 0 ? (
        <EmptyState icon={Calendar} title="No classes today" subtitle="You have no classes scheduled for today" />
      ) : (
        <div style={s.classesGrid}>
          {todayClasses.map((cls) => (
            <div key={cls.id} style={s.classCard}>
              <div style={s.classCardTop}>
                <div>
                  <h4 style={s.classSubject}>{cls.subject}</h4>
                  <p style={s.classMeta}>{cls.branch} · Sem {cls.semester} · Sec {cls.section}</p>
                </div>
                <Badge label={cls.status || "upcoming"} variant={cls.status || "upcoming"} />
              </div>
              <div style={s.classDetails}>
                <span style={s.classDetail}><Clock size={13} style={{ marginRight: 5 }} />{cls.start_time} – {cls.end_time}</span>
                <span style={s.classDetail}><BookOpen size={13} style={{ marginRight: 5 }} />Room {cls.room || "TBA"}</span>
                <span style={s.classDetail}><Users size={13} style={{ marginRight: 5 }} />{cls.total_students || 0} Students</span>
              </div>
              <button
                style={s.btnPrimary}
                onClick={() => openAttendanceModal(cls)}
              >
                <UserCheck size={15} style={{ marginRight: 6 }} />Take Attendance
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAssignments = () => {
    const list = filtered(assignments, ["title", "description"]);
    return (
      <div>
        <SectionHeader icon={FileText} title="Assignments" action={{ label: "Create Assignment", onClick: () => openModal("assignment") }} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search assignments…" />
        {sectionLoading ? <div style={s.loadingSection}><Spinner size={28} /></div> :
          list.length === 0 ? (
            <EmptyState icon={FileText} title="No assignments" subtitle="Create your first assignment" action={{ label: "Create Assignment", onClick: () => openModal("assignment") }} />
          ) : (
            <div style={s.listStack}>
              {list.map((a) => (
                <div key={a.id} style={s.listCard}>
                  <div style={s.listCardLeft}>
                    <div style={s.listCardIcon}><FileText size={18} color="#3b82f6" /></div>
                    <div>
                      <h3 style={s.listCardTitle}>{a.title}</h3>
                      <p style={s.listCardDesc}>{a.description}</p>
                      <div style={s.listMeta}>
                        <span style={s.metaPill}><Calendar size={11} style={{ marginRight: 4 }} />Due {new Date(a.due_date).toLocaleDateString()}</span>
                        <span style={s.metaPill}><Award size={11} style={{ marginRight: 4 }} />{a.total_marks} marks</span>
                        <span style={s.metaPill}><Users size={11} style={{ marginRight: 4 }} />{a.submissions || 0} submissions</span>
                      </div>
                    </div>
                  </div>
                  <div style={s.listCardActions}>
                    <ActionBtn icon={Eye} label="Submissions" onClick={() => navigate(`/faculty/assignments/${a.id}/submissions`)} />
                    <ActionBtn icon={Edit} label="Edit" onClick={() => openModal("assignment", a)} />
                    <ActionBtn icon={Trash2} label="Delete" danger onClick={() => deleteItem("/api/faculty/assignments", a.id, fetchAssignments, "assignment")} />
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  const renderNotices = () => {
    const list = filtered(notices, ["title", "content"]);
    return (
      <div>
        <SectionHeader icon={Bell} title="Notices" action={{ label: "Post Notice", onClick: () => openModal("notice") }} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search notices…" />
        {sectionLoading ? <div style={s.loadingSection}><Spinner size={28} /></div> :
          list.length === 0 ? (
            <EmptyState icon={Bell} title="No notices" subtitle="Post a notice to notify your students" action={{ label: "Post Notice", onClick: () => openModal("notice") }} />
          ) : (
            <div style={s.listStack}>
              {list.map((n) => (
                <div key={n.id} style={s.listCard}>
                  <div style={s.listCardLeft}>
                    <div style={{ ...s.listCardIcon, background: "#f59e0b1a" }}><Bell size={18} color="#f59e0b" /></div>
                    <div style={{ flex: 1 }}>
                      <div style={s.noticeTopRow}>
                        <h3 style={s.listCardTitle}>{n.title}</h3>
                        <small style={s.noticeDate}>{new Date(n.created_at).toLocaleDateString()}</small>
                      </div>
                      <p style={s.listCardDesc}>{n.content}</p>
                      {n.target_audience && <span style={s.metaPill}>Target: {n.target_audience}</span>}
                    </div>
                  </div>
                  <div style={s.listCardActions}>
                    <ActionBtn icon={Eye} label="View" onClick={() => navigate(`/faculty/notices/${n.id}/view`)} />
                    <ActionBtn icon={Trash2} label="Delete" danger onClick={() => deleteItem("/api/faculty/notices", n.id, fetchNotices, "notice")} />
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  const renderTests = () => {
    const list = filtered(tests, ["title", "subject"]);
    return (
      <div>
        <SectionHeader icon={ClipboardList} title="Tests & Exams" action={{ label: "Create Test", onClick: () => openModal("test") }} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search tests…" />
        {sectionLoading ? <div style={s.loadingSection}><Spinner size={28} /></div> :
          list.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No tests" subtitle="Schedule a test or exam for your students" action={{ label: "Create Test", onClick: () => openModal("test") }} />
          ) : (
            <div style={s.testsGrid}>
              {list.map((t) => (
                <div key={t.id} style={s.testCard}>
                  <div style={s.testCardHeader}>
                    <h3 style={s.testCardTitle}>{t.title}</h3>
                    <Badge label={t.status} variant={t.status} />
                  </div>
                  <div style={s.testMeta}>
                    <div style={s.testMetaRow}><Calendar size={13} color="#64748b" /><span>{new Date(t.test_date).toLocaleDateString()}</span></div>
                    <div style={s.testMetaRow}><Clock size={13} color="#64748b" /><span>{t.duration} min</span></div>
                    <div style={s.testMetaRow}><Award size={13} color="#64748b" /><span>{t.total_marks} marks</span></div>
                    {t.subject && <div style={s.testMetaRow}><BookOpen size={13} color="#64748b" /><span>{t.subject}</span></div>}
                  </div>
                  <div style={s.testActions}>
                    <button style={s.btnOutline} onClick={() => navigate(`/faculty/tests/${t.id}/results`)}>
                      <Eye size={14} style={{ marginRight: 5 }} />Results
                    </button>
                    <button style={s.btnDanger} onClick={() => deleteItem("/api/faculty/tests", t.id, fetchTests, "test")}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  const renderStudents = () => {
    const list = filtered(students, ["name", "roll_no", "course"]);
    return (
      <div>
        <SectionHeader icon={Users} title="Students" action={{ label: "Add Student", onClick: () => navigate("/faculty/students/add") }} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, roll no…" />
        {sectionLoading ? <div style={s.loadingSection}><Spinner size={28} /></div> :
          list.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No students found" subtitle="No students match your search" />
          ) : (
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Roll No", "Name", "Course", "Semester", "Attendance", "Actions"].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((student, idx) => (
                    <tr key={student.id} style={{ ...s.tr, ...(idx % 2 === 0 ? s.trEven : {}) }}>
                      <td style={s.td}><span style={s.rollNo}>{student.roll_no}</span></td>
                      <td style={s.td}>
                        <div style={s.studentName}>
                          <div style={s.avatar}>{student.name?.charAt(0)}</div>
                          {student.name}
                        </div>
                      </td>
                      <td style={s.td}>{student.course}</td>
                      <td style={s.td}>Sem {student.semester}</td>
                      <td style={s.td}>
                        <div style={s.attendanceCell}>
                          <div style={{ ...s.attendanceBar, width: `${student.attendance}%`, background: student.attendance >= 75 ? "#10b981" : "#ef4444" }} />
                          <span style={{ color: student.attendance >= 75 ? "#4ade80" : "#f87171", fontSize: 13, fontWeight: 600 }}>
                            {student.attendance}%
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <div style={s.tableActions}>
                          <ActionBtn icon={Eye} onClick={() => navigate(`/faculty/students/${student.id}`)} />
                          <ActionBtn icon={UserCheck} onClick={() => navigate(`/faculty/attendance/student/${student.id}`)} />
                          <ActionBtn icon={MessageCircle} onClick={() => navigate(`/faculty/messages/send?student=${student.id}`)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    );
  };

  const renderAttendance = () => (
    <div>
      <SectionHeader icon={UserCheck} title="Attendance Analytics" />
      {sectionLoading ? <div style={s.loadingSection}><Spinner size={28} /></div> :
        !attendanceStats || attendanceStats.length === 0 ? (
          <EmptyState icon={BarChart2} title="No attendance data" subtitle="Attendance statistics will appear here once you start marking attendance" />
        ) : (
          <div style={s.chartsRow}>
            <div style={{ ...s.chartCard, flex: 1 }}>
              <div style={s.chartHeader}>
                <h3 style={s.chartTitle}>Weekly Attendance %</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={attendanceStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
    </div>
  );

  // ── Modal ────────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!showModal) return null;
    const labels = { assignment: "Assignment", notice: "Notice", test: "Test" };

    return (
      <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
        <div style={s.modal} onClick={(e) => e.stopPropagation()}>
          <div style={s.modalHeader}>
            <h3 style={s.modalTitle}>{editingItem ? "Edit" : "Create"} {labels[modalType]}</h3>
            <button style={s.modalClose} onClick={() => setShowModal(false)}><X size={18} /></button>
          </div>

          <div style={s.modalBody}>
            {modalType === "assignment" && (
              <>
                <Field label="Title" error={formErrors.title}>
                  <input style={formErrors.title ? { ...s.input, ...s.inputError } : s.input} placeholder="e.g. Chapter 3 Exercise" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </Field>
                <Field label="Description">
                  <textarea style={{ ...s.input, ...s.textarea }} placeholder="Describe the assignment…" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </Field>
                <div style={s.formRow}>
                  <Field label="Due Date" error={formErrors.due_date}>
                    <input type="date" style={formErrors.due_date ? { ...s.input, ...s.inputError } : s.input} value={formData.due_date || ""} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
                  </Field>
                  <Field label="Total Marks" error={formErrors.total_marks}>
                    <input type="number" style={formErrors.total_marks ? { ...s.input, ...s.inputError } : s.input} placeholder="100" value={formData.total_marks || ""} onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })} />
                  </Field>
                </div>
                <Field label="Course" error={formErrors.course_code}>
                  <select style={formErrors.course_code ? { ...s.input, ...s.inputError } : s.input} value={formData.course_code || ""} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}>
                    <option value="">Select Course</option>
                    {facultyData?.courses?.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </Field>
              </>
            )}

            {modalType === "notice" && (
              <>
                <Field label="Title" error={formErrors.title}>
                  <input style={formErrors.title ? { ...s.input, ...s.inputError } : s.input} placeholder="Notice title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </Field>
                <Field label="Content" error={formErrors.content}>
                  <textarea style={formErrors.content ? { ...s.input, ...s.textarea, ...s.inputError } : { ...s.input, ...s.textarea }} placeholder="Write the notice content…" value={formData.content || ""} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                </Field>
                <Field label="Target Audience">
                  <select style={s.input} value={formData.target_audience || "all"} onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}>
                    <option value="all">All Students</option>
                    <option value="cs">Computer Science</option>
                    <option value="it">Information Technology</option>
                  </select>
                </Field>
              </>
            )}

            {modalType === "test" && (
              <>
                <Field label="Test Title" error={formErrors.title}>
                  <input style={formErrors.title ? { ...s.input, ...s.inputError } : s.input} placeholder="e.g. Mid-Semester Exam" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </Field>
                <div style={s.formRow}>
                  <Field label="Test Date" error={formErrors.test_date}>
                    <input type="date" style={formErrors.test_date ? { ...s.input, ...s.inputError } : s.input} value={formData.test_date || ""} onChange={(e) => setFormData({ ...formData, test_date: e.target.value })} />
                  </Field>
                  <Field label="Duration (min)" error={formErrors.duration}>
                    <input type="number" style={formErrors.duration ? { ...s.input, ...s.inputError } : s.input} placeholder="60" value={formData.duration || ""} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                  </Field>
                </div>
                <Field label="Total Marks" error={formErrors.total_marks}>
                  <input type="number" style={formErrors.total_marks ? { ...s.input, ...s.inputError } : s.input} placeholder="100" value={formData.total_marks || ""} onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })} />
                </Field>
              </>
            )}
          </div>

          <div style={s.modalFooter}>
            <button style={s.btnSecondary} onClick={() => setShowModal(false)}>Cancel</button>
            <button style={s.btnPrimary} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Spinner size={14} /><span style={{ marginLeft: 8 }}>Saving…</span></> : editingItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR NAV
  // ─────────────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "overview", icon: TrendingUp, label: "Overview" },
    { id: "today-classes", icon: Calendar, label: "Today's Classes" },
    { id: "attendance", icon: UserCheck, label: "Attendance" },
    { id: "assignments", icon: FileText, label: "Assignments" },
    { id: "tests", icon: ClipboardList, label: "Tests & Exams" },
    { id: "notices", icon: Bell, label: "Notices" },
    { id: "students", icon: Users, label: "Students" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
  ];

  if (initialLoading) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.loadingContent}>
          <GraduationCap size={40} color="#3b82f6" />
          <p style={{ color: "#94a3b8", marginTop: 16, fontFamily: "Georgia, serif" }}>Loading faculty portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <style>{globalStyles}</style>
      <ToastContainer toasts={toasts} remove={removeToast} />
      <ConfirmDialog
        open={confirmDialog.open}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false })}
      />
      {renderModal()}
      {renderAttendanceModal()}

      {/* ── Sidebar ── */}
      <aside style={{ ...s.sidebar, width: sidebarOpen ? 240 : 64 }}>
        <div style={s.sidebarLogo}>
          <GraduationCap size={24} color="#3b82f6" />
          {sidebarOpen && <span style={s.logoText}>Faculty Portal</span>}
        </div>

        <nav style={s.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              style={{ ...s.navItem, ...(activeSection === item.id ? s.navItemActive : {}) }}
              onClick={() => setActiveSection(item.id)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={18} />
              {sidebarOpen && <span style={s.navLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <button style={s.navItem} onClick={() => navigate("/faculty/settings")} title={!sidebarOpen ? "Settings" : undefined}>
            <Settings size={18} />
            {sidebarOpen && <span style={s.navLabel}>Settings</span>}
          </button>
          <button style={{ ...s.navItem, color: "#ef4444" }} onClick={handleLogout} title={!sidebarOpen ? "Logout" : undefined}>
            <LogOut size={18} />
            {sidebarOpen && <span style={s.navLabel}>Logout</span>}
          </button>
        </div>

        <button style={s.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <ChevronRight size={16} style={{ transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>
        <header style={s.topbar}>
          <div>
            <h2 style={s.welcomeText}>
              Welcome back, <span style={{ color: "#3b82f6" }}>{facultyData?.name?.split(" ")[0] || "Faculty"}</span>
            </h2>
            <p style={s.welcomeSub}>{facultyData?.designation} · {facultyData?.department}</p>
          </div>
          <div style={s.topbarRight}>
            <button style={s.iconBtn} onClick={() => setActiveSection("notices")} title="Notifications">
              <Bell size={18} />
              {notificationCount > 0 && <span style={s.notifDot}>{notificationCount}</span>}
            </button>
            <div style={s.userAvatar}>{facultyData?.name?.charAt(0) || "F"}</div>
          </div>
        </header>

        <div style={s.contentWrapper}>
          {activeSection === "overview" && renderOverview()}
          {activeSection === "today-classes" && renderTodayClasses()}
          {activeSection === "attendance" && renderAttendance()}
          {activeSection === "assignments" && renderAssignments()}
          {activeSection === "tests" && renderTests()}
          {activeSection === "notices" && renderNotices()}
          {activeSection === "students" && renderStudents()}
          {activeSection === "messages" && (
            <EmptyState icon={MessageCircle} title="Messages" subtitle="Navigate to send messages to students" action={{ label: "Open Messages", onClick: () => navigate("/faculty/messages") }} />
          )}
        </div>
      </main>
    </div>
  );
};

// ─── Small helper components ─────────────────────────────────────────────────
const ActionBtn = ({ icon: Icon, label, onClick, danger }) => (
  <button
    style={{ ...s.actionBtn, ...(danger ? s.actionBtnDanger : {}) }}
    onClick={onClick}
    title={label}
  >
    <Icon size={14} />
    {label && <span style={{ marginLeft: 4 }}>{label}</span>}
  </button>
);

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={s.searchWrap}>
    <Search size={16} color="#475569" style={s.searchIcon} />
    <input
      style={s.searchInput}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button style={s.searchClear} onClick={() => onChange("")}><X size={14} /></button>
    )}
  </div>
);

const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={s.fieldLabel}>{label}</label>
    {children}
    {error && <p style={s.fieldError}><AlertCircle size={12} style={{ marginRight: 4 }} />{error}</p>}
  </div>
);

// ─── Styles ──────────────────────────────────────────────────────────────────
const globalStyles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes slideIn { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #020817; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
`;

const s = {
  root: { display: "flex", minHeight: "100vh", background: "#020817", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0" },
  loadingScreen: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#020817" },
  loadingContent: { textAlign: "center" },
  loadingSection: { display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#475569" },

  // Sidebar
  sidebar: { position: "fixed", top: 0, left: 0, height: "100vh", background: "#0a0f1e", borderRight: "1px solid #0f172a", display: "flex", flexDirection: "column", transition: "width 0.25s ease", zIndex: 100, overflow: "hidden" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "20px 16px", borderBottom: "1px solid #0f172a", minHeight: 64 },
  logoText: { fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", whiteSpace: "nowrap" },
  nav: { flex: 1, padding: "12px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 8, border: "none", background: "transparent", color: "#64748b", cursor: "pointer", transition: "all 0.15s", fontSize: 14, fontWeight: 500, width: "100%", textAlign: "left", position: "relative", whiteSpace: "nowrap" },
  navItemActive: { background: "#1e3a5f", color: "#60a5fa" },
  navLabel: { flex: 1 },
  notifBadge: { background: "#3b82f6", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "1px 6px", minWidth: 18, textAlign: "center" },
  sidebarBottom: { padding: "12px 8px", borderTop: "1px solid #0f172a", display: "flex", flexDirection: "column", gap: 2 },
  sidebarToggle: { position: "absolute", top: "50%", right: -12, transform: "translateY(-50%)", width: 24, height: 24, borderRadius: "50%", border: "1px solid #1e293b", background: "#0a0f1e", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

  // Main
  main: { marginLeft: 240, flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.25s ease", minWidth: 0 },
  topbar: { position: "sticky", top: 0, zIndex: 50, background: "rgba(2,8,23,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #0f172a", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 64 },
  welcomeText: { fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", color: "#e2e8f0" },
  welcomeSub: { fontSize: 12, color: "#475569", marginTop: 2 },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  iconBtn: { position: "relative", background: "#0f172a", border: "1px solid #1e293b", color: "#64748b", width: 36, height: 36, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 99, padding: "1px 5px", minWidth: 16, textAlign: "center" },
  userAvatar: { width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#fff" },
  contentWrapper: { padding: 28, flex: 1 },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 },
  statCard: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" },
  statIconWrap: { width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statInfo: { flex: 1 },
  statLabel: { fontSize: 12, color: "#475569", fontWeight: 500, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 800, color: "#f1f5f9", fontFamily: "Georgia, serif" },
  statAccent: { position: "absolute", top: 0, right: 0, width: 3, height: "100%", opacity: 0.6 },

  // Charts
  chartsRow: { display: "flex", gap: 16, marginBottom: 24 },
  chartCard: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 12, padding: 20 },
  chartHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  chartTitle: { fontSize: 15, fontWeight: 700, color: "#e2e8f0", fontFamily: "Georgia, serif" },
  chartSubtitle: { fontSize: 12, color: "#475569" },
  chartTooltip: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px" },
  quickSummary: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 },
  summaryRow: { display: "flex", alignItems: "center", gap: 10 },
  summaryDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  summaryLabel: { flex: 1, fontSize: 13, color: "#94a3b8" },
  summaryValue: { fontSize: 18, fontWeight: 800, fontFamily: "Georgia, serif" },
  divider: { height: 1, background: "#0f172a", margin: "16px 0" },
  facultyDetails: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 },
  facultySubdetails: { fontSize: 12, color: "#475569" },

  // Section
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  sectionTitle: { display: "flex", alignItems: "center", gap: 10 },
  sectionIcon: { width: 36, height: 36, borderRadius: 8, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" },
  sectionTitleText: { fontSize: 18, fontWeight: 700, fontFamily: "Georgia, serif", color: "#e2e8f0" },

  // Buttons
  btnPrimary: { display: "inline-flex", alignItems: "center", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", gap: 6, transition: "opacity 0.15s", whiteSpace: "nowrap" },
  btnSuccess: { display: "inline-flex", alignItems: "center", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", gap: 6 },
  btnSecondary: { display: "inline-flex", alignItems: "center", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", gap: 6 },
  btnOutline: { display: "inline-flex", alignItems: "center", background: "transparent", color: "#60a5fa", border: "1px solid #1e3a5f", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", gap: 5 },
  btnDanger: { display: "inline-flex", alignItems: "center", background: "#450a0a", color: "#f87171", border: "1px solid #7f1d1d", borderRadius: 8, padding: "7px 10px", fontSize: 12, cursor: "pointer" },
  actionBtn: { display: "inline-flex", alignItems: "center", background: "#0f172a", color: "#94a3b8", border: "1px solid #1e293b", borderRadius: 6, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer", gap: 4, transition: "all 0.15s" },
  actionBtnDanger: { background: "#450a0a", color: "#f87171", borderColor: "#7f1d1d" },

  // Classes
  classesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 },
  classCard: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14 },
  classCardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  classSubject: { fontSize: 16, fontWeight: 700, color: "#e2e8f0", fontFamily: "Georgia, serif" },
  classMeta: { fontSize: 12, color: "#475569", marginTop: 4 },
  classDetails: { display: "flex", flexDirection: "column", gap: 6 },
  classDetail: { display: "flex", alignItems: "center", fontSize: 13, color: "#64748b" },

  // List cards
  listStack: { display: "flex", flexDirection: "column", gap: 10 },
  listCard: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 12, padding: 18, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  listCardLeft: { display: "flex", gap: 14, flex: 1, minWidth: 0 },
  listCardIcon: { width: 40, height: 40, borderRadius: 8, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  listCardTitle: { fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 4, fontFamily: "Georgia, serif" },
  listCardDesc: { fontSize: 13, color: "#64748b", marginBottom: 8, lineHeight: 1.5 },
  listMeta: { display: "flex", gap: 8, flexWrap: "wrap" },
  metaPill: { display: "inline-flex", alignItems: "center", background: "#0f172a", color: "#64748b", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 500 },
  listCardActions: { display: "flex", gap: 6, flexShrink: 0, flexDirection: "column", alignItems: "flex-end" },
  noticeTopRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  noticeDate: { fontSize: 11, color: "#475569" },

  // Tests
  testsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 },
  testCard: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 14 },
  testCardHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  testCardTitle: { fontSize: 15, fontWeight: 700, color: "#e2e8f0", fontFamily: "Georgia, serif" },
  testMeta: { display: "flex", flexDirection: "column", gap: 8 },
  testMetaRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" },
  testActions: { display: "flex", gap: 8, marginTop: 4 },

  // Table
  tableWrapper: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 12, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #0f172a", background: "#050a14" },
  tr: { borderBottom: "1px solid #0a0f1e", transition: "background 0.1s" },
  trEven: { background: "#050c1a" },
  td: { padding: "12px 16px", fontSize: 13, color: "#94a3b8", verticalAlign: "middle" },
  rollNo: { fontFamily: "monospace", background: "#0f172a", padding: "2px 8px", borderRadius: 4, fontSize: 12, color: "#60a5fa" },
  studentName: { display: "flex", alignItems: "center", gap: 10, color: "#e2e8f0", fontWeight: 500 },
  avatar: { width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 },
  attendanceCell: { display: "flex", alignItems: "center", gap: 8 },
  attendanceBar: { height: 4, borderRadius: 2, background: "#10b981", minWidth: 4, maxWidth: 60 },
  tableActions: { display: "flex", gap: 6 },

  // Attendance Modal specific styles
  attendanceSummary: { background: "#0f172a", borderRadius: 10, padding: 16, marginBottom: 20 },
  summaryStats: { display: "flex", gap: 24, marginBottom: 16 },
  summaryStat: { display: "flex", gap: 8, alignItems: "center", fontSize: 14 },
  bulkActions: { display: "flex", gap: 12 },
  studentsTableWrapper: { maxHeight: 400, overflow: "auto", borderRadius: 10 },
  attendanceTable: { width: "100%", borderCollapse: "collapse" },
  studentNameCell: { display: "flex", alignItems: "center", gap: 10 },
  avatarSmall: { width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" },
  statusButtons: { display: "flex", gap: 10 },
  statusBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", transition: "all 0.15s" },
  statusBtnActive: { transform: "scale(1.02)" },

  // Badge
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, textTransform: "capitalize" },

  // Search
  searchWrap: { position: "relative", marginBottom: 16 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" },
  searchInput: { width: "100%", background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px 10px 38px", fontSize: 13, color: "#e2e8f0", outline: "none" },
  searchClear: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#475569", cursor: "pointer", display: "flex" },

  // Modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 },
  modal: { background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", display: "flex", flexDirection: "column", animation: "slideIn 0.2s ease" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #0f172a" },
  modalTitle: { fontSize: 17, fontWeight: 700, color: "#e2e8f0", fontFamily: "Georgia, serif" },
  modalClose: { background: "#1e293b", border: "none", color: "#64748b", width: 30, height: 30, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  modalBody: { padding: "20px 24px", overflowY: "auto", flex: 1 },
  modalFooter: { display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid #0f172a", justifyContent: "flex-end" },

  // Form
  formRow: { display: "flex", gap: 12 },
  fieldLabel: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" },
  fieldError: { display: "flex", alignItems: "center", color: "#f87171", fontSize: 11, marginTop: 5 },
  input: { width: "100%", background: "#050a14", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#e2e8f0", outline: "none", fontFamily: "inherit", transition: "border 0.15s" },
  inputError: { borderColor: "#ef4444" },
  textarea: { resize: "vertical", minHeight: 90 },

  // Empty state
  emptyState: { textAlign: "center", padding: "60px 24px" },
  emptyIcon: { width: 64, height: 64, background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  emptyTitle: { fontSize: 17, fontWeight: 700, color: "#475569", marginBottom: 8, fontFamily: "Georgia, serif" },
  emptySubtitle: { fontSize: 13, color: "#334155", marginBottom: 20 },

  // Toast
  toastContainer: { position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 },
  toast: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, animation: "slideIn 0.2s ease", backdropFilter: "blur(8px)" },
  toast_success: { background: "#052e16", border: "1px solid #166534", color: "#4ade80" },
  toast_error: { background: "#450a0a", border: "1px solid #7f1d1d", color: "#f87171" },
  toast_info: { background: "#0f172a", border: "1px solid #1e293b", color: "#94a3b8" },
  toastClose: { background: "transparent", border: "none", cursor: "pointer", color: "inherit", fontSize: 16, lineHeight: 1 },
};

export default FacultyDashboard;