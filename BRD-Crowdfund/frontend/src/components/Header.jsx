import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import crowdfund_logo from "../assets/header/crowdfund_logo.png"
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="main-header">
      <div className="container">
        <div className="logo">
          <NavLink to="/" onClick={closeMenu}>
            <img 
              src={crowdfund_logo} 
              alt="Crowdfund Logo" 
              style={{ height: "50px", objectFit: "contain" }} 
            />
          </NavLink>
        </div>

        {/* Hamburger Icon */}
        <div className="hamburger" onClick={toggleMenu}>
          <span className={menuOpen ? 'bar open' : 'bar'}></span>
          <span className={menuOpen ? 'bar open' : 'bar'}></span>
          <span className={menuOpen ? 'bar open' : 'bar'}></span>
        </div>

        {/* Navigation Links */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink> 
          <NavLink to="/about" onClick={closeMenu}>About</NavLink> 
          <NavLink to="/causes" onClick={closeMenu}>Causes</NavLink> 
          <NavLink to="/events" onClick={closeMenu}>Events</NavLink> 
          <NavLink to="/gallery" onClick={closeMenu}>Gallery</NavLink> 
          <NavLink to="/blog" onClick={closeMenu}>Blog</NavLink> 
          <NavLink to="/volunteer" onClick={closeMenu}>Volunteer</NavLink> 
          <NavLink to="/submit-cause" onClick={closeMenu}>Submit Cause</NavLink>
          <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink> 
          
          <div className="header-contact">
            <a href="tel:9322342225" className="phone-number">
              +91-9322342225
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
