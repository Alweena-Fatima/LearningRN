import Event from "../models/Event.js";
import User from "../models/User.js";
import { createCanvas, loadImage } from "canvas"; // Import Canvas

// ... (Create, Get, Register, Unregister functions remain exactly the same) ...

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

// REGISTER USER
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

// UNREGISTER USER
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

    console.log(`🎨 Generating Poster for: ${event.title}`);

    // --- 1. GENERATE BACKGROUND ART (AI) ---
    // We ask for ART ONLY. No text.
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
              // We use the Category and Description to inspire the art style
              text: `Background poster art for a ${event.category} event about ${event.title}. 
                     Theme: ${event.description.substring(0, 50)}.
                     Style: Minimalist, Cyberpunk or Professional (depending on category), 4K, High Detail.
                     Composition: Darker bottom half, empty space in center for text.`,
              weight: 1,
            },
            {
              text: "text, letters, words, watermark, signature, blurry, low quality, white background",
              weight: -1,
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
    if (!response.ok) throw new Error(result.message || "Stability AI Error");

    const base64Image = result.artifacts[0].base64;

    // --- 2. COMPOSE TEXT OVERLAY (CANVAS) ---
    console.log("🎨 Drawing Text Details...");

    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext("2d");

    // A. Draw AI Background
    const img = await loadImage(`data:image/png;base64,${base64Image}`);
    ctx.drawImage(img, 0, 0, 1024, 1024);

    // B. Add Gradient Overlay (Crucial for text readability)
    // Darkens the bottom 60% of the image so white text pops
    const gradient = ctx.createLinearGradient(0, 400, 0, 1024);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.4, "rgba(0,0,0,0.6)");
    gradient.addColorStop(1, "rgba(0,0,0,0.95)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    // --- C. TEXT RENDERING LOGIC ---

    // 1. CLUB NAME & CATEGORY (Top Header)
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFD700"; // Gold
    ctx.font = "bold 28px Arial";
    // Ex: "ROBOTICS CLUB PRESENTS | WORKSHOP"
    const headerText = `${event.clubName.toUpperCase()} PRESENTS  |  ${event.category.toUpperCase()}`;
    ctx.fillText(headerText, 512, 600);

    // 2. EVENT TITLE (Main Focus)
    ctx.fillStyle = "#FFFFFF"; // White
    ctx.font = "bold 75px Arial";
    
    // Wrap Title if it's too long
    const titleWords = event.title.split(" ");
    let line = "";
    let y = 690; // Starting Y position for title

    for (let n = 0; n < titleWords.length; n++) {
      const testLine = line + titleWords[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 950 && n > 0) {
        ctx.fillText(line, 512, y);
        line = titleWords[n] + " ";
        y += 85; // Line height
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 512, y);

    // 3. DATE, TIME, VENUE (The Details)
    y += 60; // Add spacing below title
    ctx.fillStyle = "#00FFFF"; // Cyan (High Contrast)
    ctx.font = "bold 32px Arial";

    // Format Date from Timestamp (Number)
    const dateObj = new Date(event.date);
    const dateStr = dateObj.toLocaleDateString("en-US", { 
      weekday: 'short', month: 'short', day: 'numeric' 
    }); // Ex: "Mon, Oct 25"

    const timeStr = `${event.startTime} - ${event.endTime}`;
    
    // Draw: 📅 Mon, Oct 25   ⏰ 10:00 AM - 2:00 PM
    ctx.fillText(`📅 ${dateStr}   ⏰ ${timeStr}`, 512, y);

    y += 45;
    // Draw Venue
    ctx.fillStyle = "#DDDDDD"; // Light Grey
    ctx.font = "30px Arial";
    ctx.fillText(`📍 ${event.venue}`, 512, y);

    // 4. DESCRIPTION (Context)
    y += 60;
    ctx.fillStyle = "#AAAAAA"; // Grey
    ctx.font = "italic 24px Arial";
    // Clean up newlines and truncate
    const cleanDesc = event.description.replace(/\n/g, " ");
    const shortDesc = cleanDesc.length > 110 
      ? cleanDesc.substring(0, 110) + "..." 
      : cleanDesc;
    ctx.fillText(shortDesc, 512, y);

    // 5. REGISTRATION DEADLINE (Footer - Call to Action)
    y += 80;
    ctx.fillStyle = "#FF4500"; // Orange-Red (Urgency)
    ctx.font = "bold 26px Arial";
    
    const deadlineObj = new Date(event.registrationDeadline);
    const deadlineStr = deadlineObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    
    ctx.fillText(`⚠️ Register by: ${deadlineStr}`, 512, y);

    // --- 3. SEND RESPONSE ---
    const finalBuffer = canvas.toBuffer("image/png");
    res.json({
      message: "Generated",
      b64Data: finalBuffer.toString("base64"),
    });

  } catch (err) {
    console.error("AI Generation Error:", err);
    res.status(500).json({ error: "Failed to generate poster" });
  }
};