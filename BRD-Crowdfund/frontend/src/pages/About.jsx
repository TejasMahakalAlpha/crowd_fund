// src/pages/About.jsx
import React from 'react';
import './About.css';
import clean_beach  from "../assets/about/clean_beach.jpg";
import cleaning_beach  from "../assets/about/cleaning-beach.jpg";

// You can find icons from libraries like 'react-icons' (e.g., npm install react-icons)
// import { FaSeedling, FaUsers, FaHandHoldingHeart, FaSearchDollar } from 'react-icons/fa';

const About = () => {
  return (
    <div className="about-page-v2">
      {/* HERO SECTION */}
      <section className="about-hero-v2">
        <div className="hero-overlay">
          <h1 className="hero-title">Our Planet, Our Promise.</h1>
          <p className="hero-subtitle">
            Founded by Lisbon Ferrao, we are a platform empowering communities to fund, support, and scale meaningful environmental projects across India.
          </p>
        </div>
      </section>

      {/* --- ALL OTHER SECTIONS REMAIN UNCHANGED --- */}

      {/* OUR STORY SECTION */}
      <section className="content-section">
        <div className="content-container two-column">
          <div className="column-text">
            <h2>Our Journey</h2>
            <p>
              Lisbon’s journey began when he discovered his children playing amid beach litter in Mumbai. Shocked by this, he and his wife Zsuzsanna Salda turned their weekend beach visits into clean-up efforts. This led to founding Vasai Beach Cleaners, which has removed hundreds of tons of plastic waste from seven beaches since 2017—sometimes uncovering tragedies, like seabirds and dolphins washed ashore, underscoring the urgency of change.
            </p>
          </div>
          <div className="column-image">
            <img src={clean_beach} alt="Beach cleanup volunteers" />
          </div>
        </div>
      </section>

      {/* OUR APPROACH CARDS SECTION */}
      <section className="approach-section">
        <div className="content-container">
          <h2>How We Create Impact</h2>
          <div className="approach-cards-container">
            <div className="approach-card">
              <h3>Crowdfund with Purpose</h3>
              <p>We connect donors and grassroots changemakers to fund local clean-ups, recycling innovators, and environmental education.</p>
            </div>
            <div className="approach-card">
              <h3>Foster Sustainable Solutions</h3>
              <p>We support community-led reuse, local recycling businesses, and ecological education—not just one-off clean-ups.</p>
            </div>
            <div className="approach-card">
              <h3>Build Green Communities</h3>
              <p>We champion volunteers, local NGOs, startups, and school clubs to build green-minded communities nationwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUOTE SECTION */}
      <section className="quote-section">
        <div className="content-container">
          <blockquote>
            “Strength isn’t just for lifting weights. It’s for lifting burdens, your own or someone else’s.”
          </blockquote>
          <cite>— Lisbon Ferrao, Founder</cite>
        </div>
      </section>
      
      {/* WHY SUPPORT US SECTION */}
      <section className="content-section">
        <div className="content-container two-column reverse">
          <div className="column-text">
            <h2>Why Support Us?</h2>
            <p>
              Our platform ensures smart activism that scales. We don’t just clean coasts—we nurture environmental stewardship in every neighbourhood by focusing on transparent funding and community empowerment.
            </p>
            <a href="/Volunteer" className="cta-button">Join The Movement</a>
          </div>
          <div className="column-image">
           <img src={cleaning_beach} alt="Thriving mangrove ecosystem" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;