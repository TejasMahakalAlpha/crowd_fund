// models/Cause.js
import mongoose from "mongoose";

const causeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Cause", causeSchema);
