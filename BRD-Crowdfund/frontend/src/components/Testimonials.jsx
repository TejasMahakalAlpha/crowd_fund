// src/components/Testimonials.jsx
import React from 'react';
import './Testimonials.css';

import avatar from "../assets/avtar.png"; 
// Confirm this image path is correct

const testimonials = [
  {
    name: 'Sudip Karmarkar',
    quote:
      'What truly resonated with me about give.do was the platform\'s trustworthiness and the assurance that my donation would be used effectively. The ease of use, excellent customer support, and verified NGOs all contributed to a positive giving experience.',
    avatar: avatar,
    tagline: 'Joined the mission to turn compassion into action through giving and support.', // ⭐ Tagline made slightly longer to encourage wrap ⭐
  },
  {
    name: 'Tejas Mahakal', 
    quote:
      'What truly resonated with me about give.do was the platform\'s trustworthiness and the assurance that my donation would be used effectively. The ease of use, excellent customer support, and verified NGOs all contributed to a positive giving experience.',
    avatar: avatar,
    tagline: 'Passionate about community welfare and sustainable development goals.', // ⭐ Tagline made slightly longer ⭐
  },
  {
    name: 'Aniket Mundhe', 
    quote:
      'What truly resonated with me about give.do was the platform\'s trustworthiness and the assurance that my donation would be used effectively. The ease of use, excellent customer support, and verified NGOs all contributed to a positive giving experience.',
    avatar: avatar,
    tagline: 'A true believer in collective good and empowering underprivileged.', // ⭐ Tagline made slightly longer ⭐
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-background-overlay"></div>
      <div className="testimonials-content-wrapper">
        {/* ⭐ CONFIRMED: Title and highlight exactly as per screenshot ⭐ */}
        <h2 className="section-title">Here’s what people say about <span className="highlight-word">give</span></h2> 
        <div className="testimonial-cards">
          {testimonials.map((item, index) => (
            <div className="testimonial-card" key={index}>
              <p className="quote">{item.quote}</p>
              <div className="author-info">
                <img src={item.avatar} alt={item.name} className="author-avatar" />
                <div className="author-details">
                  <p className="author-name">{item.name}</p>
                  <p className="author-tagline">{item.tagline}</p> {/* Tagline render here */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;