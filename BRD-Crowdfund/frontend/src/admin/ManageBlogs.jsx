import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManageBlogs.css';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
  });
  const [editingBlogId, setEditingBlogId] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/blogs`);
      setBlogs(res.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingBlogId) {
        await axios.put(`${BASE_URL}/api/blogs/${editingBlogId}`, data);
        alert("✅ Blog updated");
        setEditingBlogId(null);
      } else {
        await axios.post(`${BASE_URL}/api/blogs`, data);
        alert("✅ Blog added");
      }
      setFormData({ title: '', content: '', image: null });
      fetchBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlogId(blog._id);
    setFormData({ title: blog.title, content: blog.content, image: null });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(`${BASE_URL}/api/blogs/${id}`);
        alert("🗑️ Blog deleted");
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  return (
    <div className="manage-blogs">
      <h2>{editingBlogId ? "Edit Blog" : "Add Blog"}</h2>

      <form className="blog-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Blog Content"
          value={formData.content}
          onChange={handleChange}
          rows={4}
          required
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />
        <button type="submit">{editingBlogId ? "Update Blog" : "Add Blog"}</button>
      </form>

      <div className="blog-list">
        {blogs.map((blog) => (
          <div className="blog-item" key={blog._id}>
            <div>
              <h3>{blog.title}</h3>
              <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="actions">
              <button onClick={() => handleEdit(blog)}>Edit</button>
              <button onClick={() => handleDelete(blog._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageBlogs;
