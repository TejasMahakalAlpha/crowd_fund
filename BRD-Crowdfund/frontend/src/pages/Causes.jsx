// src/pages/Causes.jsx
import React, { useEffect, useState } from "react";
import "./Causes.css";
import API from "../services/api"; // Adjust path as needed

const Causes = () => {
  const [causes, setCauses] = useState([]);

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await API.get("/causes");
        setCauses(res.data);
      } catch (err) {
        console.error("Failed to load causes", err);
      }
    };
    fetchCauses();
  }, []);

  return (
    <div className="causes-page">
      <section className="causes-hero">
        <h1>Our Causes</h1>
        <p>Explore ongoing initiatives and support the ones that matter to you most.</p>
      </section>

      <div className="causes-grid">
        {causes.map((cause, index) => {
          const raised = Math.floor(Math.random() * (cause.goalAmount * 0.7));
          const percent = Math.round((raised / cause.goalAmount) * 100);

          return (
            <div className="cause-box" key={cause._id || index}>
              {cause.image && (
                <img
                  src={`http://localhost:5000/uploads/causes/${cause.image}`}
                  alt={cause.title}
                  className="cause-image"
                  style={{ width: "100%", borderRadius: "8px", objectFit: "cover", maxHeight: "200px" }}
                />
              )}
              <h3>{cause.title}</h3>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${percent}%` }}></div>
              </div>
              <p className="donation-amount">
                ₹{raised.toLocaleString()} raised of ₹{cause.goalAmount.toLocaleString()} goal
              </p>
              <p>{cause.description}</p>
              <button className="donate-btn">Donate Now</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Causes;
