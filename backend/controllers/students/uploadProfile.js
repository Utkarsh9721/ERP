import pool from "../../models/connectionDb.js";
import cloudinary from "../../models/cloudanry.js";

/* ================= UPLOAD PROFILE ================= */
const uploadProfile = async (req, res) => {
  try {
    const studentId = req.user.userId; // PostgreSQL id

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: "student_profiles",
      transformation: [{ width: 300, height: 300, crop: "fill" }]
    });

    const result = await pool.query(
      `
      UPDATE students
      SET profile_pic_url = $1
      WHERE id = $2
      RETURNING profile_pic_url
      `,
      [uploadResult.secure_url, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePic: result.rows[0].profile_pic_url
    });

  } catch (error) {
    console.error("Profile Upload Error:", error);
    res.status(500).json({
      message: "Profile upload failed"
    });
  }
};

/* ================= DELETE PROFILE ================= */
export const deleteProfile = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const studentResult = await pool.query(
      `SELECT profile_pic_url FROM students WHERE id = $1`,
      [studentId]
    );

    if (
      studentResult.rows.length === 0 ||
      !studentResult.rows[0].profile_pic_url
    ) {
      return res.status(404).json({
        message: "Profile photo not found"
      });
    }

    const imageUrl = studentResult.rows[0].profile_pic_url;

    /* 🔥 Extract Cloudinary public_id */
    const publicId = imageUrl
      .split("/")
      .slice(-2)
      .join("/")
      .replace(/\.(jpg|jpeg|png|webp)$/i, "");

    await cloudinary.uploader.destroy(publicId);

    await pool.query(
      `
      UPDATE students
      SET profile_pic_url = NULL
      WHERE id = $1
      `,
      [studentId]
    );

    res.status(200).json({
      message: "Profile photo deleted successfully"
    });

  } catch (error) {
    console.error("Delete Profile Error:", error);
    res.status(500).json({
      message: "Failed to delete profile photo"
    });
  }
};

export default uploadProfile;