import React, { useEffect, useState } from "react";
import API from "../services/api"; // Make sure path is correct
import "./CausesSection.css";

const CausesSection = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await API.get("/causes");
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
            const raised = cause.raisedAmount || 0; // fallback if not present
            const goal = cause.goalAmount;
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
                  ₹{raised.toLocaleString()} donated of ₹{goal.toLocaleString()} goal
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
