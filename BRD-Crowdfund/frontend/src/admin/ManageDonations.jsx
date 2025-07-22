// src/admin/ManageDonations.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageBlogs.css"; // Reuse styles
import { AdminApi } from "../services/api";

const ManageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    donorName: "",
    email: "",
    amount: "",
    message: "",
  });

  // const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      // const res = await axios.get(`${BASE_URL}/api/donations`);
      const res = AdminApi.getAllDonations()
      setDonations(res.data);
    } catch (err) {
      console.error("Error fetching donations", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await axios.post(`${BASE_URL}/api/donations`, {
      //   ...formData,
      //   amount: parseFloat(formData.amount),
      // });
      await AdminApi.getAllDonations();

      setFormData({ donorName: "", email: "", amount: "", message: "" });
      fetchDonations();
    } catch (err) {
      console.error("Error creating donation", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/donations/${id}`);
      fetchDonations();
    } catch (err) {
      console.error("Error deleting donation", err);
    }
  };

  return (
    <div className="manage-blogs">
      <h2>Manage Donations</h2>

      <form className="blog-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="donorName"
          placeholder="Donor Name"
          value={formData.donorName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email (optional)"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
        />
        <button type="submit">Add Donation</button>
      </form>

      <div className="blog-list">
        {donations.map((d) => (
          <div className="blog-item" key={d._id}>
            <div>
              <h3>{d.donorName}</h3>
              <p>₹{d.amount}</p>
              {d.email && <p>{d.email}</p>}
              {d.message && <p>{d.message}</p>}
            </div>
            <button onClick={() => handleDelete(d._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDonations;
