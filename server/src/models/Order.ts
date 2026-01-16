import mongoose, { Document, Schema } from "mongoose";

// 1. Create the Interface
export interface IOrder extends Document {
  gigId: mongoose.Types.ObjectId;
  img?: string; // Optional because it doesn't have "required: true"
  title: string;
  price: number;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  createdAt: Date;
}

// 2. Create the Schema
const OrderSchema: Schema = new Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  img: { type: String }, // Store the gig image to show it easily later
  title: { type: String, required: true },
  
  price: { type: Number, required: true },
  
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  isCompleted: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: () => new Date() }
});

// 3. Export the model
export default mongoose.model<IOrder>("Order", OrderSchema);