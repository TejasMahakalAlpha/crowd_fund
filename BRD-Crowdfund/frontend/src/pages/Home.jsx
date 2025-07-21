// src/pages/Home.jsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import DonationCard from '../components/DonationCard';
import CausesSection from '../components/CausesSection';
import StatsSection from '../components/StatsSection';
import EventsSection from '../components/EventsSection';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <DonationCard />
      <CausesSection />
      <StatsSection />
      <EventsSection />
      <Testimonials />
    </>
  );
};

export default Home;
