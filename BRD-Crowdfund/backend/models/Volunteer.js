// models/Volunteer.js
import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Volunteer", volunteerSchema);
