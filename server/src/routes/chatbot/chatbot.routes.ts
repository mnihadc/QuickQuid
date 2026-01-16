import { Router } from "express";
import { authorize } from "../../middleware/auth.js";
import { chatbotController } from "./chatbot.controller.js";

const router = Router();

router.post("/", authorize, chatbotController);

export default router;
