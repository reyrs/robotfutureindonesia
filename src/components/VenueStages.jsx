import React from 'react';
import { VENUE_CATEGORIES } from '../data/promptsData';
import { ArrowUpRight } from 'lucide-react';
import { playCyberClick } from '../utils/cyberAudio';
import { waLink } from '../config/site';

export default function VenueStages() {
  return (
    <section style={{ padding: '6rem 0', background: 'rgba(4, 7, 18, 0.6)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ maxWidth: '800px', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Setiap Venue Adalah Panggung Teatrikal.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
            Kombinasi sensor navigasi cerdas dan stabilitas bipedal memungkinkan robot beraksi di berbagai jenis lantai panggung, indoor mall, hingga convention hall berkarpet tebal.
          </p>
        </div>

        {/* 3-Column Venue Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {VENUE_CATEGORIES.map((v, idx) => (
            <div
              key={idx}
              className="cyber-card"
              style={{
                position: 'relative',
                height: '320px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <img
                src={v.image}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease'
                }}
                className="venue-img"
              />

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(3, 6, 17, 0.95) 0%, rgba(3, 6, 17, 0.4) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{v.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{v.subtitle}</p>
                  </div>
                  <a
                    href={waLink(`Halo Robotshow Indonesia, saya ingin cek jadwal sewa robot untuk event di ${v.title}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playCyberClick(700, 0.03)}
                    aria-label={`Cek jadwal untuk ${v.title} lewat WhatsApp`}
                    style={{
                      flexShrink: 0,
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(79, 151, 210, 0.15)',
                      border: '1px solid var(--border-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                      textDecoration: 'none'
                    }}
                  >
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        .venue-img:hover {
          transform: scale(1.06);
        }
      `}</style>
    </section>
  );
}
