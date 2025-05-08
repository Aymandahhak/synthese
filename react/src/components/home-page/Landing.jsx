import React from 'react';
import HeroSection from './HeroSection';
import FeatureHighlights from './FeatureHighlights';
import AboutSection from './AboutSection';
import ScrollToTop from './ScrollToTop';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HeroSection />
      <AboutSection />
      <FeatureHighlights />
      <ScrollToTop />
    </div>
  );
};

export default Landing; 