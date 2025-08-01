// src/admin/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminApi } from "../services/api"; // Ensure AdminApi is correctly imported
import "./Dashboard.css"; // Assuming you have this CSS file for styling
import { AuthContext } from "../context/AuthContext"; // Ensure AuthContext is correctly imported

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // Initialize summary state with default values, including blogs and contacts
  const [summary, setSummary] = useState({
    blogs: 0,
    causes: 0,
    donations: 0,
    volunteers: 0,
    events: 0,
    contacts: 0,
    personalCauses: 0, // ⭐ NEW: Add personalCauses to summary state
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      // ⭐ Using Promise.allSettled to handle individual API call successes/failures
      const results = await Promise.allSettled([
        AdminApi.getAllBlogs(),
        AdminApi.getAllCauses(),
        AdminApi.getAllDonationsAdmin(),
        AdminApi.getAllVolunteer(),
        AdminApi.getAllEvents(),
        AdminApi.getPersonalCauseSubmissions(), // ⭐ NEW: Fetch personal cause submissions
        // AdminApi.getAllContacts(), // Uncomment if you have this API endpoint
      ]);

      // --- DEBUGGING CONSOLE LOGS START ---
      console.log("--- Dashboard Data Fetch Results (allSettled) ---");
      console.log("All Settled Results:", results);
      // --- DEBUGGING CONSOLE LOGS END ---

      const newSummary = { ...summary }; // Create a copy to update

      // Process each result from Promise.allSettled
      // blogs (index 0)
      if (results[0].status === 'fulfilled') {
        newSummary.blogs = results[0].value.data.length;
      } else {
        console.error("Error fetching blogs:", results[0].reason);
        newSummary.blogs = 0;
      }

      // causes (index 1)
      if (results[1].status === 'fulfilled') {
        newSummary.causes = results[1].value.data.length;
      } else {
        console.error("Error fetching causes:", results[1].reason);
        newSummary.causes = 0;
      }

      // donations (index 2)
      if (results[2].status === 'fulfilled') {
        newSummary.donations = results[2].value.data.length;
      } else {
        console.error("Error fetching donations:", results[2].reason);
        newSummary.donations = 0;
      }

      // volunteers (index 3)
      if (results[3].status === 'fulfilled') {
        newSummary.volunteers = results[3].value.data.length;
      } else {
        console.error("Error fetching volunteers:", results[3].reason);
        newSummary.volunteers = 0;
      }

      // events (index 4)
      if (results[4].status === 'fulfilled') {
        newSummary.events = results[4].value.data.length;
      } else {
        console.error("Error fetching events:", results[4].reason);
        newSummary.events = 0;
      }

      // ⭐ NEW: personalCauses (index 5)
      // Check if results[5] exists before accessing its properties
      if (results[5] && results[5].status === 'fulfilled') {
        newSummary.personalCauses = results[5].value.data.length;
      } else {
        console.error("Error fetching personal causes:", results[5]?.reason || "API call failed or result missing.");
        newSummary.personalCauses = 0;
      }

      // Uncomment and add similar logic for contacts if you enable it (index 6 if personalCauses is index 5)
      // if (results[6] && results[6].status === 'fulfilled') {
      //   newSummary.contacts = results[6].value.data.length;
      // } else {
      //   console.error("Error fetching contacts:", results[6]?.reason);
      //   newSummary.contacts = 0;
      // }

      setSummary(newSummary); // Update the state with new values

    } catch (error) {
      console.error("Unexpected error in fetchSummary (this should be rare with allSettled):", error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          console.log("Unauthorized or Forbidden access. Redirecting to login.");
          logout(); // Remove token from context and localStorage
          navigate("/admin/login"); // Redirect to login page
        }
      }
    }
  };

  const handleLogout = () => {
    logout(); // Remove token from context and localStorage
    navigate("/admin/login"); // Redirect to login page
  };

  return (
    <div className="dashboard">
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "1rem"
      }}>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      <h2>Admin Dashboard Summary</h2>
      <div className="dashboard-cards">
        <div className="card" onClick={() => navigate("/admin/manage-blogs")}>
          <h3>Blogs</h3>
          <p>{summary.blogs}</p>
        </div>
        <div className="card" onClick={() => navigate("/admin/manage-causes")}>
          <h3>Causes</h3>
          <p>{summary.causes}</p>
        </div>
        <div className="card" onClick={() => navigate("/admin/manage-donations")}>
          <h3>Donations</h3>
          <p>{summary.donations}</p>
        </div>
        <div className="card" onClick={() => navigate("/admin/manage-volunteers")}>
          <h3>Volunteers</h3>
          <p>{summary.volunteers}</p>
        </div>
        <div className="card" onClick={() => navigate("/admin/manage-events")}>
          <h3>Events</h3>
          <p>{summary.events}</p>
        </div>
        {/* ⭐ NEW: Personal Causes Card ⭐ */}
        <div className="card" onClick={() => navigate("/admin/manage-personal-causes")}>
          <h3>Personal Causes</h3>
          <p>{summary.personalCauses}</p>
        </div>
        {/* <div className="card" onClick={() => navigate("/admin/manage-contacts")}>
          <h3>Contacts</h3>
          <p>{summary.contacts}</p>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;