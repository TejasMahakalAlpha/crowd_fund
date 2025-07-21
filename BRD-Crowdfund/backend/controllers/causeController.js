// backend/controllers/causeController.js
import Cause from "../models/Cause.js";

export const getAllCauses = async (req, res) => {
  try {
    const causes = await Cause.find().sort({ createdAt: -1 });
    res.json(causes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching causes" });
  }
};

export const createCause = async (req, res) => {
  try {
    const { title, description, goalAmount } = req.body;
    const image = req.file ? req.file.filename : null;

    const newCause = new Cause({
      title,
      description,
      goalAmount,
      image, // ✅ store image filename
    });

    await newCause.save();
    res.status(201).json(newCause);
  } catch (err) {
    res.status(500).json({ message: "Error creating cause" });
  }
};

export const updateCause = async (req, res) => {
  try {
    const updated = await Cause.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating cause" });
  }
};

export const deleteCause = async (req, res) => {
  try {
    await Cause.findByIdAndDelete(req.params.id);
    res.json({ message: "Cause deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting cause" });
  }
};
