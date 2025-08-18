// src/pages/Home.jsx
import React, { useEffect, useRef } from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import DonationCard from '../components/DonationCard';
import CausesSection from '../components/CausesSection';
import StatsSection from '../components/StatsSection';
import EventsSection from '../components/EventsSection';
import Testimonials from '../components/Testimonials';
import "./Home.css";
import { useLocation } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const donationRef = useRef(null);

  useEffect(() => {
    if (location.state?.scrollTo === 'DonationCard') {
      donationRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);
  return (
    <>
      <HeroSection />
      <AboutSection />
      <div ref={donationRef}>
        {/* <DonationCard /> */}
      </div>
      <CausesSection />
      <StatsSection />
      <EventsSection />
      <Testimonials />
    </>
  );
};

export default Home;
