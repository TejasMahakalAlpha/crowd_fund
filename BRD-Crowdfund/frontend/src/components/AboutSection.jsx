// src/components/AboutSection.jsx
import React from 'react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section" id="about">
      <div className="container about-flex-container"> {/* ⭐ Added new class for flex layout ⭐ */}
        
        {/* ⭐ Left Column: Title ⭐ */}
        <div className="about-title-wrapper">
          <h2 className="section-title">Who <span className="highlight-text">We Are?</span></h2> {/* ⭐ Added span for highlight ⭐ */}
        </div>
        
        {/* ⭐ Right Column: Text Content ⭐ */}
        <div className="about-text-wrapper">
          <p className="about-main-text"> {/* Combined content into one paragraph */}
            We are a community dedicated to making a difference. Green Dharti works tirelessly to bring change
            through impactful causes. Whether it's education, environment, or social welfare — we act where it matters most.
            By empowering people and inspiring action, we believe we can build a compassionate, equal, and sustainable future.
            simply dummy text of the printing and typesetting industry. lorem ipsum has been the industry standard dummy text ever since the 1535 when an unknown
            printer.simply dummy text of the printing and typesetting industry. lorem ipsum has been the industry standard dummy text ever since the 1535 when an unknown
            printer.
          </p>
          {/* ⭐ Removed about-subtext p tag ⭐ */}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;