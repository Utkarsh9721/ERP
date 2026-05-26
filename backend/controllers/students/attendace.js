import pool from "../../models/connectionDb.js";

const getStudentAttendance = async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await pool.query(
      `
      SELECT 
        COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(*) as total,
        ROUND(COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as percentage
      FROM attendance
      WHERE student_id = $1
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      ...result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(200).json({
      success: true,
      present: 0,
      absent: 0,
      total: 0,
      percentage: 0
    });
  }
};

export default getStudentAttendance;