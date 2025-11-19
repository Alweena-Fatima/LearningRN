import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  
  registeredAt: { type: Number, default: Date.now },

  attended: { type: Boolean, default: false }
});

export default mongoose.model("Registration", registrationSchema);
