import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  role: { 
    type: String,
    enum: ["student", "admin"],
    required: true 
  },

  collegeId: { type: String },
  department: { type: String },
  clubName: { type: String },

  password: { type: String, required: true },

  points: { type: Number, default: 0 },

  registeredEvents: [{ type: String }],
  attendedEvents: [{ type: String }],

  createdAt: { type: Number, default: Date.now() }
});

export default mongoose.model("User", userSchema);
