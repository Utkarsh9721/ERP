import pool from "../../models/connectionDb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import redis from "../../models/redis.js";

const superLogin = async (req, res) => {
  try {
    console.log("Super admin login request received");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM super_admin WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const superAdmin = result.rows[0];

    const isMatch = await bcrypt.compare(password, superAdmin.password);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    console.log("Password verified");

    const accessToken = jwt.sign(
      {
        userId: superAdmin.id,
        role: "super_admin"
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshTokenId = uuidv4();

    const refreshToken = jwt.sign(
      {
        userId: superAdmin.id,
        tokenId: refreshTokenId
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    try {
      // works with redis@4+
await redis.set(
  `refresh:${superAdmin.id}:${refreshTokenId}`,
  "valid",
  { EX: 7 * 24 * 60 * 60 } // 7 days in seconds
);
      console.log("Refresh token stored in Redis");
    } catch (err) {
      console.error("Redis error:", err.message);
    }

    res.cookie("super_access", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("super_refresh", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: "Super Admin Login Successful",
      admin: {
        id: superAdmin.id,
        email: superAdmin.email
      }
    });

  } catch (error) {
    console.error("Super Login Error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

export default superLogin;