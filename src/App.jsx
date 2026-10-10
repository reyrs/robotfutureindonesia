import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import ScrollProgress from './components/ScrollProgress';
import PageBackdrop from './components/PageBackdrop';
import Hero from './components/Hero';
import TalentSection from './components/TalentSection';
import TeaserSection from './components/TeaserSection';
import BookingSection from './components/BookingSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import ConciergeBot from './components/ConciergeBot';

import { useLanguage } from './context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const { t } = useLanguage();

  // Smooth scrolling drives the pinned story; reduced-motion users keep the native scroll.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ duration: 1.05 });
    window.__lenis = lenis;
    const raf = (time) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">{t.nav.skipLink}</a>
      <ScrollProgress />
      <PageBackdrop />
      <Navbar />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <Hero />
        <TalentSection />
        <TeaserSection />
        <BookingSection />
        <FaqSection />
      </main>
      <Footer />
      <ConciergeBot />
    </>
  );
}
