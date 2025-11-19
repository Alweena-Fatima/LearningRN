import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },

  createdAt: { type: Number, default: Date.now }
});

export default mongoose.model("Feedback", feedbackSchema);
