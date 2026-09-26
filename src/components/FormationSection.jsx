import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle } from 'lucide-react';
import { smoothstep, useMediaQuery } from '../utils/frames';
import { WA_CTA_LABEL, waLink } from '../config/site';
import { playCyberClick } from '../utils/cyberAudio';

gsap.registerPlugin(ScrollTrigger);

const IMAGE = '/assets/formasi.webp';
const IMAGE_W = 2752;
const IMAGE_H = 1536;
const SCROLL_VH = 240;

// Positions are fractions of the formation image. Each robot gets its own spotlight window.
const ROBOTS = [
  { name: 'AgiBot A2 Lite', fact: '± 169 cm · 23 DoF', x: 0.29, y: 0.47, rx: 0.14, ry: 0.52, label: [0.07, 0.36], window: [0.1, 0.3] },
  { name: 'AgiBot X2 Ultra', fact: '± 131 cm · 30 DoF', x: 0.5, y: 0.5, rx: 0.13, ry: 0.52, label: [0.585, 0.24], window: [0.3, 0.5] },
  { name: 'AgiBot D1 Pro', fact: '3,5 m/s · bisa salto', x: 0.67, y: 0.75, rx: 0.12, ry: 0.24, label: [0.78, 0.58], window: [0.5, 0.7] }
];
const FINALE = [0.74, 0.88];

const intensity = (robot, p) => smoothstep(robot.window[0], robot.window[1], p);

function Finale({ active }) {
  return (
    <div className={`formation-finale${active ? ' is-active' : ''}`} aria-hidden={!active}>
      <h3 className="formation-finale-title">Satu kru, tiga bintang.</h3>
      <p className="formation-finale-body">Dua humanoid dan satu robodog, dioperasikan satu tim dalam satu kontrak.</p>
      <div className="formation-ctas">
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playCyberClick(850, 0.05)}
          className="btn-cyber-primary formation-btn"
          aria-label={`${WA_CTA_LABEL} lewat WhatsApp`}
          tabIndex={active ? undefined : -1}
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span>{WA_CTA_LABEL}</span>
        </a>
        <a href="#calculator" className="btn-cyber-outline formation-btn" tabIndex={active ? undefined : -1}>
          Hitung Biaya
        </a>
      </div>
    </div>
  );
}

function StaticFormation() {
  return (
    <section id="armada" className="formation-static" aria-labelledby="formation-title">
      <div className="container">
        <h2 id="formation-title" className="formation-title">Armada panggung Anda.</h2>
        <img src={IMAGE} alt="AgiBot A2 Lite, X2 Ultra, dan D1 Pro berdiri berdampingan di panggung" width={IMAGE_W} height={IMAGE_H} loading="lazy" />
        <ul className="formation-static-list">
          {ROBOTS.map((robot) => (
            <li key={robot.name}>
              <h3>{robot.name}</h3>
              <p>{robot.fact}</p>
            </li>
          ))}
        </ul>
        <Finale active />
      </div>
      <style>{FORMATION_CSS}</style>
    </section>
  );
}

export default function FormationSection() {
  const isMobile = useMediaQuery('(max-width: 899px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const sectionRef = useRef(null);
  const photoRef = useRef(null);
  const shadeRef = useRef(null);
  const labelRefs = useRef([]);
  const [lit, setLit] = useState(0);
  const [finale, setFinale] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const photoCanvas = photoRef.current;
    const shadeCanvas = shadeRef.current;
    const photo = photoCanvas.getContext('2d');
    const shade = shadeCanvas.getContext('2d');
    const state = { p: 0 };
    let image = null;
    let rafId = 0;
    let lastLit = 0;
    let lastFinale = false;

    const draw = () => {
      rafId = 0;
      const w = photoCanvas.clientWidth;
      const h = photoCanvas.clientHeight;
      const k = photoCanvas.width / (w || 1);
      const p = state.p;
      const levels = ROBOTS.map((robot) => intensity(robot, p));
      const done = smoothstep(FINALE[0], FINALE[1], p);

      // Cover-fit with a slow pull-back; on mobile the frame pans to whichever robot is being lit.
      const zoom = 1.12 - 0.12 * smoothstep(0, 0.9, p);
      const scale = Math.max(w / IMAGE_W, h / IMAGE_H) * zoom;
      const dw = IMAGE_W * scale;
      const dh = IMAGE_H * scale;
      let focusX = 0.5;
      if (isMobile) {
        focusX = ROBOTS[0].x + (ROBOTS[1].x - ROBOTS[0].x) * levels[1] + (ROBOTS[2].x - ROBOTS[1].x) * levels[2];
        focusX += (0.5 - focusX) * done;
      }
      const ox = Math.min(0, Math.max(w - dw, w / 2 - focusX * dw));
      const oy = (h - dh) / 2;
      const toScreen = ([fx, fy]) => [ox + fx * dw, oy + fy * dh];

      if (image) {
        photo.setTransform(k, 0, 0, k, 0, 0);
        photo.clearRect(0, 0, w, h);
        photo.drawImage(image, ox, oy, dw, dh);
      }

      shade.setTransform(k, 0, 0, k, 0, 0);
      shade.clearRect(0, 0, w, h);
      shade.globalCompositeOperation = 'source-over';
      shade.fillStyle = `rgba(3, 6, 17, ${0.94 - 0.5 * done})`;
      shade.fillRect(0, 0, w, h);
      shade.globalCompositeOperation = 'destination-out';
      ROBOTS.forEach((robot, i) => {
        const level = Math.max(levels[i], done);
        if (level <= 0) return;
        const [cx, cy] = toScreen([robot.x, robot.y]);
        shade.save();
        shade.translate(cx, cy);
        shade.scale(robot.rx * dw, robot.ry * dh);
        const light = shade.createRadialGradient(0, 0, 0, 0, 0, 1);
        light.addColorStop(0, `rgba(0, 0, 0, ${level})`);
        light.addColorStop(0.55, `rgba(0, 0, 0, ${0.85 * level})`);
        light.addColorStop(1, 'rgba(0, 0, 0, 0)');
        shade.fillStyle = light;
        shade.beginPath();
        shade.arc(0, 0, 1, 0, Math.PI * 2);
        shade.fill();
        shade.restore();
      });
      shade.globalCompositeOperation = 'source-over';

      ROBOTS.forEach((robot, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const [lx, ly] = toScreen(robot.label);
        const x = Math.min(Math.max(lx, 24), w - el.offsetWidth - 24);
        el.style.transform = `translate(${x}px, ${ly}px)`;
        el.style.opacity = String(levels[i] * (1 - done * 0.6));
      });

      const litCount = levels.filter((level) => level > 0.5).length;
      if (litCount !== lastLit) {
        lastLit = litCount;
        setLit(litCount);
      }
      const isDone = done > 0.5;
      if (isDone !== lastFinale) {
        lastFinale = isDone;
        setFinale(isDone);
      }
    };
    const requestDraw = () => {
      if (!rafId) rafId = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      [photoCanvas, shadeCanvas].forEach((canvas) => {
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
      });
      requestDraw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(photoCanvas);

    const loadObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || image) return;
      const img = new Image();
      img.src = IMAGE;
      img.decode().then(() => {
        image = img;
        requestDraw();
      }).catch(() => {});
    }, { rootMargin: '100% 0px' });
    loadObserver.observe(section);

    const tween = gsap.to(state, {
      p: 1,
      ease: 'none',
      onUpdate: requestDraw,
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5 }
    });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      loadObserver.disconnect();
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [isMobile, reducedMotion]);

  if (reducedMotion) return <StaticFormation />;

  const current = lit > 0 ? ROBOTS[lit - 1] : null;

  return (
    <section
      id="armada"
      ref={sectionRef}
      className="formation"
      style={{ height: `calc(100svh + ${SCROLL_VH}vh)` }}
      aria-labelledby="formation-title"
    >
      <div className="formation-stage">
        <canvas ref={photoRef} className="formation-canvas" role="img" aria-label="AgiBot A2 Lite, X2 Ultra, dan D1 Pro berdiri berdampingan, disorot lampu satu per satu" />
        <canvas ref={shadeRef} className="formation-canvas" aria-hidden="true" />

        {ROBOTS.map((robot, i) => (
          <div key={robot.name} ref={(el) => { labelRefs.current[i] = el; }} className="formation-label">
            <h3 className="formation-label-name">{robot.name}</h3>
            <p className="formation-label-fact">{robot.fact}</p>
          </div>
        ))}

        <div className="container formation-copy">
          <h2 id="formation-title" className={`formation-title${lit > 0 || finale ? ' is-hidden' : ''}`}>Armada panggung Anda.</h2>
          <p className="formation-mobile-label" aria-live="polite">
            {current && !finale ? (
              <>
                <strong>{current.name}</strong>
                <span>{current.fact}</span>
              </>
            ) : null}
          </p>
          <Finale active={finale} />
        </div>
      </div>
      <style>{FORMATION_CSS}</style>
    </section>
  );
}

const FORMATION_CSS = `
  .formation {
    position: relative;
    z-index: 1;
    background: var(--bg-void);
  }
  .formation-stage {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
  }
  .formation-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
  .formation-label {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    opacity: 0;
    pointer-events: none;
    border-left: 1px solid rgba(214, 229, 247, 0.5);
    padding-left: 0.85rem;
  }
  .formation-label-name {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-pure);
    letter-spacing: -0.01em;
  }
  .formation-label-fact {
    margin-top: 0.2rem;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--text-body);
  }
  .formation-copy {
    position: relative;
    z-index: 3;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-top: 6.5rem;
    padding-bottom: 3rem;
    pointer-events: none;
  }
  .formation-title {
    font-size: clamp(2rem, 3.6vw, 3.1rem);
    letter-spacing: -0.035em;
    line-height: 1.05;
    color: var(--text-pure);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .formation-copy .formation-title {
    position: absolute;
    bottom: 3rem;
  }
  .formation-title.is-hidden {
    opacity: 0;
    transform: translateY(-12px);
  }
  .formation-stage::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(to top, rgba(3, 6, 17, 0.8) 0%, rgba(3, 6, 17, 0) 42%);
  }
  .formation-mobile-label {
    display: none;
  }
  .formation-finale {
    margin-top: auto;
    max-width: 520px;
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .formation-finale.is-active {
    opacity: 1;
    transform: none;
    pointer-events: auto;
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .formation-finale-title {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    letter-spacing: -0.03em;
    line-height: 1.08;
    color: var(--text-pure);
  }
  .formation-finale-body {
    margin-top: 0.75rem;
    color: var(--text-body);
    line-height: 1.6;
    max-width: 44ch;
  }
  .formation-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
    margin-top: 1.5rem;
  }
  .formation-btn {
    min-height: 52px;
    padding: 0.9rem 1.75rem;
    white-space: nowrap;
  }
  @media (max-width: 899px) {
    .formation-label {
      display: none;
    }
    .formation-copy {
      padding-top: 5.5rem;
      padding-bottom: 2rem;
    }
    .formation-copy .formation-title {
      position: static;
    }
    .formation-mobile-label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-top: auto;
      margin-bottom: 1rem;
      min-height: 3.5rem;
      color: var(--text-body);
    }
    .formation-mobile-label strong {
      font-size: 1.3rem;
      color: var(--text-pure);
    }
    .formation-mobile-label span {
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }
    .formation-finale {
      position: absolute;
      left: 1.5rem;
      right: 1.5rem;
      bottom: 2rem;
    }
    .formation-btn {
      flex: 1 1 0;
      padding: 0.85rem 1rem;
    }
  }
  .formation-static {
    position: relative;
    z-index: 1;
    padding: 6rem 0;
    background: var(--bg-void);
  }
  .formation-static img {
    width: 100%;
    height: auto;
    margin: 2rem 0;
    border-radius: var(--radius-lg);
  }
  .formation-static-list {
    list-style: none;
    display: grid;
    gap: 1.25rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-bottom: 3rem;
  }
  .formation-static-list h3 {
    color: var(--text-pure);
    font-size: 1.15rem;
  }
  .formation-static-list p {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: var(--text-body);
  }
`;
