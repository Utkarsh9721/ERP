import pool from "../models/connectionDb.js"; // PostgreSQL pool connection
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import bcrypt from 'bcrypt';

// Random password generator
const generatePassword = (length = 10) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

// Multer setup
export const upload = multer({ storage: multer.memoryStorage() });

// Admin → Add Faculty
const facultyAdmin = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      facultyId,
      name,
      email,
      phone,
      department,
      designation,
      classes // array of { branch, section }
    } = req.body;

    if (!facultyId || !name || !email || !department || !designation || !classes) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const classArray = typeof classes === "string" ? JSON.parse(classes) : classes;
    if (!Array.isArray(classArray) || classArray.length === 0) {
      return res.status(400).json({ message: "At least one class assignment is required" });
    }

    await client.query("BEGIN");

    // Check if faculty exists
    const exists = await client.query(
      "SELECT * FROM faculty WHERE faculty_id=$1 OR email=$2",
      [facultyId, email]
    );

    if (exists.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Faculty already exists" });
    }

    // Generate password & hash it
    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10); // 10 salt rounds

    // Handle image upload
    let profile_pic_url = null;
    if (req.file) {
      const uploadPath = path.join("uploads/faculty", Date.now() + "-" + req.file.originalname);
      fs.writeFileSync(uploadPath, req.file.buffer);
      profile_pic_url = "/" + uploadPath.replace(/\\/g, "/");
    }

    // Insert into faculty table with hashed password
    const facultyResult = await client.query(
      `INSERT INTO faculty(
        faculty_id, name, email, phone, department, designation, profile_pic_url, password
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [facultyId, name, email, phone, department, designation, profile_pic_url, hashedPassword]
    );

    const facultyDbId = facultyResult.rows[0].id;

    // Insert classes
    for (let cls of classArray) {
      if (!cls.branch || !cls.section) continue;
      await client.query(
        `INSERT INTO faculty_class(faculty_id, branch, section) VALUES($1,$2,$3)`,
        [facultyDbId, cls.branch, cls.section]
      );
    }

    await client.query("COMMIT");

    // Send credentials via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"ERP Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your ERP Login Credentials",
      html: `
        <h3>Welcome to College ERP</h3>
        <p><b>Faculty ID:</b> ${facultyId}</p>
        <p><b>Password:</b> ${rawPassword}</p>
        <p>Please change your password after first login.</p>
      `
    });

    return res.status(201).json({
      message: "Faculty added successfully & credentials emailed",
      faculty: facultyResult.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Faculty Admin Error:", error);
    return res.status(500).json({ message: "Failed to add faculty" });
  } finally {
    client.release();
  }
};

export default facultyAdmin;