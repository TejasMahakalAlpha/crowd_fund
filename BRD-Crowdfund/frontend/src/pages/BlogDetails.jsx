// src/components/BlogDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PublicApi } from "../services/api";
import "./BlogDetails.css"; // ✅ Import the CSS

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const BlogDetails = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getImageUrl = (relativePath) => `${API_BASE}/api/images/${relativePath}`;

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await PublicApi.getBlogById(slug);
                setBlog(res.data);
            } catch (err) {
                console.error(err);
                setError("Could not fetch blog");
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return <p style={{ textAlign: "center" }}>Loading blog...</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
    if (!blog) return <p style={{ textAlign: "center" }}>Blog not found</p>;

    return (
        <div className="blog-container">
            {blog.featuredImage && (
                <img
                    src={getImageUrl(blog.featuredImage)}
                    alt={blog.title}
                    onError={(e) => { e.target.src = "default.jpeg"; }}
                    className="blog-image"
                />
            )}
            <h1 className="blog-title">{blog.title}</h1>
            {blog.subtitle && <h3 className="blog-subtitle">{blog.subtitle}</h3>}
            <p className="blog-meta">
                By <strong>{blog.author}</strong> | {new Date(blog.createdAt).toLocaleDateString()}
            </p>
            <hr className="blog-hr" />
            <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            <div className="blog-footer">
                {blog.authorEmail && (
                    <p>
                        <strong>Contact Author:</strong> {blog.authorEmail}
                    </p>
                )}
                {blog.publishedAt && (
                    <p>
                        <strong>Published on:</strong> {new Date(blog.publishedAt).toLocaleString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default BlogDetails;
