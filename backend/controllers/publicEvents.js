import eventSchema from "../models/mongo/eventSchema.js"; // your Mongoose model

// Public events fetch
export const publicEvents = async (req, res) => {
  try {
    // Fetch all events, newest first
    const events = await eventSchema.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      events
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching events"
    });
  }
};
