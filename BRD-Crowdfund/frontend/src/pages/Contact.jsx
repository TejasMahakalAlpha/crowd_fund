import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';
import { PublicApi } from '../services/api';
import Swal from 'sweetalert2';

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
      <section className="contact-hero">
        <h1>Contact Us</h1>
        <p>We’d love to hear from you!</p>
      </section>

      <div className="contact-container">
        <div className="contact-form">
          <h2>Send a Message</h2>
          <form onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}

            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}

            <input
              type="text"
              name="phone"
              placeholder="Your Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
            />
            {errors.subject && <span className="error">{errors.subject}</span>}

            <textarea
              name="content"
              rows="6"
              placeholder="Your Message"
              value={formData.content}
              onChange={handleChange}
            />
            {errors.content && <span className="error">{errors.content}</span>}

            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="contact-info">
          <h2>Contact Information</h2>
          <p><strong>Phone:</strong> 9322342225</p>
          <p><strong>Email:</strong> lisbon.ferrao@gmail.com</p>
          <p><strong>Organization:</strong> Green Dharti</p>
          <p><strong>Address:</strong> Mary Villa, Badalepada, Giriz, Vasai West</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
