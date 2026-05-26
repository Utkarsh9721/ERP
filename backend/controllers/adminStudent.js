import pool from "../models/connectionDb.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

/* 🔑 Password generator */
const generatePassword = (length = 10) => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
};

const adminStudent = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      studentId,
      rollNumber,
      firstName,
      lastName,
      email,
      phone,
      branch,
      section,
      semester,
      admissionYear,
      dateOfBirth,
      gender,
      fatherName,
      motherName,
      address,
      city,
      state,
      pincode,
      bloodGroup,
      category,
      achievements,
      certificates
    } = req.body;

    /* ✅ Validation */
    if (
      !studentId ||
      !rollNumber ||
      !firstName ||
      !email ||
      !branch ||
      !section ||
      !semester ||
      !admissionYear
    ) {
      return res.status(400).json({
        message: "Please provide all required fields"
      });
    }

    await client.query("BEGIN");

    /* 🔍 Duplicate check */
    const exists = await client.query(
      `SELECT id FROM students
       WHERE student_id=$1 OR email=$2 OR roll_number=$3`,
      [studentId, email, rollNumber]
    );

    if (exists.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Student already exists"
      });
    }

    /* 🔑 Generate + hash password */
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    /* 🖼️ Profile upload */
    let profilePicUrl = null;

    if (req.file) {
      const uploadDir = "uploads/students";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(
        uploadDir,
        Date.now() + "-" + req.file.originalname
      );

      fs.writeFileSync(filePath, req.file.buffer);
      profilePicUrl = "/" + filePath.replace(/\\/g, "/");
    }

    /* 📜 Certificates JSON */
    const certificatesArray = certificates
      ? certificates.split(",").map((c) => c.trim())
      : [];

    /* 💾 Insert into PostgreSQL */
    const result = await client.query(
      `INSERT INTO students (
        student_id,
        roll_number,
        first_name,
        last_name,
        full_name,
        email,
        phone,
        password,
        branch,
        section,
        semester,
        admission_year,
        date_of_birth,
        gender,
        father_name,
        mother_name,
        address,
        city,
        state,
        pincode,
        blood_group,
        category,
        profile_pic_url,
        certificates,
        achievements
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25
      ) RETURNING id, student_id, email`,
      [
        studentId,
        rollNumber,
        firstName,
        lastName,
        `${firstName} ${lastName || ""}`.trim(),
        email,
        phone,
        hashedPassword,
        branch,
        section,
        Number(semester),
        Number(admissionYear),
        dateOfBirth || null,
        gender,
        fatherName,
        motherName,
        address,
        city,
        state,
        pincode,
        bloodGroup,
        category,
        profilePicUrl,
        JSON.stringify(certificatesArray),
        achievements
      ]
    );

    await client.query("COMMIT");

    /* 📧 Send password email */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"ERP Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your ERP Login Password",
      html: `
        <h3>Welcome to College ERP</h3>
        <p><b>Student ID:</b> ${studentId}</p>
        <p><b>Password:</b> ${plainPassword}</p>
        <p>Please change password after first login.</p>
      `
    });

    return res.status(201).json({
      message: "Student added successfully",
      student: result.rows[0],
      tempPassword: plainPassword
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Upload Student Error:", error);

    return res.status(500).json({
      message: "Failed to add student",
      error: error.message
    });
  } finally {
    client.release();
  }
};

export default adminStudent;