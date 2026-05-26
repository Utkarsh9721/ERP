import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Calendar, Clock, BookOpen, AlertCircle, CheckCircle, XCircle, 
  ChevronLeft, ChevronRight, Download, Filter, Search, 
  Eye, Calendar as CalendarIcon, ChevronDown, RefreshCw,
  FileText, TrendingUp, Award, Target
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    summary: { percentage: 0, present: 0, absent: 0, late: 0, total: 0 },
    subjectWise: [],
    recentRecords: [],
    absentDates: [],
    monthlyStats: []
  });
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [selectedDate, setSelectedDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateAttendance, setDateAttendance] = useState(null);
  const [loadingDate, setLoadingDate] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAttendance();
  }, [selectedSubject, dateRange]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/student/attendance`, {
        withCredentials: true,
        params: {
          days: dateRange,
          subject: selectedSubject !== "all" ? selectedSubject : undefined
        }
      });
      
      if (response.data.success) {
        setAttendanceData({
          summary: {
            percentage: response.data.percentage || 0,
            present: response.data.present || 0,
            absent: response.data.absent || 0,
            late: response.data.late || 0,
            total: response.data.total || 0
          },
          subjectWise: response.data.subjectWise || [],
          recentRecords: response.data.records || [],
          absentDates: response.data.absentDates || [],
          monthlyStats: response.data.monthlyStats || []
        });
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceByDate = async (date) => {
    try {
      setLoadingDate(true);
      const response = await axios.get(`${API_BASE}/api/student/attendance/date`, {
        withCredentials: true,
        params: { date }
      });
      
      if (response.data.success) {
        setDateAttendance(response.data.attendance);
      }
    } catch (err) {
      console.error("Error fetching date attendance:", err);
      setMockDateAttendance(date);
    } finally {
      setLoadingDate(false);
    }
  };

  const setMockData = () => {
    setAttendanceData({
      summary: { percentage: 78, present: 78, absent: 22, late: 5, total: 100 },
      subjectWise: [
        { subject: "Data Structures", total: 25, present: 20, absent: 5, percentage: 80 },
        { subject: "Database Management", total: 24, present: 18, absent: 6, percentage: 75 },
        { subject: "Operating Systems", total: 22, present: 19, absent: 3, percentage: 86 },
        { subject: "Computer Networks", total: 20, present: 14, absent: 6, percentage: 70 },
        { subject: "Web Development", total: 18, present: 15, absent: 3, percentage: 83 }
      ],
      recentRecords: [
        { date: "2024-03-15", subject: "Data Structures", status: "present", time: "10:00 AM" },
        { date: "2024-03-14", subject: "Database Management", status: "absent", time: "11:00 AM" },
        { date: "2024-03-13", subject: "Operating Systems", status: "present", time: "09:00 AM" },
        { date: "2024-03-12", subject: "Computer Networks", status: "present", time: "02:00 PM" },
        { date: "2024-03-11", subject: "Web Development", status: "absent", time: "03:00 PM" }
      ],
      absentDates: ["2024-03-14", "2024-03-11", "2024-03-07", "2024-03-03"],
      monthlyStats: [
        { month: "March 2024", present: 18, absent: 5, percentage: 78 },
        { month: "February 2024", present: 22, absent: 4, percentage: 85 },
        { month: "January 2024", present: 20, absent: 6, percentage: 77 }
      ]
    });
  };

  const setMockDateAttendance = (date) => {
    const mockClasses = [
      { subject: "Data Structures", status: "present", time: "10:00 AM - 11:30 AM", faculty: "Dr. Smith" },
      { subject: "Database Management", status: "absent", time: "11:30 AM - 01:00 PM", faculty: "Prof. Johnson" },
      { subject: "Operating Systems", status: "present", time: "02:00 PM - 03:30 PM", faculty: "Dr. Williams" }
    ];
    setDateAttendance({ date, classes: mockClasses });
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    await fetchAttendanceByDate(date);
    setShowDatePicker(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "present": return { bg: "#d1fae5", color: "#065f46", icon: CheckCircle };
      case "absent": return { bg: "#fee2e2", color: "#991b1b", icon: XCircle };
      case "late": return { bg: "#fed7aa", color: "#92400e", icon: AlertCircle };
      default: return { bg: "#f3f4f6", color: "#6b7280", icon: AlertCircle };
    }
  };

  const getAttendanceLevel = (percentage) => {
    if (percentage >= 75) return { text: "Excellent", color: "#10b981", bg: "#d1fae5" };
    if (percentage >= 60) return { text: "Average", color: "#f59e0b", bg: "#fed7aa" };
    return { text: "Needs Improvement", color: "#ef4444", bg: "#fee2e2" };
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isAbsent = attendanceData.absentDates.includes(date);
      const isPresent = attendanceData.recentRecords.some(r => r.date === date && r.status === 'present');
      days.push({ date, day: i, isAbsent, isPresent });
    }
    return days;
  };

  const paginatedRecords = attendanceData.recentRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(attendanceData.recentRecords.length / itemsPerPage);

  const exportToCSV = () => {
    const headers = ["Date", "Subject", "Status", "Time"];
    const rows = attendanceData.recentRecords.map(record => [
      record.date, record.subject, record.status, record.time
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const attendanceLevel = getAttendanceLevel(attendanceData.summary.percentage);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Attendance Overview</h1>
          <p style={styles.subtitle}>Track your attendance across all subjects</p>
        </div>
        <button onClick={exportToCSV} style={styles.exportBtn}>
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: "#3b82f61a", color: "#3b82f6" }}>📊</div>
          <div>
            <div style={styles.summaryLabel}>Overall Attendance</div>
            <div style={styles.summaryValue}>{attendanceData.summary.percentage}%</div>
            <div style={{ ...styles.attendanceBadge, background: attendanceLevel.bg, color: attendanceLevel.color }}>
              {attendanceLevel.text}
            </div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: "#10b9811a", color: "#10b981" }}>✓</div>
          <div>
            <div style={styles.summaryLabel}>Present</div>
            <div style={styles.summaryValue}>{attendanceData.summary.present}</div>
            <div style={styles.summarySub}>days</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: "#ef44441a", color: "#ef4444" }}>✗</div>
          <div>
            <div style={styles.summaryLabel}>Absent</div>
            <div style={styles.summaryValue}>{attendanceData.summary.absent}</div>
            <div style={styles.summarySub}>days</div>
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: "#f59e0b1a", color: "#f59e0b" }}>⏰</div>
          <div>
            <div style={styles.summaryLabel}>Late</div>
            <div style={styles.summaryValue}>{attendanceData.summary.late}</div>
            <div style={styles.summarySub}>days</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <Filter size={16} color="#64748b" />
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Subjects</option>
            {attendanceData.subjectWise.map(sub => (
              <option key={sub.subject} value={sub.subject}>{sub.subject}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <Calendar size={16} color="#64748b" />
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="7">Last 7 days</option>
            <option value="15">Last 15 days</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Date Picker Button */}
        <div style={styles.datePickerWrapper}>
          <button 
            onClick={() => setShowDatePicker(!showDatePicker)}
            style={styles.datePickerBtn}
          >
            <CalendarIcon size={16} />
            {selectedDate ? new Date(selectedDate).toLocaleDateString() : "Pick a Date"}
            <ChevronDown size={14} />
          </button>

          {showDatePicker && (
            <div style={styles.datePickerDropdown}>
              <div style={styles.calendarHeader}>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
                  <ChevronLeft size={16} />
                </button>
                <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div style={styles.calendarWeekdays}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                  <div key={day} style={styles.weekday}>{day}</div>
                ))}
              </div>
              <div style={styles.calendarDays}>
                {generateCalendarDays().map((day, idx) => (
                  day ? (
                    <button
                      key={idx}
                      onClick={() => handleDateSelect(day.date)}
                      style={{
                        ...styles.calendarDay,
                        ...(day.isAbsent ? styles.calendarDayAbsent : {}),
                        ...(day.isPresent ? styles.calendarDayPresent : {}),
                        ...(selectedDate === day.date ? styles.calendarDaySelected : {})
                      }}
                    >
                      {day.day}
                    </button>
                  ) : (
                    <div key={idx} style={styles.calendarDayEmpty} />
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={styles.viewToggle}>
          <button 
            onClick={() => setViewMode("table")} 
            style={{ ...styles.viewBtn, ...(viewMode === "table" ? styles.viewBtnActive : {}) }}
          >📋 Table</button>
          <button 
            onClick={() => setViewMode("subject")} 
            style={{ ...styles.viewBtn, ...(viewMode === "subject" ? styles.viewBtnActive : {}) }}
          >📚 Subject</button>
          <button 
            onClick={() => setViewMode("calendar")} 
            style={{ ...styles.viewBtn, ...(viewMode === "calendar" ? styles.viewBtnActive : {}) }}
          >📅 Calendar</button>
        </div>
      </div>

      {/* Date Attendance Modal/View */}
      {selectedDate && dateAttendance && (
        <div style={styles.dateAttendanceCard}>
          <div style={styles.dateAttendanceHeader}>
            <div>
              <CalendarIcon size={18} />
              <h3>Attendance for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            </div>
            <button onClick={() => setSelectedDate("")} style={styles.closeBtn}>×</button>
          </div>
          {loadingDate ? (
            <div style={styles.loadingSmall}>Loading...</div>
          ) : (
            <div style={styles.dateAttendanceBody}>
              {dateAttendance.classes?.map((cls, idx) => {
                const statusStyle = getStatusColor(cls.status);
                const StatusIcon = statusStyle.icon;
                return (
                  <div key={idx} style={styles.dateClassItem}>
                    <div style={styles.dateClassInfo}>
                      <BookOpen size={16} color="#3b82f6" />
                      <div>
                        <div style={styles.dateClassSubject}>{cls.subject}</div>
                        <div style={styles.dateClassFaculty}>{cls.faculty}</div>
                        <div style={styles.dateClassTime}>{cls.time}</div>
                      </div>
                    </div>
                    <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.color }}>
                      <StatusIcon size={12} style={{ marginRight: 4 }} />
                      {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Subject Wise View */}
      {viewMode === "subject" && (
        <div style={styles.subjectGrid}>
          {attendanceData.subjectWise.map(subject => {
            const level = getAttendanceLevel(subject.percentage);
            return (
              <div key={subject.subject} style={styles.subjectCard}>
                <div style={styles.subjectHeader}>
                  <BookOpen size={20} color="#3b82f6" />
                  <h3 style={styles.subjectName}>{subject.subject}</h3>
                </div>
                <div style={styles.subjectStats}>
                  <div style={styles.subjectStat}>
                    <span>Present:</span>
                    <strong>{subject.present}</strong>
                  </div>
                  <div style={styles.subjectStat}>
                    <span>Absent:</span>
                    <strong style={{ color: "#ef4444" }}>{subject.absent}</strong>
                  </div>
                  <div style={styles.subjectStat}>
                    <span>Total:</span>
                    <strong>{subject.total}</strong>
                  </div>
                </div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${subject.percentage}%`, background: subject.percentage >= 75 ? "#10b981" : subject.percentage >= 60 ? "#f59e0b" : "#ef4444" }} />
                </div>
                <div style={{ ...styles.subjectPercentage, color: level.color }}>
                  {subject.percentage}% - {level.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div style={styles.calendarContainer}>
          <div style={styles.calendarHeaderSection}>
            <h3 style={styles.calendarTitle}>📅 Attendance Calendar</h3>
            <div style={styles.calendarLegend}>
              <span><span style={styles.legendGreen}></span> Present</span>
              <span><span style={styles.legendRed}></span> Absent</span>
              <span><span style={styles.legendGray}></span> No Class</span>
            </div>
          </div>
          
          <div style={styles.calendarWrapper}>
            <div style={styles.calendarHeader}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
                <ChevronLeft size={20} />
              </button>
              <span style={styles.calendarMonth}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div style={styles.calendarWeekdays}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} style={styles.calendarWeekday}>{day}</div>
              ))}
            </div>
            <div style={styles.calendarDays}>
              {generateCalendarDays().map((day, idx) => (
                day ? (
                  <button
                    key={idx}
                    onClick={() => handleDateSelect(day.date)}
                    style={{
                      ...styles.calendarDayLarge,
                      ...(day.isAbsent ? styles.calendarDayAbsentLarge : {}),
                      ...(day.isPresent ? styles.calendarDayPresentLarge : {})
                    }}
                  >
                    {day.day}
                  </button>
                ) : (
                  <div key={idx} style={styles.calendarDayEmptyLarge} />
                )
              ))}
            </div>
          </div>

          {/* Monthly Statistics */}
          <div style={styles.monthlyStats}>
            <h4>Monthly Summary</h4>
            <div style={styles.monthlyStatsGrid}>
              {attendanceData.monthlyStats.map((stat, idx) => (
                <div key={idx} style={styles.monthlyStatCard}>
                  <div style={styles.monthlyStatMonth}>{stat.month}</div>
                  <div style={styles.monthlyStatNumbers}>
                    <span>✅ {stat.present}</span>
                    <span>❌ {stat.absent}</span>
                  </div>
                  <div style={styles.monthlyStatBar}>
                    <div style={{ ...styles.monthlyStatFill, width: `${stat.percentage}%` }} />
                  </div>
                  <div style={styles.monthlyStatPercent}>{stat.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record, index) => {
                const statusStyle = getStatusColor(record.status);
                const StatusIcon = statusStyle.icon;
                return (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{new Date(record.date).toLocaleDateString()}</td>
                    <td style={styles.td}>{record.subject}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: statusStyle.bg, color: statusStyle.color }}>
                        <StatusIcon size={12} style={{ marginRight: 4 }} />
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td style={styles.td}>{record.time || "--:--"}</td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => handleDateSelect(record.date)}
                        style={styles.viewDateBtn}
                      >
                        <Eye size={14} /> View Day
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ ...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {}) }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ ...styles.pageBtn, ...(currentPage === totalPages ? styles.pageBtnDisabled : {}) }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warning for low attendance */}
      {attendanceData.summary.percentage < 75 && (
        <div style={styles.warningBanner}>
          <AlertCircle size={20} />
          <div>
            <strong>⚠️ Low Attendance Alert!</strong>
            <p>Your attendance is below 75%. Please attend classes regularly to maintain eligibility.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'DM Sans', sans-serif",
    background: "#f5f7fa",
    minHeight: "100vh"
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: "1rem"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  loadingSmall: {
    textAlign: "center",
    padding: "2rem",
    color: "#64748b"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem"
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "0.5rem"
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.875rem"
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s"
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem"
  },
  summaryCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  summaryIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  },
  summaryLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "600"
  },
  summaryValue: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: "1.2"
  },
  summarySub: {
    fontSize: "0.75rem",
    color: "#94a3b8"
  },
  attendanceBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: "500",
    marginTop: "4px"
  },
  filterBar: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
    alignItems: "center"
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "white",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0"
  },
  filterSelect: {
    border: "none",
    background: "transparent",
    fontSize: "0.875rem",
    color: "#1e293b",
    outline: "none",
    cursor: "pointer"
  },
  datePickerWrapper: {
    position: "relative"
  },
  datePickerBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "white",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    fontSize: "0.875rem"
  },
  datePickerDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: "0.5rem",
    background: "white",
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 100,
    minWidth: "280px"
  },
  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem"
  },
  calendarWeekdays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.25rem",
    marginBottom: "0.5rem"
  },
  weekday: {
    textAlign: "center",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#64748b",
    padding: "0.25rem"
  },
  calendarDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.25rem"
  },
  calendarDay: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "0.75rem",
    transition: "all 0.2s"
  },
  calendarDayAbsent: {
    background: "#fee2e2",
    color: "#dc2626"
  },
  calendarDayPresent: {
    background: "#d1fae5",
    color: "#065f46"
  },
  calendarDaySelected: {
    background: "#3b82f6",
    color: "white"
  },
  calendarDayEmpty: {
    aspectRatio: "1"
  },
  viewToggle: {
    display: "flex",
    gap: "0.5rem",
    background: "white",
    padding: "0.25rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginLeft: "auto"
  },
  viewBtn: {
    padding: "0.5rem 1rem",
    border: "none",
    background: "transparent",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    transition: "all 0.2s"
  },
  viewBtnActive: {
    background: "#3b82f6",
    color: "white"
  },
  dateAttendanceCard: {
    background: "white",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden"
  },
  dateAttendanceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc"
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#64748b"
  },
  dateAttendanceBody: {
    padding: "1.5rem"
  },
  dateClassItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    borderBottom: "1px solid #f1f5f9"
  },
  dateClassInfo: {
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  },
  dateClassSubject: {
    fontWeight: "600",
    color: "#1e293b"
  },
  dateClassFaculty: {
    fontSize: "0.75rem",
    color: "#64748b"
  },
  dateClassTime: {
    fontSize: "0.7rem",
    color: "#94a3b8"
  },
  subjectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1rem"
  },
  subjectCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  subjectHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  subjectName: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1e293b"
  },
  subjectStats: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1rem",
    fontSize: "0.875rem"
  },
  subjectStat: {
    display: "flex",
    gap: "0.25rem",
    color: "#64748b"
  },
  progressBar: {
    width: "100%",
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "0.5rem"
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.5s ease"
  },
  subjectPercentage: {
    fontSize: "0.875rem",
    fontWeight: "600",
    textAlign: "center"
  },
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    padding: "1rem",
    textAlign: "left",
    background: "#f8fafc",
    fontWeight: "600",
    color: "#475569",
    borderBottom: "1px solid #e2e8f0"
  },
  td: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #f1f5f9"
  },
  tr: {
    transition: "background 0.2s"
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "500"
  },
  viewDateBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "4px 8px",
    background: "#f1f5f9",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.7rem",
    color: "#475569"
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem"
  },
  pageBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.5rem 1rem",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem"
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  pageInfo: {
    fontSize: "0.875rem",
    color: "#64748b"
  },
  calendarContainer: {
    background: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  calendarHeaderSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem"
  },
  calendarTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    margin: 0
  },
  calendarLegend: {
    display: "flex",
    gap: "1rem",
    fontSize: "0.75rem"
  },
  legendGreen: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    background: "#d1fae5",
    borderRadius: "2px",
    marginRight: "4px"
  },
  legendRed: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    background: "#fee2e2",
    borderRadius: "2px",
    marginRight: "4px"
  },
  legendGray: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    background: "#f1f5f9",
    borderRadius: "2px",
    marginRight: "4px"
  },
  calendarWrapper: {
    marginBottom: "2rem"
  },
  calendarMonth: {
    fontWeight: "600",
    fontSize: "1rem"
  },
  calendarWeekday: {
    textAlign: "center",
    padding: "0.5rem",
    fontWeight: "600",
    color: "#64748b",
    fontSize: "0.75rem"
  },
  calendarDayLarge: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "#f8fafc",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    transition: "all 0.2s"
  },
  calendarDayAbsentLarge: {
    background: "#fee2e2",
    color: "#dc2626"
  },
  calendarDayPresentLarge: {
    background: "#d1fae5",
    color: "#065f46"
  },
  calendarDayEmptyLarge: {
    aspectRatio: "1"
  },
  monthlyStats: {
    marginTop: "1.5rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e2e8f0"
  },
  monthlyStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1rem",
    marginTop: "1rem"
  },
  monthlyStatCard: {
    padding: "1rem",
    background: "#f8fafc",
    borderRadius: "8px"
  },
  monthlyStatMonth: {
    fontWeight: "600",
    marginBottom: "0.5rem"
  },
  monthlyStatNumbers: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    marginBottom: "0.5rem"
  },
  monthlyStatBar: {
    height: "4px",
    background: "#e2e8f0",
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "0.5rem"
  },
  monthlyStatFill: {
    height: "100%",
    background: "#3b82f6",
    borderRadius: "2px",
    transition: "width 0.5s ease"
  },
  monthlyStatPercent: {
    fontSize: "0.875rem",
    fontWeight: "600",
    textAlign: "center"
  },
  warningBanner: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "1rem",
    marginTop: "1.5rem"
  }
};

// Add keyframes for spinner animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default StudentAttendance;