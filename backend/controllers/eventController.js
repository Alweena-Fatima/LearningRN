import Event from "../models/Event.js";
import User from "../models/User.js";
// Removed: import OpenAI from "openai"; 

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
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const event = await Event.findById(id);
    const user = await User.findById(userId);

    if (!event) return res.status(404).json({ error: "Event not found" });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (event.registeredParticipants.includes(userId)) {
      return res.status(400).json({ error: "User already registered" });
    }

    if (event.registeredParticipants.length >= event.maxParticipants) {
      return res.status(400).json({ error: "Event is full" });
    }

    event.registeredParticipants.push(userId);
    await event.save();

    user.registeredEvents.push(id);
    await user.save();

    res.status(200).json({ message: "Registered successfully", event, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UNREGISTER USER FROM EVENT
export const unregisterFromEvent = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const event = await Event.findByIdAndUpdate(
      id,
      { $pull: { registeredParticipants: userId } },
      { new: true }
    );

    if (!event) return res.status(404).json({ error: "Event not found" });

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

export const generateAiPoster = async (req, res) => {
  const { id } = req.params;
  const apiKey = process.env.STABILITY_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "Missing API Key" });

  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    console.log(`🎨 Generating Poster for: ${event.title}...`);

    // 1. Call Stability AI
    const response = await fetch(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: `Event poster for ${event.title}. ${event.category}. ${event.description}. Professional, 4k resolution.`,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Stability AI Error");
    }

    // 2. Extract Base64 (Do NOT save to DB)
    const base64Image = result.artifacts[0].base64;

    console.log("✅ Image generated, sending to client...");

    // 3. Send Base64 directly to Frontend
    res.json({ 
      message: "Generated", 
      b64Data: base64Image // Send raw base64 string
    });

  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
};