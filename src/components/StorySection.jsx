import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_CHAPTERS = [
  {
    id: 'persiapan',
    place: 'Belakang panggung',
    word: 'PERSIAPAN',
    title: ['Dua jam sebelum', 'pintu dibuka.'],
    text: 'Operator membuka koper, kalibrasi sendi, cek baterai, lalu menjalankan gladi aksi sampai gerakannya bersih.',
    facts: ['2 operator per unit', 'Baterai cadangan di lokasi']
  },
  {
    id: 'sambutan',
    place: 'Pintu masuk',
    word: 'SAMBUTAN',
    title: ['Tamu pertama', 'disambut robot.'],
    text: 'Unit humanoid berdiri di pintu, menyapa dalam bahasa Indonesia, menunjuk arah, dan meladeni ajakan berfoto.',
    facts: ['Sapaan ramah', 'Atribut brand menyusul permintaan']
  },
  {
    id: 'panggung',
    place: 'Panggung utama',
    word: 'PANGGUNG',
    title: ['Semua ponsel', 'langsung naik.'],
    text: 'Dua unit menari seirama di bawah satu lampu sorot, mengikuti lagu yang Anda pakai untuk acara.',
    facts: ['Koreografi mengikuti lagu Anda', '3-5 menit per sesi tampil']
  },
  {
    id: 'kerumunan',
    place: 'Area publik',
    word: 'KERUMUNAN',
    title: ['Anak-anak', 'ikut berjalan.'],
    text: 'Robodog berjalan pelan di depan pengunjung, berhenti untuk difoto, lalu lanjut. Kerumunan terbentuk tanpa perlu panggung.',
    facts: ['D1 Pro, 15,5 kg', 'Lari sampai 3,5 m/s']
  },
  {
    id: 'brosur',
    place: 'Booth pameran',
    word: 'PAMERAN',
    title: ['Brosur', 'berpindah tangan.'],
    text: 'Di booth, robot menyerahkan brosur dan menahan pengunjung lebih lama di depan produk Anda.',
    facts: ['Host booth sepanjang acara', 'Bergantian dengan tim Anda']
  }
];

const pad = (n) => String(n + 1).padStart(2, '0');
const HAS_VIDEO = new Set(['persiapan', 'sambutan', 'panggung', 'kerumunan', 'brosur']);

export default function StorySection() {
  const { t } = useLanguage();
  const chapters = t.story?.chapters || FALLBACK_CHAPTERS;
  const ref = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches || !ref.current) return;
    
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray('.story-card');
      cardEls.forEach((card, i) => {
        // Video auto-playback based on scroll
        const video = card.querySelector('video');
        if (video) {
          ScrollTrigger.create({
            trigger: card,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => { video.currentTime = 0; video.play().catch(() => {}); },
            onEnterBack: () => { video.play().catch(() => {}); },
            onLeave: () => video.pause(),
            onLeaveBack: () => video.pause(),
          });
        }

        if (i === cardEls.length - 1) return;
        
        // Scale and fade when the next card scrolls over it
        gsap.to(card.querySelector('.story-inner'), {
          scale: 0.93,
          opacity: 0.35,
          filter: 'blur(8px)',
          ease: 'none',
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });
      });
    }, ref);
    
    return () => ctx.revert();
  }, []);

  return (
    <section id="acara" ref={ref} className="story-section" data-bg="#ffffff">
      <h2 id="story-title" className="sr-only">{t.story?.srTitle || 'Satu malam acara bersama robot'}</h2>
      
      {chapters.map((chapter, index) => (
        <div key={chapter.id} className="story-card">
          <div className="story-inner">
            
            <figure className="story-plate">
              {HAS_VIDEO.has(chapter.id) ? (
                <video
                  src={`/assets/story/${chapter.id}.mp4`}
                  poster={`/assets/story/${chapter.id}.webp`}
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  className="story-media"
                />
              ) : (
                <img
                  src={`/assets/story/${chapter.id}.webp`}
                  alt={`${chapter.place}: ${chapter.title.join(' ')}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="story-media"
                />
              )}
              
              <div className="story-overlay-vertical" />
              <div className="story-overlay-horizontal" />
            </figure>

            <div className="story-wordmark" aria-hidden="true">
              {chapter.word}
            </div>

            <div className="container story-content">
              <div className="story-meta mono-label">
                <span className="story-step">
                  {pad(index)}
                  <span className="story-step-slash">/</span>
                  <span className="story-step-total">{pad(chapters.length - 1)}</span>
                </span>
                <span className="story-place">{chapter.place}</span>
              </div>

              <div className="story-copy">
                <p className="story-title display">
                  {chapter.title.map((line, idx) => (
                    <React.Fragment key={line}>
                      {line}
                      {idx < chapter.title.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
                <p className="story-desc">
                  {chapter.text}
                </p>
                <ul className="story-facts">
                  {chapter.facts.map((fact) => (
                    <li key={fact} className="story-fact-item mono-label">
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="story-disclaimer mono-label">
                {t.story?.disclaimer || 'Ilustrasi suasana acara'}
              </div>
            </div>
            
          </div>
        </div>
      ))}

      <style>{`
        .story-section {
          position: relative;
          z-index: 1;
        }
        .story-card {
          position: sticky;
          top: 0;
          height: 100vh;
          height: 100dvh;
          width: 100%;
          overflow: hidden;
          isolation: isolate;
          /* Solid page-white so each stacked plate occludes the one below.
             Same hex as the section data-bg — PageBackdrop still owns colour. */
          background: var(--color-white);
        }
        .story-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
          gap: clamp(1.5rem, 3vw, 3.5rem);
          align-items: stretch;
          padding: clamp(5rem, 9vh, 6.5rem) var(--pad-x) clamp(1.75rem, 4vh, 2.75rem);
          will-change: transform, opacity, filter;
        }
        .story-plate {
          position: relative;
          grid-column: 2;
          grid-row: 1;
          margin: 0;
          z-index: 0;
          border-radius: var(--radius);
          border: var(--hairline);
          background: var(--bg-surface);
          overflow: hidden;
          min-height: 0;
        }
        .story-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .story-overlay-vertical {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            transparent 55%,
            rgba(0, 0, 0, 0.16) 100%
          );
        }
        .story-overlay-horizontal {
          position: absolute;
          inset: 0;
          width: 45%;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.22),
            transparent 100%
          );
        }
        .story-wordmark {
          position: absolute;
          right: var(--pad-x);
          bottom: -0.05em;
          z-index: 1;
          font-family: var(--font-display);
          font-size: clamp(4rem, 13vw, 13rem);
          font-weight: 900;
          line-height: 0.8;
          letter-spacing: -0.06em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(0, 0, 0, 0.1);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          text-transform: uppercase;
        }
        .story-inner .story-content {
          position: relative;
          z-index: 2;
          grid-column: 1;
          grid-row: 1;
          width: 100%;
          max-width: 52rem;
          margin: 0;
          padding: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: var(--text-body);
        }
        .story-meta {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding-bottom: 1.1rem;
          border-bottom: var(--hairline);
          margin-bottom: clamp(1.5rem, 3vh, 2.25rem);
          color: var(--text-muted);
        }
        .story-step {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--color-blue);
          font-weight: 700;
        }
        .story-step-slash {
          opacity: 0.45;
          font-weight: 400;
        }
        .story-step-total {
          color: var(--text-muted);
          font-weight: 400;
        }
        .story-place {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--text-muted);
        }
        .story-place::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--color-blue);
        }
        .story-copy {
          max-width: 52ch;
        }
        .story-title {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 4.6vw, 4.4rem);
          color: var(--text-heading);
          margin: 0;
        }
        .story-desc {
          max-width: 46ch;
          margin-top: 1.1rem;
          font-size: clamp(0.98rem, 1.1vw, 1.08rem);
          line-height: 1.6;
          color: var(--text-body);
          font-weight: 400;
        }
        .story-facts {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding: 0;
          list-style: none;
        }
        .story-fact-item {
          display: inline-flex;
          align-items: center;
          padding: 0.42rem 0.9rem;
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          border: var(--hairline);
          color: var(--text-body);
          font-weight: 500;
        }
        .story-disclaimer {
          align-self: flex-start;
          margin-top: 1.75rem;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          background: var(--bg-surface);
          border: var(--hairline);
          color: var(--text-muted);
          pointer-events: none;
          z-index: 3;
          white-space: nowrap;
        }

        @media (max-width: 899px) {
          .story-inner {
            grid-template-columns: 1fr;
            grid-template-rows: minmax(0, 44%) minmax(0, 1fr);
            gap: 1.15rem;
            padding-top: clamp(4.25rem, 8vh, 5.25rem);
          }
          .story-plate {
            grid-column: 1;
            grid-row: 1;
          }
          .story-inner .story-content {
            grid-column: 1;
            grid-row: 2;
            max-width: none;
            justify-content: flex-start;
            overflow: hidden;
          }
          .story-overlay-horizontal {
            width: 100%;
            background: linear-gradient(
              180deg,
              transparent 70%,
              rgba(0, 0, 0, 0.12) 100%
            );
          }
          .story-wordmark {
            right: 1.5rem;
            bottom: 0.5em;
            opacity: 0.5;
          }
        }
        @media (max-width: 639px) {
          .story-title {
            font-size: clamp(1.9rem, 8vw, 2.6rem);
          }
          .story-desc {
            font-size: 0.95rem;
            margin-top: 0.9rem;
          }
          .story-facts {
            margin-top: 1.1rem;
          }
          .story-disclaimer {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
