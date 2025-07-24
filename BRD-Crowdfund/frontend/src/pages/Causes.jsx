// src/pages/Causes.jsx
import React, { useEffect, useState } from "react";
import "./Causes.css";
import { PublicApi } from "../services/api"; // Adjust path as needed

const Causes = () => {
  const [causes, setCauses] = useState([]);

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await PublicApi.getCauses();
        setCauses(res.data);
      } catch (err) {
        console.error("Failed to load causes", err);
      }
    };
    fetchCauses();
  }, []);

  const handleDonate = async (causeId) => {
    const { value: amount } = await Swal.fire({
      title: "Enter donation amount",
      input: "number",
      inputAttributes: {
        min: 1,
        step: 1,
      },
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return "Please enter a valid amount";
        }
      },
      showCancelButton: true,
      confirmButtonText: "Donate",
    });

    if (amount) {
      try {
        await PublicApi.donateToCause(causeId, Number(amount));
        Swal.fire("Thank you!", "Your donation was successful.", "success");
      } catch (err) {
        Swal.fire("Oops!", "Donation failed. Please try again.", "error");
        console.error("Donation error:", err);
      }
    }
  };

  return (
    <div className="causes-page">
      <section className="causes-hero">
        <h1>Our Causes</h1>
        <p>Explore ongoing initiatives and support the ones that matter to you most.</p>
      </section>

      <div className="causes-grid">
        {causes.map((cause, index) => {
          const raised = Number(cause.currentAmount) || 0;
          const goal = Number(cause.targetAmount) || 1;
          const percentage = Math.min(100, Math.round((raised / goal) * 100));

          return (
            <div className="cause-card" key={cause._id || index}>
              <h3
                className="cause-title"
                onClick={() => navigate(`/cause/${cause.id}`)} // FR-CAU-002
                style={{ cursor: "pointer", color: "#004d40" }}
              >
                {cause.title.toUpperCase()}
              </h3>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <p className="donation-info">
                ₹{raised.toLocaleString()} donated of ₹{goal.toLocaleString()} goal
              </p>

              <p className="description">{cause.description}</p>

              <button
                className="donate-btn"
                onClick={() => handleDonate(cause._id)}
              >
                Donate Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Causes;
