import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  Calendar, Clock, Users, BookOpen, UserPlus, Trash2, Edit, 
  Plus, X, Search, Download, Filter, AlertCircle, CheckCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";
import "./schedule.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminClassSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Data states
  const [schedules, setSchedules] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [branches] = useState(["B.Tech", "BBA", "BCA", "MCA"]);
  const [sections] = useState(["A", "B", "C", "D"]);
  const [subjects] = useState(["DBMS", "OS", "CN", "DSA", "AI", "ML", "Web Dev", "Python"]);
  
  // UI States
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("timetable");
  
  // Form data matching your faculty_class table
  const [formData, setFormData] = useState({
    faculty_id: "",
    branch: "",
    section: "",
    semester: "",
    subject: "",
    day: "Monday",
    start_time: "09:00:00",
    end_time: "10:30:00"
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = [
    "09:00:00", "10:30:00", "12:00:00", "13:30:00", "15:00:00", "16:30:00"
  ];

  // Fetch schedules from your backend
  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/faculty-schedules`, {
        withCredentials: true
      });
      setSchedules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setSchedules([]);
      setError("Failed to load class schedules");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch faculties using your existing getAllFaculty endpoint
  const fetchFaculties = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/faculties/list`, {
        withCredentials: true
      });
      const facultyData = Array.isArray(response.data) ? response.data : 
                         (response.data?.data || []);
      setFaculties(facultyData);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      setFaculties([]);
      setError("Failed to fetch faculty list");
      setTimeout(() => setError(null), 3000);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchFaculties();
  }, [fetchSchedules, fetchFaculties]);

  // Create new schedule
  const createSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/api/admin/faculty-classes`, scheduleData, {
        withCredentials: true
      });
      
      if (response.data) {
        await fetchSchedules();
        handleCloseModal();
        setSuccess("Class schedule created successfully!");
        setTimeout(() => setSuccess(null), 3000);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      setError(error.response?.data?.message || "Failed to create schedule");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Update existing schedule
  const updateSchedule = async (id, scheduleData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE}/api/admin/faculty-classes/${id}`, scheduleData, {
        withCredentials: true
      });
      
      if (response.data) {
        await fetchSchedules();
        handleCloseModal();
        setSuccess("Class schedule updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      setError(error.response?.data?.message || "Failed to update schedule");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Delete schedule
  const deleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class schedule?")) return;
    
    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/api/admin/faculty-classes/${id}`, {
        withCredentials: true
      });
      
      await fetchSchedules();
      setSuccess("Class schedule deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setError("Failed to delete schedule");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Close modal function
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Open modal for create
  const handleOpenCreateModal = () => {
    resetForm();
    setEditingSchedule(null);
    setShowModal(true);
  };

  // Handle edit
  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      faculty_id: schedule.faculty_id,
      branch: schedule.branch,
      section: schedule.section,
      semester: schedule.semester,
      subject: schedule.subject,
      day: schedule.day,
      start_time: schedule.start_time,
      end_time: schedule.end_time
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.faculty_id || !formData.branch || !formData.section || 
        !formData.semester || !formData.subject || !formData.day || 
        !formData.start_time || !formData.end_time) {
      setError("Please fill all required fields");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check for faculty conflict
    const hasConflict = schedules.some(schedule => 
      schedule.faculty_id === parseInt(formData.faculty_id) &&
      schedule.day === formData.day &&
      schedule.start_time === formData.start_time &&
      (editingSchedule ? schedule.id !== editingSchedule.id : true)
    );
    
    if (hasConflict) {
      const confirm = window.confirm(
        "⚠️ Warning: This faculty member already has a class at this time!\n\nDo you want to continue anyway?"
      );
      if (!confirm) return;
    }
    
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, formData);
    } else {
      await createSchedule(formData);
    }
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({
      faculty_id: "",
      branch: "",
      section: "",
      semester: "",
      subject: "",
      day: "Monday",
      start_time: "09:00:00",
      end_time: "10:30:00"
    });
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : "Unknown";
  };

  const getFacultyDetails = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty;
  };

  // Filter schedules
  const filteredSchedules = Array.isArray(schedules) ? schedules.filter(schedule => {
    if (!schedule) return false;
    if (selectedBranch !== "all" && schedule.branch !== selectedBranch) return false;
    if (selectedSemester !== "all" && schedule.semester?.toString() !== selectedSemester.toString()) return false;
    if (searchTerm && !schedule.subject?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !getFacultyName(schedule.faculty_id).toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }) : [];

  // Group schedules by day and time for timetable
  const getSchedulesByDayAndTime = (day, time) => {
    return filteredSchedules.filter(schedule => 
      schedule.day === day && schedule.start_time === time
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Faculty Name", "Faculty ID", "Department", "Branch", "Section", "Semester", "Subject", "Day", "Start Time", "End Time"];
    const csvData = filteredSchedules.map(s => {
      const faculty = getFacultyDetails(s.faculty_id);
      return [
        faculty?.name || "Unknown",
        faculty?.faculty_id || "N/A",
        faculty?.department || "N/A",
        s.branch,
        s.section,
        s.semester,
        s.subject,
        s.day,
        s.start_time,
        s.end_time
      ];
    });
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `class_schedule_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccess("Schedule exported successfully!");
    setTimeout(() => setSuccess(null), 2000);
  };

  // Get faculty workload stats
  const getFacultyWorkload = (facultyId) => {
    return schedules.filter(s => s.faculty_id === facultyId).length;
  };

  // Render Weekly Timetable
  const renderTimetableView = () => (
    <div className="timetable-container">
      <div className="timetable-controls">
        <div className="filter-group">
          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          
          <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
            <option value="all">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by subject or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn-secondary" onClick={exportToCSV}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="timetable">
        <table>
          <thead>
            <tr>
              <th>Time / Day</th>
              {weekDays.map(day => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td className="time-column">{time.substring(0, 5)}</td>
                {weekDays.map(day => {
                  const classes = getSchedulesByDayAndTime(day, time);
                  return (
                    <td key={`${day}-${time}`} className={classes.length > 0 ? "has-class" : ""}>
                      {classes.map((cls, idx) => (
                        <div key={cls?.id || idx} className="class-info">
                          <strong>{cls?.subject || 'Unknown'}</strong>
                          <small>{cls?.branch} - Sem {cls?.semester} - Sec {cls?.section}</small>
                          <small className="faculty-name">👨‍🏫 {getFacultyName(cls?.faculty_id)}</small>
                          <div className="class-actions-mini">
                            <button onClick={() => handleEdit(cls)} title="Edit">
                              <Edit size={12} />
                            </button>
                            <button onClick={() => deleteSchedule(cls?.id)} title="Delete">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="list-view">
      <div className="list-header">
        <h3>📋 All Class Schedules</h3>
        <div className="stats-badge">
          Total Classes: {filteredSchedules.length}
        </div>
      </div>
      
      <div className="schedules-list">
        {filteredSchedules.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No class schedules found</p>
            <button className="btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={16} /> Create First Schedule
            </button>
          </div>
        ) : (
          filteredSchedules.map(schedule => {
            const faculty = getFacultyDetails(schedule.faculty_id);
            return (
              <div key={schedule.id} className="schedule-card">
                <div className="schedule-header">
                  <div className="subject-info">
                    <h4>{schedule.subject}</h4>
                    <span className="badge">{schedule.branch} - Sem {schedule.semester}</span>
                    <span className="badge-secondary">Sec {schedule.section}</span>
                  </div>
                  <div className="schedule-actions">
                    <button onClick={() => handleEdit(schedule)} className="icon-btn" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => deleteSchedule(schedule.id)} className="icon-btn danger" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="schedule-details">
                  <div className="detail-item">
                    <label>👨‍🏫 Faculty</label>
                    <span>{faculty?.name || "Unknown"}</span>
                    <small>{faculty?.department} - {faculty?.designation}</small>
                  </div>
                  
                  <div className="detail-item">
                    <label>📅 Schedule</label>
                    <span>{schedule.day}</span>
                    <small>{schedule.start_time?.substring(0,5)} - {schedule.end_time?.substring(0,5)}</small>
                  </div>
                  
                  <div className="detail-item">
                    <label>📚 Class Info</label>
                    <span>{schedule.branch}</span>
                    <small>Semester {schedule.semester} • Section {schedule.section}</small>
                  </div>
                  
                  <div className="detail-item">
                    <label>🆔 Faculty ID</label>
                    <span>{faculty?.faculty_id || "N/A"}</span>
                    <small>{faculty?.email || "No email"}</small>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Render Faculty Stats
  const renderFacultyStats = () => (
    <div className="faculty-stats">
      <h4>📊 Faculty Workload</h4>
      <div className="stats-grid">
        {faculties.map(faculty => {
          const workload = getFacultyWorkload(faculty.id);
          return (
            <div key={faculty.id} className="faculty-stat-card">
              <div className="faculty-avatar">
                {faculty.name?.charAt(0)}
              </div>
              <div className="faculty-info">
                <strong>{faculty.name}</strong>
                <small>{faculty.department}</small>
                <span className={`workload-badge ${workload > 5 ? 'heavy' : workload > 3 ? 'medium' : 'light'}`}>
                  {workload} Classes
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Modal Form - Make sure this is defined before being called
  const renderModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{editingSchedule ? "✏️ Edit Class Schedule" : "➕ Create New Class Schedule"}</h3>
            <button onClick={handleCloseModal} className="close-btn" type="button">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Faculty *</label>
                <select
                  required
                  value={formData.faculty_id}
                  onChange={(e) => setFormData({...formData, faculty_id: parseInt(e.target.value)})}
                >
                  <option value="">-- Select Faculty Member --</option>
                  {faculties.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} - {faculty.department} ({faculty.designation}) - ID: {faculty.faculty_id}
                    </option>
                  ))}
                </select>
                {formData.faculty_id && (
                  <small className="helper-text">
                    Workload: {getFacultyWorkload(formData.faculty_id)} classes assigned
                  </small>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Branch *</label>
                  <select
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Section *</label>
                  <select
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  >
                    <option value="">Select Section</option>
                    {sections.map(section => (
                      <option key={section} value={section}>Section {section}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Day *</label>
                  <select
                    required
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                  >
                    {weekDays.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time?.substring(0,5)}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value + ":00"})}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time?.substring(0,5)}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value + ":00"})}
                  />
                </div>
              </div>

              {/* Conflict Warning */}
              {formData.faculty_id && formData.day && formData.start_time && (
                schedules.some(s => 
                  s.faculty_id === formData.faculty_id && 
                  s.day === formData.day && 
                  s.start_time === formData.start_time &&
                  (editingSchedule ? s.id !== editingSchedule.id : true)
                ) && (
                  <div className="warning-box">
                    <AlertCircle size={16} />
                    <div>
                      <strong>⚠️ Schedule Conflict!</strong>
                      <p>This faculty member already has a class at this time slot.</p>
                    </div>
                  </div>
                )
              )}
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : (editingSchedule ? "Update Schedule" : "Create Schedule")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main return
  return (
    <div className="admin-schedule-container">
      {error && (
        <div className="toast error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="toast success">
          <CheckCircle size={18} />
          {success}
        </div>
      )}
      
      <div className="page-header">
        <div>
          <h1>📅 Class Schedule Management</h1>
          <p>Create and manage class schedules, assign faculty to classes</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} /> Assign Faculty to Class
        </button>
      </div>

      <div className="view-toggle">
        <button 
          className={viewMode === "timetable" ? "active" : ""}
          onClick={() => setViewMode("timetable")}
        >
          📅 Weekly Timetable
        </button>
        <button 
          className={viewMode === "list" ? "active" : ""}
          onClick={() => setViewMode("list")}
        >
          📋 List View
        </button>
        <button 
          className={viewMode === "stats" ? "active" : ""}
          onClick={() => setViewMode("stats")}
        >
          📊 Faculty Workload
        </button>
      </div>

      {viewMode === "timetable" && renderTimetableView()}
      {viewMode === "list" && renderListView()}
      {viewMode === "stats" && renderFacultyStats()}
      {renderModal()}
    </div>
  );
};

export default AdminClassSchedule;