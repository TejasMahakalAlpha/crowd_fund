import React, { useState } from "react";
import axios from "axios";
import "./VolunteerForm.css";

const VolunteerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/volunteers`, formData);
      alert("Thank you for volunteering!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.error("Volunteer form error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="volunteer-page">
      <section className="volunteer-hero">
        <h1>Become a Volunteer</h1>
        <p>Join us in creating impact through service, compassion, and action.</p>
      </section>

      <div className="volunteer-container">
        <h2>Volunteer Application Form</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Your Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            rows="6"
            placeholder="Tell us why you want to volunteer"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          <button type="submit">Submit Application</button>
        </form>
      </div>
    </div>
  );
};

export default VolunteerForm;
