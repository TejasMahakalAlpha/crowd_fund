// src/pages/Gallery.jsx
import React from 'react';
import './Gallery.css';

const images = [
  '/assets/images/gallery1.jpg',
  '/assets/images/gallery2.jpg',
  '/assets/images/gallery3.jpg',
  '/assets/images/gallery4.jpg',
  '/assets/images/gallery5.jpg',
  '/assets/images/gallery6.jpg',
  '/assets/images/gallery7.jpg',
  '/assets/images/gallery8.jpg',
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
