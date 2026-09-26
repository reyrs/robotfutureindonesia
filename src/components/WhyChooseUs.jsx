import React from 'react';
import { ShieldCheck, RefreshCw, MapPin, Award, Check } from 'lucide-react';
import { INCLUDED_SERVICES } from '../data/promptsData';

const ADVANTAGES = [
  {
    icon: Award,
    title: 'Armada Robot Panggung Resmi',
    desc: 'Akses langsung ke teknologi robot humanoid X2 dan Robodog D1 Pro dengan dukungan teknis terlengkap di Indonesia.'
  },
  {
    icon: RefreshCw,
    title: 'Pembaruan Koreografi OTA Berkala',
    desc: 'Tarian dan skenario panggung selalu segar melalui pembaruan software Over-the-Air tanpa perlu kontrak ulang.'
  },
  {
    icon: ShieldCheck,
    title: 'Turnkey 100% & Asuransi Penuh',
    desc: 'Anda tinggal menentukan waktu dan panggung. Kru pilot teknisi, safety officer, hingga baterai cadangan kami tangani secara penuh.'
  },
  {
    icon: MapPin,
    title: 'Jangkauan Logistik Seluruh Nusantara',
    desc: 'Armada siap diberangkatkan ke Jakarta, Surabaya, Bali, Medan, Balikpapan, dan kota lainnya dengan flight case militer.'
  }
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" style={{ padding: '6rem 0', position: 'relative' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ maxWidth: '820px', marginBottom: '3.5rem' }}>
          <span className="cyber-eyebrow" style={{ marginBottom: '1rem' }}>
            <span className="pulse-dot"></span>
            Standar Panggung Internasional
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Semua Sudah Termasuk. Bebas Repot, 100% Show-Ready.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
            Kami bukan sekadar menyewakan robot, melainkan menyediakan ekosistem pertunjukan panggung terpadu di bawah satu kontrak resmi.
          </p>
        </div>

        {/* 2-Column Asymmetric Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: '2.5rem'
          }}
          className="why-grid"
        >
          {/* Column 1: 4 Key Advantages */}
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {ADVANTAGES.map((adv, idx) => {
              const Icon = adv.icon;
              return (
                <div
                  key={idx}
                  className="cyber-card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    background: 'rgba(7, 13, 30, 0.75)'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(79, 151, 210, 0.1)',
                      border: '1px solid var(--border-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--accent)'
                    }}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                      {adv.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                      {adv.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Checklist of Everything Included */}
          <div
            className="cyber-card"
            style={{
              padding: '2.25rem',
              border: '1px solid var(--border-accent)',
              background: 'linear-gradient(170deg, rgba(13, 23, 49, 0.9) 0%, rgba(4, 7, 18, 0.95) 100%)'
            }}
          >
            <div className="hud-corner-tl"></div>
            <div className="hud-corner-br"></div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
              Setiap Booking Sudah Mencakup:
            </h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {INCLUDED_SERVICES.map((srv, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'rgba(79, 151, 210, 0.15)',
                      border: '1px solid var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Check size={13} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {srv.title}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '0.2rem' }}>
                      {srv.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .why-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
