import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const KEY = 'rs-preloader-seen';

const shouldPlay = () => {
  try {
    return (
      !sessionStorage.getItem(KEY) &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  } catch {
    return false;
  }
};

// Full-screen percent counter that plays once per session, then wipes up.
// Signals the rest of the page with `rs:intro-done` when it is gone.
export default function Preloader() {
  const [visible, setVisible] = useState(shouldPlay);
  const rootRef = useRef(null);
  const digitsRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      window.dispatchEvent(new CustomEvent('rs:intro-done'));
      return undefined;
    }

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        try {
          sessionStorage.setItem(KEY, '1');
        } catch {
          /* private mode: it simply plays again next visit */
        }
        setVisible(false);
        window.dispatchEvent(new CustomEvent('rs:intro-done'));
      }
    });

    tl.to(counter, {
      v: 100,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (digitsRef.current) digitsRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
      }
    })
      .to(barRef.current, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
      .to(rootRef.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=0.15');

    return () => tl.kill();
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="preloader-mark">ROBOTSHOW</div>
      <div className="preloader-bottom">
        <div className="preloader-bar">
          <span ref={barRef} />
        </div>
        <span className="preloader-digits mono-label" ref={digitsRef}>
          000
        </span>
      </div>
      <style>{`
        .preloader {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: var(--color-bg);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: var(--pad-y) var(--pad-x);
        }
        .preloader-mark {
          font: 900 clamp(1.6rem, 4vw, 3rem) / 1 var(--font-display);
          letter-spacing: -0.04em;
          color: var(--color-ink);
        }
        .preloader-bottom {
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
        }
        .preloader-bar {
          flex: 1;
          height: 2px;
          background: rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }
        .preloader-bar span {
          display: block;
          height: 100%;
          background: var(--color-ink);
          transform: scaleX(0);
          transform-origin: left center;
        }
        .preloader-digits {
          font-size: clamp(2.5rem, 7vw, 5.5rem);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 0.9;
          color: var(--color-ink);
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
