import express, { Request, Response, Router } from "express";
import Order from "../models/Order.js";  
import Listing from "../models/Listing.js"; 
import { authorize} from "../middleware/auth.js"; 
// 1. Define custom request to include 'userId' from auth middleware
interface AuthRequest extends Request {
  userId?: string;
}

const router: Router = express.Router();

// 1. CREATE ORDER (Buyer buys a gig)
router.post("/:gigId", authorize, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { gigId } = req.params;

    // A. Find the gig details first
    const gig = await Listing.findById(gigId);
    if (!gig) return res.status(404).send("Gig not found");

    // B. Create the new Order
    const newOrder = new Order({
      gigId,
      buyerId: req.userId,      // From Token (via AuthRequest)
      sellerId: gig.seller,     // From the Gig details
      price: gig.price,
      title: gig.title,
      img: gig.image
    });

    await newOrder.save();
    res.status(200).json(newOrder);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error processing order");
  }
});

// 2. GET MY ORDERS (Shows orders for both Buyers AND Sellers)
router.get("/", authorize, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Find orders where I am the Buyer OR I am the Seller
    const orders = await Order.find({
      $or: [{ buyerId: req.userId }, { sellerId: req.userId }],
    });

    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send("Error fetching orders");
  }
});

// 3. MARK ORDER AS COMPLETED (Seller marks it done)
router.put("/complete/:id", authorize, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).send("Order not found");

    // Only the Seller (or Admin) can mark it as done
    // We convert ObjectId to string to ensure safe comparison
    if (order.sellerId.toString() !== req.userId) {
      return res.status(403).send("Only the seller can complete this order.");
    }

    order.isCompleted = true;
    await order.save();

    res.status(200).send("Order completed!");
  } catch (error) {
    res.status(500).send("Error updating order.");
  }
});

export default router;