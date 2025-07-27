// src/components/Blog.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api"; // Use PublicApi
import Swal from "sweetalert2"; // For user-friendly error messages
import "./Blog.css"; // Ensure this CSS is linked

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await PublicApi.getBlogs(); // Use PublicApi to get all blogs
        if (Array.isArray(res.data)) {
          setBlogs(res.data);
        } else {
          console.error("Unexpected response format for blogs:", res.data);
          setBlogs([]); // Ensure it's an array
          setError("Unexpected data format received from server for blogs.");
        }
      } catch (err) {
        console.error("Error fetching blogs for public view:", err);
        setError("Failed to fetch blog posts. Please try again later.");
        // Optional: Show a Swal alert for user
        Swal.fire("Oops!", "Could not load blog posts. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return (
      <div className="blog-page">
        <section className="blog-hero">
          <h1>Our Blog</h1>
          <p>Stories, updates, and insights from our ground-level efforts.</p>
        </section>
        <div className="blog-list">Loading blog posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-page">
        <section className="blog-hero">
          <h1>Our Blog</h1>
          <p>Stories, updates, and insights from our ground-level efforts.</p>
        </section>
        <div className="blog-list" style={{ color: 'red', textAlign: 'center' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <h1>Our Blog</h1>
        <p>Stories, updates, and insights from our ground-level efforts.</p>
      </section>

      <div className="blog-list">
        {blogs.length === 0 ? (
          <p style={{ textAlign: 'center', width: '100%' }}>No blog posts available yet. Check back soon!</p>
        ) : (
          blogs.map((post) => (
            <div className="blog-card" key={post.id}> {/* Assuming post.id from backend */}
              {post.imageUrl && ( // Display blog image from backend
                <img
                  src={post.imageUrl} // Direct URL from backend
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
                <p className="summary">{post.content?.slice(0, 150)}...</p> {/* Increased slice for more content */}
                <button
                  className="read-more"
                  onClick={() => navigate(`/blog/${post.id}`)} // Navigate to individual blog post
                >
                  Read More
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Blog;