// src/pages/About.jsx
import React from 'react';
import AboutSection from '../components/AboutSection';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="overlay">
          <h1>About Us</h1>
          <p>Making the world a better place through compassion, action, and impact.</p>
        </div>
      </section>

      <AboutSection />

      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          Green Dharti is committed to creating a just, sustainable, and compassionate world. 
          We drive positive change through impactful causes — from education and environment 
          to health and community welfare.
        </p>
      </section>

      <section className="about-values">
        <h2>Our Values</h2>
        <ul>
          <li>🌱 Sustainability</li>
          <li>💛 Compassion</li>
          <li>🧩 Inclusion</li>
          <li>🤝 Collaboration</li>
        </ul>
      </section>

      <section className="about-story">
        <h2>Our Journey</h2>
        <p>
          Since our beginning, we’ve empowered thousands of people through grassroots campaigns, 
          educational programs, environmental drives, and volunteerism. And this is just the start.
        </p>
      </section>
    </div>
  );
};

export default About;
