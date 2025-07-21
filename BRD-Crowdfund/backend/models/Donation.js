// models/Donation.js
import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    email: { type: String },
    amount: { type: Number, required: true },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
