import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { PublicApi } from "../services/api";
import "./Blog.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  const getImageUrl = (relativePath) => `${API_BASE}/api/images/${relativePath}`;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await PublicApi.getBlogs();
        setBlogs(res.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <section className="causes-hero">
        <h1>Our Blogs</h1>
        <p>Discover inspiring stories, latest updates, and impactful journeys shared by our community through these blogs.</p>
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {blogs.map((blog) => (
          <div
            key={blog.id}
            onClick={() => navigate(`/blog/${blog.slug || blog.id}`)}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {blog.featuredImage && (
              <img
                src={getImageUrl(blog.featuredImage)}
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
              <p style={{ color: '#777', fontSize: '0.85rem' }}>{blog.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
