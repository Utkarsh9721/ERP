import cloudinary from "../models/cloudanry.js"; // Fixed typo in import
import Placement from "../models/mongo/placementSchema.js";

// Helper function to extract public ID from Cloudinary URL
const getPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' and remove version prefix (v1234567890/)
    const afterUpload = urlParts.slice(uploadIndex + 1).join('/');
    const publicIdWithExtension = afterUpload.replace(/^v\d+\//, '');
    
    // Remove file extension
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

const deletePlacement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1️⃣ Find placement
    const placement = await Placement.findById(id);
    if (!placement) {
      return res.status(404).json({ message: "Placement not found" });
    }
    
    // 2️⃣ Delete student's image (if exists)
    if (placement.studentImage) {
      const publicId = getPublicId(placement.studentImage);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }
    
    // 3️⃣ Delete placement from database
    await Placement.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Placement deleted successfully" });
    
  } catch (err) {
    console.error("Delete placement error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default deletePlacement;