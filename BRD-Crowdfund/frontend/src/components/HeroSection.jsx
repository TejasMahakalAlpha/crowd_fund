// src/components/HeroSection.jsx
import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Helping Each Other<br />Make World Better</h1>
        <p>By working together and supporting each other, we can create a more compassionate and equitable society.</p>
        <div className="hero-buttons">
          <button className="btn primary">View Our Causes</button>
          <button className="btn secondary">Donate Now</button>
          <button className="btn outline">Become a Volunteer</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
