import placementSchema from "../models/mongo/placementSchema.js";

const placementPublic = async (req, res) => {
  try {
    const placements = await placementSchema.find({ isPublic: true });
    res.status(200).json(placements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch placements" });
  }
};

export default placementPublic;
