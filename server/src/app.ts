import express from "express";
import type { Application } from "express";
import cors from "cors";
import chatbotRoutes from "./routes/chatbot/chatbot.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/chatbot", chatbotRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 Server running");
});

export default app;
