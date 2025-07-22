// src/pages/Contact.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';
import API, { PublicApi } from '../services/api';
import Swal from 'sweetalert2';

const Contact = () => {
  // const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: '',
    content: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: 'Sending...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await PublicApi.contactMessage(formData);
      Swal.fire({ icon: 'success', title: 'Message Sent!', text: 'Thank you for reaching out to us.' });
      setFormData({ name: '', email: '', subject: '', content: '', phone: '' });
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
          <form onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Your Email Address" value={formData.email} onChange={handleChange} required />
            <input type="number" name="phone" placeholder="Your phone number" value={formData.phone} onChange={handleChange} required />
            <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} />
            <textarea name="content" rows="6" placeholder="Your Message" value={formData.content} onChange={handleChange} required />
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
