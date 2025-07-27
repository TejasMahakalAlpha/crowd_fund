// src/pages/Blog.jsx
import React, { useState, useEffect } from 'react';
import { PublicApi } from '../services/api'; // Import PublicApi for public blog endpoints
import { Link } from 'react-router-dom';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        // This will attempt to fetch from BASE_URL/api/public/blogs
        const response = await PublicApi.getBlogs(); // Swagger shows this as 200 OK
        setBlogs(response.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Oops! Could not load blog posts. Please try again later.");
        if (err.response && err.response.status === 401) {
          setError("Access Denied: Public blogs endpoint incorrectly requires authentication. (Backend configuration error)"); //
        } else if (err.response && err.response.status === 404) {
          setError("Blog endpoint not found. Please check backend URL for /api/public/blogs.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading blogs...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>;
  }

  if (blogs.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>No blog posts available yet.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Our Latest Blogs</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {blogs.map((blog) => (
          <div key={blog.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {blog.imageUrl && ( // Assuming blog objects have an imageUrl property
              <img src={blog.imageUrl} alt={blog.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            )}
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{blog.title}</h3>
              <p style={{ color: '#555', fontSize: '0.9rem' }}>{new Date(blog.createdAt).toLocaleDateString()}</p>
              <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                {/* Display a snippet of content */}
                {blog.content ? `${blog.content.substring(0, Math.min(blog.content.length, 100))}...` : 'No content available'}
              </p>
              {/* Link to individual blog post using ID (or slug if your backend supports fetching by slug for detail) */}
              <Link to={`/blogs/${blog.slug || blog.id}`} style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;