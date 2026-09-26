import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircle } from 'lucide-react';
import frames from '../data/scrollFrames.json';
import { WA_CTA_LABEL, waLink } from '../config/site';
import { playCyberClick } from '../utils/cyberAudio';
import { loadFrames, nearestFrame, smoothstep, useMediaQuery } from '../utils/frames';

gsap.registerPlugin(ScrollTrigger);

// Scroll budget per phase, in viewport heights.
const INTRO = 0.35;
const CLIP_LENGTHS = [0.9, 1.1, 0.9, 0.9];
// Each clip opens on the previous pose, so its caption waits until the new action is underway.
const TEXT_LEAD = [0, 0.1, 0.3, 0.25];
const OUTRO = 0.45;
const DIP_WIDTH = 0.06;
const MOBILE_QUERY = '(max-width: 899px)';

const SEGMENTS = [];
let cursor = INTRO;
frames.clips.forEach((clip, i) => {
  SEGMENTS.push({
    ...clip,
    from: cursor,
    to: cursor + CLIP_LENGTHS[i],
    textFrom: cursor + CLIP_LENGTHS[i] * TEXT_LEAD[i]
  });
  cursor += CLIP_LENGTHS[i];
});
const TOTAL = cursor + OUTRO;
// clip-1 is trimmed before its baked-in dissolve, so clip-2 opens on a cut hidden by a short dip.
const CUT_AT = SEGMENTS[1].from;
const END_PHASE = SEGMENTS.length + 1;

const CHAPTERS = [
  {
    label: 'Bangun',
    title: 'Datang siap tampil.',
    body: 'Kru kami merakit dan mengkalibrasi robot di lokasi, jauh sebelum tamu pertama datang.',
    fact: '2 kru bersertifikat · safety officer di lokasi'
  },
  {
    label: 'Menari',
    title: 'Menari mengikuti musik Anda.',
    body: 'Koreografi diprogram mengikuti jingle atau tema kampanye brand Anda.',
    fact: 'AgiBot X2 Ultra · 30 DoF'
  },
  {
    label: 'Menyapa',
    title: 'Menyapa tamu satu per satu.',
    body: 'Sambutan VIP, gunting pita, dan sesi foto yang membuat pengunjung berhenti di booth Anda.',
    fact: 'LiDAR 3D + kamera RGB-D'
  },
  {
    label: 'Armada',
    title: 'Humanoid dan robodog, satu panggung.',
    body: 'D1 Pro menambah atraksi salto dan lompat. Semua unit dikawal safety officer dan diasuransikan.',
    fact: 'AgiBot D1 Pro · 3,5 m/s'
  }
];

const STORY_CSS = `
  .story {
    position: relative;
    background: var(--bg-void);
    z-index: 1;
  }
  .story-stage {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
  }
  .story-stage::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 140px;
    z-index: 2;
    background: linear-gradient(180deg, rgba(3, 6, 17, 0.75), rgba(3, 6, 17, 0));
    pointer-events: none;
  }
  .story-stage::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 14%;
    background: linear-gradient(180deg, transparent, var(--bg-void));
    pointer-events: none;
  }
  .story-media {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 30%;
    right: 0;
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 22%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 22%);
  }
  .story-poster,
  .story-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }
  .story-poster {
    object-fit: cover;
    z-index: 1;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }
  .story-copy {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: center;
    padding-top: 72px;
  }
  .story-blocks {
    display: grid;
    width: min(480px, 40vw);
  }
  .story-block {
    grid-area: 1 / 1;
    align-self: center;
    opacity: 0;
    transform: translateY(24px);
    pointer-events: none;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .story-block.is-past {
    transform: translateY(-16px);
  }
  .story-block.is-active {
    opacity: 1;
    transform: none;
    pointer-events: auto;
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s;
  }
  .story-title {
    font-size: clamp(2rem, 3vw, 2.9rem);
    line-height: 1.06;
    letter-spacing: -0.035em;
    font-weight: 800;
    color: var(--text-pure);
    text-wrap: balance;
    margin-bottom: 1rem;
  }
  .story-title--hero {
    font-size: clamp(2.2rem, 3.4vw, 3.2rem);
  }
  .story-accent {
    color: var(--accent);
  }
  .story-body {
    font-size: clamp(1rem, 1.3vw, 1.15rem);
    line-height: 1.6;
    color: var(--text-body);
    max-width: 38ch;
  }
  .story-fact {
    margin-top: 1.25rem;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--text-muted);
  }
  .story-ctas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.85rem;
    margin-top: 2rem;
  }
  .story-btn {
    min-height: 52px;
    padding: 0.9rem 1.75rem;
    font-size: 1.02rem;
    white-space: nowrap;
  }
  .story-nav {
    position: absolute;
    bottom: 2.5rem;
    display: flex;
    gap: 0.5rem;
  }
  .story-nav-item {
    position: relative;
    min-height: 44px;
    padding: 0.5rem 0.75rem;
    background: none;
    border: 0;
    color: var(--text-muted);
    font-family: var(--font-display);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.25s ease;
  }
  .story-nav-item:first-child {
    padding-left: 0;
  }
  .story-nav-item::after {
    content: '';
    position: absolute;
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.35rem;
    height: 2px;
    background: var(--accent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .story-nav-item:first-child::after {
    left: 0;
  }
  .story-nav-item:hover {
    color: var(--text-heading);
  }
  .story-nav-item.is-active {
    color: var(--text-pure);
  }
  .story-nav-item.is-active::after {
    transform: scaleX(1);
  }
  .story-note {
    position: absolute;
    right: 1.5rem;
    bottom: 1.25rem;
    z-index: 2;
    font-size: 0.75rem;
    color: var(--text-muted);
  }
  .story-aperture {
    position: absolute;
    inset: 0;
    z-index: 5;
    pointer-events: none;
  }
  .story-aperture span {
    position: absolute;
    left: 0;
    right: 0;
    height: 50.5%;
    background: var(--bg-void);
    animation: storyAperture 1.5s cubic-bezier(0.76, 0, 0.24, 1) 0.2s both;
  }
  .story-aperture span:first-child {
    top: 0;
    transform-origin: top;
    box-shadow: 0 1px 0 rgba(166, 200, 238, 0.7);
  }
  .story-aperture span:last-child {
    bottom: 0;
    transform-origin: bottom;
    box-shadow: 0 -1px 0 rgba(166, 200, 238, 0.7);
  }
  @keyframes storyAperture {
    to { transform: scaleY(0); }
  }
  @media (prefers-reduced-motion: no-preference) {
    .story-rise {
      animation: storyRise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-delay: calc(900ms + var(--i, 0) * 110ms);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .story-aperture {
      display: none;
    }
  }
  @keyframes storyRise {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: none; }
  }
  @media (max-width: 899px) {
    .story-stage::after {
      display: none;
    }
    .story-media {
      top: 0;
      bottom: auto;
      left: 0;
      height: 56svh;
      -webkit-mask-image: linear-gradient(180deg, #000 80%, transparent 100%);
      mask-image: linear-gradient(180deg, #000 80%, transparent 100%);
    }
    .story-copy {
      align-items: flex-start;
      padding-top: calc(56svh + 0.75rem);
      padding-bottom: 1rem;
    }
    .story-blocks {
      width: 100%;
    }
    .story-block {
      align-self: start;
    }
    .story-title--hero {
      font-size: clamp(1.9rem, 8vw, 2.4rem);
    }
    .story-title {
      font-size: clamp(1.7rem, 7vw, 2.1rem);
      margin-bottom: 0.75rem;
    }
    .story-ctas {
      margin-top: 1.25rem;
    }
    .story-btn {
      flex: 1 1 0;
      padding: 0.85rem 1rem;
    }
    .story-fact {
      margin-top: 0.75rem;
    }
    .story-nav {
      display: none;
    }
    .story-note {
      top: calc(56svh - 2.25rem);
      bottom: auto;
      right: 1rem;
    }
  }
  @media (max-width: 899px) and (max-height: 740px) {
    .story-body {
      font-size: 0.95rem;
    }
  }
  .story-static {
    position: relative;
    z-index: 1;
    padding: 7rem 0 4rem;
    background: var(--bg-void);
  }
  .story-static-end {
    max-width: 560px;
  }
  .story-static-item {
    display: grid;
    gap: 1.5rem;
    align-items: center;
    margin-bottom: 4rem;
  }
  .story-static-item img {
    width: 100%;
    height: auto;
    border-radius: var(--radius-lg);
  }
  @media (min-width: 900px) {
    .story-static-item {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 3rem;
    }
  }
`;

const frameUrl = (variant, index) => `/assets/scroll/${variant}/f-${String(index + 1).padStart(4, '0')}.webp`;
const lastFrameOf = (clip) => clip.start + clip.count - 1;

function frameAt(t) {
  if (t <= INTRO) return 0;
  for (const s of SEGMENTS) {
    if (t < s.to) return s.start + Math.round(((t - s.from) / (s.to - s.from)) * (s.count - 1));
  }
  return frames.total - 1;
}

// Horizontal focus (0 = left edge, 1 = right edge). Only the narrow mobile crop needs to follow
// the robot dog as it walks in during the last clip.
function focusAt(t) {
  const last = SEGMENTS[SEGMENTS.length - 1];
  const p = (t - last.from) / (last.to - last.from);
  return 0.5 + 0.5 * smoothstep(0.15, 0.7, p);
}

function phaseAt(t) {
  if (t >= SEGMENTS[SEGMENTS.length - 1].to) return END_PHASE;
  for (let i = SEGMENTS.length - 1; i >= 0; i--) {
    if (t >= SEGMENTS[i].textFrom) return i + 1;
  }
  return 0;
}

function HeroCopy({ active }) {
  return (
    <>
      <h1 className="story-title story-title--hero story-rise">
        Robot yang jadi <span className="story-accent">bintang panggung</span>.
      </h1>
      <p className="story-body story-rise" style={{ '--i': 1 }}>
        Sewa humanoid dan robodog AgiBot lengkap dengan 2 kru bersertifikat dan asuransi, siap tampil di expo, mall, dan peluncuran produk.
      </p>
      <StoryCtas active={active} className="story-rise" style={{ '--i': 2 }} />
    </>
  );
}

function StoryCtas({ active, className = '', style }) {
  return (
    <div className={`story-ctas ${className}`} style={style} aria-hidden={!active}>
      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => playCyberClick(850, 0.05)}
        className="btn-cyber-primary story-btn"
        aria-label={`${WA_CTA_LABEL} lewat WhatsApp`}
        tabIndex={active ? undefined : -1}
      >
        <MessageCircle size={18} aria-hidden="true" />
        <span>{WA_CTA_LABEL}</span>
      </a>
      <a
        href="#calculator"
        onClick={() => playCyberClick(700, 0.04)}
        className="btn-cyber-outline story-btn"
        tabIndex={active ? undefined : -1}
      >
        Hitung Biaya
      </a>
    </div>
  );
}

function ChapterCopy({ chapter }) {
  return (
    <>
      <h2 className="story-title">{chapter.title}</h2>
      <p className="story-body">{chapter.body}</p>
      <p className="story-fact">{chapter.fact}</p>
    </>
  );
}

function EndCopy({ active }) {
  return (
    <>
      <h2 className="story-title">Siap tampil di event Anda.</h2>
      <p className="story-body">Cek ketersediaan tanggal, atau hitung estimasi biaya dalam satu menit.</p>
      <StoryCtas active={active} />
    </>
  );
}

function StaticStory({ variant }) {
  return (
    <section id="top" className="story-static" aria-label="Pertunjukan robot">
      <div className="container">
        <div className="story-static-item">
          <img src="/assets/robots/hero-agibot-stage-2k.jpg" alt="Robot humanoid berdiri di panggung pameran" width={2752} height={1536} />
          <div><HeroCopy active /></div>
        </div>
        {CHAPTERS.map((chapter, i) => (
          <div key={chapter.label} className="story-static-item">
            <img
              src={frameUrl(variant, lastFrameOf(frames.clips[i]))}
              alt=""
              width={frames[variant].width}
              height={frames[variant].height}
              loading="lazy"
              decoding="async"
            />
            <div><ChapterCopy chapter={chapter} /></div>
          </div>
        ))}
        <div className="story-static-end"><EndCopy active /></div>
      </div>
      <style>{STORY_CSS}</style>
    </section>
  );
}

export default function ScrollStory() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const variant = isMobile ? 'mobile' : 'desktop';

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const posterRef = useRef(null);
  const triggerRef = useRef(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const poster = posterRef.current;
    const ctx = canvas.getContext('2d');
    const state = { t: 0 };
    let currentFrame = 0;
    let dip = 0;
    let focus = 0.5;
    let lastPhase = 0;
    let rafId = 0;

    const draw = () => {
      rafId = 0;
      const img = nearestFrame(loader.images, currentFrame);
      if (!img) return;
      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) * focus, (ch - h) / 2, w, h);
      if (dip > 0) {
        ctx.fillStyle = `rgba(3, 6, 17, ${dip})`;
        ctx.fillRect(0, 0, cw, ch);
      }
      poster.style.opacity = '0';
    };

    const requestDraw = () => {
      if (!rafId) rafId = requestAnimationFrame(draw);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      requestDraw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const loader = loadFrames({
      total: frames.total,
      url: (i) => frameUrl(variant, i),
      onLoad: (i) => {
        if (Math.abs(i - currentFrame) < 48) requestDraw();
      }
    });

    const update = () => {
      const t = state.t;
      const frame = frameAt(t);
      const nextDip = Math.max(0, 1 - Math.abs(t - CUT_AT) / DIP_WIDTH);
      const nextFocus = variant === 'mobile' ? focusAt(t) : 0.5;
      if (frame !== currentFrame || nextDip !== dip || nextFocus !== focus) {
        currentFrame = frame;
        dip = nextDip;
        focus = nextFocus;
        requestDraw();
      }
      const nextPhase = phaseAt(t);
      if (nextPhase !== lastPhase) {
        lastPhase = nextPhase;
        setPhase(nextPhase);
      }
    };

    const tween = gsap.to(state, {
      t: TOTAL,
      ease: 'none',
      onUpdate: update,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6
      }
    });
    triggerRef.current = tween.scrollTrigger;

    return () => {
      loader.cancel();
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      tween.scrollTrigger?.kill();
      tween.kill();
      triggerRef.current = null;
    };
  }, [variant, reducedMotion]);

  if (reducedMotion) return <StaticStory variant={variant} />;

  const goToChapter = (index) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    playCyberClick(700, 0.04);
    const t = SEGMENTS[index].textFrom + 0.02;
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * (t / TOTAL), behavior: 'smooth' });
  };

  const blockClass = (i) => `story-block${phase === i ? ' is-active' : ''}${phase > i ? ' is-past' : ''}`;

  return (
    <section
      id="top"
      ref={sectionRef}
      className="story"
      style={{ height: `calc(100svh + ${TOTAL * 100}vh)` }}
      aria-label="Pertunjukan robot"
    >
      <div className="story-stage">
        <div className="story-media">
          <picture>
            <source media={MOBILE_QUERY} srcSet={frameUrl('mobile', 0)} />
            <img
              ref={posterRef}
              src={frameUrl('desktop', 0)}
              alt=""
              fetchPriority="high"
              className="story-poster"
            />
          </picture>
          <canvas ref={canvasRef} className="story-canvas" role="img" aria-label="Robot humanoid bangun, menari, menyapa tamu, lalu tampil bersama robodog di panggung" />
        </div>

        <div className="container story-copy">
          <div className="story-blocks">
            <div className={blockClass(0)}>
              <HeroCopy active={phase === 0} />
            </div>
            {CHAPTERS.map((chapter, i) => (
              <div key={chapter.label} className={blockClass(i + 1)}>
                <ChapterCopy chapter={chapter} />
              </div>
            ))}
            <div className={blockClass(END_PHASE)}>
              <EndCopy active={phase === END_PHASE} />
            </div>
          </div>

          <nav className="story-nav" aria-label="Bab pertunjukan">
            {CHAPTERS.map((chapter, i) => (
              <button
                key={chapter.label}
                type="button"
                onClick={() => goToChapter(i)}
                className={`story-nav-item${phase === i + 1 ? ' is-active' : ''}`}
                aria-current={phase === i + 1 ? 'step' : undefined}
              >
                {chapter.label}
              </button>
            ))}
          </nav>
        </div>

        <p className="story-note">Ilustrasi visual</p>

        {/* Opening: the stage opens like a lit slit between two black panels. */}
        <div className="story-aperture" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>

      <style>{STORY_CSS}</style>
    </section>
  );
}
