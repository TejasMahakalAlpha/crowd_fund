// src/admin/ManageDonations.jsx
import React, { useEffect, useState } from "react";
import "./ManageDonations.css"; // ⭐ Ensure this CSS file exists and is correctly linked
import { AdminApi, PublicApi } from "../services/api";
import { toast } from "react-toastify"; // Assuming you have react-toastify setup for notifications
import { useNavigate } from "react-router-dom";


const ManageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "", // Amount in Rupees for form input
    message: "",
    causeId: "",
    currency: "",
    paymentMethod: "",
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});


  useEffect(() => {
    fetchDonations();
  }, []); // Empty dependency array means this runs once on mount

  const fetchDonations = async () => {
    try {
      // ⭐ CRITICAL FIX: Changed to AdminApi.getAllDonationsAdmin()
      const res = await AdminApi.getAllDonationsAdmin();
      setDonations(res.data || []);
    } catch (err) {
      console.error("Error fetching donations", err);
      toast.error("Failed to fetch donations");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.donorName.trim()) newErrors.donorName = "Donor Name is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!formData.currency.trim()) newErrors.currency = "Currency is required";
    if (!formData.paymentMethod.trim()) newErrors.paymentMethod = "Payment Method is required";

    if (formData.donorEmail) {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (!emailRegex.test(formData.donorEmail)) newErrors.donorEmail = "Invalid email address";
    }

    if (formData.donorPhone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.donorPhone)) newErrors.donorPhone = "Enter 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Amount sent to backend typically in paisa/smallest unit
      const amountInPaisa = parseFloat(formData.amount);

      const payload = {
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        donorPhone: formData.donorPhone,
        amount: amountInPaisa,
        message: formData.message,
        causeId: formData.causeId ? parseInt(formData.causeId) : null, // Send null if empty, otherwise parse
        currency: formData.currency || "INR", // Default to INR if not provided
        paymentMethod: formData.paymentMethod || "MANUAL", // Default to MANUAL
        // Add other required fields by backend for manual donation if any (e.g., status, paymentId, orderId)
        // For manual entry, status might directly be COMPLETED, paymentId/orderId might be generated/N/A
        status: "COMPLETED",
        paymentId: "MANUAL_" + Date.now(),
        orderId: "MANUAL_ORDER_" + Date.now(),
      };

      // Assuming PublicApi.donate corresponds to a public endpoint to add donations directly (not via Razorpay)
      // If this requires admin authentication, it should be an AdminApi call, not PublicApi.donate
      await PublicApi.donate(payload); // This calls /api/public/donate

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

      fetchDonations(); // Refresh the list after adding a donation
    } catch (err) {
      console.error("Error creating donation", err);
      // More detailed error message from backend if available
      const errorMessage = err.response?.data?.error || err.message || "Failed to create donation";
      toast.error(`Failed to create donation: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Ensure AdminApi has a deleteDonation method mapped to /admin/donations/{id}
      await AdminApi.deleteDonation(id);
      toast.success("Donation deleted");
      fetchDonations(); // Refresh the list after deletion
    } catch (err) {
      console.error("Error deleting donation", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to delete donation";
      toast.error(`Failed to delete donation: ${errorMessage}`);
    }
  };

  return (
    <div className="manage-donations-container"> {/* ⭐ Renamed class for specific styling */}
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      <h2>Manage Donations</h2>


      <form className="donation-form" onSubmit={handleSubmit}>
        <label>
          Donor Name <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="donorName"
            value={formData.donorName}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
          {errors.donorName && <p className="error">{errors.donorName}</p>}
        </label>

        <label>
          Email Address <span style={{ color: "red" }}>*</span>
          <input
            type="email"
            name="donorEmail"
            value={formData.donorEmail}
            onChange={handleChange}
            placeholder="Enter your email address"
          />
          {errors.donorEmail && <p className="error">{errors.donorEmail}</p>}
        </label>

        <label>
          Phone Number <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="donorPhone"
            maxLength={10}
            value={formData.donorPhone}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
          />
          {errors.donorPhone && <p className="error">{errors.donorPhone}</p>}
        </label>

        <label>
          Amount (in Rupees) <span style={{ color: "red" }}>*</span>
          <input
            type="number"
            name="amount"
            min="1"
            step="any"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter donation amount"
          />
          {errors.amount && <p className="error">{errors.amount}</p>}
        </label>

        <label>
          Cause ID (Optional)
          <input
            type="number"
            name="causeId"
            value={formData.causeId}
            onChange={handleChange}
            placeholder="Enter cause ID (optional)"
          />
        </label>

        <label>
          Currency <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            placeholder="Enter currency (e.g., INR)"
          />
          {errors.currency && <p className="error">{errors.currency}</p>}
        </label>

        <label>
          Payment Method <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            placeholder="Enter payment method (e.g., UPI, Card)"
          />
          {errors.paymentMethod && <p className="error">{errors.paymentMethod}</p>}
        </label>

        <label>
          Message (Optional)
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            placeholder="Write a message (optional)"
          />
        </label>

        <button type="submit">Add Donation</button>
      </form>



      <div className="donations-list"> {/* ⭐ Renamed class for specific styling */}
        {Array.isArray(donations) && donations.length > 0 ? (
          donations.map((d) => (
            <div className="donation-item" key={d.id || d._id || d.orderId || Math.random()}> {/* ⭐ Renamed class, added more robust key */}
              <div>
                <h3>{d.donorName}</h3>
                <p><strong>Amount:</strong> ₹{d.amount ? (d.amount).toLocaleString() : 'N/A'} {d.currency || ''}</p> {/* Assuming amount in paisa, convert to Rupee */}
                <p><strong>Status:</strong> {d.status || 'N/A'}</p> {/* Display status */}
                {d.donorEmail && <p><strong>Email:</strong> {d.donorEmail}</p>}
                {d.donorPhone && <p><strong>Phone:</strong> {d.donorPhone}</p>}
                {d.message && <p><strong>Message:</strong> {d.message}</p>}
                {d.paymentMethod && <p><strong>Method:</strong> {d.paymentMethod}</p>}
                {d.cause && d.cause.title && <p><strong>Cause:</strong> {d.cause.title}</p>} {/* Display cause title if available */}
                {d.createdAt && <p><strong>Date:</strong> {new Date(d.createdAt).toLocaleString()}</p>} {/* Display full date/time */}
                {d.paymentId && <p><strong>Payment ID:</strong> {d.paymentId}</p>} {/* Display payment ID */}
                {d.orderId && <p><strong>Order ID:</strong> {d.orderId}</p>} {/* Display order ID */}
              </div>
              <div className="donation-actions"> {/* Optional: Wrapper for buttons if you add more */}
                {/* <button className="delete-btn" onClick={() => handleDelete(d.id || d._id)}>Delete</button> */}
              </div>
            </div>
          ))
        ) : (
          <p className="no-donations-message">No donations found. Please add some or check backend.</p>
        )}
      </div>
    </div>
  );
};

export default ManageDonations;