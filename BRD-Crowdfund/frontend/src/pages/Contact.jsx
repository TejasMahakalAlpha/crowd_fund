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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error as user types
  };

  const validate = () => {
    const newErrors = {};
    const isTextOnly = (str) => /^[A-Za-z\s]+$/.test(str);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (!isTextOnly(formData.name)) newErrors.name = "Only letters and spaces allowed";
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    else if (formData.subject.trim().length < 10) newErrors.subject = "Minimum 10 characters required";

    if (!formData.content.trim()) { newErrors.content = 'Message content is required'; }
    else if (formData.content.trim().length < 10) { newErrors.content = "Minimum 10 characters required"; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

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
          <p className="form-intro-text">simply dummy text of the printing and typesetting industry. lorem ipsum has been the industry standard dummy text ever since the 1535 when an unknown printer.</p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
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
                <label htmlFor="email">Email Address</label>
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
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                maxLength={10}
                placeholder="Your Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
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
              <label htmlFor="content">Message</label>
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