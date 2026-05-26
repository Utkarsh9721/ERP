import Placement from "../models/mongo/placementSchema.js";
import cloudinary from "../models/cloudanry.js";

const adminPlacementData = async (req, res) => {
  try {
    let {
      studentName,
      studentId,
      department,
      batch,
      companyName,
      jobRole,
      packageLPA,
      placementType,
      isPublic,
    } = req.body;

    packageLPA = Number(packageLPA);

    if (
      !studentName ||
      !studentId ||
      !department ||
      !batch ||
      !companyName ||
      !jobRole ||
      !packageLPA
    ) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    /* =========================
       ✅ UPLOAD IMAGE TO CLOUDINARY
    ========================= */
    let studentImage = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Placements", timeout: 60000 },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      studentImage = uploadResult.secure_url;
    }

    /* =========================
       ✅ SAVE TO DATABASE
    ========================= */
    const placement = await Placement.create({
      studentName,
      studentId,
      studentImage, // ✅ SAVED HERE
      department,
      batch,
      companyName,
      jobRole,
      packageLPA,
      placementType,
      isPublic,
    });

    res.status(201).json({
      message: "Placement added successfully",
      data: placement,
    });

  } catch (error) {
    console.error("Add placement error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default adminPlacementData;
