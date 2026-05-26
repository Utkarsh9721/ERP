import pool from "../../models/connectionDb.js";

// Mark or update attendance for a class
export const markAttendance = async (req, res) => {
  const { classId } = req.params;
  const { attendance, date, remarks } = req.body;
  const facultyId = req.user.userId;

  try {
    // Verify faculty owns this class
    const classCheck = await pool.query(
      `SELECT id, branch, section, semester, subject FROM faculty_class WHERE id = $1 AND faculty_id = $2`,
      [classId, facultyId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this class"
      });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    await pool.query('BEGIN');

    // Process each student's attendance
    for (const record of attendance) {
      await pool.query(
        `INSERT INTO attendance (student_id, class_id, date, status, marked_by, remarks)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (student_id, class_id, date) 
         DO UPDATE SET 
           status = $4, 
           marked_by = $5, 
           remarks = $6,
           updated_at = CURRENT_TIMESTAMP`,
        [record.student_id, classId, attendanceDate, record.status, facultyId, record.remarks || null]
      );
    }

    await pool.query('COMMIT');

    res.status(200).json({
      success: true,
      message: "Attendance saved successfully",
      data: {
        class: classCheck.rows[0],
        date: attendanceDate,
        total_students: attendance.length
      }
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Mark Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save attendance",
      error: error.message
    });
  }
};

// Get attendance for a specific class on a specific date
export const getClassAttendance = async (req, res) => {
  const { classId } = req.params;
  const { date } = req.query;
  const facultyId = req.user.userId;

  try {
    // Verify faculty owns this class
    const classCheck = await pool.query(
      `SELECT fc.*, f.name as faculty_name 
       FROM faculty_class fc
       JOIN faculty f ON fc.faculty_id = f.id
       WHERE fc.id = $1 AND fc.faculty_id = $2`,
      [classId, facultyId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this class"
      });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    // Get all students for this class with their attendance status
    const result = await pool.query(
      `
      SELECT 
        s.id,
        s.student_id,
        s.roll_number,
        s.full_name,
        s.email,
        COALESCE(a.status, 'not_marked') as status,
        a.remarks,
        a.marked_by,
        a.date as attendance_date,
        a.created_at as marked_at
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id 
        AND a.class_id = $1 
        AND a.date = $2
      WHERE s.branch = $3 
        AND s.section = $4 
        AND s.semester = $5
        AND s.status = 'active'
      ORDER BY s.roll_number
      `,
      [classId, attendanceDate, classCheck.rows[0].branch, classCheck.rows[0].section, classCheck.rows[0].semester]
    );

    const summary = {
      total_students: result.rows.length,
      present: result.rows.filter(r => r.status === 'present').length,
      absent: result.rows.filter(r => r.status === 'absent').length,
      late: result.rows.filter(r => r.status === 'late').length,
      excused: result.rows.filter(r => r.status === 'excused').length,
      not_marked: result.rows.filter(r => r.status === 'not_marked').length
    };

    res.status(200).json({
      success: true,
      data: {
        class: classCheck.rows[0],
        date: attendanceDate,
        summary,
        students: result.rows
      }
    });

  } catch (error) {
    console.error("Get Class Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
      error: error.message
    });
  }
};

// Get student attendance history
export const getStudentAttendance = async (req, res) => {
  const { studentId } = req.params;
  const facultyId = req.user.userId;

  try {
    // Check if student exists and belongs to faculty's classes
    const studentCheck = await pool.query(
      `
      SELECT s.* 
      FROM students s
      WHERE s.id = $1 AND s.status = 'active'
      `,
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const student = studentCheck.rows[0];

    // Get all attendance records for this student in faculty's classes
    const result = await pool.query(
      `
      SELECT 
        a.*,
        fc.subject,
        fc.branch,
        fc.section,
        fc.semester,
        fc.day as class_day,
        fc.start_time,
        fc.end_time
      FROM attendance a
      JOIN faculty_class fc ON a.class_id = fc.id
      WHERE a.student_id = $1 
        AND fc.faculty_id = $2
      ORDER BY a.date DESC, fc.start_time
      `,
      [studentId, facultyId]
    );

    // Calculate attendance percentage
    const totalClasses = result.rows.length;
    const presentCount = result.rows.filter(r => r.status === 'present' || r.status === 'late').length;
    const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;

    // Group by subject
    const bySubject = {};
    result.rows.forEach(record => {
      if (!bySubject[record.subject]) {
        bySubject[record.subject] = {
          subject: record.subject,
          total: 0,
          present: 0
        };
      }
      bySubject[record.subject].total++;
      if (record.status === 'present' || record.status === 'late') {
        bySubject[record.subject].present++;
      }
    });

    const subjectWise = Object.values(bySubject).map(sub => ({
      ...sub,
      percentage: ((sub.present / sub.total) * 100).toFixed(1)
    }));

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student.id,
          student_id: student.student_id,
          roll_number: student.roll_number,
          full_name: student.full_name,
          branch: student.branch,
          section: student.section,
          semester: student.semester
        },
        summary: {
          total_classes: totalClasses,
          present: presentCount,
          absent: result.rows.filter(r => r.status === 'absent').length,
          late: result.rows.filter(r => r.status === 'late').length,
          excused: result.rows.filter(r => r.status === 'excused').length,
          attendance_percentage: attendancePercentage
        },
        subject_wise: subjectWise,
        records: result.rows
      }
    });

  } catch (error) {
    console.error("Get Student Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
      error: error.message
    });
  }
};

// Get attendance statistics for faculty dashboard
export const getAttendanceStats = async (req, res) => {
  const facultyId = req.user.userId;

  try {
    // Get total students across all faculty's classes
    const totalStudentsResult = await pool.query(
      `
      SELECT COUNT(DISTINCT s.id) as total
      FROM students s
      WHERE EXISTS (
        SELECT 1 FROM faculty_class fc
        WHERE fc.faculty_id = $1
          AND fc.branch = s.branch
          AND fc.section = s.section
          AND fc.semester = s.semester
      )
      AND s.status = 'active'
      `,
      [facultyId]
    );

    // Get weekly attendance trend for last 8 weeks
    const weeklyTrend = await pool.query(
      `
      SELECT 
        TO_CHAR(DATE_TRUNC('week', a.date), 'Mon DD') as week,
        ROUND(AVG(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) * 100) as percentage,
        COUNT(DISTINCT a.class_id) as classes_held
      FROM attendance a
      JOIN faculty_class fc ON a.class_id = fc.id
      WHERE fc.faculty_id = $1
        AND a.date >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', a.date)
      ORDER BY DATE_TRUNC('week', a.date) DESC
      LIMIT 8
      `,
      [facultyId]
    );

    // Get subject-wise attendance
    const subjectWise = await pool.query(
      `
      SELECT 
        fc.subject,
        COUNT(DISTINCT a.id) as total_records,
        ROUND(AVG(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) * 100) as attendance_percentage
      FROM faculty_class fc
      LEFT JOIN attendance a ON a.class_id = fc.id
      WHERE fc.faculty_id = $1
      GROUP BY fc.subject
      ORDER BY attendance_percentage DESC
      `,
      [facultyId]
    );

    // Get students with low attendance (< 75%)
    const lowAttendanceStudents = await pool.query(
      `
      SELECT 
        s.id,
        s.student_id,
        s.roll_number,
        s.full_name,
        s.branch,
        s.section,
        s.semester,
        ROUND(
          AVG(CASE WHEN a.status IN ('present', 'late') THEN 1.0 ELSE 0.0 END) * 100
        ) as attendance_percentage,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count
      FROM students s
      JOIN attendance a ON a.student_id = s.id
      JOIN faculty_class fc ON a.class_id = fc.id
      WHERE fc.faculty_id = $1
        AND s.status = 'active'
      GROUP BY s.id
      HAVING ROUND(AVG(CASE WHEN a.status IN ('present', 'late') THEN 1.0 ELSE 0.0 END) * 100) < 75
      ORDER BY attendance_percentage ASC
      LIMIT 20
      `,
      [facultyId]
    );

    res.status(200).json({
      success: true,
      data: {
        total_students: totalStudentsResult.rows[0]?.total || 0,
        weekly_trend: weeklyTrend.rows,
        subject_wise: subjectWise.rows,
        low_attendance_students: lowAttendanceStudents.rows
      }
    });

  } catch (error) {
    console.error("Get Attendance Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance statistics",
      error: error.message
    });
  }
};

// Get attendance report for a date range
export const getAttendanceReport = async (req, res) => {
  const { classId } = req.params;
  const { startDate, endDate } = req.query;
  const facultyId = req.user.userId;

  try {
    // Verify faculty owns this class
    const classCheck = await pool.query(
      `SELECT * FROM faculty_class WHERE id = $1 AND faculty_id = $2`,
      [classId, facultyId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this class"
      });
    }

    const result = await pool.query(
      `
      SELECT 
        s.roll_number,
        s.full_name,
        a.date,
        a.status,
        a.remarks
      FROM students s
      JOIN attendance a ON a.student_id = s.id
      WHERE a.class_id = $1 
        AND a.date BETWEEN $2 AND $3
      ORDER BY s.roll_number, a.date
      `,
      [classId, startDate, endDate]
    );

    // Pivot data for report
    const report = {};
    result.rows.forEach(record => {
      if (!report[record.roll_number]) {
        report[record.roll_number] = {
          student_name: record.full_name,
          roll_number: record.roll_number,
          attendance: {}
        };
      }
      report[record.roll_number].attendance[record.date] = record.status;
    });

    res.status(200).json({
      success: true,
      data: {
        class: classCheck.rows[0],
        start_date: startDate,
        end_date: endDate,
        report: Object.values(report)
      }
    });

  } catch (error) {
    console.error("Get Attendance Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance report",
      error: error.message
    });
  }
};

// Get students for a specific class (for marking attendance)
export const getClassStudents = async (req, res) => {
  const { classId } = req.params;
  const facultyId = req.user.userId;

  try {
    // Verify faculty owns this class
    const classCheck = await pool.query(
      `SELECT fc.*, f.name as faculty_name 
       FROM faculty_class fc
       JOIN faculty f ON fc.faculty_id = f.id
       WHERE fc.id = $1 AND fc.faculty_id = $2`,
      [classId, facultyId]
    );

    if (classCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this class"
      });
    }

    const classInfo = classCheck.rows[0];

    const result = await pool.query(
      `
      SELECT 
        s.id,
        s.student_id,
        s.roll_number,
        s.full_name,
        s.email,
        s.phone
      FROM students s
      WHERE s.branch = $1 
        AND s.section = $2 
        AND s.semester = $3
        AND s.status = 'active'
      ORDER BY s.roll_number
      `,
      [classInfo.branch, classInfo.section, classInfo.semester]
    );

    res.status(200).json({
      success: true,
      data: {
        class: classInfo,
        students: result.rows
      }
    });

  } catch (error) {
    console.error("Get Class Students Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch class students",
      error: error.message
    });
  }
};