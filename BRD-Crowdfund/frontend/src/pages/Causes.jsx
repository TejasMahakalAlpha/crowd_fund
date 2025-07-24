// src/pages/Causes.jsx
import React, { useEffect, useState } from "react";
import "./Causes.css";
import { PublicApi } from "../services/api"; // Adjust path as needed

const Causes = () => {
  const [causes, setCauses] = useState([]);

  useEffect(() => {
    // Static demo data
    const staticCauses = [
      {
        id: 1,
        title: " EDUCATION FOR EVERY ONE",
        shortDescription: "Support families affected by the flood",
        description: "Heavy monsoons caused flooding in several villages. Funds will be used for food, shelter, and medicine.",
        category: "Disaster Relief",
        location: "Assam",
        targetAmount: 5000000,
        currentAmount: 1200000,
        endDate: "2025-08-31T00:00:00",
        imageUrl: "https://via.placeholder.com/300x200?text=Flood+Relief",
        status: "ACTIVE"
      },
      {
        id: 2,
        title: "HELP REBUILD NEPAL ",
        shortDescription: "Help renovate rural schools",
        description: "Raise funds to build toilets, repair roofs, and buy benches for underfunded village schools.",
        category: "Education",
        location: "Bihar",
        targetAmount: 3000000,
        currentAmount: 150000,
        endDate: "2025-09-15T00:00:00",
        imageUrl: "https://via.placeholder.com/300x200?text=School+Upgrade",
        status: "ACTIVE"
      },
      {
        id: 3,
        title: "SAVE WATER INITIATIVE",
        shortDescription: "More space for rescued animals",
        description: "Help us build additional kennels and provide medical supplies for rescued street animals.",
        category: "Animal Welfare",
        location: "Pune",
        targetAmount: 1000000,
        currentAmount: 450000,
        endDate: "2025-08-10T00:00:00",
        imageUrl: "https://via.placeholder.com/300x200?text=Animal+Shelter",
        status: "ACTIVE"
      },
      {
        id: 4,
        title: "Girl Child Scholarship Fund",
        shortDescription: "Sponsor education for girls",
        description: "Provide scholarships to meritorious girls from low-income families to complete high school.",
        category: "Women Empowerment",
        location: "Uttar Pradesh",
        targetAmount: 2000000,
        currentAmount: 700000,
        endDate: "2025-10-01T00:00:00",
        imageUrl: "https://via.placeholder.com/300x200?text=Scholarship+Fund",
        status: "ACTIVE"
      },
      {
        id: 5,
        title: "Village Clean Water Project",
        shortDescription: "Install clean drinking water systems",
        description: "Install borewells and purifiers in water-scarce tribal areas.",
        category: "Health & Hygiene",
        location: "Jharkhand",
        targetAmount: 2500000,
        currentAmount: 200000,
        endDate: "2025-09-25T00:00:00",
        imageUrl: "https://via.placeholder.com/300x200?text=Clean+Water",
        status: "ACTIVE"
      },
    ];

    setCauses(staticCauses);
  }, []);

  // useEffect(() => {
  //   const fetchCauses = async () => {
  //     try {
  //       const res = await PublicApi.getCauses();
  //       setCauses(res.data);
  //     } catch (err) {
  //       console.error("Failed to load causes", err);
  //     }
  //   };
  //   fetchCauses();
  // }, []);

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
