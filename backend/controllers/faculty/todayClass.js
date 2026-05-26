import pool from "../../models/connectionDb.js";

const todayClasses = async (req, res) => {
  try {
    const facultyId = req.user.userId;
    
    if (!facultyId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Faculty ID not found"
      });
    }

    console.log(`Fetching today's classes for faculty: ${facultyId}`);

    // Get current day name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const query = `
      SELECT 
        fc.id,
        fc.branch,
        fc.section,
        fc.semester,
        fc.subject,
        fc.day,
        fc.start_time,
        fc.end_time,
        COALESCE(fc.room_no, 'Room ' || fc.branch) as room,
        'upcoming' as status,
        COALESCE(
          (SELECT COUNT(*) 
           FROM students s 
           WHERE s.branch = fc.branch 
             AND s.semester = fc.semester 
             AND s.section = fc.section),
          0
        ) as total_students
      FROM faculty_class fc
      WHERE fc.faculty_id = $1 AND fc.day = $2
      ORDER BY fc.start_time
    `;

    const result = await pool.query(query, [facultyId, today]);

    console.log(`Found ${result.rows.length} classes for ${today}`);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error("Today Classes Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch today's classes",
      error: error.message
    });
  }
};

export default todayClasses;