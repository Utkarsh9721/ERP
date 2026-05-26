import pool from "../models/connectionDb.js";
import cloudinary from "../models/cloudanry.js";

/* 🔹 Extract Cloudinary public_id from URL */
const getPublicId = (url) => {
  if (!url) return null;

  try {
    const parts = url.split("/");
    const fileWithExt = parts.pop();               // post1.png
    const fileName = fileWithExt.split(".")[0];    // post1

    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    const folderPath = parts.slice(uploadIndex + 2).join("/");
    return folderPath ? `${folderPath}/${fileName}` : fileName;
  } catch {
    return null;
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    /* 🔹 Fetch announcement */
    const result = await pool.query(
      "SELECT image_url FROM announcements WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    const imageUrl = result.rows[0].image_url;

    /* 🔹 Delete image from Cloudinary */
    if (imageUrl) {
      const publicId = getPublicId(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      }
    }

    /* 🔹 Delete announcement from DB */
    await pool.query("DELETE FROM announcements WHERE id = $1", [id]);

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Delete announcement error:", err);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};

export default deleteAnnouncement;
