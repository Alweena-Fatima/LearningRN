import User from "../models/User.js";

// GET LEADERBOARD (Top Students)
export const getLeaderboard = async (req, res) => {
  try {
    // 1. Find users with role "student"
    // 2. Sort by points in descending order (-1)
    // 3. Select only the fields we need (Optimization)
    const students = await User.find({ role: "student" })
      .sort({ points: -1 }) 
      .select("name department points attendedEvents role"); 

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};