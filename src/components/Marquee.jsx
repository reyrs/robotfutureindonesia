import React, { useEffect, useRef } from 'react';

// Horizontal repeating strip. Base drift + a boost from the Lenis scroll
// velocity (exposed as window.__lenis by App), so the row reacts to how the
// visitor scrolls instead of looping at a fixed pace.
export default function Marquee({
  items,
  speed = 60,
  reverse = false,
  separator = '•',
  className = '',
  style
}) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let x = 0;
    let half = 0;
    let last = performance.now();
    let raf = 0;

    const measure = () => {
      half = track.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const velocity = window.__lenis?.velocity || 0;
      const boost = Math.min(Math.abs(velocity) * 6, 320);
      const dir = reverse ? 1 : -1;
      x += dir * (speed + boost) * dt;
      if (half > 0) {
        if (x <= -half) x += half;
        if (x >= 0 && reverse) x -= half;
      }
      track.style.transform = `translate3d(${x}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [speed, reverse]);

  const row = (
    <span className="marquee-row">
      {items.map((item, i) => (
        <span key={`${item}-${i}`}>
          {item}
          <i aria-hidden="true">{separator}</i>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`marquee ${className}`} style={style} aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        {row}
        {row}
      </div>
      <style>{`
        .marquee-row {
          display: inline-flex;
          align-items: center;
          gap: 2.5rem;
          padding-right: 2.5rem;
          white-space: nowrap;
          font-weight: 900;
          letter-spacing: -0.03em;
        }
        .marquee-row span { display: inline-flex; align-items: center; gap: 2.5rem; }
        .marquee-row i {
          font-style: normal;
          color: var(--color-blue);
        }
      `}</style>
    </div>
  );
}
