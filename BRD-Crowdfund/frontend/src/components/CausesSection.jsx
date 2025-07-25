import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { PublicApi } from "../services/api";
import "./CausesSection.css";
import Swal from "sweetalert2";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const CausesSection = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState(null);
  const getImageUrl = (relativePath) => {
    return `${API_BASE}/api/images/${relativePath}`;
  };


  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await PublicApi.getCauses();
        if (Array.isArray(res.data)) {
          const sorted = [...res.data].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
          const latestThree = sorted.slice(0, 3);
          setCauses(latestThree);
        }
        else {
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
                {/* ✅ Cause Image */}

                {cause.imageUrl && (
                  <img src={getImageUrl(cause.imageUrl)}
                    alt={cause.title}
                    className="cause-image"
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderTopLeftRadius: "8px",
                      borderTopRightRadius: "8px",
                      marginBottom: "10px"
                    }}
                  />
                )}


                {/* Title */}
                <h3
                  className="cause-title"
                  onClick={() => {
                    setSelectedCause(cause);
                    setModalOpen(true);
                  }}
                  style={{ cursor: "pointer", color: "#004d40" }}
                >
                  {cause.title}
                </h3>


                {/* Progress Bar */}
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
      {modalOpen && selectedCause && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            <h2 className="modal-title">{selectedCause.title?.toUpperCase()}</h2>

            {selectedCause.imageUrl && (
              <img
                src={getImageUrl(selectedCause.imageUrl)}
                alt={selectedCause.title}
                className="modal-image"
              />
            )}

            <div className="modal-details">
              <p><strong>Category:</strong> {selectedCause.category}</p>
              <p><strong>Location:</strong> {selectedCause.location}</p>
              <p><strong>Description:</strong> {selectedCause.description}</p>
              <p><strong>Raised:</strong> ₹{Number(selectedCause.currentAmount).toLocaleString()} of ₹{Number(selectedCause.targetAmount).toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedCause.status}</p>
              <p><strong>End Date:</strong> {selectedCause.endDate ? new Date(selectedCause.endDate).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>
      )}


    </section>
  );
};

export default CausesSection;
