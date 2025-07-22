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
          const raised = Math.floor(Math.random() * (cause.targetAmount * 0.7));
          const percent = Math.round((raised / cause.targetAmount) * 100);
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
                ₹{typeof raised === "number" ? raised.toLocaleString() : 0} raised of ₹
                {typeof cause.targetAmount === "number" ? cause.targetAmount.toLocaleString() : 0} goal
              </p>
              <p>{cause.description}</p>
              <button className="donate-btn" onClick={() => handleDonate(cause.id)}>Donate Now</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Causes;
