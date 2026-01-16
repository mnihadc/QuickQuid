import mongoose, { Document, Schema } from "mongoose";

// 1. Create an Interface representing a document in MongoDB.
export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  seller: mongoose.Types.ObjectId; // Reference to a User ID
  sellerName?: string;
  createdAt: Date;
}

// 2. Create the Schema corresponding to the document interface.
const ListingSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  
  // Store the image filename/path here
  image: { type: String, required: true }, 

  // Link this listing to the Seller who created it
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  sellerName: { type: String }, 
  createdAt: { type: Date, default: () => new Date() }
});

// 3. Export the model
export default mongoose.model<IListing>("Listing", ListingSchema);