import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll motion inside `ref`, driven by data attributes:
//   data-split         headline rises line by line from behind its own mask (re-splits on resize/font load)
//   data-reveal        fades up once it enters the screen
//   data-stagger       its children fade up one after another
//   data-parallax="8"  image drifts 8% and settles from a slight zoom while its frame crosses the screen
//   data-spotlight     frame opens from a rounded inset to full bleed, like stage lights coming up
//   data-drift         big type slides sideways with the scroll
export function useScrollMotion(ref) {
  useEffect(() => {
    if (reducedMotion()) return;
    const root = ref.current;
    const ctx = gsap.context(() => {
      const enter = (targets, trigger, stagger = 0) =>
        gsap.from(targets, { y: 60, opacity: 0, filter: 'blur(16px)', duration: 1.2, stagger, ease: 'power3.out', scrollTrigger: { trigger, start: 'top 88%', once: true } });
      root.querySelectorAll('[data-split]').forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 120,
            opacity: 0,
            filter: 'blur(12px)',
            duration: 1.3,
            stagger: 0.08,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 86%', once: true }
          })
        });
      });
      root.querySelectorAll('[data-reveal]').forEach((el) => enter(el, el));
      root.querySelectorAll('[data-stagger]').forEach((group) => enter(group.children, group, 0.08));
      root.querySelectorAll('[data-spotlight]').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(10% 14% round 32px)' }, {
          clipPath: 'inset(0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 30%', scrub: true }
        });
      });
      root.querySelectorAll('[data-drift]').forEach((el) => {
        gsap.fromTo(el, { xPercent: 8 }, {
          xPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
      root.querySelectorAll('[data-parallax]').forEach((el) => {
        const amount = parseFloat(el.dataset.parallax) || 8;
        gsap.fromTo(el, { yPercent: -amount, scale: 1.15 }, {
          yPercent: amount,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: el.closest('section, .duotone') ?? el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }, root);
    return () => ctx.revert();
  }, [ref]);
}

// "± 131 cm" counts 0 → 131 and keeps the text around the number; values without a number stay as they are.
export function countUp(el) {
  const text = el.dataset.value;
  const match = text.match(/\d+(?:,\d+)?/);
  if (!match || reducedMotion()) return null;
  const decimals = (match[0].split(',')[1] || '').length;
  const head = text.slice(0, match.index);
  const tail = text.slice(match.index + match[0].length);
  const state = { v: 0 };
  return gsap.to(state, {
    v: parseFloat(match[0].replace(',', '.')),
    duration: 1.2,
    ease: 'power3.out',
    onUpdate: () => {
      el.textContent = head + state.v.toFixed(decimals).replace('.', ',') + tail;
    }
  });
}
