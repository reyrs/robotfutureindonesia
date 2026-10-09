import React, { useEffect, useRef } from 'react';

const isEligible = () =>
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Two-piece cursor (dot + ring) with exclusion blending so it stays legible
// over both the off-white page and the dark 3D lab. Desktop only.
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!isEligible()) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    let targetScale = 1;
    let visible = false;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
      const hit = e.target instanceof Element ? e.target.closest('a, button, [data-cursor]') : null;
      const text = hit?.getAttribute?.('data-cursor') || '';
      const isLabelled = text.length > 1;
      targetScale = hit ? (isLabelled ? 1 : 2.6) : 1;
      if (label) {
        label.textContent = isLabelled ? text : '';
        label.style.opacity = isLabelled ? '1' : '0';
        if (isLabelled) targetScale = 4.4;
      }
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${hit ? 0.5 : 1})`;
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      const current = Number(ring.dataset.scale || 1);
      const next = current + (targetScale - current) * 0.16;
      ring.dataset.scale = String(next);
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%) scale(${next})`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (typeof window !== 'undefined' && !isEligible()) return null;

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true">
        <span ref={labelRef} />
      </div>
      <style>{`
        .cursor-dot, .cursor-ring {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 3000;
          pointer-events: none;
          mix-blend-mode: exclusion;
          opacity: 0;
        }
        .cursor-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
          transition: opacity 0.3s ease;
        }
        .cursor-ring {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1.5px solid #fff;
          display: grid;
          place-items: center;
          transition: opacity 0.3s ease;
        }
        .cursor-ring span {
          font: 500 8px/1 var(--font-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        @media (pointer: coarse), (prefers-reduced-motion: reduce) {
          .cursor-dot, .cursor-ring { display: none; }
        }
      `}</style>
    </>
  );
}
