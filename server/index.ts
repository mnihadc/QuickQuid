import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Route Imports
import authRoutes from "./src/routes/auth.js";
import listingRoutes from "./src/routes/listings.js";
import orderRoutes from "./src/routes/orders.js";
import reviewRoutes from "./src/routes/reviews.js";
import paymentRoutes from "./src/routes/payment.js";
import userRoutes from "./src/routes/user.js";
import chatbotRoutes from "./src/routes/chatbot/chatbot.routes.js";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Make the 'uploads' folder public
app.use('/uploads', express.static('uploads')); 

// Routes
app.use("/api/user", userRoutes);
app.use("/user", authRoutes);
app.use("/listings", listingRoutes);
app.use("/orders", orderRoutes);
app.use("/reviews", reviewRoutes);
app.use("/payment", paymentRoutes);
app.use("/chatbot", chatbotRoutes);

// Database Connection
// ✅ TIP: Added 'quickquid' (database name) to the URL. 
// Without it, Mongo saves data to the generic 'test' database.
const CONNECTION_URL: string = process.env.MONGO_URI || "mongodb://localhost:27017/quickquid"; 
const PORT: string | number = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((error) => console.log(error.message));