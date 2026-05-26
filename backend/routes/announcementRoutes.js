import express from "express";
import multer from "multer";

/* ===== CONTROLLERS ===== */
import fetchData from "../controllers/publicAnnuncement.js";
import { publicEvents } from "../controllers/publicEvents.js";
import addAnnouncement from "../controllers/Announcement.js";
import deleteAnnouncement from "../controllers/deleteAnnouncement.js";

import adminPlacementData from "../controllers/placementAdim.js";
import placementPublic from "../controllers/placementPublic.js";
import deletePlacement from "../controllers/placementDelete.js";

import adminLogin from "../controllers/admin/adminLogin.js";
import adminLogout from "../controllers/admin/logout.js";

import { AdminEvents, deleteEvent, getEvents } from "../controllers/events.js";
import adminStudent from "../controllers/adminStudent.js";

import studentLogin from "../controllers/students/studentLogin.js";
import forgotPassword from "../controllers/students/forgotPassword.js";
import resetPassword from "../controllers/students/resetPassword.js";
import studentHome from "../controllers/students/studentHome.js";

/* ===== MIDDLEWARE ===== */
import { loginLimiter } from "../middleware/rateLimit.js";
import authMiddleware from "../jwtRedis/login.js";
import uploadProfile from "../controllers/students/uploadProfile.js";
import { deleteProfile } from "../controllers/students/uploadProfile.js";
import facultyAdmin from "../controllers/adminFaculty.js";
import facultyLogin from "../controllers/faculty/facultyLogin.js";
import facultyDashboard from "../controllers/faculty/dashboard.js";
import facultyLogout from "../controllers/faculty/logout.js";
import superLogin from "../controllers/superAdmin/superAdmin.js";
import addInstitute from "../controllers/superAdmin/addInstitute.js";
import { deleteAdmin, getAdmins } from "../controllers/superAdmin/deleteAdmin.js";
import getAllFaculty from "../controllers/admin/getFacultity.js";
import getStudentsAttendance from "../controllers/students/attendace.js";
import { 
  getFaculty,
  ScheduleFaculty, 
  createFacultyClass, 
  updateFacultyClass, 
  deleteFacultyClass 
} from "../controllers/admin/schedule.js";
import todayClasses from "../controllers/faculty/todayClass.js";

/* ===== ATTENDANCE CONTROLLERS ===== */
import { 
  markAttendance, 
  getClassAttendance, 
  getStudentAttendance, 
  getAttendanceStats,
  getAttendanceReport,
  getClassStudents
} from "../controllers/faculty/attendance.js";
import { getAttendanceByDate } from "../controllers/students/getAttendanceByDate.js";


const router = express.Router();

/* ===== MULTER CONFIG ===== */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* ================= AUTH ================= */
router.post("/admin-login", loginLimiter, adminLogin);
router.post("/student/login", studentLogin);
router.post("/faculty/login", facultyLogin);
router.post("/super/login", loginLimiter, superLogin);

/* ================= GET CURRENT USER ================= */
router.get("/auth/me", authMiddleware(), (req, res) => {
  res.json({ 
    success: true,
    authenticated: true, 
    user: req.user 
  });
});

/* ================= LOGOUT ROUTES ================= */
router.post("/admin/logout", authMiddleware("admin", "super_admin"), adminLogout);
router.post("/faculty/logout", authMiddleware("faculty"), facultyLogout);
router.post("/student/logout", authMiddleware("student"), adminLogout);

/* ================= STUDENT ================= */
router.post("/student/forgot-password", forgotPassword);
router.post("/student/reset-password", resetPassword);
router.get("/student/home", authMiddleware("student"), studentHome);
router.post("/student/upload-profile", authMiddleware("student"), upload.single("profilePic"), uploadProfile);
router.delete("/student/delete-profile", authMiddleware("student"), deleteProfile);
router.get("/student/attendance",authMiddleware("student"),getStudentsAttendance);
router.get("/student/attendance/date",authMiddleware("student"),getAttendanceByDate)

/* ================= ADMIN ================= */
router.post("/admin/faculty/add", authMiddleware("admin", "super_admin"), upload.single("profilePic"), facultyAdmin);
router.post("/admin/students/add", authMiddleware("admin", "super_admin"), upload.single("profilePic"), adminStudent);
router.get("/admin/faculty", authMiddleware("admin", "super_admin"), getAllFaculty);

/* ================= ANNOUNCEMENTS ================= */
router.get("/announcements", fetchData);
router.post("/announcements", authMiddleware("admin", "super_admin"), upload.single("image"), addAnnouncement);
router.delete("/announcements/:id", authMiddleware("admin", "super_admin"), deleteAnnouncement);

/* ================= PLACEMENTS ================= */
router.post("/admin/placements", authMiddleware("admin", "super_admin"), upload.single("image"), adminPlacementData);
router.delete("/admin/placements/:id", authMiddleware("admin", "super_admin"), deletePlacement);
router.get("/publicPlacement", placementPublic);

/* ================= EVENTS ================= */
router.post("/admin/events", authMiddleware("admin", "super_admin"), upload.single("image"), AdminEvents);
router.get("/admin/events", authMiddleware("admin", "super_admin"), getEvents);
router.delete("/admin/events/:id", authMiddleware("admin", "super_admin"), deleteEvent);
router.get("/public/events", publicEvents);

/* ================= FACULTY ROUTES ================= */
router.get("/faculty/dashboard", authMiddleware("faculty"), facultyDashboard);
router.get("/faculty/today-classes", authMiddleware("faculty"), todayClasses);

/* ================= ATTENDANCE ROUTES ================= */
// Get students for a class (for marking attendance)
router.get("/faculty/class/:classId/students", authMiddleware("faculty"), getClassStudents);

// Mark attendance for a class
router.post("/faculty/attendance/:classId", authMiddleware("faculty"), markAttendance);

// Get attendance for a specific class on a date
router.get("/faculty/attendance/class/:classId", authMiddleware("faculty"), getClassAttendance);

// Get student attendance history
router.get("/faculty/attendance/student/:studentId", authMiddleware("faculty"), getStudentAttendance);

// Get attendance statistics for dashboard
router.get("/faculty/attendance-stats", authMiddleware("faculty"), getAttendanceStats);

// Get attendance report for date range
router.get("/faculty/attendance/report/:classId", authMiddleware("faculty"), getAttendanceReport);

/* ================= FACULTY SCHEDULE MANAGEMENT ================= */
router.get("/admin/faculty-schedules", authMiddleware("admin", "super_admin"), ScheduleFaculty);
router.get("/admin/faculties/list", authMiddleware("admin", "super_admin"), getAllFaculty);
router.post("/admin/faculty-classes", authMiddleware("admin", "super_admin"), createFacultyClass);
router.put("/admin/faculty-classes/:id", authMiddleware("admin", "super_admin"), updateFacultyClass);
router.delete("/admin/faculty-classes/:id", authMiddleware("admin", "super_admin"), deleteFacultyClass);

/* ================= SUPER ADMIN ================= */
router.post("/super/institute/add", authMiddleware("super_admin"), addInstitute);
router.get("/super/admins", authMiddleware("super_admin"), getAdmins);
router.delete("/super/admins/:id", authMiddleware("super_admin"), deleteAdmin);

/* ================= 404 HANDLER ================= */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

/* ================= ERROR HANDLER ================= */
router.use((err, req, res, next) => {
  console.error("Error:", err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB."
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please login again."
    });
  }
  
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again."
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

export default router;