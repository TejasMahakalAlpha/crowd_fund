// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you use React Router for navigation
import './Footer.css';

// Import icons from react-icons
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="main-footer-v2">
      <div className="footer-container-v2">
        {/* Column 1: Brand & Socials */}
        <div className="footer-col about-col">
          <h3 className="footer-logo">Green Dharti</h3>
          <p className="footer-tagline">
            Empowering communities to fund, support, and scale meaningful environmental projects across India.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col links-col">
          <h3 className="footer-heading">Quick Links</h3>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/causes">Our Causes</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/volunteer">Volunteer</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="footer-col contact-col">
          <h3 className="footer-heading">Get in Touch</h3>
          <ul>
            <li>
              <FiMapPin className="contact-icon" />
              <span>Mary Villa, Badalepada, Giriz, Vasai West</span>
            </li>
            <li>
              <FiPhone className="contact-icon" />
              <a href="tel:9322342225">9322342225</a>
            </li>
            <li>
              <FiMail className="contact-icon" />
              <a href="mailto:Lisbon.ferrao@gmail.com">Lisbon.ferrao@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Green Dharti. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;