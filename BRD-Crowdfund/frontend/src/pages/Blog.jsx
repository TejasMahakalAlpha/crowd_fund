import React, { useEffect, useState } from "react";
import API, { PublicApi } from "../services/api";
import "./Blog.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(true);
  const [expandedBlogIds, setExpandedBlogIds] = useState([]); // <-- NEW

  const getImageUrl = (relativePath) => {
    return `${API_BASE}/api/images/${relativePath}`;
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await PublicApi.getBlogs();
        setBlogs(res.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Oops! Could not load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const toggleExpanded = (blogId) => {
    setExpandedBlogIds((prev) =>
      prev.includes(blogId)
        ? prev.filter((id) => id !== blogId)
        : [...prev, blogId]
    );
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Our Latest Blogs</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {blogs.map((blog) => {
          const isExpanded = expandedBlogIds.includes(blog.id);
          return (
            <div key={blog.id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              {blog.featuredImage && (
                <img
                  src={blog.featuredImage ? getImageUrl(blog.featuredImage) : "/default.jpeg"}
                  alt={blog.title}
                  onError={(e) => { e.target.src = "default.jpeg"; }}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />

              )}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{blog.title}</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {isExpanded
                    ? blog.content
                    : `${blog.content?.substring(0, 100)}...`}
                </p>
                <button
                  onClick={() => toggleExpanded(blog.id)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {isExpanded ? 'Read Less' : 'Read More'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Blog;
