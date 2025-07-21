import Contact from "../models/Contact.js";

// POST - Save contact
export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    res.status(201).json({ message: "Message sent successfully", contact });
  } catch (error) {
    res.status(500).json({ message: "Error saving contact" });
  }
};

// GET - Get all contacts (for admin)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contacts" });
  }
};

// DELETE - Remove contact
export const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: "Contact deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting contact" });
  }
};
