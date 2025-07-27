// src/admin/ManageBlog.jsx
import React, { useState, useEffect } from 'react';
import { AdminApi } from '../services/api'; // Import AdminApi for authenticated blog endpoints
import { useNavigate } from 'react-router-dom';

const ManageBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null); // For edit/add form
  // Initialize formData with correct structure for blog properties
  const [formData, setFormData] = useState({ title: '', content: '', imageFile: null, imageUrl: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminBlogs();
  }, []);

  const fetchAdminBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // This will attempt to fetch from BASE_URL/admin/blogs
      const response = await AdminApi.getAllBlogs();
      setBlogs(response.data);
    } catch (err) {
      console.error("Error fetching admin blogs:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("You are not authorized to view this page. Please log in.");
        navigate('/admin/login'); // Redirect to login if unauthorized
      } else if (err.response && err.response.status === 404) {
        setError("Admin Blog API endpoint not found. Check backend URL for /admin/blogs.");
      }
      else {
        setError("Failed to load blogs. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, imageFile: e.target.files[0] });
  };

  const openAddModal = () => {
    setCurrentBlog(null);
    setFormData({ title: '', content: '', imageFile: null, imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (blog) => {
    setCurrentBlog(blog);
    // Pre-fill form with existing blog data, but reset imageFile input
    setFormData({ 
      title: blog.title, 
      content: blog.content, 
      imageFile: null, 
      imageUrl: blog.imageUrl || '' // Store existing image URL if any
    }); 
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setCurrentBlog(null);
    setFormData({ title: '', content: '', imageFile: null, imageUrl: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formPayload = new FormData();
    formPayload.append('title', formData.title);
    formPayload.append('content', formData.content);
    // Only append image if a new one is selected
    if (formData.imageFile) {
      formPayload.append('image', formData.imageFile); // 'image' should match backend @RequestParam name
    } else if (currentBlog && formData.imageUrl) {
        // If it's an edit and no new file is selected but there was an existing image URL, 
        // you might need a way to tell the backend to keep the old image.
        // This often involves sending the existing imageUrl or a flag.
        // For simplicity, if no new file, we assume backend keeps existing if not explicitly told to change.
        // Some APIs might expect 'imageUrl' field for existing image, or 'keepExistingImage: true'
        // For now, we don't send anything if no new file and no currentBlog (new post)
        // or if it's an edit and no new file, the backend should implicitly keep the old one.
    }


    try {
      if (currentBlog) {
        await AdminApi.updateBlog(currentBlog.id, formPayload); // Swagger shows PUT /admin/blogs/{id}
      } else {
        await AdminApi.createBlog(formPayload); // Assuming POST /admin/blogs/with-image
      }
      closeFormModal();
      fetchAdminBlogs(); // Refresh list
    } catch (err) {
      console.error("Error saving blog:", err);
      setError(err.response?.data?.message || "Failed to save blog. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        setLoading(true);
        await AdminApi.deleteBlog(blogId); // Swagger shows DELETE /admin/blogs/{id}
        fetchAdminBlogs(); // Refresh list
      } catch (err) {
        console.error("Error deleting blog:", err);
        setError(err.response?.data?.message || "Failed to delete blog. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !blogs.length) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading blogs...</div>;
  }

  if (error && !isModalOpen) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Manage Blog Posts</h1>
      <button onClick={openAddModal} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1.5rem' }}>
        Add New Blog
      </button>

      {error && isModalOpen && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
      
      {blogs.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>No blog posts to manage. Add one!</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '0.8rem', border: '1px solid #ddd', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '0.8rem', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td style={{ padding: '0.8rem', border: '1px solid #ddd' }}>{blog.title}</td>
                <td style={{ padding: '0.8rem', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => openEditModal(blog)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{currentBlog ? 'Edit Blog Post' : 'Add New Blog Post'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </label>
              <label>
                Content:
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                ></textarea>
              </label>
              <label>
                Image (optional):
                <input
                  type="file"
                  name="imageFile"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                {/* Display current image if editing and no new file selected */}
                {currentBlog && currentBlog.imageUrl && !formData.imageFile && (
                    <img src={currentBlog.imageUrl} alt="Current Blog Image" style={{ width: '100px', height: 'auto', marginTop: '10px', borderRadius: '4px' }} />
                )}
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={closeFormModal}
                  style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '0.75rem 1.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Saving...' : 'Save Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlog;