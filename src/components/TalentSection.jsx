import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle, RotateCcw } from 'lucide-react';
import { ROBOTS, robotCutout, shortName } from '../data/robots';
import { CUTOUT_SIZE, TALENT } from '../data/talent';
import { waLink } from '../config/site';
import { useMediaQuery } from '../utils/frames';
import { useLanguage } from '../context/LanguageContext';
import ModelName from './ModelName';

gsap.registerPlugin(ScrollTrigger);

// Talent roster. Each robot gets its own seamless-paper studio in an RFI logo colour; scrolling
// pulls the next sheet down over the last, with a roller riding the edge. Humanoids stand at true
// relative height (X2 131 cm, A2 169 cm). Comp cards tilt with the pointer, catch a foil sheen on
// the RFI mark, and flip over for the details and the booking link.

const SIZE = CUTOUT_SIZE;

const STYLES = `
.talent { position: relative; height: 100svh; overflow: hidden; --stage: 70svh; }
.talent-sheet {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--bg);
  color: var(--rfi-paper);
}
.talent-sheet + .talent-sheet { clip-path: inset(0 0 100% 0); }
.talent-sheet.is-light { color: var(--rfi-navy); }
/* Seamless paper: light falling from the key, the sweep darkening into the floor. */
.talent-paper {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, color-mix(in oklab, var(--bg) 84%, black) 0%, transparent 34%),
    radial-gradient(110% 80% at 52% 34%, color-mix(in oklab, var(--bg) 84%, white) 0%, var(--bg) 52%, color-mix(in oklab, var(--bg) 78%, black) 100%);
}
.talent-robot {
  position: absolute;
  left: 50%;
  bottom: 8svh;
  height: calc(var(--stage) * var(--h) * ${SIZE} / var(--px));
  width: auto;
  translate: -50% var(--drop);
  user-select: none;
}
.talent-info { position: absolute; left: var(--pad-x); top: 24svh; max-width: 34vw; }
.talent-name {
  margin: 0 0 0.3em;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(56px, 7.4vw, 136px);
  line-height: 0.92;
  letter-spacing: -0.02em;
  color: inherit;
}
.talent-role { margin: 0; max-width: 24ch; font-size: clamp(16px, 1.25vw, 21px); line-height: 1.45; opacity: 0.86; }

.talent-head {
  position: absolute;
  z-index: 20;
  top: calc(76px + 2svh);
  left: var(--pad-x);
  right: var(--pad-x);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
  color: var(--rfi-paper);
  pointer-events: none;
  transition: color 0.5s ease;
}
.talent-head.is-light { color: var(--rfi-navy); }
.talent-head h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 400;
  font-size: clamp(20px, 1.6vw, 26px);
  letter-spacing: 0;
  color: inherit;
}
.talent-index { display: flex; gap: clamp(14px, 1.6vw, 26px); margin: 0; padding: 0; list-style: none; pointer-events: auto; }
.talent-index button {
  padding: 6px 0;
  border: 0;
  border-bottom: 1px solid transparent;
  background: none;
  color: inherit;
  font: 500 13px/1 var(--font-display);
  opacity: 0.6;
  cursor: pointer;
  transition: opacity 0.3s, border-color 0.3s;
}
.talent-index button:hover { opacity: 1; }
.talent-index button[aria-current='true'] { opacity: 1; border-bottom-color: currentColor; }

/* The roller on the edge of the incoming sheet. */
.talent-roll {
  position: absolute;
  z-index: 15;
  left: 0;
  right: 0;
  top: 0;
  height: 5svh;
  translate: 0 -50%;
  visibility: hidden;
  background: linear-gradient(to bottom,
    color-mix(in oklab, var(--roll) 62%, black) 0%,
    color-mix(in oklab, var(--roll) 72%, white) 30%,
    var(--roll) 52%,
    color-mix(in oklab, var(--roll) 55%, black) 100%);
  box-shadow: 0 1.6svh 3svh rgba(4, 10, 30, 0.38);
  pointer-events: none;
}

.comp {
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 30%;
  position: absolute;
  z-index: 3;
  right: var(--pad-x);
  bottom: 8svh;
  width: clamp(260px, 20vw, 310px);
  height: min(410px, 54svh);
  perspective: 1100px;
}
.comp-tilt { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transform: rotateX(var(--rx)) rotateY(var(--ry)); transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.comp-card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1); }
.comp.is-flipped .comp-card { transform: rotateY(180deg); }
.comp-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 22px 22px 18px;
  overflow: hidden;
  border-radius: 14px;
  background: #f7f5f0;
  color: var(--rfi-navy);
  backface-visibility: hidden;
  box-shadow: 0 34px 60px -24px rgba(4, 10, 30, 0.6), 0 2px 6px rgba(4, 10, 30, 0.18);
}
.comp-back { transform: rotateY(180deg); }
.comp-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.comp-photo { flex: 1; min-height: 0; margin: 0 -22px 16px; background-repeat: no-repeat; }
.comp-agency { font-family: var(--font-serif); font-style: italic; font-size: 15px; }
/* Foil stamp: the RFI mark cut from an iridescent silver-blue that slides with the tilt. */
.comp-foil {
  width: 58px;
  aspect-ratio: 492 / 170;
  -webkit-mask: url('/assets/logo/rfi-mark-color.png') center / contain no-repeat;
  mask: url('/assets/logo/rfi-mark-color.png') center / contain no-repeat;
  background: linear-gradient(110deg, #8d95a8 0%, #eef1f7 calc(var(--mx) - 18%), #4f97d2 var(--mx), #2f5fd8 calc(var(--mx) + 16%), #b8b1ab 100%);
}
.comp-name { margin: 0 0 14px; font-family: var(--font-serif); font-size: clamp(30px, 2.4vw, 40px); line-height: 1; letter-spacing: -0.015em; }
.comp-stats { margin: 0 0 14px; }
.comp-stats div { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid rgba(11, 21, 51, 0.14); font-size: 14px; }
.comp-stats dt { color: rgba(11, 21, 51, 0.62); }
.comp-stats dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }
.comp-flip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 6px 0;
  border: 0;
  background: none;
  color: var(--rfi-navy);
  font: 600 13px/1 var(--font-display);
  cursor: pointer;
}
.comp-flip:hover { color: var(--rfi-blue); }
.comp-summary { margin: 0 0 14px; font-size: 14px; line-height: 1.55; }
.comp-book { align-self: stretch; margin-top: auto; margin-bottom: 10px; padding: 0.8rem 1.2rem; font-size: 0.9rem; }
/* Glare from the pointer, like light catching a printed card. */
.comp-sheen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(70% 55% at var(--mx) var(--my), rgba(255, 255, 255, 0.55), transparent 60%);
  mix-blend-mode: soft-light;
}

.talent.is-static { height: auto; }
.talent.is-static .talent-sheet { position: relative; height: 100svh; clip-path: none; }
.talent.is-static .talent-roll { display: none; }

/* Phones and tablets, top to bottom: header, name, robot, card. The robot gets what is left. */
@media (max-width: 1023px) {
  .talent { --card-h: min(224px, 28svh); --stage: calc(100svh - 290px - var(--card-h)); }
  .talent-robot { bottom: calc(28px + var(--card-h)); }
  .talent-info { top: 150px; right: 20px; left: 20px; max-width: none; }
  .talent-name { font-size: clamp(40px, 11vw, 64px); margin-bottom: 0.2em; }
  .talent-role { font-size: 15px; }
  .talent-head { top: 84px; left: 20px; right: 20px; flex-direction: column; gap: 8px; }
  .talent-index { gap: 14px; flex-wrap: wrap; }
  .talent-index button { font-size: 12px; }
  .comp { left: 20px; right: 20px; bottom: 16px; width: auto; height: var(--card-h); perspective: 1600px; }
  .comp-face { padding: 16px 18px 12px; }
  .comp-top { margin-bottom: 8px; }
  .comp-photo { display: none; }
  .comp-name { font-size: 26px; margin-bottom: 8px; }
  .comp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: auto; }
  .comp-stats div { flex-direction: column; gap: 4px; padding: 8px 0 0; font-size: 12px; }
  .comp-stats dd { text-align: left; font-size: 14px; }
  .comp-back .comp-stats { display: none; }
  .comp-summary { font-size: 13px; margin-bottom: 8px; }
  .comp-book { margin-bottom: 4px; }
}
`;

function CompCard({ robot, item, info, fine, t }) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef(null);
  const frontButton = useRef(null);
  const backButton = useRef(null);
  const moved = useRef(false);
  const name = shortName(robot.name);
  const specs = info.specs;

  // Keyboard focus follows the card to the face that just turned up.
  useEffect(() => {
    if (!moved.current) return;
    (flipped ? backButton : frontButton).current?.focus({ preventScroll: true });
  }, [flipped]);

  const flip = (value) => {
    moved.current = true;
    setFlipped(value);
  };
  const tilt = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const s = ref.current.style;
    s.setProperty('--rx', `${(0.5 - y) * 14}deg`);
    s.setProperty('--ry', `${(x - 0.5) * 18}deg`);
    s.setProperty('--mx', `${x * 100}%`);
    s.setProperty('--my', `${y * 100}%`);
  };
  const rest = () => {
    ref.current.style.setProperty('--rx', '0deg');
    ref.current.style.setProperty('--ry', '0deg');
  };

  return (
    <div ref={ref} className={`comp${flipped ? ' is-flipped' : ''}`} onPointerMove={fine ? tilt : undefined} onPointerLeave={fine ? rest : undefined}>
      <div className="comp-tilt">
        <div className="comp-card">
          <div className="comp-face comp-front" inert={flipped}>
            <div className="comp-top">
              <span className="comp-agency">Robotshow</span>
              <span className="comp-foil" role="img" aria-label="RFI" />
            </div>
            <div
              className="comp-photo"
              style={{ backgroundColor: item.bg, backgroundImage: `url(${robotCutout(robot)})`, backgroundSize: item.photo[0], backgroundPosition: item.photo[1] }}
              aria-hidden="true"
            />
            <p className="comp-name">
              <ModelName text={name} />
            </p>
            <dl className="comp-stats">
              {specs.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            <button ref={frontButton} type="button" className="comp-flip" onClick={() => flip(true)}>
              {t.talent.detail}
              <RotateCcw size={14} aria-hidden="true" />
            </button>
            <span className="comp-sheen" aria-hidden="true" />
          </div>
          <div className="comp-face comp-back" inert={!flipped}>
            <p className="comp-summary">{info.summary}</p>
            {specs.length > 3 && (
              <dl className="comp-stats">
                {specs.slice(3).map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <a className="btn-cyber-primary comp-book" href={waLink(t.fleet.askRobot(robot.name))} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} aria-hidden="true" />
              <span>{t.talent.book(name)}</span>
            </a>
            <button ref={backButton} type="button" className="comp-flip" onClick={() => flip(false)}>
              <RotateCcw size={14} aria-hidden="true" />
              {t.talent.back}
            </button>
            <span className="comp-sheen" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TalentSection() {
  const { t } = useLanguage();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const fine = useMediaQuery('(hover: hover) and (pointer: fine)');
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const scroller = useRef(null);

  useLayoutEffect(() => {
    if (reducedMotion) return undefined;
    const section = sectionRef.current;
    const ctx = gsap.context(() => {
      const sheets = gsap.utils.toArray('.talent-sheet', section);
      const roll = section.querySelector('.talent-roll');
      const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
      sheets.slice(1).forEach((sheet, k) => {
        const i = k + 1;
        tl.set(roll, { '--roll': TALENT[i].bg, autoAlpha: 1 })
          .fromTo(sheet, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, '<')
          .fromTo(roll, { top: '0%' }, { top: '100%', duration: 1 }, '<')
          .fromTo(sheet.querySelector('.talent-robot'), { y: () => window.innerHeight * 0.05, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }, '<0.4')
          .set(roll, { autoAlpha: 0 }, '>0.15')
          .addLabel(`t${i}`)
          .to({}, { duration: 0.6 });
      });
      const st = ScrollTrigger.create({
        animation: tl,
        trigger: section,
        start: 'top top',
        end: () => `+=${(sheets.length - 1) * window.innerHeight * 1.25}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const time = self.progress * tl.duration();
          // A sheet counts as current once it covers half the screen.
          setActive(TALENT.reduce((current, _, i) => (i && time >= tl.labels[`t${i}`] - 0.75 ? i : current), 0));
        }
      });
      scroller.current = (i) => {
        const time = i ? tl.labels[`t${i}`] : 0;
        const y = st.start + (time / tl.duration()) * (st.end - st.start);
        if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 });
        else window.scrollTo({ top: y, behavior: 'smooth' });
      };
    }, section);
    return () => {
      ctx.revert();
      scroller.current = null;
    };
  }, [reducedMotion]);

  const go = (i) => {
    if (scroller.current) scroller.current(i);
    else sectionRef.current.querySelectorAll('.talent-sheet')[i].scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="armada" ref={sectionRef} className={`talent${reducedMotion ? ' is-static' : ''}`} aria-labelledby="talent-title" data-bg="#2F5FD8">
      {/* First in the DOM so the h2 precedes the sheets' h3s; it is positioned over them. */}
      <header className={`talent-head${TALENT[active].dark ? '' : ' is-light'}`}>
        <h2 id="talent-title">{t.talent.title}</h2>
        <ul className="talent-index">
          {TALENT.map((item, i) => (
            <li key={item.id}>
              <button type="button" aria-current={i === active} onClick={() => go(i)}>
                {shortName(ROBOTS.find((r) => r.id === item.id).name)}
              </button>
            </li>
          ))}
        </ul>
      </header>
      {TALENT.map((item, i) => {
        const robot = ROBOTS.find((r) => r.id === item.id);
        const info = t.fleet.robots[item.id];
        return (
          <article
            key={item.id}
            className={`talent-sheet${item.dark ? '' : ' is-light'}`}
            style={{ '--bg': item.bg, '--h': item.h, '--px': item.bottom - item.top, '--drop': `${((SIZE - item.bottom) / SIZE) * 100}%`, zIndex: i }}
            aria-labelledby={`talent-${item.id}`}
            inert={!reducedMotion && i !== active}
          >
            <div className="talent-paper" aria-hidden="true" />
            <img className="talent-robot" src={robotCutout(robot)} alt={robot.name} width={SIZE} height={SIZE} decoding="async" />
            <div className="talent-info">
              <h3 id={`talent-${item.id}`} className="talent-name">
                <ModelName text={shortName(robot.name)} />
              </h3>
              <p className="talent-role">{info.tagline}</p>
            </div>
            <CompCard robot={robot} item={item} info={info} fine={fine} t={t} />
          </article>
        );
      })}
      <div className="talent-roll" aria-hidden="true" />
      <style>{STYLES}</style>
    </section>
  );
}
