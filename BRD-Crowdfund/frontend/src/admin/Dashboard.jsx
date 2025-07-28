import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AdminApi } from "../services/api";
import "./Dashboard.css";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [summary, setSummary] = useState({
    blogs: 0,
    causes: 0,
    donations: 0,
    volunteers: 0,
    events: 0,
    contacts: 0,
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const [
        blogsRes,
        causesRes,
        donationsRes,
        volunteersRes,
        eventsRes,
        // contactsRes,
      ] = await Promise.all([
        AdminApi.getAllBlogs(),
        AdminApi.getAllCauses(),
        AdminApi.getAllDonations(),
        AdminApi.getAllVolunteer(),
        AdminApi.getAllEvents(),
        // AdminApi.getAllContacts(),
      ]);

      setSummary({
        blogs: blogsRes.data.length,
        causes: causesRes.data.length,
        donations: donationsRes.data.length,
        volunteers: volunteersRes.data.length,
        events: eventsRes.data.length,
        // contacts: contactsRes.data.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  const handleLogout = () => {
    logout(); // remove token from context and localStorage
    navigate("/admin/login");
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
        {/* <div className="card" onClick={() => navigate("/admin/manage-contacts")}>
          <h3>Contacts</h3>
          <p>{summary.contacts}</p>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
