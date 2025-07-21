// src/components/Testimonials.jsx
import React from 'react';
import './Testimonials.css';

const testimonials = [
  {
    name: 'Sudip Karmarkar',
    quote:
      'What truly resonated with me about give.do was the platform\'s trustworthiness and the assurance that my donation would be used effectively. The ease of use, excellent customer support, and verified NGOs all contributed to a positive giving experience.',
  },
  {
    name: 'Sudip Karmarkar',
    quote:
      'What truly resonated with me about give.do was the platform\'s trustworthiness and the assurance that my donation would be used effectively. The ease of use, excellent customer support, and verified NGOs all contributed to a positive giving experience.',
  },
  {
    name: 'Sudip Karmarkar',
    quote:
      'What truly resonated with me about give.do was the platform\'s trustworthiness and the assurance that my donation would be used effectively. The ease of use, excellent customer support, and verified NGOs all contributed to a positive giving experience.',
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section" id="testimonials">
      <h2 className="section-title">Here’s What People Say About Us</h2>
      <div className="testimonial-cards">
        {testimonials.map((item, index) => (
          <div className="testimonial-card" key={index}>
            <p className="quote">“{item.quote}”</p>
            <p className="name">— {item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
