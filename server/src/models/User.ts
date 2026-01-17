import mongoose, { Document, Schema } from "mongoose";

// 1. Create the Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string; // You could also make this 'buyer' | 'seller' | 'admin' if strict
  college: string;
  idCardImage: string;
  isVerified: boolean;
  verificationStatus: "unverified" | "pending" | "approved" | "rejected";
  createdAt: Date;
}

// 2. Create the Schema
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }, // buyer, seller, admin
  college: { type: String, default: "" },
  idCardImage: { type: String, default: "" }, // Stores the path to the uploaded image
  isVerified: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ["unverified", "pending", "approved", "rejected"], 
    default: "unverified" 
  },

  createdAt: { type: Date, default: Date.now },
});

// 3. Export the model
export default mongoose.model<IUser>("User", UserSchema);