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
    contacts: 0, // Ensure contacts is initialized if you plan to use it
  });

  // useEffect to fetch summary data when the component mounts
  useEffect(() => {
    fetchSummary();
  }, []); // Empty dependency array ensures it runs only once on mount

  const fetchSummary = async () => {
    try {
      const [
        blogsRes,
        causesRes,
        donationsRes, // Correct variable name for donations response
        volunteersRes,
        eventsRes,
        // contactsRes, // Uncomment if you have AdminApi.getAllContacts() and need this data
      ] = await Promise.all([
        AdminApi.getAllBlogs(), // Un-commented and correctly calling getAllBlogs
        AdminApi.getAllCauses(),
        AdminApi.getAllDonationsAdmin(), // ⭐ CRITICAL FIX: Changed from getAllDonations to getAllDonationsAdmin
        AdminApi.getAllVolunteer(),
        AdminApi.getAllEvents(),
        // AdminApi.getAllContacts(), // Uncomment if you have this API endpoint
      ]);

      // Update summary state with fetched data lengths
      setSummary({
        blogs: blogsRes.data.length,
        causes: causesRes.data.length,
        donations: donationsRes.data.length,
        volunteers: volunteersRes.data.length,
        events: eventsRes.data.length,
        // contacts: contactsRes.data.length, // Uncomment if you have contacts data
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // More robust error handling, especially for authentication issues
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          console.log("Unauthorized or Forbidden access. Redirecting to login.");
          logout(); // Remove token from context and localStorage
          navigate("/admin/login"); // Redirect to login page
        } else {
          // Handle other HTTP errors (e.g., 500, 404 for specific endpoints)
          console.error(`API Error for ${error.config.url}:`, error.response.status, error.response.data);
          // You might want to set specific summary values to 0 or display an error message on the card
          // For now, we'll just log and let default 0 stay
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
      }
    }
  };

  const handleLogout = () => {
    logout(); // Remove token from context and localStorage
    navigate("/admin/login"); // Redirect to login page
  };

  return (
    <div className="dashboard">
      {/* Logout button at top right */}
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
        {/* Blog Card */}
        <div className="card" onClick={() => navigate("/admin/manage-blogs")}>
          <h3>Blogs</h3>
          <p>{summary.blogs}</p>
        </div>
        {/* Causes Card */}
        <div className="card" onClick={() => navigate("/admin/manage-causes")}>
          <h3>Causes</h3>
          <p>{summary.causes}</p>
        </div>
        {/* Donations Card */}
        <div className="card" onClick={() => navigate("/admin/manage-donations")}>
          <h3>Donations</h3>
          <p>{summary.donations}</p>
        </div>
        {/* Volunteers Card */}
        <div className="card" onClick={() => navigate("/admin/manage-volunteers")}>
          <h3>Volunteers</h3>
          <p>{summary.volunteers}</p>
        </div>
        {/* Events Card */}
        <div className="card" onClick={() => navigate("/admin/manage-events")}>
          <h3>Events</h3>
          <p>{summary.events}</p>
        </div>
        {/* Contacts Card (uncomment if you have this feature) */}
        {/* <div className="card" onClick={() => navigate("/admin/manage-contacts")}>
          <h3>Contacts</h3>
          <p>{summary.contacts}</p>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;