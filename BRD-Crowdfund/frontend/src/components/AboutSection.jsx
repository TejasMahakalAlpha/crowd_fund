// src/components/AboutSection.jsx
import React from 'react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section" id="about">
      <div className="container about-flex-container"> {/* ⭐ Added new class for flex layout ⭐ */}

        {/* ⭐ Left Column: Title ⭐ */}
        <div className="about-title-wrapper">
          <h2 className="section-title">Who <span className="highlight-text">Are We?</span></h2> {/* ⭐ Added span for highlight ⭐ */}
        </div>

        {/* ⭐ Right Column: Text Content ⭐ */}
        <div className="about-text-wrapper">
          <p className="about-main-text"> {/* Combined content into one paragraph */}
            Founded by Lisbon Ferrao, our platform empowers communities to fund, support, and scale meaningful environmental projects across India’s coastal and urban regions.
            We are a community mobilization team that connects donors with grassroots changemakers to enable local clean-ups, recycling innovation, mangrove restoration, and environmental education.
            We leverage real-time mapping tools for transparency, allowing supporters to track the impact of every rupee. Our focus is on sustainable solutions that foster community-led reuse and long-term ecological education, not just one-off clean-ups.
            Join us in giving future generations cleaner beaches, thriving mangroves, and a healthier planet.
          </p>
          {/* ⭐ Removed about-subtext p tag ⭐ */}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;