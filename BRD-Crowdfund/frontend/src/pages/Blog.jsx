import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { PublicApi } from "../services/api";
import "./Blog.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();
  const getImageUrl = (relativePath) => {
    return `${API_BASE}/api/images/${relativePath}`;
  };
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await PublicApi.getAllBlogs();
        setBlogs(res.data);
      } catch (err) {
        console.error("Error fetching blogs", err);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <h1>Our Blog</h1>
        <p>Stories, updates, and insights from our ground-level efforts.</p>
      </section>
      {console.log(blogs)}

      <div className="blog-list">
        {blogs.map((post) => (
          <div className="blog-card" key={post._id}>
            {post.imageUrl && (
              <img
                src={getImageUrl(post.imageUrl)}
                alt={post.title}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px"
                }}
              />
            )}
            <div className="blog-content">
              <h3>{post.title}</h3>
              <p className="date">
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
              <p className="summary">{post.content?.slice(0, 100)}...</p>
              <button
                className="read-more"
                onClick={() => navigate(`/blog/${post._id}`)}
              >
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
