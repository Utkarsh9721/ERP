import pool from "../../models/connectionDb.js";

// Get all faculty with their assigned classes
export const getFaculty = async (req, res) => {
  try {
    const facultyRes = await pool.query(`
      SELECT f.id, f.faculty_id, f.name, f.email, f.phone, f.department, f.designation, f.profile_pic_url,
             json_agg(json_build_object('branch', fc.branch, 'section', fc.section)) AS classes
      FROM faculty f
      LEFT JOIN faculty_class fc ON f.id = fc.faculty_id
      GROUP BY f.id
      ORDER BY f.name
    `);

    res.status(200).json(facultyRes.rows);
  } catch (err) {
    console.error("Fetch Faculty Error:", err);
    res.status(500).json({ message: "Failed to fetch faculty" });
  }
};

// Get all faculty-class assignments
export const ScheduleFaculty = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fc.*, f.name as faculty_name, f.faculty_id as faculty_code
      FROM faculty_class fc
      JOIN faculty f ON fc.faculty_id = f.id
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
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Fetch Schedules Error:", err);
    res.status(500).json({ message: "Failed to fetch schedules" });
  }
};

// Create new faculty-class assignment
export const createFacultyClass = async (req, res) => {
  const { faculty_id, branch, section, semester, subject, day, start_time, end_time } = req.body;
  
  try {
    // Validate required fields
    if (!faculty_id || !branch || !section || !semester || !subject || !day || !start_time || !end_time) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }
    
    // Check for conflicts
    const conflictCheck = await pool.query(
      `SELECT * FROM faculty_class 
       WHERE faculty_id = $1 AND day = $2 AND start_time = $3`,
      [faculty_id, day, start_time]
    );
    
    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ 
        success: false,
        message: "Faculty already has a class at this time slot" 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO faculty_class (faculty_id, branch, section, semester, subject, day, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [faculty_id, branch, section, semester, subject, day, start_time, end_time]
    );
    
    // Get faculty name for response
    const facultyResult = await pool.query(
      `SELECT name, faculty_id FROM faculty WHERE id = $1`,
      [faculty_id]
    );
    
    res.status(201).json({ 
      success: true,
      data: {
        ...result.rows[0],
        faculty_name: facultyResult.rows[0]?.name,
        faculty_code: facultyResult.rows[0]?.faculty_id
      },
      message: "Class schedule created successfully" 
    });
  } catch (err) {
    console.error("Create Schedule Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to create schedule" 
    });
  }
};

// Update faculty-class assignment
export const updateFacultyClass = async (req, res) => {
  const { id } = req.params;
  const { faculty_id, branch, section, semester, subject, day, start_time, end_time } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE faculty_class 
       SET faculty_id = $1, branch = $2, section = $3, semester = $4, 
           subject = $5, day = $6, start_time = $7, end_time = $8
       WHERE id = $9
       RETURNING *`,
      [faculty_id, branch, section, semester, subject, day, start_time, end_time, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Schedule not found" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      data: result.rows[0],
      message: "Schedule updated successfully" 
    });
  } catch (err) {
    console.error("Update Schedule Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update schedule" 
    });
  }
};

// Delete faculty-class assignment
export const deleteFacultyClass = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `DELETE FROM faculty_class WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Schedule not found" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: "Schedule deleted successfully" 
    });
  } catch (err) {
    console.error("Delete Schedule Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete schedule" 
    });
  }
};