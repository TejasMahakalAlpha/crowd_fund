import React, { useState } from "react";
import "./VolunteerForm.css";
import { PublicApi } from "../services/api";
import Swal from 'sweetalert2';

const VolunteerForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    skills: "",
    availability: "",
    experience: "",
    motivation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await PublicApi.registerVolunteer(formData);
      Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        text: 'Thank you for volunteering!',
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        skills: "",
        availability: "",
        experience: "",
        motivation: "",
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
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (e.g., Teaching, Event Management)"
            value={formData.skills}
            onChange={handleChange}
          />
          <input
            type="text"
            name="availability"
            placeholder="Availability (e.g., Weekends)"
            value={formData.availability}
            onChange={handleChange}
          />
          <textarea
            name="experience"
            rows="3"
            placeholder="Experience (e.g., 2 years at local shelter)"
            value={formData.experience}
            onChange={handleChange}
          ></textarea>
          <textarea
            name="motivation"
            rows="4"
            placeholder="Why do you want to volunteer?"
            value={formData.motivation}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit">Submit Application</button>
        </form>
      </div>
    </div>
  );
};

export default VolunteerForm;
