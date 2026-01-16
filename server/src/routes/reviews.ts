import express, { Request, Response, Router } from "express";
import Review from "../models/Review.js"; // Remove .js extension
import { authorize} from "../middleware/auth.js"; 

// Define interface to include userId from the auth middleware
interface AuthRequest extends Request {
  userId?: string;
}

const router: Router = express.Router();

// 1. CREATE A REVIEW
router.post("/", authorize, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { gigId, star, desc } = req.body;

    // Optional: Check if they actually bought the gig first (Advanced)
    // For now, we will just let logged-in users review.

    const newReview = new Review({
      userId: req.userId, // This comes from the token via auth middleware
      gigId,
      star,
      desc
    });

    await newReview.save();
    res.status(201).send("Review created!");
  } catch (error) {
    console.log(error); // Helpful for debugging
    res.status(500).send("Error creating review");
  }
});

// 2. GET REVIEWS FOR A GIG
router.get("/:gigId", async (req: Request, res: Response): Promise<any> => {
  try {
    const reviews = await Review.find({ gigId: req.params.gigId });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).send("Error fetching reviews");
  }
});

export default router;