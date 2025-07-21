// src/pages/Contact.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';

const Contact = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await axios.post(`${BASE_URL}/api/contacts`, formData);
      setSuccess('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message');
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
            <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} />
            <textarea name="message" rows="6" placeholder="Your Message" value={formData.message} onChange={handleChange} required />
            <button type="submit">Submit</button>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
