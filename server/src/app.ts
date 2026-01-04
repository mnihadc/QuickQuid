import express from "express";
import type { Application } from "express";
import cors from "cors";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("🚀 Server running");
});

export default app;
