import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Blog.css";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const navigate = useNavigate();

  useEffect(() => {
    // Static blog data
    const staticBlogs = [
      {
        _id: "1",
        title: "Empowering Rural Women Through Education",
        createdAt: "2025-07-01T10:00:00Z",
        content:
          "We recently launched an initiative to educate and empower rural women in Maharashtra by providing digital literacy training and essential life skills...",
        imageUrl: "/rulardevelopement.jpeg",
      },
      {
        _id: "2",
        title: "Food Drive for Flood Victims",
        createdAt: "2025-06-28T14:30:00Z",
        content:
          "Our volunteers distributed over 10,000 food packets to families affected by the recent floods in Assam. Here's a behind-the-scenes look at the effort...",
        imageUrl: "/foodvitam.jpeg",
      },
      {
        _id: "3",
        title: "Eco Awareness Week Wrap-up",
        createdAt: "2025-06-20T08:15:00Z",
        content:
          "We wrapped up Eco Awareness Week with tree plantations, school campaigns, and city clean-up drives across 12 districts in India...",
        imageUrl: "/eco-week.jpeg",
      },
      {
        _id: "4",
        title: "Health Camp Benefits 800+ Patients",
        createdAt: "2025-06-10T12:45:00Z",
        content:
          "In collaboration with local hospitals, our health camp in Nagpur served over 800 individuals, offering free checkups and medicines...",
        imageUrl: "/healthcamp.jpeg",
      },
      {
        _id: "5",
        title: "Youth Volunteer Program Kicks Off",
        createdAt: "2025-06-01T09:00:00Z",
        content:
          "We officially launched our Youth Volunteer Program, which aims to engage students in local community development projects during summer...",
        imageUrl: "/youthvoluneteer.jpeg",
      },
    ];

    setBlogs(staticBlogs);
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get("/blogs");
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

      <div className="blog-list">
        {blogs.map((post) => (
          <div className="blog-card" key={post._id}>
            {post.imageUrl && (
              <img
                src={`${post.imageUrl}`}
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
