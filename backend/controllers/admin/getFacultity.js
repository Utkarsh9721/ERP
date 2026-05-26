import pool from "../../models/connectionDb.js";

const getAllFaculty = async (req, res) => {
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

export default getAllFaculty;