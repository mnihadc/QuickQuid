// server/routes/payment.ts
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

// Placeholder route
router.post("/create-order", async (req: Request, res: Response) => {
  res.send("Payment route working");
});

export default router; // <--- This is the line you were missing!