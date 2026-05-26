import pool from "../models/connectionDb.js";
import cloudinary from "../models/cloudanry.js";

const addAnnouncement = async (req, res) => {
  try {
    const { title, description, created_by } = req.body;

    if (!title || !description || !created_by) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let image_url = null;

    if (req.file) {
      image_url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "announcements", timeout: 60000 }, // ⏱ increase timeout
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    }

    const dbResult = await pool.query(
      `INSERT INTO announcements (title, description, image_url, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, image_url, created_by]
    );

    return res.status(201).json({
      message: "Announcement added successfully",
      data: dbResult.rows[0],
    });

  } catch (err) {
    console.error("Announcement error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export default addAnnouncement;
