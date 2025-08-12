import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PublicApi } from "../services/api";
import "./Blog.css";
import { FaShareAlt } from 'react-icons/fa'; // ✅ Import the share icon

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const navigate = useNavigate();

  const getImageUrl = (relativePath) => `${API_BASE}/api/images/${relativePath}`;

  // ✅ Function to handle sharing
  const handleShare = async (e, title, url, summary) => {
    // This stops the click from navigating to the blog page
    e.stopPropagation(); 

    const shareData = {
      title: title,
      text: summary,
      url: url,
    };

    if (navigator.share) {
      // Use the Web Share API if available (best for mobile)
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for desktop browsers
      // In this case, we'll just copy the link to the clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
        alert('Sharing not supported on this browser. Link could not be copied.');
      }
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await PublicApi.getBlogs();
        // Make sure blogs data is an array before setting state
        if (Array.isArray(res.data)) {
          setBlogs(res.data);
        } else {
          console.error("Fetched data is not an array:", res.data);
          setBlogs([]); // Set to empty array to prevent crash
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setBlogs([]); // Set to empty array on error
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
        {blogs.map((blog) => {
          // Define the full URL for sharing
          const blogUrl = `${window.location.origin}/blog/${blog.slug || blog.id}`;
          
          return (
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
                
                {/* ✅ Add the Share Button JSX here */}
                <div className="share-container">
                  <button 
                    // ✅ THIS IS THE ONLY LINE THAT CHANGED
                    onClick={(e) => handleShare(e, blog.title, blogUrl, blog.content ? blog.content.slice(0, 150) + '...' : 'Check out this article!')} 
                    className="share-button" 
                    title="Share this blog"
                  >
                    <FaShareAlt /> Share
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Blog;