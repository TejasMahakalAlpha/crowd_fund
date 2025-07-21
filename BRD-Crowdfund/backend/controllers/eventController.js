// controllers/eventController.js
import Event from "../models/Event.js";
import path from "path";

// GET all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
};

// POST new event with image
export const createEvent = async (req, res) => {
  const { title, date, description, location } = req.body;
  const imageUrl = req.file ? `/uploads/events/${req.file.filename}` : "";

  if (!title || !date || !description || !location) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  try {
    const newEvent = new Event({ title, date, description, location, imageUrl });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({ message: "Error creating event" });
  }
};

// PUT update event
export const updateEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const updated = await Event.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    console.error("❌ Error updating event:", error);
    res.status(500).json({ message: "Error updating event" });
  }
};

// DELETE event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await Event.findByIdAndDelete(id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Error deleting event" });
  }
};
