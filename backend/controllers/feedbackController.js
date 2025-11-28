import Feedback from "../models/Feedback.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

export const createFeedback = async (req, res) => {
  const { eventId, userId, userName, rating, comment } = req.body;

  try {
    // 1. Check if Event and User exist
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ error: "Event not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. Create Feedback
    const feedback = await Feedback.create({
      eventId,
      userId,
      userName,
      rating,
      comment,
      createdAt: Date.now(),
    });

    // 3. Update User: Add Points and mark as Attended
    // We check if the user has already been credited to avoid double points
    if (!user.attendedEvents.includes(eventId)) {
      user.points += event.points;
      user.attendedEvents.push(eventId);
      await user.save();
    }

    res.status(201).json({ feedback, updatedUser: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};