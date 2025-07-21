// backend/controllers/blogController.js
import Blog from "../models/Blog.js";

// GET all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

// POST new blog (with image support)
export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageUrl = req.file ? `/uploads/blogs/${req.file.filename}` : "";

    const newBlog = new Blog({ title, content, imageUrl });
    await newBlog.save();
    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.error("❌ Blog creation error:", error);
    res.status(500).json({ message: "Error creating blog" });
  }
};

// PUT update blog (with optional image)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedFields = {
      title,
      content,
    };

    if (req.file) {
      updatedFields.imageUrl = `/uploads/blogs/${req.file.filename}`;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updatedFields, { new: true });
    res.json({ message: "Blog updated", blog: updatedBlog });
  } catch (error) {
    console.error("❌ Blog update error:", error);
    res.status(500).json({ message: "Error updating blog" });
  }
};

// DELETE blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog" });
  }
};
