import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageBlogs.css"; // reuse styling
import { AdminApi } from "../services/api";

const ManageVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  // const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("token"); // ✅ Get the admin token

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      // const res = await axios.get(`${BASE_URL}/api/volunteers`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`, // ✅ Include token
      //   },
      // });
      const res = await AdminApi.getAllVolunteer();
      setVolunteers(res.data);
    } catch (err) {
      console.error("Error fetching volunteers", err);
      setError("Failed to fetch volunteers");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      await axios.post(`${BASE_URL}/api/volunteers`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Include token for admin-protected POST
        },
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSuccess("Volunteer added successfully");
      fetchVolunteers();
    } catch (err) {
      console.error("Error creating volunteer", err);
      setError("Error adding volunteer");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/volunteers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Include token
        },
      });
      fetchVolunteers();
    } catch (err) {
      console.error("Error deleting volunteer", err);
      setError("Error deleting volunteer");
    }
  };

  return (
    <div className="manage-blogs">
      <h2>Manage Volunteers</h2>

      <form className="blog-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
        />
        <button type="submit">Add Volunteer</button>
        {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>

      <div className="blog-list">
        {volunteers.length === 0 ? (
          <p>No volunteers yet.</p>
        ) : (
          volunteers.map((v) => (
            <div className="blog-item" key={v._id}>
              <div>
                <h3>{v.name}</h3>
                <p><strong>Email:</strong> {v.email}</p>
                <p><strong>Phone:</strong> {v.phone}</p>
                <p><strong>Message:</strong> {v.message}</p>
              </div>
              <button onClick={() => handleDelete(v._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageVolunteers;
