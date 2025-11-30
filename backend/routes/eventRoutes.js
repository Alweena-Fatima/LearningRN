import express from "express";
import { 
  createEvent, 
  getAllEvents, 
  getEventById,
   generateAiPoster,
  registerForEvent, // <--- Import the new function
  unregisterFromEvent // <--- Import this
} from "../controllers/eventController.js";

const router = express.Router();

router.post("/", createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Add this new route
router.put("/:id/register", registerForEvent);
router.put("/:id/unregister", unregisterFromEvent); // <--- Add this route
router.post("/:id/generate-poster", generateAiPoster);
export default router;