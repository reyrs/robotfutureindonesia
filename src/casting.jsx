import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LabSection from './components/LabSection';
import ScrollProgress from './components/ScrollProgress';
import PageBackdrop from './components/PageBackdrop';
import ConciergeBot from './components/ConciergeBot';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

// /casting/: the 3D lab on its own page. On the home page its 4 MB model parsed mid-scroll and
// froze the teaser for ~3 s.
function CastingEntry() {
  const { t } = useLanguage();

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
        <LabSection />
      </main>
      <Footer />
      <ConciergeBot />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <CastingEntry />
    </LanguageProvider>
  </StrictMode>
);
