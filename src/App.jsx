import React, { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import ScrollStory from './components/ScrollStory';
import FormationSection from './components/FormationSection';
import RentalCalculator from './components/RentalCalculator';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';

// three.js is only needed for the lab, so it loads as its own chunk.
const LabSection = lazy(() => import('./components/LabSection'));

export default function App() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-void)' }}>
      <a href="#main" className="skip-link">Lewati ke konten</a>

      <Navbar />

      <main id="main" tabIndex={-1} style={{ position: 'relative', zIndex: 1, outline: 'none' }}>
        {/* 1. Opening + scroll-scrubbed robot story */}
        <ScrollStory />

        {/* 2. Official X2 Ultra 3D model: orbit, pose each joint, emotes, exploded and X-ray views */}
        <Suspense fallback={<section id="lab" style={{ height: '100svh', background: 'var(--bg-void)' }} aria-label="Kenali X2 Ultra" />}>
          <LabSection />
        </Suspense>

        {/* 3. Fleet formation lit one spotlight at a time */}
        <FormationSection />

        {/* 4. Interactive Rental Cost & Package Estimator */}
        <RentalCalculator />

        {/* 5. Frequently Asked Questions */}
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
