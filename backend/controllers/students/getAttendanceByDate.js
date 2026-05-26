import pool from "../../models/connectionDb.js";

export const getAttendanceByDate = async (req, res) => {
  try {
    const { userId } = req.user;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required"
      });
    }
    
    const result = await pool.query(
      `
      SELECT 
        a.status,
        a.date,
        fc.subject,
        fc.start_time,
        fc.end_time,
        f.name as faculty,
        fc.room_no
      FROM attendance a
      JOIN faculty_class fc ON a.class_id = fc.id
      JOIN faculty f ON fc.faculty_id = f.id
      WHERE a.student_id = $1 AND a.date = $2
      ORDER BY fc.start_time
      `,
      [userId, date]
    );
    
    res.status(200).json({
      success: true,
      attendance: {
        date: date,
        classes: result.rows.map(row => ({
          subject: row.subject,
          status: row.status,
          time: `${row.start_time?.substring(0,5)} - ${row.end_time?.substring(0,5)}`,
          faculty: row.faculty,
          room: row.room_no || "Online"
        }))
      }
    });
  } catch (error) {
    console.error("Get Attendance By Date Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance for this date"
    });
  }
};

