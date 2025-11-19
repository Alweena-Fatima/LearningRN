import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed!",
    user: req.user,
  });
});

export default router;
