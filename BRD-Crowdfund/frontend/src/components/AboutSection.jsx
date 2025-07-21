// src/components/AboutSection.jsx
import React from 'react';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <h2 className="section-title">Who We Are?</h2>
        <p className="about-text">
          We are a community dedicated to making a difference. Green Dharti works tirelessly to bring change
          through impactful causes. Whether it's education, environment, or social welfare — we act where it matters most.
        </p>
        <p className="about-subtext">
          By empowering people and inspiring action, we believe we can build a compassionate, equal, and sustainable future.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
