import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
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
    <div className="blog-page">
      <section className="blog-hero">
        <h1>Our Blogs</h1>
        <p>
          Discover inspiring stories, latest updates, and impactful journeys shared by our community through these blogs.
        </p>
      </section>

      <div className="blog-grid">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="blog-box"
            onClick={() => navigate(`/blog/${blog.slug || blog.id}`)}
          >
            {blog.featuredImage && (
              <img
                src={getImageUrl(blog.featuredImage)}
                alt={blog.title}
                onError={(e) => { e.target.src = "/default.jpeg"; }}
                className="blog-image"
              />
            )}
            <div className="blog-content">
              <h3>{blog.title}</h3>
              <p className="blog-date">
                {new Date(blog.createdAt).toLocaleDateString()}
              </p>
              <p className="blog-slug">{blog.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
