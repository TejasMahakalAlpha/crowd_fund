import React, { useEffect, useState } from 'react';
import './ManageBlogs.css';
import { AdminApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const initialFormData = {
  title: '',
  subtitle: '',
  slug: '',
  content: '',
  image: null,
  author: '',
  authorEmail: '',
  status: 'DRAFT',
  // publishedAt: '',
  tags: '',
  isFeatured: true,
  allowComments: true,
};

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await AdminApi.getAllBlogs();
      if (Array.isArray(res.data)) {
        setBlogs(res.data);
      } else {
        console.warn("Unexpected response formate", res.data);
      }

    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(formData.slug)) newErrors.slug = 'Slug must be alphanumeric with dashes';
    if (!formData.content.trim()) newErrors.content = 'Content is required';

    if (formData.authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.authorEmail)) {
      newErrors.authorEmail = 'Invalid email format';
    }

    if (formData.publishedAt && isNaN(Date.parse(formData.publishedAt))) {
      newErrors.publishedAt = 'Invalid date';
    }

    if (formData.image && !formData.image.type.startsWith('image/')) {
      newErrors.image = 'File must be an image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      const file = files[0];
      setFormData({ ...formData, image: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error on change
    setErrors({ ...errors, [name]: '' });
  };

  const handlePublish = async (id) => {
    const confirm = await Swal.fire({
      title: "Publish Blog?",
      text: "Are you sure you want to publish this blog?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, publish it",
    });

    if (confirm.isConfirmed) {
      try {
        await AdminApi.publishBlog(id);
        Swal.fire("Success", "Blog published successfully", "success");
        fetchBlogs(); // refresh the list
      } catch (err) {
        console.error("Publish error:", err);
        Swal.fire("Error", "Failed to publish blog", "error");
      }
    }
  };
  const handleUnpublish = async (id) => {
    const confirm = await Swal.fire({
      title: "Unpublish Blog?",
      text: "This blog will no longer be publicly visible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, unpublish it",
    });

    if (confirm.isConfirmed) {
      try {
        await AdminApi.unpublishBlog(id);
        Swal.fire("Success", "Blog unpublished successfully", "success");
        fetchBlogs(); // Refresh list
      } catch (err) {
        console.error("Unpublish error:", err);
        Swal.fire("Error", "Failed to unpublish blog", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data = new FormData();

    // Manually append each field from formData
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('slug', formData.slug);
    data.append('content', formData.content);
    data.append('author', formData.author);
    data.append('authorEmail', formData.authorEmail);
    data.append('status', formData.status);
    // data.append('publishedAt', formData.publishedAt);
    data.append('tags', formData.tags);
    data.append('isFeatured', String(formData.isFeatured));    // boolean as string
    data.append('allowComments', String(formData.allowComments));  // boolean as string

    // Append image only if present
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingBlogId) {
        const res = await AdminApi.updateBlog(editingBlogId, data);
        Swal.fire("Updated", "Blog updated successfully", "success");
      } else {
        await AdminApi.createBlog(data);
        Swal.fire("Added", "Blog created successfully", "success");
      }

      setEditingBlogId(null);
      setFormData(initialFormData);
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);

      let message = "Something went wrong while saving the blog.";
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }

      Swal.fire("Error", message, "error");
    }
  };


  const handleEdit = async (id) => {
    try {
      const res = await AdminApi.getBlogById(id);
      console.log(res)
      const blog = res.data;
      setEditingBlogId(blog.id);
      setFormData({
        ...initialFormData,
        ...blog,
        publishedAt: blog.publishedAt ? blog.publishedAt.split('T')[0] : '',
        image: null,
      });
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error fetching blog for edit:", error);
      Swal.fire("Error", "Failed to fetch blog details", "error");
    }
  };


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the Blog.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await AdminApi.deleteBlog(id);
        Swal.fire("Deleted!", "Blog has been deleted.", "success");
        fetchBlogs();
      } catch (err) {
        console.error("Error deleting Blog", err);
        Swal.fire("Error", "Failed to delete Blog", "error");
      }
    }
  };

  return (
    <div className="manage-blogs">
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>
      <h2>{editingBlogId ? 'Edit Blog' : 'Add Blog'}</h2>

      <form className="blog-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="title">
          Title <span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="title"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <p className="error">{errors.title}</p>}

        <label htmlFor="subtitle">
          Subtitle
        </label>
        <input
          id="subtitle"
          name="subtitle"
          placeholder="Subtitle"
          value={formData.subtitle}
          onChange={handleChange}
        />

        <label htmlFor="slug">
          Slug <span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="slug"
          name="slug"
          placeholder="Slug"
          value={formData.slug}
          onChange={handleChange}
        />
        {errors.slug && <p className="error">{errors.slug}</p>}

        <label htmlFor="content">
          Content <span style={{ color: "red" }}>*</span>
        </label>
        <textarea
          id="content"
          name="content"
          placeholder="Content"
          rows={4}
          value={formData.content}
          onChange={handleChange}
        />
        {errors.content && <p className="error">{errors.content}</p>}

        <label htmlFor="author">
          Author Name <span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="author"
          name="author"
          placeholder="Author Name"
          value={formData.author}
          onChange={handleChange}
        />

        <label htmlFor="authorEmail">
          Author Email <span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="authorEmail"
          name="authorEmail"
          type="email"
          placeholder="Author Email"
          value={formData.authorEmail}
          onChange={handleChange}
        />
        {errors.authorEmail && <p className="error">{errors.authorEmail}</p>}

        <label htmlFor="status">
          Status
        </label>
        <select id="status" name="status" value={formData.status} onChange={handleChange}>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>

        <label htmlFor="tags">
          Tags
        </label>
        <input
          id="tags"
          name="tags"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleChange}
        />

        <label htmlFor="image">
          Upload Image <span style={{ color: "red" }}>*</span>
        </label>
        <input
          id="image"
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />
        {errors.image && <p className="error">{errors.image}</p>}

        <button type="submit">{editingBlogId ? "Update Blog" : "Add Blog"}</button>
      </form>


      <div className="blog-list">
        {blogs.map((blog) => (
          <div className="blog-item" key={blog.id}>
            <div>
              <h3>{blog.title}</h3>
              <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="actions">
              <button onClick={() => handleEdit(blog.id)}>Edit</button>
              <button onClick={() => handleDelete(blog.id)}>Delete</button>
              {blog.status === 'PUBLISHED' ? (
                <button onClick={() => handleUnpublish(blog.id)}>Unpublish</button>
              ) : (
                <button onClick={() => handlePublish(blog.id)}>Publish</button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageBlogs;
