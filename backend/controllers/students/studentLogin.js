import pool from "../../models/connectionDb.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import redis from "../../models/redis.js";

const studentLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    /* ✅ Validation */
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Student ID / Email and password required"
      });
    }

    /* 🔍 Find student by email or student_id */
    const result = await pool.query(
      `SELECT *
       FROM students
       WHERE LOWER(email)=LOWER($1)
          OR student_id=$2`,
      [identifier.trim(), identifier.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Student not found"
      });
    }

    const student = result.rows[0];

    /* 🔐 Compare password */
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    /* 🎫 Access token */
    const accessToken = jwt.sign(
      {
        userId: student.id,
        role: "student"
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    /* 🔁 Refresh token */
    const refreshTokenId = uuidv4();

    const refreshToken = jwt.sign(
      {
        userId: student.id,
        role: "student",
        tokenId: refreshTokenId
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    /* 🧠 Save refresh token in Redis */
    await redis.set(
      `student:refresh:${student.id}:${refreshTokenId}`,
      "valid",
      "EX",
      7 * 24 * 60 * 60
    );

    /* 🍪 Cookies */
    res.cookie("student_access", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 15 * 60 * 1000
    });

    res.cookie("student_refresh", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    /* ⚠️ Force password change */
    if (student.must_change_password) {
      return res.status(200).json({
        success: true,
        mustChangePassword: true,
        message: "Password change required"
      });
    }

    /* ✅ Success */
    return res.status(200).json({
      success: true,
      message: "Login successful",
      student: {
        id: student.id,
        studentId: student.student_id,
        name: student.full_name,
        email: student.email,
        branch: student.branch,
        section: student.section,
        semester: student.semester
      }
    });

  } catch (err) {
    console.error("Student Login Error:", err);

    return res.status(500).json({
      message: "Login failed"
    });
  }
};

export default studentLogin;