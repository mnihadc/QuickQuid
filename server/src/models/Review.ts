import mongoose, { Document, Schema } from "mongoose";

// 1. Create the Interface
export interface IReview extends Document {
  gigId: string;
  userId: string; 
  star: 1 | 2 | 3 | 4 | 5; // Specific literal types for better safety
  desc: string;
  createdAt: Date;
}

// 2. Create the Schema
const ReviewSchema: Schema = new Schema({
  gigId: { type: String, required: true },
  userId: { type: String, required: true }, // The Buyer
  star: { type: Number, required: true, enum: [1, 2, 3, 4, 5] }, // 1-5 Stars
  desc: { type: String, required: true }, // "Great job!"
  createdAt: { type: Date, default: () => new Date() }
});

// 3. Export the model
export default mongoose.model<IReview>("Review", ReviewSchema);