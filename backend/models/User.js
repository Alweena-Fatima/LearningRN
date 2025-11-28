import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  email: { 
    type: String, 
    required: true, 
    unique: true,
    // Add this validation block
    validate: {
      validator: function(v) {
        // Regex to check if email ends with @igdtuw.ac.in (case-insensitive)
        return /@igdtuw\.ac\.in$/i.test(v);
      },
      message: props => `${props.value} is not a valid IGDTUW email!`
    }
  },
  
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
  createdAt: { type: Number, default: Date.now } // Removed () to pass function reference
});

export default mongoose.model("User", userSchema);