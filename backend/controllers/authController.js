import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/email.js"; // Import the email helper

// 1. REGISTER (Now initiates OTP instead of instant creation)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, collegeId, department, clubName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });

    // If user exists AND is verified, block them
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 mins

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = existingUser;

    if (user) {
      // User exists but NOT verified -> Update them with new details & OTP
      user.name = name;
      user.password = hashedPassword;
      user.role = role;
      user.collegeId = collegeId;
      user.department = department;
      user.clubName = clubName;
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      // Create new user with isVerified: false
      user = new User({
        name,
        email,
        role,
        collegeId,
        department,
        clubName,
        password: hashedPassword,
        points: 0,
        isVerified: false, // <--- Important
        otp,
        otpExpires,
      });
    }

    await user.save();

    // Send Email
    await sendOTPEmail(email, otp);

    // Return success but NO token yet
    res.status(200).json({ 
      message: "OTP sent to your email", 
      userId: user._id 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// 2. VERIFY OTP (New Function)
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if verified
    if (user.isVerified) {
        return res.status(200).json({ message: "User already verified" });
    }

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Validate Expiry
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark as Verified
    user.isVerified = true;
    user.otp = undefined;       // Clear OTP
    user.otpExpires = undefined; // Clear Expiry
    await user.save();

    // Generate Token (Auto-login after verify)
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Email verified successfully",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

// 3. LOGIN (Added Verification Check)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // CHECK IF VERIFIED
    if (!user.isVerified) {
        return res.status(400).json({ message: "Please verify your email first" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};