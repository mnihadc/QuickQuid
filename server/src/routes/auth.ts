import express, { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js"; // Assuming you have an IUser interface export in your model
import multer, { FileFilterCallback } from "multer";
import nodemailer from "nodemailer";


const router: Router = express.Router();

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // Limit: 25 MB
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'soorajkumars195@gmail.com', // --> PUT YOUR EMAIL HERE
    pass: 'iltm qqxy kpun qjuq' // --> PUT YOUR APP PASSWORD
  }
});

// --- ROUTES ---

// 1. Sign Up
router.post("/register", upload.single('document'), async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Logic: Buyers are auto-verified, Sellers are NOT.
    const isSeller = role === 'seller';
    
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      isVerified: !isSeller // True if buyer, False if seller
    });

    // If it is a Seller, we must have a file and send an email
    if (isSeller) {
      if (!req.file) return res.status(400).json({ message: "Sellers must upload a verification document." });

      // Send Email to Admin
      const verificationLink = `http://localhost:5000/user/verify/${newUser._id}`;
      
      await transporter.sendMail({
        from: '"QuickQuid Bot" <no-reply@quickquid.com>',
        to: 'soorajkumars195@gmail.com', // --> Company Mail
        subject: `New Seller Verification: ${name}`,
        html: `
          <h3>New Seller Request</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>Please check the attached document. If approved, verify them in the database.</p>
          <br>
          <a href="${verificationLink}" style="background-color: green; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ✅ Approve & Verify Seller
          </a>
          <p style="margin-top: 20px; color: #777; font-size: 12px;">
             If the button doesn't work, copy this link:<br> ${verificationLink}
          </p>
        `,
        attachments: [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: req.file.mimetype
          }
        ]
      });
      
      await newUser.save();
      return res.status(201).json({ message: "Application sent! Please wait for admin approval." });
    }

    // Buyer gets token immediately
    await newUser.save();
    
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email }, 
      "test_secret_key", 
      { expiresIn: "1h" }
    );
    
    res.status(201).json({ result: newUser, token });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// 2. Verification Route
router.get("/verify/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    // Find user and update isVerified to TRUE
    const user = await User.findByIdAndUpdate(id, { isVerified: true }, { new: true });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Show Notification HTML
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verified</title>
        <style>
          body { background-color: #f0f2f5; font-family: sans-serif; display: flex; justify-content: center; padding-top: 50px; margin: 0; }
          .notification { background-color: white; border-left: 6px solid #28a745; padding: 20px 30px; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 15px; animation: slideDown 0.5s ease-out; max-width: 400px; }
          .icon { font-size: 24px; color: #28a745; }
          .text strong { display: block; font-size: 18px; color: #333; }
          .text span { font-size: 14px; color: #666; }
          @keyframes slideDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        </style>
      </head>
      <body>
        <div class="notification">
          <div class="icon">✅</div>
          <div class="text">
            <strong>Verified!</strong>
            <span>${user.name} can now log in.</span>
          </div>
        </div>
        <script>setTimeout(() => { window.close(); }, 5000);</script>
      </body>
      </html>
    `);

  } catch (error) {
    console.log(error);
    res.status(500).send("Error verifying user");
  }
});

// 3. Login Route
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    // Check verification status for sellers
    if (existingUser.role === 'seller' && !existingUser.isVerified) {
       return res.status(403).json({ 
           message: "Your account is pending verification. Please wait for admin approval."
       });
    }

    // Send token
    const token = jwt.sign(
        { id: existingUser._id, email: existingUser.email, role: existingUser.role }, 
        "test_secret_key", 
        { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// 4. Re-Verify Route (Fixed: Moved outside of login)
router.put("/re-verify", upload.single('document'), async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body; 

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");
    
    if (user.isVerified) return res.status(400).send("You are already verified!");

    if (!req.file) return res.status(400).json({ message: "Upload a document" });

    // Re-use transporter logic here (simplified for brevity)
    const verificationLink = `http://localhost:5000/user/verify/${user._id}`;
    
    await transporter.sendMail({
        from: '"QuickQuid Bot" <no-reply@quickquid.com>',
        to: 'mail', // --> Company Mail
        subject: `Re-Verification Request: ${user.name}`,
        html: `<h3>Re-Verification Request</h3><p>Check attachment.</p><a href="${verificationLink}">Approve</a>`,
        attachments: [{ filename: req.file.originalname, content: req.file.buffer, contentType: req.file.mimetype }]
    });

    res.status(200).json({ message: "New document submitted for approval." });

  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
});

export default router;