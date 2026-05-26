import pool from "../../models/connectionDb.js";

const studentHome = async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Fetch student basic info
    const studentResult = await pool.query(
      `
      SELECT
        s.id,
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.branch as department,
        s.section,
        s.roll_number,
        s.semester,
        s.profile_pic_url as "profilePic",
        s.status,
        s.created_at as "enrollmentDate",
        s.admission_year as batch,
        s.date_of_birth as dob,
        s.address
      FROM students s
      WHERE s.id = $1 AND s.status = 'active'
      `,
      [userId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const student = studentResult.rows[0];

    // Fetch attendance percentage
    let attendancePercentage = 0;
    try {
      const attendanceResult = await pool.query(
        `
        SELECT 
          ROUND(COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as attendance_percentage
        FROM attendance a
        JOIN faculty_class fc ON a.class_id = fc.id
        WHERE a.student_id = $1
          AND fc.branch = $2
          AND fc.section = $3
          AND fc.semester = $4
        `,
        [userId, student.department, student.section, student.semester]
      );
      attendancePercentage = parseFloat(attendanceResult.rows[0]?.attendance_percentage || 0);
    } catch (err) {
      console.log("Attendance data not available:", err.message);
    }

    // Get today's schedule
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    let todayClasses = [];
    try {
      const todayResult = await pool.query(
        `
        SELECT 
          fc.id,
          fc.subject,
          fc.start_time,
          fc.end_time,
          f.name as faculty_name
        FROM faculty_class fc
        JOIN faculty f ON fc.faculty_id = f.id
        WHERE fc.branch = $1 
          AND fc.section = $2 
          AND fc.semester = $3
          AND fc.day = $4
        ORDER BY fc.start_time
        `,
        [student.department, student.section, student.semester, today]
      );
      todayClasses = todayResult.rows || [];
    } catch (err) {
      console.log("Schedule data not available:", err.message);
    }

    res.status(200).json({
      success: true,
      student: {
        id: student.id,
        studentId: student.student_id,
        firstName: student.first_name,
        lastName: student.last_name || "",
        name: `${student.first_name} ${student.last_name || ""}`.trim(),
        email: student.email,
        phone: student.phone || null,
        department: student.department,
        section: student.section,
        rollNumber: student.roll_number,
        semester: student.semester,
        profilePic: student.profilePic || null,
        status: student.status,
        enrollmentDate: student.enrollmentDate,
        batch: student.batch,
        dob: student.dob,
        address: student.address,
        attendance: attendancePercentage,
        cgpa: 0.00, // You can calculate this from results table
        feeStatus: "Pending" // You can get this from fees table
      },
      todayClasses: todayClasses
    });

  } catch (error) {
    console.error("Student Home Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load student dashboard",
      error: error.message
    });
  }
};

export default studentHome;