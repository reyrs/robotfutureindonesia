import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Sections announce themselves with data-bg. Lazy sections (the lab) fire
// `rs:register-bg` once mounted so their trigger gets picked up too.
export function registerSectionBg() {
  window.dispatchEvent(new CustomEvent('rs:register-bg'));
}

export default function PageBackdrop() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let triggers = [];

    function paint(color) {
      if (!color) return;
      gsap.to(el, { backgroundColor: color, duration: 0.7, ease: 'power2.out', overwrite: 'auto' });
      document.documentElement.style.setProperty('--page-bg', color);
    }

    function bind() {
      triggers.forEach((t) => t.kill());
      triggers = gsap.utils.toArray('[data-bg]').map((section) =>
        ScrollTrigger.create({
          trigger: section,
          start: 'top 55%',
          end: 'bottom 55%',
          onEnter: () => paint(section.dataset.bg),
          onEnterBack: () => paint(section.dataset.bg)
        })
      );
      ScrollTrigger.refresh();
    }

    bind();
    window.addEventListener('rs:register-bg', bind);
    const first = document.querySelector('[data-bg]');
    if (first) paint(first.dataset.bg);

    return () => {
      window.removeEventListener('rs:register-bg', bind);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return <div className="page-backdrop" ref={ref} aria-hidden="true" />;
}
