// controllers/donationController.js
import Donation from "../models/Donation.js";

// GET all donations
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching donations" });
  }
};

// POST new donation
export const createDonation = async (req, res) => {
  try {
    const { donorName, email, amount, message } = req.body;
    const newDonation = new Donation({ donorName, email, amount, message });
    await newDonation.save();
    res.status(201).json(newDonation);
  } catch (error) {
    res.status(500).json({ message: "Error creating donation" });
  }
};

// PUT update donation
export const updateDonation = async (req, res) => {
  try {
    const updated = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating donation" });
  }
};

// DELETE donation
export const deleteDonation = async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting donation" });
  }
};
