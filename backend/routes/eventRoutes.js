import express from "express";
import { 
  createEvent, 
  getAllEvents, 
  getEventById, 
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
export default router;