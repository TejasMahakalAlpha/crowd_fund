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


  useEffect(() => {
    fetchDonations();
  }, []); // Empty dependency array means this runs once on mount

  const fetchDonations = async () => {
    try {
      // ⭐ CRITICAL FIX: Changed to AdminApi.getAllDonationsAdmin()
      const res = await AdminApi.getAllDonationsAdmin();
      setDonations(res.data || []);
      console.log("Fetched donations for admin:", res.data); // For debugging
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

      <form className="donation-form" onSubmit={handleSubmit}> {/* ⭐ Renamed class for specific styling */}
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
          placeholder="Email Address"
          value={formData.donorEmail}
          onChange={handleChange}
        />
        <input
          type="text"
          name="donorPhone"
          placeholder="Phone Number"
          maxLength={10}
          value={formData.donorPhone}
          onChange={handleChange}
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount (in Rupees)"
          value={formData.amount}
          onChange={handleChange}
          required
          min="1"
          step="any"
        />
        <input
          type="number"
          name="causeId"
          placeholder="Cause ID (Optional)"
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
          placeholder="Payment Method (e.g., MANUAL, CARD)"
          value={formData.paymentMethod}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Message (Optional)"
          value={formData.message}
          onChange={handleChange}
          rows={3}
        />
        <button type="submit">Add Donation</button>
      </form>

      <div className="donations-list"> {/* ⭐ Renamed class for specific styling */}
        {Array.isArray(donations) && donations.length > 0 ? (
          donations.map((d) => (
            <div className="donation-item" key={d.id || d._id || d.orderId || Math.random()}> {/* ⭐ Renamed class, added more robust key */}
              <div>
                <h3>{d.donorName}</h3>
                <p><strong>Amount:</strong> ₹{d.amount ? (d.amount / 100).toLocaleString() : 'N/A'} {d.currency || ''}</p> {/* Assuming amount in paisa, convert to Rupee */}
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
                <button className="delete-btn" onClick={() => handleDelete(d.id || d._id)}>Delete</button>
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