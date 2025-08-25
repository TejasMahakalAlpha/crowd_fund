// src/components/BlogDetails.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PublicApi } from "../services/api";
import "./BlogDetails.css";
import { FaEye } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SITE_URL = "https://crowd-fun.netlify.app";

const BlogDetails = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // This function is no longer used for the share image, but can stay for the <img> tag
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

    const blogDescription = blog.subtitle || blog.title;

    // ❌ Old dynamic image line is removed.
    // ✅ New static image line added below.
    const blogImage = `${SITE_URL}/crowdfund_logo.png`;

    const blogUrl = `${SITE_URL}/blog/${slug}`;

    return (
        <div className="blog-container">
            {/* Meta tags will now use the static blogImage URL */}
            <title>{`${blog.title} | Green Dharti`}</title>
            <meta name="description" content={blogDescription} />

            {/* Open Graph Tags (for Facebook, WhatsApp, etc.) */}
            <meta property="og:title" content={`${blog.title} | Green Dharti`} />
            <meta property="og:description" content={blogDescription} />
            <meta property="og:image" content={blogImage} />
            <meta property="og:url" content={blogUrl} />
            <meta property="og:type" content="article" />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${blog.title} | Green Dharti`} />
            <meta name="twitter:description" content={blogDescription} />
            <meta name="twitter:image" content={blogImage} />
            <button onClick={() => navigate('/blog')} className="back-button" style={{ marginBottom: '1.5rem' }}>
                ← Back to All Blogs
            </button>
            {/* Rest of your component */}
            <h1 className="blog-title">{blog.title}</h1>
            {blog.subtitle && <h3 className="blog-subtitle">{blog.subtitle}</h3>}
            <p className="blog-meta">
                By <strong>{blog.author}</strong> | {new Date(blog.createdAt).toLocaleDateString()} | <FaEye /> {blog.viewCount}
            </p>
            {blog.featuredImage && (
                <img
                    src={getImageUrl(blog.featuredImage)}
                    alt={blog.title}
                    onError={(e) => {
                        e.target.src = "/crowdfund_logo.png";
                        e.target.onerror = null;
                    }}
                    className="blog-image"
                />
            )}

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