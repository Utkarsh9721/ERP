import pool from "../../models/connectionDb.js";

const getStudentAttendance = async (req, res) => {
  try {
    const { userId } = req.user;
    const { days = 30, subject } = req.query;
    
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - parseInt(days));

    let query = `
      SELECT 
        a.date,
        a.status,
        fc.subject,
        fc.start_time
      FROM attendance a
      JOIN faculty_class fc ON a.class_id = fc.id
      WHERE a.student_id = $1
        AND a.date >= $2
    `;
    
    const params = [userId, dateLimit];
    
    if (subject && subject !== 'all') {
      query += ` AND fc.subject = $3`;
      params.push(subject);
    }
    
    query += ` ORDER BY a.date DESC, fc.start_time`;

    const result = await pool.query(query, params);
    
    // Calculate summary
    const total = result.rows.length;
    const present = result.rows.filter(r => r.status === 'present').length;
    const absent = result.rows.filter(r => r.status === 'absent').length;
    const late = result.rows.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;
    
    // Subject wise attendance
    const subjectWise = {};
    result.rows.forEach(record => {
      if (!subjectWise[record.subject]) {
        subjectWise[record.subject] = { present: 0, absent: 0, total: 0 };
      }
      subjectWise[record.subject].total++;
      if (record.status === 'present' || record.status === 'late') {
        subjectWise[record.subject].present++;
      } else {
        subjectWise[record.subject].absent++;
      }
    });
    
    const subjectWiseArray = Object.entries(subjectWise).map(([subject, data]) => ({
      subject,
      total: data.total,
      present: data.present,
      absent: data.absent,
      percentage: ((data.present / data.total) * 100).toFixed(1)
    }));
    
    // Absent dates
    const absentDates = result.rows
      .filter(r => r.status === 'absent')
      .map(r => r.date);
    
    res.status(200).json({
      success: true,
      total,
      present,
      absent,
      late,
      percentage,
      subjectWise: subjectWiseArray,
      records: result.rows,
      absentDates: [...new Set(absentDates)]
    });
    
  } catch (error) {
    console.error("Student Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance"
    });
  }
};

export default getStudentAttendance;