import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.js";
import { handleChat } from "./chatbot.logic.js";
import { saveMessage, getHistory } from "./chatbot.store.js";

export const chatbotController = async (req: AuthRequest, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Save user message
  saveMessage({
    userId: req.userId!,
    role: req.userRole!,
    message,
    timestamp: Date.now()
  });

  const response = handleChat(req.userRole!, message);

  // Save bot response
  saveMessage({
    userId: req.userId!,
    role: "bot" as any,
    message: response.reply,
    timestamp: Date.now()
  });

  res.json({
    reply: response.reply,
    history: getHistory(req.userId!)
  });
};
