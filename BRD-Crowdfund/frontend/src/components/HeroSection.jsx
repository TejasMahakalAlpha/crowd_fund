// src/components/HeroSection.jsx
import React from 'react';
import './HeroSection.css';
import { useNavigate } from "react-router-dom";

const HeroSection = () => {

  const navigate = useNavigate();
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Helping Each Other<br />Make World Better</h1>
        <p>By working together and supporting each other, we can create a more compassionate and equitable society.</p>
        <div className="hero-buttons">
          <button className="btn primary" onClick={() => navigate('causes')}>View Our Causes</button>
          <button className="btn secondary" onClick={() => navigate('', { state: { scrollTo: 'DonationCard' } })}>Donate Now</button>
          <button className="btn outline" onClick={() => navigate('volunteer')}>Become a Volunteer</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
