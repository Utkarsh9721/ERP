import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import redis from "../../models/redis.js";
import pool from "../../models/connectionDb.js"; // PostgreSQL pool connection

const facultyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* 🔍 Validation */
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    /* 🔎 Fetch faculty from PostgreSQL */
    const result = await pool.query(
      "SELECT * FROM faculty WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const faculty = result.rows[0];

    if (!faculty.password) {
      return res.status(500).json({ message: "Faculty password not set. Contact admin." });
    }

    /* 🔐 Compare password */
    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    /* 🎫 Access token (1 day) */
    const accessToken = jwt.sign(
      { userId: faculty.id, role: "faculty" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1d" }
    );

    /* 🔁 Refresh token (7 days) */
    const refreshTokenId = uuidv4();
    const refreshToken = jwt.sign(
      { userId: faculty.id, tokenId: refreshTokenId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    /* 🧠 Store refresh token in Redis */
    await redis.set(
      `refresh:${faculty.id}:${refreshTokenId}`,
      "valid",
      "EX",
      7 * 24 * 60 * 60
    );

    /* 🍪 Set cookies */
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    /* ⚠️ Force password change on first login */
    if (faculty.mustchangepassword) {
      return res.status(200).json({
        message: "Password change required",
        mustChangePassword: true
      });
    }

    /* ✅ Successful login */
    return res.status(200).json({
      message: "Faculty login successful",
      faculty: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        branch: faculty.branch,
        section: faculty.section
      }
    });

  } catch (error) {
    console.error("Faculty Login Error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export default facultyLogin;