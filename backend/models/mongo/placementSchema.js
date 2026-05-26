import mongoose from "mongoose";

const placementSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    // Roll number / college ID (NOT Mongo ObjectId for now)
    studentId: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
    },

    batch: {
      type: String,
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    jobRole: {
      type: String,
      required: true,
    },

    packageLPA: {
      type: Number,
      require:true,
    },

    placementType: {
      type: String,
      enum: ["On-Campus", "Off-Campus"],
      default: "On-Campus",
    },

    studentImage: {
      type: String, // Cloudinary URL
    },

    offerLetter: {
      type: String, // PDF URL
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    // optional until JWT auth is added
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Placement", placementSchema);
