import studentSchema from "../../models/mongo/studentSchema.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import redis from "../../models/redis.js";

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPass } = req.body;

    // 1️⃣ Validate input
    if (!email || !otp || !password || !confirmPass) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPass) {
      return res
        .status(400)
        .json({ message: "Password and confirm password do not match" });
    }

    // 2️⃣ Find student
    const student = await studentSchema.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 3️⃣ Get OTP from Redis
    const redisKey = `otp:${email}`;
    const storedHashedOtp = await redis.get(redisKey);

    if (!storedHashedOtp) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    // 4️⃣ Hash incoming OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (hashedOtp !== storedHashedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 5️⃣ Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    student.password = hashedPassword;
    await student.save();

    // 6️⃣ Delete OTP from Redis
    await redis.del(redisKey);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default resetPassword;
