// controllers/volunteerController.js
import Volunteer from "../models/Volunteer.js";

// GET all volunteers
export const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching volunteers" });
  }
};

// POST a new volunteer
export const createVolunteer = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const newVolunteer = new Volunteer({ name, email, phone, message });
    await newVolunteer.save();
    res.status(201).json(newVolunteer);
  } catch (error) {
    res.status(500).json({ message: "Error creating volunteer" });
  }
};

// PUT update a volunteer
export const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Volunteer.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating volunteer" });
  }
};

// DELETE a volunteer
export const deleteVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    await Volunteer.findByIdAndDelete(id);
    res.json({ message: "Volunteer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting volunteer" });
  }
};
