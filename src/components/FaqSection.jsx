import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { FAQS } from '../data/promptsData';
import { useScrollMotion } from '../utils/motion';
import { useLanguage } from '../context/LanguageContext';

export default function FaqSection() {
  const { t } = useLanguage();
  const faqItems = t.faq?.items || FAQS;
  const [openIdx, setOpenIdx] = useState(0);
  const ref = useRef(null);
  useScrollMotion(ref);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" ref={ref} className="faq" data-bg="#ffffff" aria-labelledby="faq-title">
      <div className="container faq-inner">
        <h2 id="faq-title" className="faq-title display" data-split>{t.faq?.title || 'Pertanyaan yang sering diajukan.'}</h2>
        <div className="faq-list" data-stagger>
          {faqItems.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={faq.q} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                <h3>
                  <button type="button" onClick={() => toggle(idx)} id={`faq-q-${idx}`} aria-expanded={isOpen} aria-controls={`faq-a-${idx}`}>
                    <span>{faq.q}</span>
                    <Plus size={24} aria-hidden="true" className="faq-icon" strokeWidth={1.5} />
                  </button>
                </h3>
                <div className="faq-answer-wrap" inert={!isOpen}>
                  <div id={`faq-a-${idx}`} role="region" aria-labelledby={`faq-q-${idx}`} className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .faq {
          padding: 8rem 0;
        }
        .faq-inner {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.8fr);
          gap: clamp(2.5rem, 5vw, 4.5rem);
          align-items: start;
        }
        .faq-title {
          grid-column: 1 / -1;
          max-width: 16ch;
          font-size: clamp(3.5rem, 8vw, 9rem);
          color: var(--text-heading);
        }
        .faq-list {
          grid-column: 2;
          border-top: var(--hairline);
        }
        .faq-item {
          border-bottom: var(--hairline);
          transition: background-color 0.4s ease;
        }
        .faq-item:hover {
          background-color: var(--accent-subtle);
        }
        .faq-item h3 {
          margin: 0;
          font: inherit;
        }
        .faq-item button {
          width: 100%;
          min-height: 80px;
          padding: 1.5rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          background: none;
          border: none;
          text-align: left;
          color: var(--text-heading);
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 1.5vw, 1.3rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .faq-item:hover button {
          color: var(--color-blue);
        }
        .faq-icon {
          flex-shrink: 0;
          color: var(--text-muted);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease;
        }
        .faq-item:hover .faq-icon {
          color: var(--color-blue);
        }
        .faq-item.is-open .faq-icon {
          transform: rotate(45deg);
          color: var(--color-blue);
        }
        .faq-answer-wrap {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .faq-item.is-open .faq-answer-wrap { grid-template-rows: 1fr; }
        .faq-answer {
          min-height: 0;
          overflow: hidden;
        }
        .faq-answer p {
          padding: 0 4rem 2rem 1rem;
          line-height: 1.7;
          font-size: 1.05rem;
          color: var(--text-body);
          opacity: 0;
          filter: blur(8px);
          transform: translateY(-8px);
          transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .faq-item.is-open .faq-answer p {
          opacity: 1;
          transform: none;
          filter: blur(0px);
          transition-delay: 0.1s;
        }
        @media (max-width: 900px) {
          .faq {
            padding: 5rem 0;
          }
          .faq-inner {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .faq-list {
            grid-column: 1;
          }
          .faq-item button {
            font-size: 1.15rem;
            padding: 1.25rem 0;
          }
          .faq-answer p {
            padding: 0 0 1.5rem 0;
          }
        }
      `}</style>
    </section>
  );
}
