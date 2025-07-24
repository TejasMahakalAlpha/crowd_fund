// src/pages/Causes.jsx
import React, { useEffect, useState } from "react";
import "./Causes.css";
import API, { PublicApi } from "../services/api"; // Adjust path as needed

const Causes = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCause, setSelectedCause] = useState(null);

  const url = API;
  useEffect(() => {
    // Static demo data
    const staticCauses = [
      {
        id: 1,
        title: "Rain Water Harvesting",
        shortDescription: "Conserving rainwater for future use, reducing groundwater depletion and urban flooding.",
        description: "Heavy monsoons caused flooding in several villages. Funds will be used for food, shelter, and medicine.",
        category: "Disaster Relief",
        location: "Assam",
        targetAmount: 5000000,
        currentAmount: 1200000,
        endDate: "2025-08-31T00:00:00",
        imageUrl: "rainwaterharvesting.jpg",
        status: "ACTIVE"
      },
      {
        id: 2,
        title: "Sewing Machine Distribution for Women Empowerment",
        shortDescription: "Support underprivileged women by providing sewing machines to help them become self-reliant and financially independent.",
        description: "Raise funds to build toilets, repair roofs, and buy benches for underfunded village schools.",
        category: "Education",
        location: "Bihar",
        targetAmount: 3000000,
        currentAmount: 150000,
        endDate: "2025-09-15T00:00:00",
        imageUrl: "womanempower.jpg",
        status: "ACTIVE"
      },
      {
        id: 3,
        title: "School Bag Distribution for Children",
        shortDescription: "Distribute school bags and educational materials to children from economically weaker sections.",
        description: "Help us build additional kennels and provide medical supplies for rescued street animals.",
        category: "Animal Welfare",
        location: "Pune",
        targetAmount: 1000000,
        currentAmount: 450000,
        endDate: "2025-08-10T00:00:00",
        imageUrl: "student.jpg",
        status: "ACTIVE"
      },

    ];
    setLoading(false)
    setCauses(staticCauses);
  }, []);
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await PublicApi.getCauses();
        console.log(res)
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
            <div className="cause-box" key={cause._id || index}>
              <div onClick={() => { setSelectedCause(cause); setModalOpen(true); }} style={{ cursor: 'pointer' }}>
                {cause.imageUrl && (
                  <img
                    src={cause.imageUrl}
                    alt={cause.title}
                    className="cause-image"
                    style={{ width: "100%", borderRadius: "8px", objectFit: "cover", maxHeight: "200px" }}
                  />
                )}
                <h3>{cause.title}</h3>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="donation-amount">
                  ₹{raised.toLocaleString()} raised of ₹{goal.toLocaleString()} goal
                </p>
                <p>{cause.shortDescription}</p>
              </div>

              <button className="donate-btn" onClick={() => handleDonate(cause.id)}>Donate Now</button>
            </div>

          );
        })}
      </div>
      {modalOpen && selectedCause && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setModalOpen(false)}>×</button>
            <h2 className="modal-title">{selectedCause.title}</h2>

            {selectedCause.imageUrl && (
              <img
                src={selectedCause.imageUrl}
                alt={selectedCause.title}
                className="modal-image"
              />
            )}

            <div className="modal-details">
              <p><strong>Description:</strong> {selectedCause.description}</p>
              <p><strong>Category:</strong> {selectedCause.category}</p>
              <p><strong>Location:</strong> {selectedCause.location}</p>
              <p><strong>Status:</strong> {selectedCause.status}</p>
              <p><strong>End Date:</strong> {selectedCause.endDate ? new Date(selectedCause.endDate).toLocaleDateString() : "N/A"}</p>
              <p><strong>Raised:</strong> ₹{Number(selectedCause.currentAmount).toLocaleString()} of ₹{Number(selectedCause.targetAmount).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Causes;
