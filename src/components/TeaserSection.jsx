import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Volume2, VolumeX } from 'lucide-react';
import { useMediaQuery } from '../utils/frames';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

// Contact sheet from RFI's teaser (robotshow.id/assets/video/rfi-teaser.mp4). A white grease
// pencil rings one frame; scrolling on, that frame grows smoothly until it *is* the full video,
// taking over seamlessly from the exact same timestamp.

const SRC = '/assets/teaser';
const VIDEO = { w: 1920, h: 1080 };
const STILLS = [9.0, 18.2, 26.8, 31.0, 34.0, 36.0, 41.0, 42.5];
const DEFAULT = 2; // the pencak silat stage
const lerp = (a, b, p) => a + (b - a) * p;

// A hand-drawn loop: an ellipse that wobbles a little and overshoots where it started.
const PENCIL = (() => {
  const pts = [];
  for (let k = 0; k <= 48; k++) {
    const a = -0.5 + (k / 48) * (Math.PI * 2 + 0.7);
    const r = 1 + 0.035 * Math.sin(a * 3.1) + 0.02 * Math.cos(a * 5.3) + (k > 40 ? 0.05 : 0);
    pts.push(`${(50 + 50 * r * Math.cos(a)).toFixed(2)},${(50 + 50 * r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')}`;
})();

const STYLES = `
.teaser { position: relative; height: 100svh; overflow: hidden; background: var(--rfi-navy); color: var(--rfi-paper); }
.teaser-head { position: absolute; z-index: 4; top: calc(76px + 4svh); left: var(--pad-x); right: var(--pad-x); display: flex; justify-content: space-between; align-items: end; gap: 32px; }
.teaser-head h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(44px, 5.4vw, 96px);
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: inherit;
}
.teaser-sub { margin: 0; max-width: 34ch; font-size: clamp(14px, 1.05vw, 17px); line-height: 1.55; color: rgba(242, 240, 236, 0.74); }
.teaser-sheet {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 58%;
  width: min(1280px, 88vw, 140svh);
  translate: -50% -50%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(10px, 1.1vw, 18px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.teaser-frame { position: relative; aspect-ratio: 16 / 9; }
.teaser-frame button {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: #000;
  cursor: pointer;
}
.teaser-frame img { display: block; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s, filter 0.3s; }
.teaser-sheet:hover .teaser-frame img { opacity: 0.6; }
.teaser-sheet .teaser-frame button:hover img,
.teaser-sheet .teaser-frame button:focus-visible img { opacity: 1; }
.teaser-frame.is-hidden img { visibility: hidden; }
.teaser-pencil { position: absolute; inset: -14% -9%; width: 118%; height: 128%; overflow: visible; pointer-events: none; }
.teaser-pencil path { fill: none; stroke: var(--rfi-paper); stroke-width: 1.1; stroke-linecap: round; stroke-linejoin: round; }
.teaser-lens { position: absolute; z-index: 3; visibility: hidden; background-size: cover; background-position: center; pointer-events: none; }
.teaser-video { position: absolute; z-index: 3; width: 100%; height: 100%; object-fit: cover; opacity: 0; pointer-events: none; background: #000; }
.teaser-bar {
  position: absolute;
  z-index: 5;
  left: var(--pad-x);
  right: var(--pad-x);
  bottom: clamp(20px, 4svh, 40px);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  opacity: 0;
  visibility: hidden;
}
.teaser-sound {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(242, 240, 236, 0.42);
  border-radius: 999px;
  background: rgba(11, 21, 51, 0.45);
  backdrop-filter: blur(8px);
  color: var(--rfi-paper);
  font: 500 13px/1 var(--font-display);
  cursor: pointer;
}
.teaser-sound:hover { background: rgba(11, 21, 51, 0.7); }

.teaser.is-static { height: auto; padding: calc(76px + 6svh) 0 8svh; }
.teaser.is-static .teaser-head,
.teaser.is-static .teaser-sheet { position: static; translate: none; margin: 0 auto; }
.teaser.is-static .teaser-head { padding: 0 var(--pad-x) 32px; }
.teaser.is-static .teaser-player { display: block; width: min(1120px, 84vw); aspect-ratio: 16 / 9; margin: 40px auto 0; }

@media (max-width: 1023px) {
  .teaser-head { flex-direction: column; align-items: start; gap: 12px; top: calc(76px + 2svh); left: 20px; right: 20px; }
  .teaser-sheet { top: auto; bottom: max(24px, 4svh); translate: -50% 0; width: calc(100% - 40px); grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .teaser-bar { left: 20px; right: 20px; }
}
@media (max-width: 1023px) and (max-height: 720px) {
  .teaser-sheet { width: min(calc(100% - 40px), 60svh); }
}
`;

export default function TeaserSection() {
  const { t } = useLanguage();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const narrow = useMediaQuery('(max-width: 1023px)');
  const [chosen, setChosen] = useState(DEFAULT);
  const [muted, setMuted] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const lensRef = useRef(null);
  const chosenRef = useRef(DEFAULT);
  const frameRefs = useRef([]);
  const geometry = useRef(null);

  // Where the video covers the stage proportionally in cinematic cover.
  const measure = () => {
    if (!sectionRef.current || !videoRef.current || !frameRefs.current[chosenRef.current]) return;
    const stage = sectionRef.current.getBoundingClientRect();
    const s = Math.max(stage.width / VIDEO.w, stage.height / VIDEO.h);
    const ox = (stage.width - VIDEO.w * s) / 2;
    const oy = (stage.height - VIDEO.h * s) / 2;
    const video = videoRef.current;
    video.style.inset = 'auto';
    video.style.width = `${VIDEO.w * s}px`;
    video.style.height = `${VIDEO.h * s}px`;
    video.style.left = `${ox}px`;
    video.style.top = `${oy}px`;
    const frame = frameRefs.current[chosenRef.current].getBoundingClientRect();
    geometry.current = {
      from: { x: frame.left - stage.left, y: frame.top - stage.top, w: frame.width, h: frame.height },
      to: { x: ox, y: oy, w: VIDEO.w * s, h: VIDEO.h * s }
    };
  };

  useLayoutEffect(() => {
    if (reducedMotion) return undefined;
    const section = sectionRef.current;
    const video = videoRef.current;
    const lens = lensRef.current;
    const ctx = gsap.context(() => {
      const zoom = { p: 0 };
      const show = { p: 0 };
      const pencil = section.querySelector('.teaser-pencil path');
      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      const length = pencil.getTotalLength();
      tl.fromTo(pencil, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 0.25 }, 0.12)
        .to(zoom, {
          p: 1,
          duration: 0.45,
          ease: 'power2.inOut',
          onUpdate: () => {
            const g = geometry.current;
            const p = zoom.p;
            if (!g) return;
            lens.style.visibility = p > 0 ? 'visible' : 'hidden';
            frameRefs.current.forEach((el, i) => el.classList.toggle('is-hidden', p > 0 && i === chosenRef.current));
            Object.assign(lens.style, {
              left: `${lerp(g.from.x, g.to.x, p)}px`,
              top: `${lerp(g.from.y, g.to.y, p)}px`,
              width: `${lerp(g.from.w, g.to.w, p)}px`,
              height: `${lerp(g.from.h, g.to.h, p)}px`
            });
          }
        }, 0.42)
        .to(['.teaser-sheet', '.teaser-head'], { autoAlpha: 0, duration: 0.25 }, 0.45)
        .to(show, {
          p: 1,
          duration: 0.1,
          onUpdate: () => {
            video.style.opacity = show.p;
            if (show.p > 0 && video.paused) {
              video.currentTime = STILLS[chosenRef.current];
              video.play().catch(() => {});
            } else if (show.p === 0 && !video.paused) video.pause();
            setZoomed(show.p > 0.5);
          }
        }, 0.88)
        .to('.teaser-bar', { autoAlpha: 1, duration: 0.05 }, 0.95);

      ScrollTrigger.create({
        animation: tl,
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.2}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onRefresh: measure,
        onEnter: () => (video.preload = 'auto'),
        onLeave: () => video.pause(),
        onEnterBack: () => show.p > 0 && video.play().catch(() => {})
      });
      measure();
    }, section);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      ctx.revert();
    };
  }, [reducedMotion]);

  const choose = (i) => {
    chosenRef.current = i;
    setChosen(i);
    if (!reducedMotion) measure();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const sources = (
    <>
      <source src={`${SRC}/teaser-720.mp4`} type="video/mp4" media="(max-width: 1023px)" />
      <source src={`${SRC}/teaser-1080.mp4`} type="video/mp4" />
    </>
  );

  return (
    <section id="acara" ref={sectionRef} className={`teaser${reducedMotion ? ' is-static' : ''}`} aria-labelledby="teaser-title" data-bg="#0B1533">
      <div className="teaser-head">
        <h2 id="teaser-title">{t.teaser.title}</h2>
        <p className="teaser-sub">{narrow ? t.teaser.subTouch : t.teaser.sub}</p>
      </div>
      <ul className="teaser-sheet">
        {STILLS.map((time, i) => (
          <li key={time} ref={(el) => (frameRefs.current[i] = el)} className="teaser-frame">
            <button type="button" onClick={() => choose(i)} aria-pressed={i === chosen} aria-label={t.teaser.pick(i + 1)}>
              <img src={`${SRC}/still-${time.toFixed(1)}.webp`} alt="" width="640" height="360" loading="lazy" decoding="async" />
            </button>
            {i === chosen && (
              <svg className="teaser-pencil" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d={PENCIL} />
              </svg>
            )}
          </li>
        ))}
      </ul>

      {reducedMotion ? (
        <video className="teaser-player" controls playsInline preload="none" poster={`${SRC}/still-${STILLS[DEFAULT].toFixed(1)}.webp`} aria-label={t.teaser.video}>
          {sources}
        </video>
      ) : (
        <>
          <div ref={lensRef} className="teaser-lens" style={{ backgroundImage: `url(${SRC}/still-${STILLS[chosen].toFixed(1)}.webp)` }} aria-hidden="true" />
          <video ref={videoRef} className="teaser-video" muted loop playsInline preload="none" aria-label={t.teaser.video} tabIndex={-1}>
            {sources}
          </video>
          <div className="teaser-bar">
            <button type="button" className="teaser-sound" onClick={toggleSound} aria-pressed={!muted} tabIndex={zoomed ? 0 : -1}>
              {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
              {muted ? t.teaser.soundOn : t.teaser.soundOff}
            </button>
          </div>
        </>
      )}
      <style>{STYLES}</style>
    </section>
  );
}
