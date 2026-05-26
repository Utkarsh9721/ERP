import studentSchema from "../../models/mongo/studentSchema.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import redis from '../../models/redis.js'

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await studentSchema.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔐 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    student.otp = hashedOtp;
    student.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    const redisKey = `otp:${email}`;
    await redis.set(redisKey,hashedOtp,'EX',6000)

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"College ERP" <${process.env.EMAIL_USER}>`,
      to: student.email,
      subject: "OTP Verification",
      html: `
        <p>Hello ${student.firstName},</p>
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default sendOtp;
