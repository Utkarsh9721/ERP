import mongooseConnection from "../../models/mongo/connection.js";
import pool from "../../models/connectionDb.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const generatePassword = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const addInstitute = async (req, res) => {
  const { full_name, email, mobile } = req.body;

  try {
    if (!full_name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    // generate password
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    // store admin in DB
    const result = await pool.query(
      `INSERT INTO admins 
       (id, full_name, email, password, role, mobile)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [id, full_name, email, hashedPassword, "admin", mobile || null]
    );

    // send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"College ERP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Institute Admin Account Created",
      html: `
        <p>Hello,</p>
        <p>You have been added to the Works_E ERP System.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${password}</p>
        <p>Please login and change your password.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Institute admin created and email sent",
      data: result.rows[0],
    });


  } catch (err) {
    console.error("Server error:", err);

    // handle duplicate email error
    if (err.code === "23505" && err.constraint === "admins_email_key") {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export default addInstitute;

