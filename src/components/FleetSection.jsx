import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { ROBOTS, RENTABLE, robotCutout, robotHref, shortName } from '../data/robots';
import { waLink } from '../config/site';
import { useScrollMotion, countUp } from '../utils/motion';
import { useLanguage } from '../context/LanguageContext';
import Magnetic from './Magnetic';

gsap.registerPlugin(ScrollTrigger, SplitText);

const defaultAskMessage = (robot) => `Halo Robotshow Indonesia, apakah ${robot.name} bisa disewa untuk event saya?`;
const ASK = ROBOTS.filter((r) => !r.rent);
const numberOf = (value) => {
  const match = value.match(/\d+(?:[,.]\d+)?/);
  return match ? parseFloat(match[0].replace(',', '.')) : null;
};

// How far each spec goes across the whole fleet, so a bar means something. A label only one unit
// has gets no bar: there is nothing to compare it against.
const CEILINGS = RENTABLE.reduce((acc, robot) => {
  for (const spec of robot.specs) {
    const value = numberOf(spec.value);
    if (value === null) continue;
    const entry = acc[spec.label] ?? { max: 0, count: 0 };
    acc[spec.label] = { max: Math.max(entry.max, value), count: entry.count + 1 };
  }
  return acc;
}, {});

const barWidth = (spec) => {
  const ceiling = CEILINGS[spec.label];
  const value = numberOf(spec.value);
  if (!ceiling || ceiling.count < 2 || value === null) return null;
  return Math.max(12, Math.round((value / ceiling.max) * 100));
};

export default function FleetSection() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const stageRef = useRef(null);
  const figureRef = useRef(null);
  const panelRef = useRef(null);
  const rosterRef = useRef([]);
  const [selected, setSelected] = useState(2); // X2 Ultra, the unit the hero already shows
  const previous = useRef(2);
  const touchX = useRef(null);
  useScrollMotion(ref);

  const robot = RENTABLE[selected];
  const localizedRobot = t.fleet?.robots?.[robot.id] || robot;
  const askMsg = (unit) => (t.fleet?.askRobot ? t.fleet.askRobot(unit.name) : defaultAskMessage(unit));

  // The unit walks on from the side it came from; its specs fill as it lands.
  useLayoutEffect(() => {
    const direction = selected >= previous.current ? 1 : -1;
    previous.current = selected;
    const bars = panelRef.current.querySelectorAll('.cs-bar span');
    const counters = [...panelRef.current.querySelectorAll('[data-value]')].map(countUp).filter(Boolean);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => counters.forEach((tween) => tween.kill());
    }
    const name = SplitText.create(stageRef.current.querySelector('.cs-name'), { type: 'chars' });
    const timeline = gsap.timeline();
    // fromTo (not from): StrictMode's cleanup kills the first run mid-flight and from()
    // would re-capture the half-animated inline styles as its end values.
    timeline
      .fromTo(figureRef.current,
        { xPercent: 14 * direction, scale: 0.94, opacity: 0 },
        { xPercent: 0, scale: 1, opacity: 1, duration: 0.85, ease: 'expo.out', immediateRender: true })
      .from(name.chars, { yPercent: 60, opacity: 0, duration: 0.6, stagger: 0.035 * direction, ease: 'expo.out' }, 0.05)
      .fromTo(figureRef.current.querySelector('.cs-scan i'), { yPercent: 0 }, { yPercent: 520, duration: 1.1, ease: 'power2.inOut' }, 0.2)
      .fromTo(panelRef.current.querySelectorAll('.cs-role, .cs-title, .cs-summary, .cs-ctas'),
        { y: 22, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out', immediateRender: true }, 0.1)
      .fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.07, ease: 'power3.out' }, 0.15);
    return () => {
      timeline.kill();
      name.revert();
      counters.forEach((tween) => tween.kill());
    };
  }, [selected]);

  // The roster lights up once, when the stage first scrolls into view.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const tween = gsap.from(rosterRef.current, {
      y: 24, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: stageRef.current, start: 'top 80%', once: true }
    });
    return () => tween.scrollTrigger?.kill();
  }, []);

  // On phones the roster is a scroller: keep the chosen slot centred (scrollIntoView would move the page).
  useEffect(() => {
    const slot = rosterRef.current[selected];
    const list = slot?.closest('ul');
    if (!list || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: slot.parentElement.offsetLeft - (list.clientWidth - slot.clientWidth) / 2, behavior: 'smooth' });
  }, [selected]);

  const pick = (index) => {
    const next = (index + RENTABLE.length) % RENTABLE.length;
    if (next === selected) return;
    setSelected(next);
  };

  const onKeyDown = (event) => {
    const delta = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!delta) return;
    event.preventDefault();
    const next = (selected + delta + RENTABLE.length) % RENTABLE.length;
    pick(next);
    rosterRef.current[next]?.focus();
  };

  const onTouchStart = (event) => { touchX.current = event.changedTouches[0].clientX; };
  const onTouchEnd = (event) => {
    if (touchX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) > 48) pick(selected + (delta < 0 ? 1 : -1));
  };

  return (
    <section id="armada" ref={ref} className="cs" data-bg="#f0f1fa" aria-labelledby="fleet-title">
      <div className="container cs-head">
        <h2 id="fleet-title" className="display" data-split>{t.fleet.title}</h2>
        <p data-reveal>{t.fleet.sub}</p>
      </div>

      <div
        ref={stageRef}
        className="cs-stage"
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="cs-glow" aria-hidden="true" />
        <div className="cs-floor" aria-hidden="true" />
        <div className="cs-name" aria-hidden="true" key={`name-${robot.id}`}>{shortName(robot.name).toUpperCase()}</div>

        <button type="button" className="cs-arrow is-prev" onClick={() => pick(selected - 1)} aria-label={t.fleet.prevUnit}>
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div ref={figureRef} className="cs-figure" key={robot.id}>
          <img src={robotCutout(robot)} alt={robot.name} width="1100" height="1100" decoding="async" />
          <span
            className="cs-scan"
            aria-hidden="true"
            style={{ WebkitMaskImage: `url(${robotCutout(robot)})`, maskImage: `url(${robotCutout(robot)})` }}
          >
            <i />
          </span>
        </div>

        <button type="button" className="cs-arrow is-next" onClick={() => pick(selected + 1)} aria-label={t.fleet.nextUnit}>
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div ref={panelRef} className="container cs-panel">
        <div className="cs-copy">
          <p className="cs-role mono-label">{localizedRobot.tagline || robot.tagline}</p>
          <h3 className="cs-title">{shortName(robot.name)}</h3>
          <p className="cs-summary">{localizedRobot.summary || robot.summary}</p>
          <div className="cs-ctas">
            <Magnetic as="a" href={robotHref(robot)} className="btn-cyber-primary">
              {t.fleet.viewRobot} {shortName(robot.name)}
              <ChevronRight size={18} aria-hidden="true" />
            </Magnetic>
            <Magnetic as="a" href={waLink(askMsg(robot))} target="_blank" rel="noopener noreferrer" className="btn-cyber-outline">
              <MessageCircle size={18} aria-hidden="true" />
              {t.nav.cta}
            </Magnetic>
          </div>
        </div>

        <dl className="cs-stats">
          {(localizedRobot.specs || robot.specs).slice(0, 5).map((spec, i) => {
            const baseSpec = robot.specs[i] || spec;
            const width = barWidth(baseSpec);
            return (
              <div key={spec.label}>
                <dt className="mono-label">{spec.label}</dt>
                <dd data-value={spec.value}>{spec.value}</dd>
                <div className="cs-bar" aria-hidden="true">
                  {width !== null && <span style={{ width: `${width}%` }} />}
                </div>
              </div>
            );
          })}
        </dl>
      </div>

      <div className="container cs-roster-wrap">
        <ul className="cs-roster">
          {RENTABLE.map((unit, index) => (
            <li key={unit.id}>
              <button
                ref={(el) => { rosterRef.current[index] = el; }}
                type="button"
                className={`cs-slot${index === selected ? ' is-on' : ''}`}
                aria-pressed={index === selected}
                onClick={() => pick(index)}
                onKeyDown={onKeyDown}
              >
                <img src={robotCutout(unit)} alt={unit.name} width="1100" height="1100" loading="lazy" decoding="async" />
                <span className="cs-slot-name mono-label">{shortName(unit.name)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="container cs-more">
        <h3 data-reveal>{t.fleet.moreTitle || 'Unit AgiBot lain, tanya ketersediaannya'}</h3>
        <ul data-stagger>
          {ASK.map((unit) => (
            <li key={unit.id}>
              <a href={waLink(askMsg(unit))} target="_blank" rel="noopener noreferrer">
                <img src={robotCutout(unit)} alt="" width="1100" height="1100" loading="lazy" decoding="async" />
                <span className="cs-more-name">{shortName(unit.name)}</span>
                <span className="cs-more-line">{unit.tagline}</span>
                <ChevronRight size={18} aria-hidden="true" className="cs-more-arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .cs {
          position: relative;
          z-index: 10;
          padding: clamp(5rem, 9vw, 8rem) 0 6rem;
          overflow: hidden;
        }
        .cs-head h2 {
          max-width: 18ch;
          font-size: clamp(3.5rem, 8vw, 9rem);
          color: var(--text-heading);
        }
        .cs-head p {
          max-width: 46ch;
          margin-top: 1.5rem;
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-body);
        }

        /* The stage */
        .cs-stage {
          position: relative;
          height: clamp(420px, 52vw, 620px);
          margin-top: clamp(2rem, 5vw, 3.5rem);
          touch-action: pan-y;
        }
        .cs-glow {
          position: absolute;
          left: 50%;
          top: 46%;
          width: min(760px, 96vw);
          aspect-ratio: 1;
          translate: -50% -50%;
          background: var(--bg-surface);
          border-radius: 50%;
          pointer-events: none;
        }
        .cs-name {
          position: absolute;
          left: 50%;
          top: 42%;
          translate: -50% -50%;
          font: 900 clamp(3rem, 12.5vw, 13rem) / 0.8 var(--font-display);
          letter-spacing: -0.055em;
          color: transparent;
          -webkit-text-stroke: 1px var(--border-subtle);
          white-space: nowrap;
          pointer-events: none;
        }
        .cs-figure {
          position: absolute;
          left: 50%;
          top: 2%;
          height: 84%;
          translate: -50% 0;
        }
        /* A band of light that only exists on the unit itself: the cut-out is its own mask. */
        .cs-scan {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          -webkit-mask-size: contain;
          mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-position: center;
        }
        .cs-scan i {
          position: absolute;
          left: 0;
          right: 0;
          /* Parked above the unit by position, not transform, so GSAP's yPercent is the only offset. */
          top: -24%;
          height: 24%;
          background: linear-gradient(180deg, transparent, var(--color-blue) 50%, transparent);
          opacity: 0.4;
        }
        .cs-figure img {
          display: block;
          height: 100%;
          width: auto;
        }
        /* A pool of light under the unit, so it stands on the stage instead of floating above it. */
        .cs-floor {
          position: absolute;
          left: 50%;
          bottom: 10%;
          width: min(560px, 62vw);
          aspect-ratio: 4.2;
          translate: -50% 0;
          border-radius: 50%;
          background: radial-gradient(50% 50% at 50% 50%, var(--border-subtle), transparent 70%);
          pointer-events: none;
        }
        .cs-arrow {
          position: absolute;
          top: 44%;
          z-index: 2;
          display: grid;
          place-items: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: var(--hairline);
          background: var(--bg-surface);
          color: var(--text-heading);
          cursor: pointer;
          transition: border-color 0.25s ease, background-color 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }
        .cs-arrow:hover {
          border-color: var(--color-blue);
          background: var(--bg-surface);
          color: var(--color-blue);
        }
        .cs-arrow:active { transform: scale(0.94); }
        .cs-arrow.is-prev { left: max(1.5rem, calc(50% - 560px)); }
        .cs-arrow.is-next { right: max(1.5rem, calc(50% - 560px)); }

        /* The chosen unit, in words and bars */
        .cs-panel {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
          gap: clamp(2rem, 5vw, 5rem);
          align-items: start;
          margin-top: clamp(2rem, 4vw, 3.5rem);
        }
        .cs-role {
          color: var(--color-blue);
        }
        .cs-title {
          margin-top: 0.6rem;
          font-size: clamp(1.6rem, 2.6vw, 2.2rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-heading);
        }
        .cs-summary {
          max-width: 42ch;
          margin-top: 0.9rem;
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-body);
        }
        .cs-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.75rem;
        }
        .cs-stats {
          display: grid;
          gap: 1.1rem;
          background: var(--bg-surface);
          border: var(--hairline);
          border-radius: var(--radius);
          padding: clamp(1.4rem, 2.6vw, 2.2rem);
        }
        .cs-stats > div {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.35rem 1rem;
        }
        .cs-stats dt {
          color: var(--text-muted);
        }
        .cs-stats dd {
          font-family: var(--font-mono);
          font-size: 1.05rem;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          color: var(--text-heading);
        }
        .cs-bar {
          grid-column: 1 / -1;
          height: 3px;
          border-radius: 3px;
          overflow: hidden;
          background: var(--accent-subtle);
        }
        .cs-bar span {
          display: block;
          height: 100%;
          border-radius: 3px;
          background: var(--color-blue);
          transform-origin: left center;
        }

        /* The roster */
        .cs-roster-wrap { margin-top: clamp(2.5rem, 5vw, 4rem); }
        .cs-roster {
          position: relative;
          list-style: none;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 0.75rem;
        }
        .cs-slot {
          position: relative;
          display: block;
          width: 100%;
          padding: 1.5rem 1rem 3.2rem;
          border: var(--hairline);
          border-radius: var(--radius);
          background: var(--bg-surface);
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
        }
        .cs-slot img {
          width: 100%;
          height: clamp(90px, 9vw, 130px);
          object-fit: contain;
          filter: saturate(0.55);
          transition: filter 0.3s ease, scale 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cs-slot:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card);
        }
        .cs-slot:hover img { filter: saturate(0.9); }
        .cs-slot.is-on {
          border-color: var(--color-blue);
          box-shadow: var(--shadow-card);
        }
        .cs-slot.is-on::after {
          content: '';
          position: absolute;
          top: 12px;
          right: 12px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--color-acid);
          border: var(--hairline);
        }
        .cs-slot.is-on img {
          filter: none;
          scale: 1.06;
        }
        .cs-slot-name {
          position: absolute;
          left: 1rem;
          bottom: 1rem;
          color: var(--text-muted);
        }
        .cs-slot.is-on .cs-slot-name { color: var(--text-heading); }

        /* The rest of the line-up */
        .cs-more { margin-top: clamp(4rem, 7vw, 6rem); }
        .cs-more h3 {
          font-size: clamp(1.1rem, 1.6vw, 1.4rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-heading);
        }
        .cs-more ul {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: clamp(2rem, 5vw, 5rem);
          margin-top: 1.25rem;
          border-top: var(--hairline);
        }
        .cs-more a {
          display: grid;
          grid-template-columns: 64px minmax(0, 1fr) auto;
          grid-template-rows: auto auto;
          column-gap: 1.1rem;
          align-items: center;
          padding: 1rem 0.25rem;
          border-bottom: var(--hairline);
          text-decoration: none;
        }
        .cs-more img {
          grid-row: 1 / 3;
          width: 64px;
          height: 64px;
          object-fit: contain;
          filter: saturate(0.7);
          transition: filter 0.3s ease, scale 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cs-more-name {
          align-self: end;
          font-weight: 600;
          color: var(--text-heading);
        }
        .cs-more-line {
          align-self: start;
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .cs-more-arrow {
          grid-column: 3;
          grid-row: 1 / 3;
          color: var(--text-muted);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease;
        }
        .cs-more a:hover img {
          filter: none;
          scale: 1.08;
        }
        .cs-more a:hover .cs-more-name { color: var(--color-blue); }
        .cs-more a:hover .cs-more-arrow {
          color: var(--color-blue);
          transform: translateX(4px);
        }

        @media (max-width: 899px) {
          .cs-panel { grid-template-columns: 1fr; }
          .cs-more ul { grid-template-columns: 1fr; }
          .cs-roster {
            grid-template-columns: repeat(5, 46%);
            gap: 0.6rem;
            padding-bottom: 0.5rem;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
          }
          .cs-roster::-webkit-scrollbar { display: none; }
          .cs-slot {
            padding-bottom: 2.8rem;
            scroll-snap-align: center;
          }
          .cs-arrow {
            width: 44px;
            height: 44px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cs-slot, .cs-slot img { transition: none; }
        }
      `}</style>
    </section>
  );
}
