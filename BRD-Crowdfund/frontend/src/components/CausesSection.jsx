import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { PublicApi } from "../services/api";
import "./CausesSection.css";
import Swal from "sweetalert2";

const CausesSection = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await PublicApi.getCauses();
        if (Array.isArray(res.data)) {
          setCauses(res.data);
        } else {
          console.warn("⚠️ Unexpected response format:", res.data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch causes:", err);
      } finally {
        setLoading(false);
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
        await PublicApi.donate({
          causeId,
          amount: Number(amount),
          donorName: "Anonymous", // or collect via modal
          currency: "INR",
          paymentMethod: "card",
        });
        Swal.fire("Thank you!", "Your donation was successful.", "success");
      } catch (err) {
        Swal.fire("Oops!", "Donation failed. Please try again.", "error");
        console.error("Donation error:", err);
      }
    }
  };

  return (
    <section className="causes-section" id="causes">
      <h2 className="section-title">Causes That Need Your Urgent Attention</h2>

      {loading ? (
        <p>Loading causes...</p>
      ) : (
        <div className="causes-grid">
          {causes.map((cause, index) => {
            const raised = Number(cause.currentAmount) || 0;
            const goal = Number(cause.targetAmount) || 1;
            const percentage = Math.min(100, Math.round((raised / goal) * 100));

            return (
              <div className="cause-card" key={cause._id || index}>
                <h3
                  className="cause-title"
                  onClick={() => navigate(`/cause/${cause._id}`)} // FR-CAU-002
                  style={{ cursor: "pointer", color: "#004d40" }}
                >
                  {cause.title}
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
      )}
    </section>
  );
};

export default CausesSection;
