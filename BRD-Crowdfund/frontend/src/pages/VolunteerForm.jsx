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

  const [errors, setErrors] = useState({});

  const isTextOnly = (str) => /^[A-Za-z\s]+$/.test(str);
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^\d{10}$/.test(phone);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate firstName
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    else if (!isTextOnly(formData.firstName)) newErrors.firstName = "Only letters and spaces allowed";

    // Validate lastName
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (!isTextOnly(formData.lastName)) newErrors.lastName = "Only letters and spaces allowed";

    // Validate email
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(formData.email)) newErrors.email = "Invalid email address";

    // Validate phone
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!isValidPhone(formData.phone)) newErrors.phone = "Phone must be 10 digits";

    // Validate address
    if (!formData.address.trim()) newErrors.address = "Address is required";
    else if (formData.address.trim().length < 10) newErrors.address = "Minimum 10 characters required";

    // Validate skills (optional but must be valid if entered)
    if (!isTextOnly(formData.skills)) newErrors.skills = "Only letters and spaces allowed";
    else if (formData.skills.trim()) newErrors.skills = "Skills is required"
    // Validate availability
    if (!formData.availability.trim()) newErrors.availability = "Availability is required";

    // Validate experience
    if (!formData.experience.trim()) newErrors.experience = "Experience is required";
    else if (formData.experience.trim().length < 10) newErrors.experience = "Minimum 10 characters required";

    // Validate motivation
    if (!formData.motivation.trim()) newErrors.motivation = "Motivation is required";
    else if (formData.motivation.trim().length < 10) newErrors.motivation = "Minimum 10 characters required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
      setErrors({});
    } catch (err) {
      console.error("Volunteer form error:", err);
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    }
  };

  const renderError = (field) => errors[field] && <p className="form-error">{errors[field]}</p>;

  return (
    <div className="volunteer-page">
      <section className="volunteer-hero">
        <h1>Become a Volunteer</h1>
        <p>Join us in creating impact through service, compassion, and action.</p>
      </section>

      <div className="volunteer-container">
        <h2>Volunteer Application Form</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
          {renderError("firstName")}

          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
          {renderError("lastName")}

          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
          {renderError("email")}

          <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
          {renderError("phone")}

          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
          {renderError("address")}

          <input type="text" name="skills" placeholder="Skills (e.g., Teaching)" value={formData.skills} onChange={handleChange} />
          {renderError("skills")}

          <input type="text" name="availability" placeholder="Availability (e.g., Weekends)" value={formData.availability} onChange={handleChange} />
          {renderError("availability")}

          <textarea name="experience" rows="3" placeholder="Experience" value={formData.experience} onChange={handleChange}></textarea>
          {renderError("experience")}

          <textarea name="motivation" rows="4" placeholder="Why do you want to volunteer?" value={formData.motivation} onChange={handleChange}></textarea>
          {renderError("motivation")}

          <button type="submit">Submit Application</button>
        </form>
      </div>
    </div>
  );
};

export default VolunteerForm;
