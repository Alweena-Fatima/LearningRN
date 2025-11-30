import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  category: {
    type: String,
    enum: [
      "Technical", "Cultural", "Sports", "Workshop",
      "Social", "Academic", "Other"
    ],
    required: true
  },

  clubName: { type: String, required: true },
  // --- ADD THIS SECTION ---
  socials: {
    instagram: { type: String },
    twitter: { type: String },
    linkedin: { type: String }
  },
  // ------------------------
  venue: { type: String, required: true },
  date: { type: Number, required: true },

  startTime: { type: String, required: true },
  endTime: { type: String, required: true },

  imageUrl: { type: String, required: true },

  maxParticipants: { type: Number, required: true },
  registeredParticipants: [{ type: String }],

  registrationDeadline: { type: Number, required: true },

  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming"
  },

  createdBy: { type: String, required: true },
  createdAt: { type: Number, default: Date.now },

  points: { type: Number, default: 0 },
});

export default mongoose.model("Event", eventSchema);
