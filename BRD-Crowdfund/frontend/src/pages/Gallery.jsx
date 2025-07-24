// src/pages/Gallery.jsx
import React from 'react';
import './Gallery.css';

const images = [
  'blooddonation.jpeg',
  'communitycleaning.jpeg',
  'eco-week.jpeg',
  'freemedicalcamp.jpeg',
  'student.jpg',
  'treeplantation.jpeg',
  'womanempower.jpg',
  'youthvoluneteer.jpeg',
];

const Gallery = () => {
  return (
    <div className="gallery-page">
      <section className="gallery-hero">
        <h1>Our Gallery</h1>
        <p>Moments from our campaigns, events, and volunteer programs.</p>
      </section>

      <div className="gallery-grid">
        {images.map((img, index) => (
          <div className="gallery-item" key={index}>
            <img src={img} alt={`gallery-${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
