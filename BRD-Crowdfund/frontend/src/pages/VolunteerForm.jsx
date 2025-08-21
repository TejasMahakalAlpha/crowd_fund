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

  // Function to validate a single field in real-time
  const validateField = (name, value) => {
    const isTextOnly = (str) => /^[A-Za-z\s]*$/.test(str);
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => /^\d{10}$/.test(phone);

    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (!isTextOnly(value)) return "Only letters and spaces allowed";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (!isTextOnly(value)) return "Only letters and spaces allowed";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!isValidEmail(value)) return "Invalid email address";
        return "";
      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!isValidPhone(value)) return "Phone must be 10 digits";
        return "";
      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 10) return "Minimum 10 characters required";
        return "";
      case "skills":
        if (!value.trim()) return "Skills is required";
        if (!isTextOnly(value)) return "Only letters and spaces allowed";
        return "";
      case "availability":
        if (!value.trim()) return "Availability is required";
        return "";
      case "experience":
        if (!value.trim()) return "Experience is required";
        if (value.trim().length < 10) return "Minimum 10 characters required";
        return "";
      case "motivation":
        if (!value.trim()) return "Motivation is required";
        if (value.trim().length < 10) return "Minimum 10 characters required";
        return "";
      default:
        return "";
    }
  };

  // Updated handleChange to filter input and validate in real-time
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Filter input based on field name
    if (name === "firstName" || name === "lastName" || name === "skills") {
      processedValue = value.replace(/[^A-Za-z\s]/g, '');
    } else if (name === "phone") {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setFormData({ ...formData, [name]: processedValue });

    // Validate the field and update the error message
    const error = validateField(name, processedValue);
    setErrors({ ...errors, [name]: error });
  };

  // This function validates the entire form on submission
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire("Validation Error", "Please correct the errors before submitting.", "error");
      return;
    }

    try {
      Swal.fire({
        title: 'Sending...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
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
        <form onSubmit={handleSubmit} noValidate>
          <label>
            First Name <span style={{ color: "red" }}>*</span>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </label>
          {renderError("firstName")}

          <label>
            Last Name <span style={{ color: "red" }}>*</span>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </label>
          {renderError("lastName")}

          <label>
            Email Address <span style={{ color: "red" }}>*</span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          {renderError("email")}

          <label>
            Phone Number <span style={{ color: "red" }}>*</span>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>
          {renderError("phone")}

          <label>
            Address <span style={{ color: "red" }}>*</span>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
          </label>
          {renderError("address")}

          <label>
            Skills <span style={{ color: "red" }}>*</span>
            <input
              type="text"
              name="skills"
              placeholder="Skills (e.g., Teaching)"
              value={formData.skills}
              onChange={handleChange}
              required
            />
          </label>
          {renderError("skills")}

          <label>
            Availability <span style={{ color: "red" }}>*</span>
            <input
              type="text"
              name="availability"
              placeholder="Availability (e.g., Weekends)"
              value={formData.availability}
              onChange={handleChange}
            />
          </label>
          {renderError("availability")}

          <label>
            Experience <span style={{ color: "red" }}>*</span>
            <textarea
              name="experience"
              rows="3"
              placeholder="Experience"
              value={formData.experience}
              onChange={handleChange}
            ></textarea>
          </label>
          {renderError("experience")}

          <label>
            Why do you want to volunteer? <span style={{ color: "red" }}>*</span>
            <textarea
              name="motivation"
              rows="4"
              placeholder="Motivation"
              value={formData.motivation}
              onChange={handleChange}
              required
            ></textarea>
          </label>
          {renderError("motivation")}

          <button type="submit">Submit Application</button>
        </form>


      </div>
    </div>
  );
};

export default VolunteerForm;
