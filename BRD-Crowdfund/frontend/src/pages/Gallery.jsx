// src/pages/Gallery.jsx
import React from 'react';
import './Gallery.css';

const images = [
  'Gallary/Img_1.jpg',
  'Gallary/img_2.jpg',
  'Gallary/img_3.jpg',
  'Gallary/img_4.jpg',
  'Gallary/Img_5.jpg',
  'Gallary/img_6.jpg',
  'Gallary/Img_7.jpg',
  'Gallary/Img_8.jpg',
  'Gallary/Img_9.jpg',
  'Gallary/Img_10.jpg',
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
