// src/components/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* ⭐ 1st Column: Brand/Logo ⭐ */}
        <div className="footer-col brand-col">
            <div className="footer-logo">
                {/* Assuming you have a logo icon or text */}
                <i className="fas fa-hand-holding-heart footer-icon"></i> {/* Example icon, replace if you have specific logo icon */}
                <h3>Donor-box</h3>
            </div>
          <p className="brand-tagline">simply dummy text of the printing and typesetting industry. lorem ipsum has been the industry standard</p>
        </div>

        {/* ⭐ 2nd Column: Contact Info ⭐ */}
        <div className="footer-col contact-info-col">
            <i className="fas fa-phone footer-icon"></i> {/* Phone icon */}
          <h4>Contact Info</h4>
          <p>9322342225</p>
        </div>

        {/* ⭐ 3rd Column: Email Address ⭐ */}
        <div className="footer-col email-col">
            <i className="fas fa-envelope footer-icon"></i> {/* Email icon */}
          <h4>Email Address</h4>
          <p>Lisbon.ferrao@gmail.com</p>
        </div>

        {/* ⭐ 4th Column: Organization ⭐ */}
        <div className="footer-col organization-col">
            <i className="fas fa-building footer-icon"></i> {/* Organization icon */}
          <h4>Organization</h4>
          <p>Green Dharti</p>
        </div>

        {/* ⭐ 5th Column: Address (separated from contact info) ⭐ */}
        <div className="footer-col address-col">
            <i className="fas fa-map-marker-alt footer-icon"></i> {/* Location icon */}
            <h4>Address</h4>
            <p>Address: Mary Villa, Badalepada, Giriz Vasai West</p>
        </div>

      </div>

      {/* ⭐ REMOVED: footer-social and footer-bottom sections (not in screenshot) ⭐ */}
    </footer>
  );
};

export default Footer;