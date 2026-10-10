import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Camera, MessageCircle } from 'lucide-react';
import { waLink } from '../config/site';
import { useMediaQuery } from '../utils/frames';
import { addShot } from '../utils/shots';
import { useLanguage } from '../context/LanguageContext';
import studio from '../data/studio.json';
import Magnetic from './Magnetic';

gsap.registerPlugin(Draggable, InertiaPlugin);

// Photo-shoot hero. Every frame is a Cycles render of the official X2 Ultra CAD
// (scripts/render-studio.py): per pose a full frame plus a cutout with the same pixels, so the
// masthead sits between backdrop and robot. A click fires the studio flash, the robot changes pose
// under the white, and the shot drops onto a pile of prints you can throw around. Left alone, the
// photographer shoots one round of poses by itself. The idle pose leaves its head out; a grid of
// head renders follows the cursor instead.

const SRC = '/assets/studio';
const [W, H] = studio.size;
const HEAD = studio.head;
const HEAD_REST = [8, 1]; // faces the lens (HEAD_YAW in render-studio.py)
const SHOTS = [...studio.poses.slice(1), 'idle'];
const FLASH_GAP = 600; // ms: at most two flashes a second, under the WCAG 2.3.1 limit of three
// The photographer working alone: waits this long after the visitor last moved, holds a pose, rests.
const AUTO_QUIET = 2500;
const AUTO_HOLD = 2200;
const AUTO_REST = 4500;
const nextShot = (counter) => SHOTS[counter.current++ % SHOTS.length];
// Any shot but idle (it appears once in SHOTS).
const nextPose = (counter) => {
  const next = nextShot(counter);
  return next === 'idle' ? nextShot(counter) : next;
};

const cache = new Map();
const preload = (src) => {
  if (!cache.has(src)) {
    const img = new Image();
    img.src = src;
    cache.set(src, img.decode().catch(() => {}));
  }
  return cache.get(src);
};
const poseFiles = (id) => [`${SRC}/${id}.webp`, `${SRC}/${id}-cut.webp`];
const headFile = (i, j) => `${SRC}/head/${i}-${j}.webp`;
const pct = (v, total) => `${(v / total) * 100}%`;

const STYLES = `
.studio {
  --fw: max(100cqw, 100cqh * 16 / 9);
  --fh: calc(var(--fw) * 9 / 16);
  /* Cover the viewport like object-fit, keeping the robot (60% across the frame) in view. */
  --fx: clamp(100cqw - var(--fw), 50cqw - var(--fw) * 0.6, 0px);
  --fy: clamp(100cqh - var(--fh), (100cqh - var(--fh)) * 0.6, 0px);
  position: relative;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  isolation: isolate;
  container-type: size;
  background: #13308f;
  color: var(--rfi-paper);
  cursor: pointer;
}
.studio :focus-visible { outline-color: var(--rfi-paper); }
.studio-frame {
  position: absolute;
  left: var(--fx);
  top: var(--fy);
  width: var(--fw);
  height: var(--fh);
  pointer-events: none;
}
.studio-frame img { position: absolute; display: block; user-select: none; -webkit-user-drag: none; }
.studio-layer { inset: 0; width: 100%; height: 100%; }
.studio-back { z-index: 0; }
.studio-front { z-index: 2; }

.studio-mast {
  position: absolute;
  z-index: 1;
  left: 0;
  right: 0;
  top: calc(var(--fy) + var(--fh) * 0.205);
  margin: 0;
  text-align: center;
  font-family: var(--font-serif);
  font-weight: 500;
  font-size: 14.6cqw;
  line-height: 0.8;
  letter-spacing: -0.012em;
  white-space: nowrap;
  color: var(--rfi-paper);
  pointer-events: none;
  user-select: none;
  transition: opacity 1.1s ease, translate 1.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.studio-copy {
  position: absolute;
  z-index: 3;
  left: var(--pad-x);
  bottom: clamp(28px, 7cqh, 80px);
  max-width: min(32rem, 40cqw);
  cursor: auto;
}
.studio-title {
  margin: 0 0 0.4em;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(32px, 3.5cqw, 60px);
  line-height: 1.02;
  color: var(--rfi-paper);
  letter-spacing: -0.015em;
  text-wrap: balance;
}
.studio-sub {
  margin: 0 0 1.5em;
  max-width: 36ch;
  font-size: clamp(15px, 1.05cqw, 18px);
  line-height: 1.55;
  color: rgba(242, 240, 236, 0.84);
}
.studio-ctas { display: flex; flex-wrap: wrap; gap: 12px; }
.studio-copy > * { transition: opacity 0.9s ease, translate 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
.studio-copy > :nth-child(2) { transition-delay: 0.1s; }
.studio-copy > :nth-child(3) { transition-delay: 0.2s; }

.studio-hint {
  position: absolute;
  z-index: 3;
  right: clamp(16px, 3cqw, 56px);
  bottom: clamp(20px, 4cqh, 48px);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(242, 240, 236, 0.42);
  border-radius: 999px;
  background: rgba(11, 21, 51, 0.28);
  backdrop-filter: blur(8px);
  color: var(--rfi-paper);
  font: 500 13px/1 var(--font-display);
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: opacity 0.9s ease 0.5s, translate 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, background-color 0.2s;
}
.studio-hint:hover { background: rgba(11, 21, 51, 0.5); }

.studio-prints {
  position: absolute;
  z-index: 4;
  right: clamp(16px, 3cqw, 56px);
  bottom: calc(clamp(20px, 4cqh, 48px) + 64px);
  width: clamp(120px, 12cqw, 200px);
  aspect-ratio: 16 / 9;
  margin: 0;
  padding: 0;
  list-style: none;
}
.studio-print {
  position: absolute;
  inset: 0;
  padding: 5px;
  background: #fbfaf7;
  box-shadow: 0 12px 32px rgba(6, 14, 40, 0.38);
  cursor: grab;
  touch-action: none;
}
.studio-print:active { cursor: grabbing; }
.studio-print img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }

.studio-flash { position: absolute; inset: 0; z-index: 10; background: #fff; opacity: 0; pointer-events: none; }
.studio-intro { position: absolute; inset: 0; z-index: 8; background: #000; }
.studio-intro img { opacity: 0; }

.studio.is-intro .studio-mast { opacity: 0; translate: 0 10%; }
.studio.is-intro .studio-copy > *,
.studio.is-intro .studio-hint { opacity: 0; translate: 0 24px; }

@media (max-width: 767px) {
  .studio-shade {
    position: absolute;
    z-index: 2;
    inset: auto 0 0;
    height: 58%;
    background: linear-gradient(to top, rgba(11, 21, 51, 0.9) 30%, transparent);
    pointer-events: none;
  }
  .studio-copy { left: 20px; right: 20px; max-width: none; }
  .studio-hint { top: calc(72px + 2cqh); bottom: auto; right: auto; left: 50%; transform: translateX(-50%); }
  .studio-prints { top: 26cqh; bottom: auto; right: 14px; width: 104px; }
}
@media (prefers-reduced-motion: reduce) {
  .studio-mast, .studio-copy > *, .studio-hint { transition: none; }
}
`;

function Print({ pose, tilt, nudge }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const stage = el.closest('.studio').getBoundingClientRect();
    const box = el.getBoundingClientRect();
    // Ejected from where the robot stands, shrinking onto the pile.
    // fromTo, not from: a re-run effect (React strict mode) must not read a half-played tween as its end state.
    const fly = gsap.fromTo(
      el,
      { x: stage.left + stage.width * 0.6 - (box.left + box.width / 2), y: stage.top + stage.height * 0.45 - (box.top + box.height / 2), scale: 3.2, opacity: 0 },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.95, ease: 'expo.out' }
    );
    const [drag] = Draggable.create(el, { type: 'x,y', inertia: true, bounds: el.closest('.studio'), edgeResistance: 0.8, zIndexBoost: true });
    return () => {
      fly.kill();
      drag.kill();
    };
  }, []);
  return (
    <li ref={ref} className="studio-print" style={{ rotate: `${tilt}deg`, translate: `${nudge[0]}px ${nudge[1]}px` }}>
      <img src={`${SRC}/${pose}.webp`} alt="" width={W} height={H} />
    </li>
  );
}

export default function Hero() {
  const { t } = useLanguage();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const touch = useMediaQuery('(hover: none)');
  const [phase, setPhase] = useState(() => (reducedMotion ? 'live' : 'intro'));
  const [pose, setPose] = useState('idle');
  const [prints, setPrints] = useState([]);
  const flashRef = useRef(null);
  const rimRef = useRef(null);
  const headRef = useRef(null);
  const lastFlash = useRef(-Infinity);
  const busy = useRef(false);
  const shotIndex = useRef(0);
  const poseRef = useRef('idle'); // the pose on screen, for the timers
  const lastUser = useRef(0); // last pointer move or click by the visitor
  const sectionRef = useRef(null);
  const intro = useRef(phase === 'intro');

  // Intro: a dark studio, the rim lights strike, then the flash and the full set.
  useEffect(() => {
    if (!intro.current) return undefined;
    let tl;
    let cancelled = false;
    Promise.all([`${SRC}/intro-rim.webp`, ...poseFiles('idle'), headFile(...HEAD_REST)].map(preload)).then(() => {
      if (cancelled) return;
      tl = gsap
        .timeline({ delay: 0.3 })
        .to(rimRef.current, { opacity: 0.35, duration: 0.25, ease: 'power1.in' })
        .to(rimRef.current, { opacity: 0.08, duration: 0.14 })
        .to(rimRef.current, { opacity: 1, duration: 0.6, ease: 'power2.in' })
        .to(flashRef.current, { opacity: 1, duration: 0.06, ease: 'none' }, '+=0.6')
        .call(() => setPhase('live'))
        .to(flashRef.current, { opacity: 0, duration: 0.8, ease: 'power2.out' }, '+=0.1');
    });
    return () => {
      cancelled = true;
      tl?.kill();
    };
  }, []);

  // Everything else loads once the set is up.
  useEffect(() => {
    if (phase !== 'live') return;
    studio.poses.forEach((id) => poseFiles(id).forEach(preload));
    for (let i = 0; i < HEAD.yaw; i++) for (let j = 0; j < HEAD.pitch; j++) preload(headFile(i, j));
  }, [phase]);

  // Idle head follows the cursor through the render grid (left of the head looks left, and so on).
  useEffect(() => {
    if (phase !== 'live' || pose !== 'idle' || reducedMotion) return undefined;
    const target = { x: HEAD_REST[0], y: HEAD_REST[1] };
    const current = { ...target };
    const onMove = (e) => {
      const head = headRef.current?.getBoundingClientRect();
      if (!head) return;
      const hx = head.left + head.width / 2;
      const hy = head.top + head.height / 2;
      const [rx, ry] = HEAD_REST;
      target.x = e.clientX < hx ? (rx * e.clientX) / hx : rx + ((HEAD.yaw - 1 - rx) * (e.clientX - hx)) / Math.max(1, window.innerWidth - hx);
      target.y = ry + gsap.utils.clamp(-1, 1, (e.clientY - hy) / (window.innerHeight * 0.3));
    };
    const tick = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      const src = headFile(Math.round(current.x), Math.round(current.y));
      const img = headRef.current;
      if (img && img.dataset.src !== src && cache.has(src)) {
        img.src = src;
        img.dataset.src = src;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.ticker.remove(tick);
    };
  }, [phase, pose, reducedMotion]);

  // One strobe and a new pose under the white. `pick` runs only once the flash is allowed, so a
  // refused flash never skips a pose. `soft` is the photographer working alone: a dimmer flash.
  const strobe = useCallback(async (pick, { soft = false, onShow } = {}) => {
    const now = performance.now();
    if (busy.current || now - lastFlash.current < FLASH_GAP) return;
    busy.current = true;
    lastFlash.current = now;
    const next = pick();
    await Promise.all(poseFiles(next).map(preload));
    const show = () => {
      poseRef.current = next;
      setPose(next);
      onShow?.(next, now);
    };
    if (reducedMotion) {
      show();
      busy.current = false;
      return;
    }
    gsap
      .timeline({ onComplete: () => (busy.current = false) })
      .to(flashRef.current, { opacity: soft ? 0.45 : 1, duration: 0.05, ease: 'none' })
      .call(show)
      .to(flashRef.current, { opacity: 0, duration: soft ? 0.4 : 0.55, ease: 'power2.out' }, '+=0.06');
  }, [reducedMotion]);

  const shoot = useCallback(() => {
    if (phase !== 'live') return;
    lastUser.current = performance.now();
    strobe(() => nextShot(shotIndex), {
      onShow: (next, id) => {
        // The idle frame has no head of its own, so it never becomes a print.
        if (next === 'idle') return;
        addShot(next);
        const r = gsap.utils.random;
        setPrints((list) => [...list.slice(-7), { id, pose: next, tilt: r(-10, 10), nudge: [r(-14, 14), r(-10, 10)] }]);
      }
    });
  }, [phase, strobe]);

  // The photographer keeps shooting while nobody else does: a pose every few seconds, then back to
  // idle, where the head follows the cursor again. It waits while the visitor moves or clicks, when
  // the hero is off screen or the tab is hidden, and never runs with reduced motion. No prints:
  // those are the visitor's own shots.
  useEffect(() => {
    if (phase !== 'live' || reducedMotion) return undefined;
    let visible = true;
    let timer;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.4 });
    io.observe(sectionRef.current);
    const onMove = () => (lastUser.current = performance.now());
    window.addEventListener('pointermove', onMove, { passive: true });
    let posed = 0;
    const step = () => {
      if (!visible || document.hidden || performance.now() - lastUser.current < AUTO_QUIET) {
        timer = setTimeout(step, 1000);
        return;
      }
      const idle = poseRef.current === 'idle';
      // One round of every pose, then it rests on idle for good: no strobe while someone reads.
      if (idle && posed >= SHOTS.length - 1) return;
      if (idle) posed++;
      strobe(idle ? () => nextPose(shotIndex) : () => 'idle', { soft: true });
      timer = setTimeout(step, idle ? AUTO_HOLD : AUTO_REST);
    };
    timer = setTimeout(step, AUTO_REST);
    return () => {
      clearTimeout(timer);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, [phase, reducedMotion, strobe]);

  const onStageClick = (e) => {
    if (!e.target.closest('a, button, .studio-print, .studio-copy')) shoot();
  };

  return (
    <section id="top" ref={sectionRef} className={`studio theme-dark is-${phase}`} data-bg="#2F5FD8" aria-labelledby="hero-title" onClick={onStageClick}>
      <div className="studio-frame studio-back">
        <img className="studio-layer" src={`${SRC}/${pose}.webp`} alt={t.hero.alt} width={W} height={H} fetchPriority="high" />
      </div>
      <p className="studio-mast" aria-hidden="true">ROBOTSHOW</p>
      <div className="studio-frame studio-front" aria-hidden="true">
        <img className="studio-layer" src={`${SRC}/${pose}-cut.webp`} alt="" width={W} height={H} />
        {pose === 'idle' && (
          <img
            ref={headRef}
            src={headFile(...HEAD_REST)}
            alt=""
            width={HEAD.rect[2]}
            height={HEAD.rect[3]}
            style={{ left: pct(HEAD.rect[0], W), top: pct(HEAD.rect[1], H), width: pct(HEAD.rect[2], W), height: pct(HEAD.rect[3], H) }}
          />
        )}
      </div>
      <div className="studio-shade" aria-hidden="true" />

      <div className="studio-copy">
        <h1 id="hero-title" className="studio-title">{t.hero.title}</h1>
        <p className="studio-sub">{t.hero.sub}</p>
        <div className="studio-ctas">
          <Magnetic as="a" href={waLink(t.hero.waMessage)} target="_blank" rel="noopener noreferrer" className="btn-cyber-primary" aria-label={`${t.hero.cta}, ${t.hero.viaWa}`}>
            <MessageCircle size={18} aria-hidden="true" />
            <span>{t.hero.cta}</span>
          </Magnetic>
          <Magnetic as="a" href={waLink(t.hero.waPriceMessage)} target="_blank" rel="noopener noreferrer" className="btn-cyber-outline">
            {t.hero.ctaPrice}
          </Magnetic>
        </div>
      </div>

      <button type="button" className="studio-hint" onClick={shoot}>
        <Camera size={15} aria-hidden="true" />
        {touch ? t.hero.hintTouch : t.hero.hint}
      </button>

      <ul className="studio-prints" aria-label={t.hero.shots}>
        {prints.map((p) => (
          <Print key={p.id} pose={p.pose} tilt={p.tilt} nudge={p.nudge} />
        ))}
      </ul>

      {phase === 'intro' && (
        <div className="studio-intro" aria-hidden="true">
          <div className="studio-frame">
            <img ref={rimRef} className="studio-layer" src={`${SRC}/intro-rim.webp`} alt="" width={W} height={H} />
          </div>
        </div>
      )}
      <div className="studio-flash" ref={flashRef} aria-hidden="true" />
      <style>{STYLES}</style>
    </section>
  );
}
