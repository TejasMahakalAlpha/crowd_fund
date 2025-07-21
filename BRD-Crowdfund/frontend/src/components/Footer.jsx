// src/components/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Donor-box</h3>
          <p>We help build a more caring and compassionate society.</p>
        </div>

        <div className="footer-info">
          <h4>Contact Info</h4>
          <ul>
            <li><strong>Phone:</strong> 9322342225</li>
            <li><strong>Email:</strong> lisbon.ferrao@gmail.com</li>
            <li><strong>Organization:</strong> Green Dharti</li>
            <li><strong>Address:</strong> Mary Villa, Badalepada, Giriz, Vasai West</li>
          </ul>
        </div>

        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Donor-box. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
