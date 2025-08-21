// src/pages/Contact.jsx
import React, { useState } from 'react';
import axios from 'axios'; // Already imported
import './Contact.css';
import { PublicApi } from '../services/api'; // Already imported
import Swal from 'sweetalert2'; // Already imported

// ⭐ Import images for the layout ⭐
import contactHeroBg from "../assets/contact/contact_form-hero.webp";
// Path to your hero background image
import contactIllustration from '../assets/contact/contact_form_second.png'; // Path to your contact illustration image

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    content: '',
  });

  const [errors, setErrors] = useState({});

  // Function to validate a single field
  const validateField = (name, value) => {
    const isTextOnly = (str) => /^[A-Za-z\s]*$/.test(str);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]*$/;

    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!isTextOnly(value)) return "Only letters and spaces are allowed";
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Invalid email format';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value)) return 'Only numbers are allowed';
        if (value.length !== 10) return 'Phone number must be 10 digits';
        return '';
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.trim().length < 10) return "Minimum 10 characters required";
        return '';
      case 'content':
        if (!value.trim()) return 'Message content is required';
        if (value.trim().length < 10) return "Minimum 10 characters required";
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow numbers and limit to 10 digits
    if (name === 'phone') {
        const numericValue = value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, [name]: numericValue.slice(0, 10) });
        const error = validateField(name, numericValue.slice(0, 10));
        setErrors({ ...errors, [name]: error });
    } 
    // For name, only allow text
    else if (name === 'name') {
        const textValue = value.replace(/[^A-Za-z\s]/g, '');
        setFormData({ ...formData, [name]: textValue });
        const error = validateField(name, textValue);
        setErrors({ ...errors, [name]: error });
    }
    else {
        setFormData({ ...formData, [name]: value });
        // Validate the field on change and update errors state
        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });
    }
  };

  // This function validates the entire form on submission
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
        // Use the blur-style validation logic for submit
        const value = formData[key];
        let error = '';
        switch (key) {
            case 'name':
                if (!value.trim()) error = 'Name is required';
                else if (!/^[A-Za-z\s]+$/.test(value)) error = "Only letters and spaces allowed";
                break;
            case 'email':
                if (!value.trim()) error = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
                break;
            case 'phone':
                if (!value.trim()) error = 'Phone number is required';
                else if (!/^[0-9]{10}$/.test(value)) error = 'Phone number must be 10 digits';
                break;
            case 'subject':
                if (!value.trim()) error = 'Subject is required';
                else if (value.trim().length < 10) error = "Minimum 10 characters required";
                break;
            case 'content':
                if (!value.trim()) error = 'Message content is required';
                else if (value.trim().length < 10) error = "Minimum 10 characters required";
                break;
            default:
                break;
        }
        if (error) {
            newErrors[key] = error;
        }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      Swal.fire({
        title: 'Sending...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await PublicApi.contactMessage(formData);

      Swal.fire({
        icon: 'success',
        title: 'Message Sent!',
        text: 'Thank you for reaching out to us.',
      });

      setFormData({
        name: '',
        email: '',
        subject: '',
        phone: '',
        content: '',
      });
      setErrors({});
    } catch (err) {
      console.error('Contact form error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Send',
        text: 'Something went wrong. Please try again later.',
      });
    }
  };

  return (
    <div className="contact-page">
      {/* ⭐ Hero Section - Top Image with Text Overlay ⭐ */}
      <section className="contact-hero-section" style={{ backgroundImage: `url(${contactHeroBg})` }}>
        <div className="hero-overlay"></div> {/* For dark overlay on image */}
        <div className="hero-content-text">
          <h1>Contact <span className="highlight-word">Us</span></h1>
          <p>By working together and supporting each other, we can create a more caring compassionate and equitable society.</p>
        </div>
      </section>

      {/* ⭐ Contact Info Cards Section - Overlapping Hero ⭐ */}
      <section className="contact-info-cards-section">
        <div className="contact-info-card">
          <i className="fas fa-envelope contact-icon"></i> {/* Email icon */}
          <h4>Email Address</h4>
          <p>Lisbon.ferrao@gmail.com</p>
        </div>
        <div className="contact-info-card">
          <i className="fas fa-phone contact-icon"></i> {/* Phone icon */}
          <h4>Contact Info</h4>
          <p>9322342225</p>
        </div>
        <div className="contact-info-card">
          <i className="fas fa-building contact-icon"></i> {/* Organization icon */}
          <h4>Organization</h4>
          <p>Green Dharti</p>
        </div>
        <div className="contact-info-card">
          <i className="fas fa-map-marker-alt contact-icon"></i> {/* Location icon */}
          <h4>Address</h4>
          <p>Address: Mary Villa, Badalepada, Giriz, Vasai West</p>
        </div>
      </section>

      {/* ⭐ Main Contact Form Section - Illustration and Form ⭐ */}
      <section className="contact-form-section">
        <div className="contact-form-illustration">
          <img src={contactIllustration} alt="Contact Us Illustration" />
        </div>
        <div className="contact-form-content">
          <h2>Send a <span className="highlight-word">Message</span></h2>
          <p className="form-intro-text">Your message is important to us. Whether you're interested in volunteering, donating, or have a question about our work, please use the form below to reach out. Our team will get back to you as soon as possible.</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Name <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Your Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                Subject <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="content">
                Message <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                id="content"
                name="content"
                rows="6"
                placeholder="Your Message"
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
              {errors.content && <span className="error-message">{errors.content}</span>}
            </div>

            <button type="submit">Submit</button>
          </form>

        </div>
      </section>
    </div>
  );
};

export default Contact;
