import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQS } from '../data/promptsData';
import { playCyberClick } from '../utils/cyberAudio';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    playCyberClick(700, 0.03);
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" style={{ padding: '6rem 0', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Pertanyaan yang Sering Diajukan.
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
            Semua hal teknis seputar keselamatan panggung, waktu sewa, dan kustomisasi pertunjukan.
          </p>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="cyber-card"
                style={{
                  border: isOpen ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                  background: isOpen ? 'rgba(13, 23, 49, 0.8)' : 'rgba(7, 13, 30, 0.6)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.25s ease'
                }}
              >
                <h3 style={{ margin: 0, font: 'inherit' }}>
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    id={`faq-q-${idx}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${idx}`}
                    style={{
                      width: '100%',
                      padding: '1.35rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <HelpCircle size={18} color="var(--accent)" style={{ flexShrink: 0 }} aria-hidden="true" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      size={18}
                      color="var(--accent)"
                      aria-hidden="true"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        flexShrink: 0,
                        marginLeft: '1rem'
                      }}
                    />
                  </button>
                </h3>

                <div
                  id={`faq-a-${idx}`}
                  role="region"
                  aria-labelledby={`faq-q-${idx}`}
                  hidden={!isOpen}
                  style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-body)', lineHeight: 1.6, fontSize: '0.95rem' }}
                >
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
