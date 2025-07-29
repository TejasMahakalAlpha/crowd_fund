// src/components/HeroSection.jsx
import React from 'react';
import './HeroSection.css';
import { useNavigate } from "react-router-dom";

// ⭐ Image ko wapas import kiya hai ⭐
import heroImage from "../assets/homesection/homesection.jpg";
// Path to your hero image

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      {/* ⭐ No full-width overlay here, it was for background image setup ⭐ */}
      
      <div className="hero-content-wrapper"> {/* ⭐ Wrapper for side-by-side text and image ⭐ */}
        <div className="hero-text-content"> {/* Left-aligned text content */}
          <h1>Helping Each <span className="highlight-text">Other</span> Can<br />Make World <span className="highlight-text">Better</span></h1>
          <p>By working together and supporting each other, we can create a more compassionate and equitable society.</p>
          <div className="hero-buttons"> {/* ⭐ Buttons wapas text content ke andar ⭐ */}
            {/* Button classes reverted to initial distinct types */}
            <button className="btn primary" onClick={() => navigate('/causes')}>View Our Causes</button> {/* Original text/action */}
            <button className="btn secondary" onClick={() => navigate('', { state: { scrollTo: 'DonationCard' } })}>Donate Now</button> {/* Original text/action */}
            <button className="btn outline" onClick={() => navigate('/volunteer')}>Become a Volunteer</button> {/* Original text/action */}
          </div>
        </div>
        
        <div className="hero-image-container"> {/* ⭐ NEW: Div for image ⭐ */}
          <img src={heroImage} alt="Donation jar with coins" className="hero-main-image" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;