import pool from "../../models/connectionDb.js";

// Delete a single admin by ID
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete admin by id
    const del = await pool.query(
      "DELETE FROM admins WHERE id = $1 RETURNING id, full_name, email, mobile, role",
      [id]
    );

    if (del.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    console.log(`Deleted admin: ${del.rows[0].email}`);

    return res.status(200).json({ success: true, message: "Admin successfully deleted" });
  } catch (err) {
    console.error("Delete Admin Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch all admins
export const getAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, mobile, role, is_active, is_verified, last_login, created_at
       FROM admins
       ORDER BY created_at DESC`
    );

    console.log("Admins fetched:", result.rows.length);

    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Get Admins Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};