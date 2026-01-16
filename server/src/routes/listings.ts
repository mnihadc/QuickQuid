import express, { Request, Response, Router } from "express";
import multer, { FileFilterCallback } from "multer";
import Listing from "../models/Listing.js"; 
import { authorize} from "../middleware/auth.js";  

// 1. Extend the Express Request type to include properties added by your auth middleware
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const router: Router = express.Router();

// SETUP FILE UPLOAD
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "uploads/"); 
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, Date.now() + "-" + file.originalname); 
  },
});

const upload = multer({ storage });

// 2. CREATE A LISTING (Only for Logged-in Sellers)
// We use 'AuthRequest' here so TypeScript knows about userId and userRole
router.post("/", authorize, upload.single("image"), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Check if user is a Seller
    if (req.userRole !== "seller") {
        return res.status(403).json({ message: "Only sellers can create listings." });
    }

    const { title, description, price, category, sellerName } = req.body;

    const newListing = new Listing({
      title,
      description,
      price,
      category,
      sellerName,
      seller: req.userId, // Valid now because of AuthRequest
      image: req.file ? req.file.path : "", 
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    console.error(error); // Good practice to log the actual error
    res.status(500).json({ message: "Error creating listing" });
  }
});

// 3. GET ALL LISTINGS (Public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const listings = await Listing.find();
    res.status(200).json(listings);
  } catch (error) {
    res.status(404).json({ message: "No listings found" });
  }
});

export default router;