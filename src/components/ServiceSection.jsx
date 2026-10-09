import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollMotion } from '../utils/motion';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_STEPS = [
  { title: 'Kirim tanggal dan lokasi', text: 'Lewat WhatsApp, idealnya 7-14 hari sebelum acara.' },
  { title: 'Pilih unit dan aksinya', text: 'Lima unit bisa dikombinasikan: tarian, sambutan, atau koreografi dengan atribut brand Anda.' },
  { title: 'Kami antar dan pasang', text: 'Robot dan perlengkapan tiba sebelum acara dan dipasang oleh tim kami.' },
  { title: 'Tampil dengan 2 operator', text: 'Operator mengendalikan robot sepanjang acara, lalu kami bongkar.' }
];

export default function ServiceSection() {
  const { t } = useLanguage();
  const steps = t.service?.steps || DEFAULT_STEPS;
  const ref = useRef(null);
  const flowRef = useRef(null);
  useScrollMotion(ref);

  // The line draws itself as the page scrolls, and each step lights when the line reaches it.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const flow = flowRef.current;
    const ctx = gsap.context(() => {
      const vertical = window.matchMedia('(max-width: 767px)').matches;
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: flow, start: 'top 85%', end: 'bottom 55%', scrub: 0.8 }
      });
      flow.querySelectorAll('.flow-step').forEach((step, index) => {
        timeline
          .fromTo(step.querySelector('.flow-node'), { scale: 0.4, opacity: 0.1, backgroundColor: 'transparent' }, { scale: 1, opacity: 1, backgroundColor: 'var(--text-pure)', duration: 0.3, ease: 'power2.out' }, index)
          .fromTo(step.querySelectorAll('h3, p'), { opacity: 0, y: 20, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, index);
        const segment = step.querySelector('.flow-seg i');
        if (segment) timeline.fromTo(segment, vertical ? { scaleY: 0 } : { scaleX: 0 }, { scaleX: 1, scaleY: 1, duration: 1, ease: 'none' }, index);
      });
    }, flow);
    return () => ctx.revert();
  }, []);

  return (
    <section id="layanan" ref={ref} className="service" aria-labelledby="service-title" data-bg="#e7e9f6">
      <div className="service-media" data-spotlight>
        <img src="/assets/agibot/lineup.webp" alt="Robot humanoid dan robodog AgiBot bergerak bersama di plaza terbuka" loading="lazy" decoding="async" data-parallax="5" />
        <div className="service-media-overlay"></div>
      </div>

      <div className="container service-copy">
        <h2 id="service-title" className="display" data-split>
          {Array.isArray(t.service?.title) ? (
            <>
              {t.service.title[0]}<br />{t.service.title[1]}
            </>
          ) : (
            t.service?.title || 'Anda fokus ke acara, robotnya kami yang urus.'
          )}
        </h2>
        <p data-reveal>{t.service?.sub || 'Satu kontrak untuk robot, operator, pengiriman, dan pemasangan di lokasi.'}</p>
      </div>

      <div ref={flowRef} className="container flow">
        <span className="cross flow-cross flow-cross-start" aria-hidden="true" />
        <span className="cross flow-cross flow-cross-end" aria-hidden="true" />
        <ol className="flow-steps">
          {steps.map((step, index) => (
            <li key={step.title} className="flow-step">
              <span className="flow-node" aria-hidden="true">
                <span className="flow-node-inner"></span>
              </span>
              {index < steps.length - 1 && <span className="flow-seg" aria-hidden="true"><i /></span>}
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        .service { 
          position: relative;
          z-index: 2;
          padding-top: clamp(2.5rem, 5vw, 4rem);
          padding-bottom: clamp(6rem, 10vw, 10rem); 
        }
        .service-media {
          position: relative;
          width: min(1560px, calc(100% - 2 * var(--pad-x)));
          margin-inline: auto;
          height: clamp(380px, 46vw, 620px);
          border-radius: var(--radius);
          border: var(--hairline);
          background: var(--bg-surface);
          overflow: hidden;
          color: var(--text-body);
        }
        .service-media img {
          position: absolute;
          left: 0;
          top: -15%;
          width: 100%;
          height: 130%;
          object-fit: cover;
          object-position: 5% center;
          will-change: transform;
          opacity: 1;
        }
        .service-media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 62%, rgba(0, 0, 0, 0.12) 100%);
          z-index: 1;
          pointer-events: none;
        }
        .service-copy {
          margin-top: clamp(2.75rem, 5.5vw, 4.75rem);
        }
        .service-copy h2 {
          max-width: none;
          font-size: clamp(2.4rem, 6.2vw, 6.5rem);
          color: var(--text-heading);
        }
        .service-copy p {
          max-width: 44ch;
          margin-top: clamp(1.25rem, 2vw, 1.75rem);
          font-size: 1.15rem;
          color: var(--text-body);
          line-height: 1.6;
        }

        /* The booking, as a line that draws itself */
        .flow {
          position: relative;
          margin-top: clamp(4rem, 7vw, 6rem);
          border-top: var(--hairline);
          padding-top: clamp(2.5rem, 4vw, 3.5rem);
        }
        .flow-cross {
          top: -7px;
        }
        .flow-cross-start {
          left: 0;
        }
        .flow-cross-end {
          right: 0;
        }
        .flow-seg {
          position: absolute;
          left: 20px;
          top: 9px;
          width: calc(100% + 2rem - 20px);
          height: 2px;
          background: rgba(0, 0, 0, 0.08);
        }
        .flow-seg i {
          position: absolute;
          inset: 0;
          background: var(--color-blue);
          transform-origin: left center;
        }
        .flow-steps {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 3rem;
        }
        .flow-step { position: relative; }
        .flow-node {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.22);
          background: transparent;
          position: relative;
          z-index: 2;
          transition: border-color 0.3s ease;
        }
        .flow-node-inner {
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: transparent;
        }
        .flow-step h3 {
          margin-top: 2rem;
          font-size: clamp(1.25rem, 1.5vw, 1.5rem);
          letter-spacing: -0.02em;
          color: var(--text-heading);
          font-weight: 700;
        }
        .flow-step p {
          max-width: 32ch;
          margin-top: 0.75rem;
          color: var(--text-body);
          line-height: 1.6;
          font-size: 1rem;
        }

        @media (max-width: 1024px) {
          .flow-steps {
            gap: 1.5rem;
          }
        }
        @media (max-width: 899px) {
          .service-media { height: min(110vw, 560px); }
          .service-media img { object-position: 70% center; }
        }
        @media (max-width: 767px) {
          .flow-seg {
            left: 9px;
            top: calc(0.35rem + 20px);
            width: 2px;
            height: calc(100% + 3rem - 20px);
            background: rgba(0, 0, 0, 0.08);
          }
          .flow-seg i {
            background: var(--color-blue);
            transform-origin: center top;
          }
          .flow-steps {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .flow-step { padding-left: 3rem; }
          .flow-node {
            position: absolute;
            left: 0;
            top: 0.35rem;
          }
          .flow-step h3 { margin-top: 0; }
        }
      `}</style>
    </section>
  );
}
