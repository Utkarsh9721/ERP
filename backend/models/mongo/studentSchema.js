import mongoose from "mongoose";
import bcrypt from "bcrypt";

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },

  firstName: { type: String, required: true },
  lastName: { type: String },

  email: { type: String, required: true, unique: true },

  phone: { type: String },

  department: { type: String, required: true },
  semester: { type: Number, required: true },

profilePic: {
  type: String, // stores image URL
  default: ""
},


  /* 🔐 AUTH */
  password: {
    type: String,
    required: true,
    select: false
  },

  mustChangePassword: {
    type: Boolean,
    default: true
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },

  createdAt: { type: Date, default: Date.now }
});

/* 🔐 Hash password */
studentSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

/* 🔍 Compare password */
studentSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model("Student", studentSchema);
