import React, { useEffect, useState } from "react";
import API, { PublicApi } from "../services/api"; // Make sure path is correct
import "./CausesSection.css";

const CausesSection = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="causes-section" id="causes">
      <h2 className="section-title">Causes That Need Your Urgent Attention</h2>

      {loading ? (
        <p>Loading causes...</p>
      ) : (
        <div className="causes-grid">
          {causes.map((cause, index) => {
            const raised = cause.targetAmount || 0; // fallback if not present
            const goal = cause.targetAmount;
            const percentage = Math.round((raised / goal) * 100);

            return (
              <div className="cause-card" key={cause._id || index}>
                <h3>{cause.title}</h3>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="donation-info">
                  ₹{typeof raised === "number" ? raised.toLocaleString() : 0} donated of  ₹
                  {typeof cause.targetAmount === "number" ? cause.targetAmount.toLocaleString() : 0} goal

                </p>
                <p className="description">{cause.description}</p>
                <button className="donate-btn">Donate Now</button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CausesSection;
