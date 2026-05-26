import pool from "../models/connectionDb.js";

const fetchData = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, image_url, created_by, created_at FROM announcements ORDER BY created_at DESC"
    );

    // SEND DATA TO FRONTEND
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Fetch announcements error:", err);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

export default fetchData;
