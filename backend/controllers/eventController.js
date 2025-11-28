import Event from "../models/Event.js";
import User from "../models/User.js"; // Import User model
// CREATE EVENT
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET ALL EVENTS
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE EVENT
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(404).json({ error: "Event not found" });
  }
};
// REGISTER USER FOR EVENT
export const registerForEvent = async (req, res) => {
  const { id } = req.params; // Event ID
  const { userId } = req.body; // User ID sent from frontend

  try {
    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ error: "Event not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if already registered
    if (event.registeredParticipants.includes(userId)) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Check availability
    if (event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({ error: "Event is full" });
    }

    // Update Event: Add user ID to participants
    event.registeredParticipants.push(userId);
    await event.save();

    // Update User: Add event ID to registeredEvents
    user.registeredEvents.push(id);
    await user.save();

    res.status(200).json({ message: "Registered successfully", event, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// UNREGISTER USER FROM EVENT
export const unregisterFromEvent = async (req, res) => {
  const { id } = req.params; // Event ID
  const { userId } = req.body; // User ID

  try {
    // 1. Remove User ID from Event's participants array using $pull
    const event = await Event.findByIdAndUpdate(
      id,
      { $pull: { registeredParticipants: userId } },
      { new: true } // Returns the updated document so we can see the change
    );

    if (!event) return res.status(404).json({ error: "Event not found" });

    // 2. Remove Event ID from User's registeredEvents array using $pull
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { registeredEvents: id } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Unregistered successfully", event, user });
  } catch (err) {
    console.error("Unregister Error:", err);
    res.status(500).json({ error: err.message });
  }
};