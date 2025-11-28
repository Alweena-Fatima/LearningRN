import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/test.js";
import eventRoutes from "./routes/eventRoutes.js"
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/test", testRoutes);
// routes
app.use("/auth", authRoutes);
app.use("/api/events", eventRoutes);

// connect mongo
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

app.listen(process.env.PORT, () =>
  console.log("Server running on", process.env.PORT)
);
app.use("/api/feedbacks", feedbackRoutes);