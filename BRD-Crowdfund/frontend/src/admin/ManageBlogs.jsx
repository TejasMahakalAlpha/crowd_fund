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
  publishedAt: '',
  tags: '',
  isFeatured: false,
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
      console.log(res.data)
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        data.append(key, typeof val === 'boolean' ? String(val) : val);
      }
    });

    try {
      if (editingBlogId) {
        const updateData = { ...formData };
        delete updateData.image; // backend likely doesn’t support image update in PUT
        await AdminApi.updateBlogs(editingBlogId, updateData); // Send JSON
        Swal.fire("Updated", "Blog updated successfully", "success");
      } else {
        await AdminApi.createBlogsWithImage(data); // Send FormData with image
        Swal.fire("Added", "Blog updated successfully", "success");
      }
      setEditingBlogId(null);

      setFormData(initialFormData);
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlogId(blog.id);
    setFormData({
      ...initialFormData,
      ...blog,
      publishedAt: blog.publishedAt ? blog.publishedAt.split('T')[0] : '',
      image: null,
    });
    setErrors({});
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
        await AdminApi.deleteBlogs(id);
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
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
        {errors.title && <p className="error">{errors.title}</p>}

        <input name="subtitle" placeholder="Subtitle" value={formData.subtitle} onChange={handleChange} />

        <input name="slug" placeholder="Slug" value={formData.slug} onChange={handleChange} />
        {errors.slug && <p className="error">{errors.slug}</p>}

        <textarea name="content" placeholder="Content" rows={4} value={formData.content} onChange={handleChange} />
        {errors.content && <p className="error">{errors.content}</p>}

        <input name="author" placeholder="Author Name" value={formData.author} onChange={handleChange} />

        <input name="authorEmail" placeholder="Author Email" type="email" value={formData.authorEmail} onChange={handleChange} />
        {errors.authorEmail && <p className="error">{errors.authorEmail}</p>}

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
        </select>

        <input name="publishedAt" type="date" value={formData.publishedAt} onChange={handleChange} />
        {errors.publishedAt && <p className="error">{errors.publishedAt}</p>}

        <input name="tags" placeholder="Tags (comma separated)" value={formData.tags} onChange={handleChange} />

        <label>
          <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
          Featured
        </label>

        <label>
          <input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleChange} />
          Allow Comments
        </label>

        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        {errors.image && <p className="error">{errors.image}</p>}

        <button type="submit">{editingBlogId ? 'Update Blog' : 'Add Blog'}</button>
      </form>

      <div className="blog-list">
        {blogs.map((blog) => (
          <div className="blog-item" key={blog.id}>
            <div>
              <h3>{blog.title}</h3>
              <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="actions">
              <button onClick={() => handleEdit(blog)}>Edit</button>
              <button onClick={() => handleDelete(blog.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageBlogs;
