import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { MessageCircle, CheckCircle2, Calendar, MapPin, Bot, Sparkles } from 'lucide-react';
import { playCyberClick, playRoboticEngage } from '../utils/cyberAudio';
import { waLink } from '../config/site';

// A2 Lite is left out until its daily rate is confirmed.
const ROBOT_OPTIONS = [
  { id: 'combo', name: 'Paket Duo: X2 Ultra + D1 Pro', basePrice: 28000000, desc: 'Humanoid dan robodog tampil bersama, favorit untuk mall dan expo besar' },
  { id: 'x2-ultra', name: 'AgiBot X2 Ultra', basePrice: 19000000, desc: 'Humanoid kompak untuk tarian panggung dan sambutan VIP' },
  { id: 'd1-pro', name: 'AgiBot D1 Pro', basePrice: 11000000, desc: 'Robodog untuk atraksi salto dan menyapa anak-anak' }
];

const DURATION_OPTIONS = [
  { days: 1, label: '1 Hari (Full Event Day)', multiplier: 1.0 },
  { days: 3, label: '3 Hari (Weekend / Expo Pack)', multiplier: 2.4 }, // discount
  { days: 7, label: '7 Hari (Weekly Mall Activation)', multiplier: 4.8 },
  { days: 14, label: '14 Hari+ (Roadshow / Campaign)', multiplier: 8.5 }
];

const CITY_OPTIONS = [
  { id: 'jkt', label: 'Jabodetabek (Jakarta, BSD, Tangerang)', logistics: 1500000 },
  { id: 'sby', label: 'Surabaya & Jawa Timur', logistics: 3500000 },
  { id: 'bali', label: 'Bali (Nusa Dua, Kuta, Denpasar)', logistics: 4500000 },
  { id: 'bdg', label: 'Bandung & Jawa Barat', logistics: 2500000 },
  { id: 'outer', label: 'Luar Pulau Jawa (Medan, Makassar, Balikpapan)', logistics: 8000000 }
];

export default function RentalCalculator() {
  const [selectedRobot, setSelectedRobot] = useState(ROBOT_OPTIONS[0]);
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [selectedCity, setSelectedCity] = useState(CITY_OPTIONS[0]);
  const [customAudio, setCustomAudio] = useState(true);
  const [extraBattery, setExtraBattery] = useState(true);

  // Calculate estimated total
  const baseCost = selectedRobot.basePrice * selectedDuration.multiplier;
  const addonsCost = (customAudio ? 2500000 : 0) + (extraBattery ? 1500000 : 0);
  const totalEstimate = baseCost + selectedCity.logistics + addonsCost;

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const handleWhatsAppBooking = () => {
    playRoboticEngage();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#4f97d2', '#2f5fd8', '#ffffff'],
      disableForReducedMotion: true
    });

    const text = `Halo Robotshow Indonesia (RFI), saya ingin reservasi/konsultasi sewa robot:
- Pilihan Unit: ${selectedRobot.name}
- Durasi Event: ${selectedDuration.label}
- Lokasi Acara: ${selectedCity.label}
- Custom Musik/Jingle: ${customAudio ? 'Ya' : 'Tidak'}
- Extra Battery Hot-Swap: ${extraBattery ? 'Ya' : 'Tidak'}
- Estimasi Paket: ${formatIDR(totalEstimate)}

Mohon info ketersediaan jadwal tanggal acara dan proposal resmi. Terima kasih!`;

    window.open(waLink(text), '_blank', 'noopener');
  };

  return (
    <section id="calculator" style={{ padding: '6rem 0', background: 'rgba(5, 9, 23, 0.7)', position: 'relative' }}>
      <div className="container">
        
        {/* Section Header */}
        <div style={{ maxWidth: '800px', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Simulasi Paket &amp; Biaya Sewa Robot.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
            Dapatkan estimasi transparan dalam hitungan detik. Semua paket sudah mencakup 2 kru teknisi berlisensi, safety officer, dan asuransi panggung resmi RFI.
          </p>
        </div>

        {/* 2-Column Interactive Form */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
            gap: '2.5rem',
            alignItems: 'start'
          }}
          className="calc-grid"
        >
          {/* Controls Column */}
          <div className="cyber-card" style={{ padding: '2rem' }}>

            {/* Step 1: Select Robot */}
            <fieldset className="calc-group">
              <legend className="calc-legend">
                <Bot size={16} aria-hidden="true" />
                <span>1. Pilih robot</span>
              </legend>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {ROBOT_OPTIONS.map((opt) => (
                  <label key={opt.id} className="calc-choice">
                    <input
                      type="radio"
                      name="calc-robot"
                      value={opt.id}
                      checked={selectedRobot.id === opt.id}
                      onChange={() => {
                        playCyberClick(700, 0.03);
                        setSelectedRobot(opt);
                      }}
                      className="calc-choice-input"
                    />
                    <span className="calc-choice-body">
                      <span>
                        <span style={{ display: 'block', fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>{opt.name}</span>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{opt.desc}</span>
                      </span>
                      {selectedRobot.id === opt.id && <CheckCircle2 size={18} color="var(--accent)" aria-hidden="true" />}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Step 2: Select Duration */}
            <fieldset className="calc-group">
              <legend className="calc-legend">
                <Calendar size={16} aria-hidden="true" />
                <span>2. Durasi acara</span>
              </legend>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                {DURATION_OPTIONS.map((dur) => (
                  <label key={dur.days} className="calc-choice">
                    <input
                      type="radio"
                      name="calc-duration"
                      value={dur.days}
                      checked={selectedDuration.days === dur.days}
                      onChange={() => {
                        playCyberClick(750, 0.03);
                        setSelectedDuration(dur);
                      }}
                      className="calc-choice-input"
                    />
                    <span className="calc-choice-body calc-choice-body--compact">{dur.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Step 3: Location */}
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="calc-city" className="calc-legend">
                <MapPin size={16} aria-hidden="true" />
                <span>3. Kota acara</span>
              </label>

              <select
                id="calc-city"
                value={selectedCity.id}
                onChange={(e) => {
                  playCyberClick(700, 0.03);
                  const found = CITY_OPTIONS.find((c) => c.id === e.target.value);
                  if (found) setSelectedCity(found);
                }}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: 'rgba(14, 25, 53, 0.8)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#070d1e' }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Addons Checkboxes */}
            <fieldset className="calc-group" style={{ marginBottom: 0 }}>
              <legend className="calc-legend">
                <Sparkles size={16} aria-hidden="true" />
                <span>4. Tambahan</span>
              </legend>

              <div style={{ display: 'grid', gap: '0.65rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.65rem 0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <input
                    type="checkbox"
                    checked={customAudio}
                    onChange={(e) => setCustomAudio(e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: '#fff' }}>Custom Jingle &amp; Audio Timecode Synchronization</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.65rem 0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <input
                    type="checkbox"
                    checked={extraBattery}
                    onChange={(e) => setExtraBattery(e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: '#fff' }}>Hot-Swap Extra Battery Modules (Non-stop Full Day Show)</span>
                </label>
              </div>
            </fieldset>

          </div>

          {/* Quotation Summary Card */}
          <div
            className="cyber-card"
            style={{
              padding: '2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              background: 'rgba(255, 255, 255, 0.03)',
              position: 'sticky',
              top: '96px'
            }}
          >
            <span style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>
              Estimasi biaya paket
            </span>

            <div style={{ margin: '1rem 0 1.5rem 0' }}>
              <div style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {formatIDR(totalEstimate)}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                *Estimasi all-inclusive sudah termasuk kru &amp; logistik
              </div>
            </div>

            {/* Included in this quote */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem', fontWeight: 600 }}>
                Sudah termasuk
              </div>

              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.65rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                  <CheckCircle2 size={15} color="var(--accent)" />
                  <span>2 Certified Robot Pilots &amp; Stage Crew</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                  <CheckCircle2 size={15} color="var(--accent)" />
                  <span>On-Site Safety Officer Bersertifikat</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                  <CheckCircle2 size={15} color="var(--accent)" />
                  <span>Flight Case Transport &amp; Rehearsal Setup</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                  <CheckCircle2 size={15} color="var(--accent)" />
                  <span>Katalog Koreografi Tari &amp; Gunting Pita Digital</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
                  <CheckCircle2 size={15} color="var(--accent)" />
                  <span>Asuransi Tanggung Jawab Publik Lengkap</span>
                </li>
              </ul>
            </div>

            {/* Primary Action to WhatsApp */}
            <button
              onClick={handleWhatsAppBooking}
              className="btn-cyber-primary"
              style={{ width: '100%', padding: '1.15rem', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' }}
            >
              <MessageCircle size={20} />
              <span>Kirim Permintaan Kuotasi ke WA</span>
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
              Respons cepat via WhatsApp Business &middot; PT Robotika Futuristik Indonesia
            </p>
          </div>

        </div>

      </div>

      <style>{`
        .calc-group {
          border: 0;
          margin: 0 0 2rem;
          padding: 0;
          min-width: 0;
        }
        .calc-legend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0;
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-heading);
          margin-bottom: 0.85rem;
        }
        .calc-choice {
          position: relative;
          display: block;
          cursor: pointer;
        }
        .calc-choice-input {
          position: absolute;
          opacity: 0;
          width: 1px;
          height: 1px;
        }
        .calc-choice-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .calc-choice-body--compact {
          justify-content: center;
          text-align: center;
          padding: 0.85rem 0.65rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-body);
          min-height: 44px;
        }
        .calc-choice:hover .calc-choice-body {
          border-color: var(--border-accent);
        }
        .calc-choice-input:checked + .calc-choice-body {
          background: rgba(79, 151, 210, 0.12);
          border-color: var(--accent);
          color: #fff;
        }
        .calc-choice-input:focus-visible + .calc-choice-body {
          outline: 2px solid var(--accent);
          outline-offset: 3px;
        }
        @media (max-width: 900px) {
          .calc-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
