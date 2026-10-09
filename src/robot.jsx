import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RobotPage from './components/RobotPage';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import ScrollProgress from './components/ScrollProgress';
import PageBackdrop from './components/PageBackdrop';
import { RENTABLE } from './data/robots';
import { LanguageProvider } from './context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

function RobotEntry({ robot }) {
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
      <a href="#main" className="skip-link">Lewati ke konten</a>
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <PageBackdrop />
      <Navbar />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <RobotPage robot={robot} />
      </main>
      <Footer />
    </>
  );
}

// /robot/<id>/ → that robot's page; unknown ids go back to the catalog.
const id = location.pathname.split('/').filter(Boolean)[1];
const robot = RENTABLE.find((r) => r.id === id);

if (!robot) {
  location.replace('/#robot');
} else {
  document.title = `Sewa ${robot.name} untuk Event | Robotshow.id`;
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LanguageProvider>
        <RobotEntry robot={robot} />
      </LanguageProvider>
    </StrictMode>
  );
}
