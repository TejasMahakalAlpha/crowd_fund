// src/components/BlogDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PublicApi } from "../services/api";

const BlogDetails = () => {
    const { slugOrId } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await PublicApi.getBlogBySlugOrId(slugOrId); // You’ll create this method
                setBlog(res.data);
            } catch (err) {
                console.error(err);
                setError("Could not fetch blog");
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slugOrId]);

    if (loading) return <p>Loading blog...</p>;
    if (error) return <p>{error}</p>;
    if (!blog) return <p>Blog not found</p>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>{blog.title}</h1>
            <p><i>By {blog.author} | {new Date(blog.createdAt).toLocaleDateString()}</i></p>
            <hr />
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
    );
};

export default BlogDetails;
