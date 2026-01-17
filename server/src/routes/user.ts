import express, { Request, Response, Router } from "express";
import multer from "multer";
import User from "../models/User.js"; 
import { authorize} from "../middleware/auth.js"; 

// Define custom request interface to include userId from middleware
interface AuthRequest extends Request {
  userId?: string;
}

const router: Router = express.Router();

// 1. SETUP IMAGE UPLOAD STORAGE
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, "uploads/"); 
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, Date.now() + "-" + file.originalname); 
  },
});

const upload = multer({ storage: storage });

// 2. SUBMIT VERIFICATION (Upload ID Card)
router.put("/verify", authorize, upload.single("idCard"), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { college } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).send("Please upload your College ID Card.");
    }

    // Update the User in Database
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).send("User not found");

    if (user.verificationStatus === "approved") {
      return res.status(400).send("You are already verified!");
    }

    user.college = college || user.college;
    user.idCardImage = req.file.path; // Save file path
    user.verificationStatus = "pending"; // Mark as pending approval

    await user.save();

    res.status(200).json({ 
      message: "Verification submitted! Admin will review it.", 
      status: user.verificationStatus 
    });

  } catch (error) {
    console.log(error);
    res.status(500).send("Error submitting verification.");
  }
});

// 3. GET MY PROFILE (To check status)
router.get("/me", authorize, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await User.findById(req.userId).select("-password"); // Don't send password back
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (error) {
    res.status(500).send("Error fetching profile");
  }
});

// 4. GENERAL PROFILE UPDATE (Name, Avatar)
// Fixed: Moved OUTSIDE of the previous router.get() function
router.put("/update", authorize, upload.single("profilePic"), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name } = req.body;
    
    // Find the user
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send("User not found");

    // Update fields if they are provided
    if (name) user.name = name;
    
    // If they uploaded a new Profile Picture (Not the ID Card)
    if (req.file) {
      // Assuming 'img' exists in your User interface/schema
     // user.img = req.file.path; 
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully!", user });

  } catch (error) {
    res.status(500).send("Error updating profile");
  }
});

export default router;