import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:5000";

const api = axios.create({ baseURL: API, withCredentials: true });

// ─── Constants ────────────────────────────────────────────────────────────────
const BRANCHES = ["B.Tech", "M.Tech", "MCA", "MBA", "BBA", "MCS", "BCS", "BCom", "PhD"];
const SECTIONS = ["A", "B", "C", "D", "E"];
const DESIGNATIONS = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "HOD", "Dean"];
const EMPTY_FORM = {
  facultyId: "", name: "", email: "", phone: "",
  department: "", designation: "",
  classes: [{ branch: "", section: "" }],
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);
  return { toasts, push };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = "") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const branchColor = (branch) => {
  const map = {
    "B.Tech": "#3b82f6", "M.Tech": "#8b5cf6", "MCA": "#10b981",
    "MBA": "#f59e0b", "BBA": "#ef4444", "MCS": "#06b6d4",
    "BCS": "#ec4899", "BCom": "#84cc16", "PhD": "#f97316",
  };
  return map[branch] || "#6366f1";
};

const sectionColor = (sec) => {
  const map = { A: "#3b82f6", B: "#10b981", C: "#f59e0b", D: "#ef4444", E: "#8b5cf6" };
  return map[sec] || "#64748b";
};

const validate = (form) => {
  const errs = {};
  if (!form.facultyId.trim()) errs.facultyId = "Required";
  if (!form.name.trim()) errs.name = "Required";
  if (!form.email.trim()) errs.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
  if (!form.department.trim()) errs.department = "Required";
  form.classes.forEach((cls, i) => {
    if (!cls.branch) errs[`class_branch_${i}`] = "Select branch";
    if (!cls.section) errs[`class_section_${i}`] = "Select section";
  });
  return errs;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Field = ({ label, error, required, children, half }) => (
  <div style={{ ...st.field, ...(half ? st.fieldHalf : {}) }}>
    <label style={st.label}>
      {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && (
      <span style={st.fieldErr}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        {error}
      </span>
    )}
  </div>
);

const Inp = ({ error, ...props }) => (
  <input style={{ ...st.input, ...(error ? st.inputErr : {}) }} {...props} />
);

const Sel = ({ error, children, ...props }) => (
  <select style={{ ...st.input, ...st.select, ...(error ? st.inputErr : {}) }} {...props}>{children}</select>
);

const StatusBadge = ({ type, children }) => {
  const colors = {
    success: { bg: "#052e16", border: "#166534", color: "#4ade80" },
    error: { bg: "#450a0a", border: "#7f1d1d", color: "#f87171" },
    warning: { bg: "#431407", border: "#9a3412", color: "#fb923c" },
    info: { bg: "#0c1a35", border: "#1e3a5f", color: "#60a5fa" },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, borderRadius: 10, padding: "12px 16px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "flex-start", gap: 10 }}>
      {children}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminFaculty() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [fetchingList, setFetchingList] = useState(true);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("add"); // "add" | "list"
  const [expandedFaculty, setExpandedFaculty] = useState(null);
  const fileRef = useRef();
  const formRef = useRef();
  const { toasts, push } = useToast();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchFaculty = useCallback(async () => {
    setFetchingList(true);
    try {
      const res = await api.get("/api/admin/faculty");
      setFacultyList(res.data || []);
    } catch {
      push("Failed to load faculty list", "error");
    } finally {
      setFetchingList(false);
    }
  }, []);

  useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => { const n = { ...p }; delete n[e.target.name]; return n; });
  };

  const handleClassChange = (idx, field, val) => {
    const cls = [...form.classes];
    cls[idx] = { ...cls[idx], [field]: val };
    setForm(p => ({ ...p, classes: cls }));
    const key = `class_${field}_${idx}`;
    if (errors[key]) setErrors(p => { const n = { ...p }; delete n[key]; return n; });
  };

  const addClass = () => setForm(p => ({ ...p, classes: [...p.classes, { branch: "", section: "" }] }));

  const removeClass = (idx) => setForm(p => ({ ...p, classes: p.classes.filter((_, i) => i !== idx) }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { push("Image must be under 3MB", "warning"); return; }
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setImage(null);
    setImagePreview(null);
    setErrors({});
    setCredentials(null);
    setEditMode(false);
    setEditId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const loadForEdit = (faculty) => {
    setForm({
      facultyId: faculty.faculty_id || "",
      name: faculty.name || "",
      email: faculty.email || "",
      phone: faculty.phone || "",
      department: faculty.department || "",
      designation: faculty.designation || "",
      classes: faculty.classes?.length ? faculty.classes : [{ branch: "", section: "" }],
    });
    setImagePreview(faculty.profile_pic_url ? `${API}/${faculty.profile_pic_url}` : null);
    setEditMode(true);
    setEditId(faculty.id);
    setCredentials(null);
    setActiveTab("add");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const submit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); push("Please fix the errors below", "error"); return; }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "classes") data.append(k, JSON.stringify(v));
      else data.append(k, v);
    });
    if (image) data.append("profilePic", image);

    try {
      setLoading(true);
      let res;
      if (editMode) {
        res = await api.put(`/api/admin/faculty/${editId}`, data);
        push("Faculty updated successfully", "success");
      } else {
        res = await api.post("/api/admin/faculty/add", data);
        setCredentials(res.data.faculty);
        push("Faculty added successfully", "success");
      }
      resetForm();
      fetchFaculty();
    } catch (err) {
      push(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/faculty/${deleteConfirm.id}`);
      push("Faculty removed", "success");
      fetchFaculty();
    } catch {
      push("Failed to delete faculty", "error");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = facultyList.filter(f => {
    const q = search.toLowerCase();
    return !q || f.name?.toLowerCase().includes(q) || f.faculty_id?.toLowerCase().includes(q)
      || f.department?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q);
  });

  const totalClasses = facultyList.reduce((a, f) => a + (f.classes?.length || 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={st.root}>
      <style>{globalCSS}</style>

      {/* Toast Stack */}
      <div style={st.toastStack}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...st.toast, ...st[`toast_${t.type}`] }} className="toast-in">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {t.type === "success" && "✓"}{t.type === "error" && "✕"}{t.type === "warning" && "⚠"}{t.type === "info" && "ℹ"}
              {t.msg}
            </span>
          </div>
        ))}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={st.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={st.confirmBox} onClick={e => e.stopPropagation()}>
            <div style={st.confirmIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif" }}>Remove Faculty</h3>
            <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              This will permanently remove <strong style={{ color: "#e2e8f0" }}>{deleteConfirm.name}</strong> and revoke all their class assignments. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={st.btnGhost} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={st.btnDanger} onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Removing…" : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={st.pageHeader}>
        <div>
          <div style={st.headerEyebrow}>Admin Panel</div>
          <h1 style={st.pageTitle}>Faculty Management</h1>
          <p style={st.pageSubtitle}>Add, assign and manage faculty across branches and sections</p>
        </div>
        <div style={st.headerStats}>
          <div style={st.statCard}>
            <span style={st.statVal}>{facultyList.length}</span>
            <span style={st.statLbl}>Total Faculty</span>
          </div>
          <div style={st.statCard}>
            <span style={st.statVal}>{totalClasses}</span>
            <span style={st.statLbl}>Class Assignments</span>
          </div>
          <div style={st.statCard}>
            <span style={st.statVal}>{[...new Set(facultyList.map(f => f.department).filter(Boolean))].length}</span>
            <span style={st.statLbl}>Departments</span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={st.tabBar}>
        <button style={{ ...st.tab, ...(activeTab === "add" ? st.tabActive : {}) }} onClick={() => setActiveTab("add")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          {editMode ? "Edit Faculty" : "Add Faculty"}
        </button>
        <button style={{ ...st.tab, ...(activeTab === "list" ? st.tabActive : {}) }} onClick={() => setActiveTab("list")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          All Faculty
          {facultyList.length > 0 && <span style={st.tabCount}>{facultyList.length}</span>}
        </button>
        {editMode && (
          <button style={{ ...st.tab, marginLeft: "auto", color: "#f87171" }} onClick={resetForm}>
            Cancel Edit
          </button>
        )}
      </div>

      {/* ══ ADD / EDIT FORM ═══════════════════════════════════════════════════ */}
      {activeTab === "add" && (
        <div ref={formRef} style={st.formCard}>
          {/* Profile section */}
          <div style={st.formTop}>
            <div style={st.avatarUploadWrap}>
              <div style={st.avatarCircle} onClick={() => fileRef.current?.click()}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : <div style={st.avatarPlaceholder}>
                    {form.name ? initials(form.name) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    )}
                  </div>
                }
                <div style={st.avatarOverlay}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
              </div>
              <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }} onChange={handleImage} />
              <p style={st.avatarHint}>Click to upload photo<br /><span style={{ color: "#334155" }}>Max 3MB · JPG, PNG</span></p>
            </div>

            <div style={st.formFields}>
              <div style={st.formRow}>
                <Field label="Faculty ID" required error={errors.facultyId} half>
                  <Inp name="facultyId" placeholder="e.g. FAC2024001" value={form.facultyId} onChange={handleChange} error={errors.facultyId} disabled={editMode} />
                </Field>
                <Field label="Full Name" required error={errors.name} half>
                  <Inp name="name" placeholder="Dr. First Last" value={form.name} onChange={handleChange} error={errors.name} />
                </Field>
              </div>
              <div style={st.formRow}>
                <Field label="Email Address" required error={errors.email} half>
                  <Inp name="email" type="email" placeholder="faculty@university.edu" value={form.email} onChange={handleChange} error={errors.email} />
                </Field>
                <Field label="Phone Number" half>
                  <Inp name="phone" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
                </Field>
              </div>
              <div style={st.formRow}>
                <Field label="Department" required error={errors.department} half>
                  <Inp name="department" placeholder="e.g. Computer Science" value={form.department} onChange={handleChange} error={errors.department} />
                </Field>
                <Field label="Designation" half>
                  <Sel name="designation" value={form.designation} onChange={handleChange}>
                    <option value="">Select Designation</option>
                    {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Sel>
                </Field>
              </div>
            </div>
          </div>

          {/* Class Assignments */}
          <div style={st.classSection}>
            <div style={st.classSectionHeader}>
              <div>
                <h3 style={st.classSectionTitle}>Class Assignments</h3>
                <p style={st.classSectionSub}>Assign one or more branch–section pairs to this faculty member</p>
              </div>
              <button style={st.btnAddClass} onClick={addClass} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add Class
              </button>
            </div>

            <div style={st.classGrid}>
              {form.classes.map((cls, idx) => (
                <div key={idx} style={st.classRow} className="class-row">
                  <div style={st.classIndex}>{idx + 1}</div>

                  <div style={{ flex: 1 }}>
                    <label style={st.label}>Branch *</label>
                    <Sel value={cls.branch} onChange={e => handleClassChange(idx, "branch", e.target.value)} error={errors[`class_branch_${idx}`]}>
                      <option value="">Select Branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </Sel>
                    {errors[`class_branch_${idx}`] && <span style={st.fieldErr}>{errors[`class_branch_${idx}`]}</span>}
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={st.label}>Section *</label>
                    <Sel value={cls.section} onChange={e => handleClassChange(idx, "section", e.target.value)} error={errors[`class_section_${idx}`]}>
                      <option value="">Select Section</option>
                      {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                    </Sel>
                    {errors[`class_section_${idx}`] && <span style={st.fieldErr}>{errors[`class_section_${idx}`]}</span>}
                  </div>

                  {/* Preview chip */}
                  {cls.branch && cls.section && (
                    <div style={{ alignSelf: "flex-end", marginBottom: 2 }}>
                      <span style={{ ...st.chip, background: branchColor(cls.branch) + "22", color: branchColor(cls.branch), border: `1px solid ${branchColor(cls.branch)}44` }}>
                        {cls.branch} / {cls.section}
                      </span>
                    </div>
                  )}

                  {form.classes.length > 1 && (
                    <button style={st.btnRemoveClass} onClick={() => removeClass(idx)} title="Remove" type="button">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={st.formFooter}>
            <button style={st.btnGhost} onClick={resetForm} type="button">Reset</button>
            <button style={st.btnPrimary} onClick={submit} disabled={loading} type="button">
              {loading
                ? <><span style={st.spinner} />Saving…</>
                : editMode
                  ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Update Faculty</>
                  : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Add Faculty</>
              }
            </button>
          </div>

          {/* Credentials Box */}
          {credentials && (
            <div style={st.credBox} className="cred-reveal">
              <div style={st.credHeader}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                <span>Login Credentials Generated</span>
              </div>
              <div style={st.credGrid}>
                <CredRow label="Faculty ID" value={credentials.faculty_id} />
                <CredRow label="Password" value={credentials.password} secret />
              </div>
              <div style={st.credWarning}>
                ⚠ Share these credentials securely. The faculty member must change their password on first login.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ FACULTY LIST ══════════════════════════════════════════════════════ */}
      {activeTab === "list" && (
        <div>
          {/* Search */}
          <div style={st.searchBar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input style={st.searchInput} placeholder="Search by name, ID, department, email…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 4 }} onClick={() => setSearch("")}>✕</button>}
          </div>

          {fetchingList ? (
            <div style={st.emptyState}>
              <div style={st.loadSpinner} />
              <p style={{ color: "#475569", marginTop: 16 }}>Loading faculty…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={st.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
              <h3 style={{ color: "#334155", marginTop: 16, fontFamily: "'Playfair Display', Georgia, serif" }}>{search ? "No results found" : "No faculty added yet"}</h3>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>{search ? `Try a different search term` : `Click "Add Faculty" to get started`}</p>
              {!search && <button style={{ ...st.btnPrimary, marginTop: 20 }} onClick={() => setActiveTab("add")}>Add First Faculty</button>}
            </div>
          ) : (
            <div style={st.facultyList}>
              {filtered.map(faculty => {
                const isExpanded = expandedFaculty === faculty.id;
                return (
                  <div key={faculty.id} style={{ ...st.facultyCard, ...(isExpanded ? st.facultyCardExpanded : {}) }} className="faculty-card">
                    <div style={st.facultyCardMain}>
                      {/* Avatar */}
                      <div style={st.facultyAvatar}>
                        {faculty.profile_pic_url
                          ? <img src={`${API}/${faculty.profile_pic_url}`} alt={faculty.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                          : <span style={st.facultyAvatarInitials}>{initials(faculty.name)}</span>
                        }
                        <span style={st.facultyStatusDot} />
                      </div>

                      {/* Info */}
                      <div style={st.facultyInfo}>
                        <div style={st.facultyNameRow}>
                          <h3 style={st.facultyName}>{faculty.name}</h3>
                          {faculty.designation && <span style={st.desigBadge}>{faculty.designation}</span>}
                        </div>
                        <div style={st.facultyMeta}>
                          <span style={st.metaItem}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                            {faculty.faculty_id}
                          </span>
                          <span style={st.metaItem}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                            {faculty.email}
                          </span>
                          {faculty.department && (
                            <span style={st.metaItem}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                              {faculty.department}
                            </span>
                          )}
                        </div>
                        {/* Class chips */}
                        <div style={st.classChips}>
                          {faculty.classes?.slice(0, 3).map((cls, i) => (
                            <span key={i} style={{ ...st.chip, background: branchColor(cls.branch) + "18", color: branchColor(cls.branch), border: `1px solid ${branchColor(cls.branch)}33` }}>
                              {cls.branch} · {cls.section}
                            </span>
                          ))}
                          {faculty.classes?.length > 3 && (
                            <span style={{ ...st.chip, background: "#1e293b", color: "#64748b", border: "1px solid #334155" }}>
                              +{faculty.classes.length - 3} more
                            </span>
                          )}
                          {!faculty.classes?.length && (
                            <span style={{ ...st.chip, background: "#1e293b", color: "#475569", border: "1px solid #334155" }}>No classes assigned</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={st.facultyActions}>
                        <button style={st.actionBtn} onClick={() => setExpandedFaculty(isExpanded ? null : faculty.id)} title="Details">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        <button style={st.actionBtn} onClick={() => { loadForEdit(faculty); }} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button style={{ ...st.actionBtn, ...st.actionBtnDanger }} onClick={() => setDeleteConfirm(faculty)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={st.expandedPanel} className="expand-in">
                        <div style={st.expandedGrid}>
                          <div>
                            <p style={st.expandLabel}>Phone</p>
                            <p style={st.expandValue}>{faculty.phone || "—"}</p>
                          </div>
                          <div>
                            <p style={st.expandLabel}>Designation</p>
                            <p style={st.expandValue}>{faculty.designation || "—"}</p>
                          </div>
                          <div>
                            <p style={st.expandLabel}>Total Classes</p>
                            <p style={st.expandValue}>{faculty.classes?.length || 0}</p>
                          </div>
                        </div>
                        <div>
                          <p style={{ ...st.expandLabel, marginBottom: 10 }}>All Class Assignments</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {faculty.classes?.map((cls, i) => (
                              <div key={i} style={{ ...st.assignCard, borderColor: branchColor(cls.branch) + "44" }}>
                                <div style={{ width: 3, borderRadius: 2, background: branchColor(cls.branch), alignSelf: "stretch" }} />
                                <div>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{cls.branch}</p>
                                  <p style={{ fontSize: 11, color: "#64748b" }}>Section {cls.section}</p>
                                </div>
                                <span style={{ ...st.secBadge, background: sectionColor(cls.section) + "22", color: sectionColor(cls.section) }}>{cls.section}</span>
                              </div>
                            ))}
                            {!faculty.classes?.length && <p style={{ color: "#475569", fontSize: 13 }}>No classes assigned yet.</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CredRow ──────────────────────────────────────────────────────────────────
function CredRow({ label, value, secret }) {
  const [show, setShow] = useState(!secret);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <code style={{ flex: 1, background: "#020817", border: "1px solid #1e293b", borderRadius: 6, padding: "7px 12px", fontSize: 13, color: "#a5f3fc", fontFamily: "monospace", letterSpacing: "0.04em" }}>
          {show ? value : "•".repeat(value?.length || 8)}
        </code>
        {secret && (
          <button style={st.credBtn} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
        )}
        <button style={{ ...st.credBtn, ...(copied ? { background: "#052e16", color: "#4ade80", borderColor: "#166534" } : {}) }} onClick={copy}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const st = {
  root: { minHeight: "100vh", background: "#020817", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: "#e2e8f0", padding: "32px 28px", maxWidth: 1100, margin: "0 auto" },

  // Header
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 20 },
  headerEyebrow: { fontSize: 11, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 },
  pageTitle: { fontSize: 30, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.1, marginBottom: 6 },
  pageSubtitle: { fontSize: 14, color: "#475569" },
  headerStats: { display: "flex", gap: 12 },
  statCard: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 10, padding: "12px 20px", textAlign: "center", display: "flex", flexDirection: "column", gap: 4 },
  statVal: { fontSize: 22, fontWeight: 800, color: "#f1f5f9", fontFamily: "'Playfair Display', Georgia, serif" },
  statLbl: { fontSize: 11, color: "#475569", fontWeight: 500 },

  // Tabs
  tabBar: { display: "flex", gap: 4, marginBottom: 24, background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 10, padding: 4 },
  tab: { display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 7, border: "none", background: "transparent", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" },
  tabActive: { background: "#0f172a", color: "#e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" },
  tabCount: { background: "#1e293b", color: "#64748b", borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 700 },

  // Form card
  formCard: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 16, overflow: "hidden" },
  formTop: { display: "flex", gap: 32, padding: 28, borderBottom: "1px solid #0f172a", flexWrap: "wrap" },

  // Avatar
  avatarUploadWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 120 },
  avatarCircle: { width: 100, height: 100, borderRadius: "50%", background: "#0f172a", border: "2px dashed #1e293b", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transition: "border-color 0.2s" },
  avatarPlaceholder: { display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#334155", fontFamily: "'Playfair Display', Georgia, serif", width: "100%", height: "100%" },
  avatarOverlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" },
  avatarHint: { fontSize: 11, color: "#475569", textAlign: "center", lineHeight: 1.5 },

  // Form fields
  formFields: { flex: 1, minWidth: 280 },
  formRow: { display: "flex", gap: 14, flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, flex: 1, minWidth: 200 },
  fieldHalf: { flex: "1 1 200px" },
  label: { fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em" },
  input: { background: "#050a14", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 13px", fontSize: 13, color: "#e2e8f0", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s" },
  inputErr: { borderColor: "#ef4444" },
  select: { cursor: "pointer", appearance: "none" },
  fieldErr: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#f87171", fontWeight: 500 },

  // Class section
  classSection: { padding: 28 },
  classSectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  classSectionTitle: { fontSize: 16, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Playfair Display', Georgia, serif" },
  classSectionSub: { fontSize: 12, color: "#475569", marginTop: 3 },
  classGrid: { display: "flex", flexDirection: "column", gap: 10 },
  classRow: { display: "flex", alignItems: "flex-end", gap: 12, background: "#050a14", border: "1px solid #0f172a", borderRadius: 10, padding: "14px 16px", flexWrap: "wrap" },
  classIndex: { width: 26, height: 26, borderRadius: "50%", background: "#0f172a", border: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#475569", flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 },
  btnAddClass: { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#60a5fa", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnRemoveClass: { width: 30, height: 30, borderRadius: 7, background: "#450a0a", border: "1px solid #7f1d1d", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 },
  chip: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 },

  // Form footer
  formFooter: { display: "flex", justifyContent: "flex-end", gap: 10, padding: "20px 28px", borderTop: "1px solid #0f172a" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#1d4ed8,#4f46e5)", color: "#fff", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "opacity 0.15s" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "#475569", border: "1px solid #1e293b", borderRadius: 9, padding: "11px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnDanger: { display: "inline-flex", alignItems: "center", gap: 6, background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b", borderRadius: 9, padding: "10px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  spinner: { display: "inline-block", width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" },

  // Credentials
  credBox: { margin: "0 28px 28px", background: "#051510", border: "1px solid #14532d", borderRadius: 12, overflow: "hidden" },
  credHeader: { display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderBottom: "1px solid #14532d", fontSize: 14, fontWeight: 700, color: "#4ade80" },
  credGrid: { display: "flex", flexDirection: "column", gap: 14, padding: 20 },
  credWarning: { padding: "10px 20px", background: "#431407", borderTop: "1px solid #7c2d12", fontSize: 12, color: "#fb923c" },
  credBtn: { padding: "5px 12px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, color: "#64748b", fontSize: 11, fontWeight: 600, cursor: "pointer" },

  // Search
  searchBar: { display: "flex", alignItems: "center", gap: 10, background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 10, padding: "10px 14px", marginBottom: 16 },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#e2e8f0", fontFamily: "inherit" },

  // Faculty list
  facultyList: { display: "flex", flexDirection: "column", gap: 8 },
  facultyCard: { background: "#0a0f1e", border: "1px solid #0f172a", borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" },
  facultyCardExpanded: { borderColor: "#1e3a5f" },
  facultyCardMain: { display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" },
  facultyAvatar: { width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" },
  facultyAvatarInitials: { fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', Georgia, serif" },
  facultyStatusDot: { position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#10b981", border: "2px solid #0a0f1e" },
  facultyInfo: { flex: 1, minWidth: 0 },
  facultyNameRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" },
  facultyName: { fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Playfair Display', Georgia, serif" },
  desigBadge: { fontSize: 10, fontWeight: 700, color: "#818cf8", background: "#1e1b4b", border: "1px solid #3730a3", borderRadius: 5, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.05em" },
  facultyMeta: { display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 8 },
  metaItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#475569" },
  classChips: { display: "flex", gap: 6, flexWrap: "wrap" },
  facultyActions: { display: "flex", gap: 6, flexShrink: 0 },
  actionBtn: { width: 32, height: 32, borderRadius: 7, background: "#0f172a", border: "1px solid #1e293b", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" },
  actionBtnDanger: { background: "#450a0a", borderColor: "#7f1d1d", color: "#f87171" },

  // Expanded panel
  expandedPanel: { padding: "0 20px 20px", borderTop: "1px solid #0f172a", marginTop: 0 },
  expandedGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, padding: "16px 0", marginBottom: 16 },
  expandLabel: { fontSize: 10, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 },
  expandValue: { fontSize: 14, color: "#94a3b8", fontWeight: 500 },
  assignCard: { display: "flex", alignItems: "center", gap: 10, background: "#050a14", border: "1px solid", borderRadius: 8, padding: "8px 12px", minWidth: 130 },
  secBadge: { marginLeft: "auto", padding: "2px 8px", borderRadius: 5, fontSize: 12, fontWeight: 800 },

  // Toast
  toastStack: { position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 340 },
  toast: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", animation: "slideDown 0.25s ease" },
  toast_success: { background: "#052e16", border: "1px solid #166534", color: "#4ade80" },
  toast_error: { background: "#450a0a", border: "1px solid #7f1d1d", color: "#f87171" },
  toast_warning: { background: "#431407", border: "1px solid #9a3412", color: "#fb923c" },
  toast_info: { background: "#0c1a35", border: "1px solid #1e3a5f", color: "#60a5fa" },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 },
  confirmBox: { background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 16, padding: 28, maxWidth: 420, width: "100%", textAlign: "center" },
  confirmIcon: { width: 56, height: 56, borderRadius: "50%", background: "#450a0a", border: "1px solid #7f1d1d", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },

  // Empty
  emptyState: { textAlign: "center", padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center" },
  loadSpinner: { width: 32, height: 32, borderRadius: "50%", border: "3px solid #0f172a", borderTopColor: "#3b82f6", animation: "spin 0.8s linear infinite" },
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes expandIn { from { opacity:0; transform:scaleY(0.95); } to { opacity:1; transform:scaleY(1); } }
  * { box-sizing: border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:3px; }
  input::placeholder, textarea::placeholder { color:#334155; }
  input:focus, select:focus { border-color:#3b82f6 !important; outline:none; }
  .faculty-card:hover { border-color:#1e293b !important; }
  .class-row:hover { border-color:#1e293b !important; }
  .avatarCircle:hover .avatarOverlay { opacity:1 !important; }
  .expand-in { animation: expandIn 0.2s ease; transform-origin:top; }
  .toast-in { animation: slideDown 0.25s ease; }
  .cred-reveal { animation: slideDown 0.3s ease; }
`;