// src/pages/BlogDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import "./BlogDetail.css";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await API.get(`/blogs`);
        const blogData = res.data.find((item) => item._id === id);
        setBlog(blogData);
      } catch (err) {
        console.error("Error fetching blog", err);
      }
    };
    fetchBlog();
  }, [id]);

  if (!blog) return <div className="blog-page"><h2>Loading blog...</h2></div>;

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <h1>{blog.title}</h1>
        <p>{new Date(blog.createdAt).toLocaleDateString()}</p>
      </section>

      {blog.imageUrl && (
        <img
          src={
            blog.imageUrl.startsWith("/uploads/")
              ? `${BASE_URL}${blog.imageUrl}`
              : blog.imageUrl
          }
          alt={blog.title}
          style={{ width: "100%", maxHeight: "400px", objectFit: "cover", marginBottom: "20px" }}
        />
      )}

      <div className="blog-detail-content">
        <p>{blog.content}</p>
      </div>
    </div>
  );
};

export default BlogDetail;
