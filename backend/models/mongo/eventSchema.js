import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
      enum: [
        "CSE",
        "ECE",
        "ME",
        "CE",
        "MBA",
        "CULTURAL",
        "SPORTS",
      ],
    },

    date: {
      type: Date,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

  imagePublicId: { type: String, required: true }, // 👈 ADD THIS

    // Optional but useful later
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Event", eventSchema);
