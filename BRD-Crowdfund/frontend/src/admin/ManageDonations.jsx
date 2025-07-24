// src/admin/ManageDonations.jsx
import React, { useEffect, useState } from "react";
import "./ManageBlogs.css"; // Reusing styles
import { AdminApi, PublicApi } from "../services/api"; // Adjust as needed
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const ManageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    message: "",
    causeId: "",
    currency: "", // or "USD"
    paymentMethod: "",
  });
  const navigate = useNavigate();


  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await AdminApi.getAllDonations();
      setDonations(res.data || []);
    } catch (err) {
      console.error("Error fetching donations", err);
      toast.error("Failed to fetch donations");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        amount: parseFloat(formData.amount),
        message: formData.message,
        causeId: parseInt(formData.causeId || "1"), // default causeId = 1
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
      };

      await PublicApi.donate(payload);
      toast.success("Donation added successfully");

      setFormData({
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        amount: "",
        message: "",
        causeId: "",
        currency: "",
        paymentMethod: "",
      });

      fetchDonations();
    } catch (err) {
      console.error("Error creating donation", err);
      toast.error("Failed to create donation");
    }
  };

  const handleDelete = async (id) => {
    try {
      await AdminApi.deleteDonation(id);
      toast.success("Donation deleted");
      fetchDonations();
    } catch (err) {
      console.error("Error deleting donation", err);
      toast.error("Failed to delete donation");
    }
  };

  return (
    <div className="manage-blogs">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

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
          name="donorEmail"
          placeholder="Email "
          value={formData.donorEmail}
          onChange={handleChange}
        />
        <input
          type="text"
          name="donorPhone"
          placeholder="Phone"
          value={formData.donorPhone}
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
        <input
          type="number"
          name="causeId"
          placeholder="Cause ID"
          value={formData.causeId}
          onChange={handleChange}
        />
        <input
          type="text"
          name="currency"
          placeholder="Currency (e.g., INR)"
          value={formData.currency}
          onChange={handleChange}
        />
        <input
          type="text"
          name="paymentMethod"
          placeholder="Payment Method"
          value={formData.paymentMethod}
          onChange={handleChange}
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
        {Array.isArray(donations) && donations.map((d) => (
          <div className="blog-item" key={d._id}>
            <div>
              <h3>{d.donorName}</h3>
              <p>₹{d.amount}</p>
              {d.donorEmail && <p>{d.donorEmail}</p>}
              {d.message && <p>{d.message}</p>}
              {d.currency && <p>Currency: {d.currency}</p>}
              {d.paymentMethod && <p>Method: {d.paymentMethod}</p>}
            </div>
            <button onClick={() => handleDelete(d._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDonations;
