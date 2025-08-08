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
          Founded by Lisbon Ferrao, our platform empowers communities to fund, support, and scale meaningful environmental projects across India’s coastal and urban regions.
          Lisbon’s journey began when he discovered his children playing amid beach litter in Mumbai. Shocked by this, he and his wife Zsuzsanna Salda turned their weekend beach visits into clean‑up efforts.
          That led to founding Vasai Beach Cleaners, which has removed hundreds of tons of plastic waste from seven beaches since 2017—sometimes uncovering tragedies, like a seabird , turtles , dolphins washed ashore in a pile of trash, underscoring the urgency of change
        </p>
      </section>
    </div>
  );
};

export default About;
