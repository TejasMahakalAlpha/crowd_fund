// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
