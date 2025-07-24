// src/components/Header.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
      <div className="container">
        <div className="logo">
          <NavLink to="/">Donar-box</NavLink>
        </div>


        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/causes">Causes</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/blog">Blog</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <NavLink to="/volunteer">Volunteer</NavLink>

          {/* Mega Menu Placeholder */}
          <div className="mega-menu">
            <NavLink to="#">Mega Menu ▾</NavLink>
            <div className="mega-menu-content">
              {/* Example links - replace with actual routes/content */}
              <NavLink to="#">Services</NavLink>
              <NavLink to="#">Projects</NavLink>
              <NavLink to="#">Impact</NavLink>
            </div>
          </div>
          {/* Phone Number */}
          <div className="header-contact">
            <a href="tel:9322342225" className="phone-number">📞 9322342225</a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
