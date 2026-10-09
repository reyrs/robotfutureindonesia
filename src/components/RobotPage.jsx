import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { SERIES, RENTABLE, robotCutout, shortName } from '../data/robots';
import { WA_CTA_LABEL, waLink } from '../config/site';
import { useScrollMotion, countUp } from '../utils/motion';
import { RobotGrid, CATALOG_CSS } from './Catalog';
import RobotViewer from './RobotViewer';
import Magnetic from './Magnetic';

const bookMessage = (robot) => `Halo Robotshow Indonesia, saya ingin cek jadwal sewa ${robot.name} untuk event.`;

function BookButton({ robot }) {
  return (
    <Magnetic as="a"
      href={waLink(bookMessage(robot))}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-cyber-primary"
      aria-label={`${WA_CTA_LABEL} ${robot.name} lewat WhatsApp`}
    >
      <MessageCircle size={18} aria-hidden="true" />
      <span>{WA_CTA_LABEL}</span>
    </Magnetic>
  );
}

export default function RobotPage({ robot }) {
  const ref = useRef(null);
  const series = SERIES.find((s) => s.id === robot.series);
  const others = RENTABLE.filter((r) => r.id !== robot.id);
  useScrollMotion(ref);

  // Entrance: the robot rises into its tile, the copy follows, then the specs count up.
  // fromTo (not from): React StrictMode's cleanup kills the first run mid-flight and
  // from() would re-capture the half-animated inline styles as its end values.
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = ref.current;
    const tl = gsap.timeline();
    tl.fromTo(root.querySelector('.rp-media'),
      { y: 60, scale: 0.96, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out', immediateRender: true })
      .fromTo(root.querySelectorAll('.rp-info > *'),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out', immediateRender: true }, 0.15);
    const counters = [...root.querySelectorAll('[data-value]')].map(countUp).filter(Boolean);
    return () => {
      tl.kill();
      counters.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={ref} className="rp">
      <section className="container rp-hero" data-bg="#f0f1fa" aria-labelledby="rp-title">
        <div className="rp-media theme-dark">
          {robot.model
            ? <RobotViewer robot={robot} />
            : <img src={robotCutout(robot)} alt={robot.name} width="1100" height="1100" fetchPriority="high" />}
        </div>
        <div className="rp-info">
          <Magnetic as="a" href="/#armada" className="rp-back mono-label"><ArrowLeft size={16} aria-hidden="true" />Semua robot</Magnetic>
          <h1 id="rp-title" className="display">{robot.name}</h1>
          <p className="rp-summary">{robot.summary}</p>
          <dl className="rp-specs">
            {robot.specs.map((spec) => (
              <div key={spec.label}>
                <dt className="mono-label">{spec.label}</dt>
                <dd data-value={spec.value}>{spec.value}</dd>
              </div>
            ))}
          </dl>
          <BookButton robot={robot} />
        </div>
      </section>

      <section className="rp-band duotone" data-bg="#0a0c10" aria-labelledby="rp-acts-title" data-spotlight>
        <picture>
          <source media="(max-width: 767px)" srcSet={`/assets/agibot/${series.banner}-m.webp`} />
          <img src={`/assets/agibot/${series.banner}.webp`} alt="" loading="lazy" decoding="async" data-parallax="6" />
        </picture>
        <div className="container rp-band-copy">
          <h2 id="rp-acts-title" className="display" data-split>Yang bisa {shortName(robot.name)} lakukan di acara Anda.</h2>
          <ul data-stagger>
            {robot.acts.map((act) => <li key={act}>{act}</li>)}
          </ul>
        </div>
      </section>

      <section className="container rp-more" data-bg="#ffffff" aria-labelledby="rp-more-title">
        <h2 id="rp-more-title" className="display" data-split>Robot lain yang siap disewa.</h2>
        <RobotGrid robots={others} />
      </section>

      <section className="container rp-cta" data-bg="#f0f1fa" aria-labelledby="rp-cta-title" data-reveal>
        <h2 id="rp-cta-title" className="display">Cek jadwal {shortName(robot.name)}.</h2>
        <p>Kirim tanggal, lokasi, dan jenis acara. Kami balas dengan ketersediaan unit dan harga.</p>
        <BookButton robot={robot} />
      </section>

      <style>{CATALOG_CSS}</style>
      <style>{`
        .rp-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: clamp(2rem, 5vw, 5rem);
          align-items: center;
          padding-top: 7rem;
          padding-bottom: 5rem;
        }
        .rp-media {
          position: relative;
          aspect-ratio: 1;
          border-radius: var(--radius);
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
        }
        .rp-media img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .rp-media .rpv {
          position: absolute;
          inset: 0;
        }
        .rp-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          min-height: 44px;
          color: var(--text-body);
          text-decoration: none;
        }
        .rp-back:hover {
          color: var(--color-blue);
        }
        .rp-info h1 {
          margin-top: 0.5rem;
          font-size: clamp(3.5rem, 7vw, 7rem);
          color: var(--text-heading);
        }
        .rp-summary {
          margin-top: 1rem;
          max-width: 46ch;
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-body);
        }
        .rp-specs {
          display: grid;
          margin: 2rem 0 2.25rem;
          border-bottom: var(--hairline);
        }
        .rp-specs > div {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.85rem 0;
          border-top: var(--hairline);
        }
        .rp-specs dt {
          color: var(--text-muted);
        }
        .rp-specs dd {
          font-family: var(--font-mono);
          font-size: clamp(1rem, 1.3vw, 1.1rem);
          font-weight: 500;
          color: var(--text-heading);
          font-variant-numeric: tabular-nums;
          text-align: right;
        }
        .rp-band {
          position: relative;
          min-height: clamp(460px, 42vw, 640px);
          display: flex;
          align-items: center;
          overflow: hidden;
          color: var(--color-white);
        }
        .rp-band.duotone {
          background: transparent;
        }
        .rp-band img {
          position: absolute;
          left: 0;
          top: -10%;
          width: 100%;
          height: 120%;
          object-fit: cover;
          will-change: transform;
        }
        .rp-band::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(10, 12, 16, 0.62) 0%, transparent 65%);
        }
        .rp-band-copy {
          position: relative;
          z-index: 1;
          padding-block: 4rem;
        }
        .rp-band h2 {
          max-width: 16ch;
          font-size: clamp(3.5rem, 6vw, 6rem);
          color: var(--color-white);
        }
        .rp-band ul {
          list-style: none;
          margin-top: 2rem;
          display: grid;
          gap: 0.9rem;
          max-width: 30rem;
        }
        .rp-band li {
          padding-left: 1rem;
          border-left: 2px solid var(--color-white);
          font-size: 1.1rem;
          color: var(--color-white);
        }
        .rp-more {
          padding-top: 6rem;
        }
        .rp-more h2,
        .rp-cta h2 {
          font-size: clamp(3.5rem, 8vw, 9rem);
          color: var(--text-heading);
        }
        .rp-cta {
          margin-top: clamp(5rem, 9vw, 7rem);
          margin-bottom: clamp(5rem, 9vw, 7rem);
          padding-top: clamp(3rem, 5vw, 4rem);
          border-top: var(--hairline);
        }
        .rp-cta p {
          max-width: 44ch;
          margin: 1rem 0 1.75rem;
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-body);
        }
        .tile-media {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius);
          box-shadow: none;
        }
        .tile-line {
          color: var(--text-body);
        }
        .tile-badge {
          background: var(--color-white);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--color-ink);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
        @media (max-width: 899px) {
          .rp-hero {
            grid-template-columns: 1fr;
            padding-top: 5.5rem;
            padding-bottom: 3.5rem;
          }
          .rp-specs dd {
            font-size: 1rem;
          }
          .rp-band {
            min-height: min(120vw, 560px);
            align-items: flex-end;
          }
          .rp-band::after {
            background: linear-gradient(0deg, rgba(10, 12, 16, 0.78) 0%, rgba(10, 12, 16, 0.42) 60%, transparent 100%);
          }
        }
      `}</style>
    </div>
  );
}
