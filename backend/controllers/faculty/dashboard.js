import pool from "../../models/connectionDb.js";

const facultyDashboard = async (req, res) => {
  try {
    const facultyId = req.user.userId;

    // Fetch faculty basic info
    const facultyResult = await pool.query(
      `
      SELECT 
        f.id,
        f.faculty_id,
        f.name,
        f.email,
        f.phone,
        f.department,
        f.designation,
        f.profile_pic_url,
        f.status,
        f.created_at
      FROM faculty f
      WHERE f.id = $1
      `,
      [facultyId]
    );

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found"
      });
    }

    const faculty = facultyResult.rows[0];

    // Fetch classes assigned to this faculty by admin
    const classesResult = await pool.query(
      `
      SELECT 
        fc.id,
        fc.branch,
        fc.section,
        fc.semester,
        fc.subject,
        fc.day,
        fc.start_time,
        fc.end_time,
        (
          SELECT COUNT(*) 
          FROM students s 
          WHERE s.branch = fc.branch 
            AND s.semester = fc.semester 
            AND s.section = fc.section
        ) as total_students
      FROM faculty_class fc
      WHERE fc.faculty_id = $1
      ORDER BY 
        CASE fc.day
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
        END,
        fc.start_time
      `,
      [facultyId]
    );

    // Get today's classes
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayClasses = classesResult.rows.filter(cls => cls.day === today);

    // Get weekly schedule
    const weeklySchedule = classesResult.rows;

    // Get total students count across all classes
    const totalStudentsResult = await pool.query(
      `
      SELECT COUNT(DISTINCT s.id) as total
      FROM students s
      WHERE EXISTS (
        SELECT 1 FROM faculty_class fc
        WHERE fc.faculty_id = $1
          AND fc.branch = s.branch
          AND fc.semester = s.semester
          AND fc.section = s.section
      )
      `,
      [facultyId]
    );

    // Get attendance statistics
    const attendanceStats = await pool.query(
      `
      SELECT 
        TO_CHAR(date, 'MM/DD') as week,
        ROUND(AVG(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100) as percentage
      FROM attendance a
      JOIN faculty_class fc ON a.class_id = fc.id
      WHERE fc.faculty_id = $1
        AND date >= NOW() - INTERVAL '8 weeks'
      GROUP BY TO_CHAR(date, 'MM/DD')
      ORDER BY MIN(date) DESC
      LIMIT 8
      `,
      [facultyId]
    );

    return res.status(200).json({
      success: true,
      message: "Faculty dashboard data",
      faculty: {
        id: faculty.id,
        faculty_id: faculty.faculty_id,
        name: faculty.name,
        email: faculty.email,
        phone: faculty.phone,
        department: faculty.department,
        designation: faculty.designation,
        profile_pic_url: faculty.profile_pic_url,
        status: faculty.status,
        total_students: totalStudentsResult.rows[0]?.total || 0,
        total_courses: classesResult.rows.length
      },
      today_classes: todayClasses,
      weekly_schedule: weeklySchedule,
      attendance_stats: attendanceStats.rows,
      notification_count: 0 // You can implement notifications later
    });

  } catch (error) {
    console.error("Faculty Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error.message
    });
  }
};

export default facultyDashboard;