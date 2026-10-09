import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle } from 'lucide-react';
import { waLink } from '../config/site';
import { useMediaQuery } from '../utils/frames';
import { useLanguage } from '../context/LanguageContext';
import Magnetic from './Magnetic';

gsap.registerPlugin(ScrollTrigger);

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};
// Mirrors Preloader's gate: is the percent intro still going to play?
const introPending = () => {
  try {
    return (
      !sessionStorage.getItem('rs-preloader-seen') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  } catch {
    return false;
  }
};

export default function Hero() {
  const { t } = useLanguage();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const copyRef = useRef(null);
  const stageRef = useRef(null);
  const headlineRef = useRef(false);
  const [webgl] = useState(hasWebGL);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [introDone, setIntroDone] = useState(() => !introPending());
  const failed = !webgl || loadError;

  // Headline and stage wait for the preloader so nothing animates unseen.
  useEffect(() => {
    if (introDone) return undefined;
    const onDone = () => setIntroDone(true);
    window.addEventListener('rs:intro-done', onDone);
    return () => window.removeEventListener('rs:intro-done', onDone);
  }, [introDone]);

  // 3D stage: its own chunk, paused off screen, camera pulls back as the hero scrolls away.
  useEffect(() => {
    if (!webgl) return undefined;
    let stage = null;
    let io = null;
    let trigger = null;
    let cancelled = false;
    import('../three/heroStage').then(({ createHeroStage }) => {
      if (cancelled) return;
      stage = createHeroStage({
        canvas: canvasRef.current,
        isMobile,
        reducedMotion,
        onReady: () => {
          setReady(true);
        },
        onError: () => setLoadError(true)
      });
      stageRef.current = stage;
      io = new IntersectionObserver(([entry]) => stage.setVisible(entry.isIntersecting));
      io.observe(sectionRef.current);
      trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        onUpdate: (self) => stage.setProgress(self.progress)
      });
    });
    return () => {
      cancelled = true;
      io?.disconnect();
      trigger?.kill();
      stage?.dispose();
      stageRef.current = null;
    };
  }, [webgl, isMobile, reducedMotion]);

  // The headline hands over to the story: it lifts and fades as the hero scrolls away.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const tween = gsap.to(copyRef.current, {
      yPercent: -40,
      opacity: 0,
      filter: 'blur(10px)',
      ease: 'none',
      scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '70% top', scrub: 1.5 }
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reducedMotion]);

  // Once the model is in and the intro is gone: lights up, the robot waves, the headline rises.
  useEffect(() => {
    if (headlineRef.current) return;
    if (!ready && !failed) return;
    if (!introDone) return;
    headlineRef.current = true;
    stageRef.current?.start();
    if (!reducedMotion) {
      gsap.fromTo(copyRef.current.querySelectorAll('.hero-line > span, .hero-sub, .hero-ctas'),
        {
          yPercent: 110,
          opacity: 0,
          filter: 'blur(15px)'
        },
        {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.4,
          stagger: 0.1,
          ease: 'power4.out',
          delay: 0.3
        }
      );
    }
  }, [introDone, ready, failed, reducedMotion]);

  return (
    <section id="top" ref={sectionRef} className={`hero${ready ? ' is-ready' : ''}${failed ? ' is-static' : ''}`} data-bg="#f0f1fa" aria-labelledby="hero-title">
      <div className="hero-glow" aria-hidden="true" />
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
      <div className="hero-word" aria-hidden="true">ROBOTSHOW</div>
      {failed && <img className="hero-fallback" src="/assets/robots/x2-ultra.webp" alt="" width="1100" height="1100" />}

      <div ref={copyRef} className="container hero-copy">
        <div className="hero-copy-inner">
          <h1 id="hero-title" className="hero-title">
            {[t.hero.line1, t.hero.line2].map((line) => (
              <span key={line} className="hero-line"><span>{line}</span></span>
            ))}
          </h1>
          <p className="hero-sub">{t.hero.sub}</p>
        </div>
        <div className="hero-ctas">
          <Magnetic as="a" href={waLink(t.hero.waMessage)} target="_blank" rel="noopener noreferrer" className="btn-cyber-primary" aria-label={`${t.nav.cta} lewat WhatsApp`}>
            <MessageCircle size={18} aria-hidden="true" />
            <span>{t.nav.cta}</span>
          </Magnetic>
          <Magnetic as="a" href={waLink(t.hero.waPriceMessage)} target="_blank" rel="noopener noreferrer" className="btn-cyber-outline">
            {t.hero.ctaPrice}
          </Magnetic>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          height: 100svh;
          min-height: 640px;
          overflow: hidden;
          background: var(--color-bg);
          isolation: isolate;
        }
        .hero-glow {
          position: absolute;
          top: 40%;
          left: 50%;
          translate: -50% -50%;
          width: 80vw;
          height: 80vw;
          background: radial-gradient(circle, rgba(0, 22, 236, 0.05) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        .hero-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          opacity: 0;
          transition: opacity 1.2s ease;
          z-index: 1;
        }
        .hero.is-ready .hero-canvas { opacity: 1; }
        .hero-word {
          position: absolute;
          left: 50%;
          top: 41%;
          translate: -50% -50%;
          font: 900 clamp(4rem, 17.5vw, 17rem) / 0.8 var(--font-display);
          letter-spacing: -0.06em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(0, 22, 236, 0.28);
          white-space: nowrap;
          opacity: 0.8;
          transition: opacity 0.8s ease;
          pointer-events: none;
          z-index: 0;
        }
        .hero.is-ready .hero-word { opacity: 0; }
        .hero.is-static .hero-word { opacity: 0.9; }
        .hero-fallback {
          position: absolute;
          left: 50%;
          bottom: 12%;
          height: 70%;
          width: auto;
          translate: -50% 0;
          z-index: 1;
        }
        .hero::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(180deg, transparent 88%, rgba(240, 241, 250, 0.55) 97%, var(--color-bg) 100%);
        }
        .hero-copy {
          position: absolute;
          left: 0;
          right: 0;
          bottom: clamp(40px, 8vh, 100px);
          z-index: 3;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 2rem;
        }
        .hero-title {
          font-size: clamp(2.8rem, 5.5vw, 5.5rem);
          line-height: 1.05;
          letter-spacing: -0.05em;
          color: var(--text-pure);
          font-weight: 700;
        }
        .hero-line {
          display: block;
          overflow: hidden;
          padding-bottom: 0.06em;
        }
        .hero-line > span { display: inline-block; }
        .hero-sub {
          max-width: 42ch;
          margin-top: 1.25rem;
          font-size: 1.15rem;
          color: var(--text-body);
          font-weight: 400;
          line-height: 1.6;
        }
        .hero-ctas {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .hero-copy {
            flex-direction: column;
            align-items: stretch;
            gap: 2rem;
          }
          .hero-title {
            font-size: clamp(2.6rem, 8vw, 4rem);
          }
        }
        @media (max-width: 767px) {
          .hero-ctas { flex-direction: column; }
          .hero-word { top: 30%; }
        }
      `}</style>
    </section>
  );
}
