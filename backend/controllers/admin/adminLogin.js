import pool from "../../models/connectionDb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redis from "../../models/redis.js";
import { v4 as uuidv4 } from "uuid";

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    /* 1️⃣ Find admin */
    const result = await pool.query(
      `
      SELECT *
      FROM admins
      WHERE email = $1
        AND is_active = true
        AND is_verified = true
        AND role IN ('admin', 'super_admin')
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];

    /* 2️⃣ Verify password */
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    /* 3️⃣ Access token (15 min) */
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    /* 4️⃣ Refresh token (7 days) */
    const refreshTokenId = uuidv4();
    const refreshToken = jwt.sign(
      { id: user.id, tokenId: refreshTokenId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    /* 5️⃣ Store refresh token in Redis */
    await redis.set(
      `refresh:${user.id}:${refreshTokenId}`,
      "valid",
      "EX",
      7 * 24 * 60 * 60
    );

    /* 6️⃣ Update last login */
   /* 6️⃣ Update last login */
await pool.query(
  `UPDATE admins SET last_login = now() WHERE id = $1`, 
  [user.id]
);

    /* 7️⃣ SET COOKIES (CORRECT WAY) */
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,      // localhost
      sameSite: "lax",
      path: "/",          // VERY IMPORTANT
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",          // VERY IMPORTANT
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    /* 8️⃣ Response */
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default adminLogin;
