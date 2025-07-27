// src/admin/ManageBlogs.jsx
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api'; // Use AdminApi
import Swal from 'sweetalert2'; // For better alerts
import './ManageBlogs.css'; // Ensure this CSS is linked

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null, // File object
    imageUrl: '', // For displaying current image if editing
  });
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminApi.getAllBlogs(); // Use AdminApi to get all blogs
      if (Array.isArray(res.data)) {
        setBlogs(res.data);
      } else {
        console.error("Unexpected response format for blogs:", res.data);
        setBlogs([]); // Ensure it's an array
        setError("Unexpected data format received for blogs.");
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.response?.data?.message || "Failed to fetch blogs. Ensure backend is running and you are authenticated.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleEdit = (blog) => {
    setEditingBlogId(blog.id); // Assuming backend uses 'id' not '_id'
    setFormData({
      title: blog.title,
      content: blog.content,
      image: null, // Don't pre-fill file input, user will select new if needed
      imageUrl: blog.imageUrl || '', // Store for display
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    Swal.fire({
      title: editingBlogId ? "Updating Blog..." : "Adding Blog...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    if (formData.image) {
      data.append("image", formData.image); // Append the File object
    }

    try {
      if (editingBlogId) {
        // Use AdminApi.updateBlog for PUT request
        await AdminApi.updateBlog(editingBlogId, data);
        Swal.fire("✅ Blog Updated!", "", "success");
      } else {
        // Use AdminApi.createBlog for POST request
        await AdminApi.createBlog(data);
        Swal.fire("✅ Blog Added!", "", "success");
      }
      setFormData({ title: '', content: '', image: null, imageUrl: '' }); // Clear form
      setEditingBlogId(null); // Exit editing mode
      fetchBlogs(); // Refresh list
    } catch (err) {
      console.error("Error saving blog:", err);
      let errorMessage = "Failed to save blog. Please try again.";
      if (err.response) {
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
      }
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
      Swal.close();
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        setError(null);
        try {
          await AdminApi.deleteBlog(id); // Use AdminApi.deleteBlog
          Swal.fire("Deleted!", "Your blog has been deleted.", "success");
          fetchBlogs(); // Refresh list
        } catch (err) {
          console.error("Error deleting blog:", err);
          let errorMessage = "Failed to delete blog.";
          if (err.response) {
            errorMessage = err.response.data.message || err.response.data.error || errorMessage;
          }
          Swal.fire("Error!", errorMessage, "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  if (loading && blogs.length === 0) {
    return <div className="admin-content">Loading blogs...</div>;
  }

  if (error) {
    return <div className="admin-content" style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div className="manage-blogs admin-content"> {/* Added admin-content class for consistency */}
      <h2>{editingBlogId ? "Edit Blog" : "Add New Blog"}</h2>

      <form className="blog-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <textarea
          name="content"
          placeholder="Blog Content"
          value={formData.content}
          onChange={handleChange}
          rows={4}
          required
          disabled={loading}
        />
        {formData.imageUrl && editingBlogId && (
          <div className="current-image-preview">
            <p>Current Image:</p>
            <img src={formData.imageUrl} alt="Current Blog" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }} />
            <p style={{fontSize: '0.8em', color: '#666'}}>Select a new file to change the image.</p>
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : (editingBlogId ? "Update Blog" : "Add Blog")}
        </button>
        {editingBlogId && (
          <button type="button" onClick={() => {
            setEditingBlogId(null);
            setFormData({ title: '', content: '', image: null, imageUrl: '' });
          }} disabled={loading} className="cancel-btn">
            Cancel Edit
          </button>
        )}
      </form>

      <h3>All Blogs</h3>
      {blogs.length === 0 ? (
        <p>No blogs available. Add one above!</p>
      ) : (
        <div className="blog-list">
          {blogs.map((blog) => (
            <div className="blog-item" key={blog.id}> {/* Assuming blog.id */}
              {blog.imageUrl && ( // Display image thumbnail in list
                <img src={blog.imageUrl} alt={blog.title} className="blog-thumbnail" />
              )}
              <div className="blog-item-details">
                <h3>{blog.title}</h3>
                <p>Published: {new Date(blog.createdAt).toLocaleDateString()}</p> {/* Assuming createdAt */}
              </div>
              <div className="actions">
                <button onClick={() => handleEdit(blog)} disabled={loading}>Edit</button>
                <button onClick={() => handleDelete(blog.id)} disabled={loading}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;