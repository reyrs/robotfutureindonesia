import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Volume2, VolumeX, Menu, X, MessageCircle } from 'lucide-react';
import { toggleSound, isSoundEnabled, playCyberClick } from '../utils/cyberAudio';
import { NAV_ITEMS, WA_CTA_LABEL, waLink } from '../config/site';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sentinelRef = useRef(null);
  const toggleRef = useRef(null);

  // Solid once the page leaves the top; hides while scrolling down, returns on the way up.
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        setScrolled(y > 40);
        setHidden(self.direction === 1 && y > 120);
      }
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const toggleButton = toggleRef.current;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        toggleButton?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const handleSoundToggle = () => {
    setSoundOn(toggleSound());
  };

  const handleNavClick = () => {
    playCyberClick(700, 0.04);
    setMobileMenuOpen(false);
    setHidden(false);
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="nav-sentinel" />

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${hidden ? ' is-hidden' : ''}`}>
        <div className="container site-header-inner">
          <a href="#top" onClick={handleNavClick} className="brand-lockup" aria-label="Robotshow.id, kembali ke atas">
            <img src="/assets/logo/rfi-mark-color.png" alt="" width="36" height="36" className="brand-mark" />
            <span className="brand-text">
              <span className="brand-name">
                Robotshow<span style={{ color: 'var(--accent)' }}>.id</span>
              </span>
              <span className="brand-sub">Robotika Futuristik Indonesia</span>
            </span>
          </a>

          <nav aria-label="Navigasi utama" className="desktop-nav">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={handleNavClick} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              onClick={handleSoundToggle}
              aria-pressed={soundOn}
              aria-label="Efek suara"
              title={soundOn ? 'Matikan efek suara' : 'Nyalakan efek suara'}
              className="icon-btn sound-toggle-desktop"
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playCyberClick(800, 0.05)}
              className="btn-cyber-primary header-cta"
              aria-label={`${WA_CTA_LABEL} lewat WhatsApp`}
            >
              <MessageCircle size={16} className="header-cta-icon" />
              <span>{WA_CTA_LABEL}</span>
            </a>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => { playCyberClick(500, 0.03); setMobileMenuOpen((open) => !open); }}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              className="icon-btn mobile-nav-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="mobile-drawer">
          <nav aria-label="Menu utama" className="mobile-drawer-nav">
            {NAV_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={handleNavClick} className="mobile-nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <button type="button" onClick={handleSoundToggle} aria-pressed={soundOn} className="mobile-sound-toggle">
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>Efek suara: {soundOn ? 'Nyala' : 'Mati'}</span>
          </button>
        </div>
      )}

      <style>{`
        .nav-sentinel {
          position: absolute;
          top: 0;
          left: 0;
          width: 1px;
          height: 40px;
          pointer-events: none;
        }
        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 0.9rem 0;
          border-bottom: 1px solid transparent;
          transform: translateY(0);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, padding 0.3s ease, border-color 0.3s ease;
          will-change: transform;
        }
        .site-header.is-hidden {
          transform: translateY(-100%);
        }
        .site-header.is-scrolled {
          padding: 0.6rem 0;
          background: rgba(3, 6, 17, 0.9);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom-color: rgba(79, 151, 210, 0.15);
        }
        .site-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .brand-lockup {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          text-decoration: none;
          min-width: 0;
        }
        .brand-mark {
          width: 36px;
          height: 36px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .brand-name {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-pure);
          letter-spacing: -0.02em;
          line-height: 1.2;
          white-space: nowrap;
        }
        .brand-sub {
          font-size: 0.7rem;
          color: var(--text-body);
          white-space: nowrap;
        }
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 1.75rem;
        }
        .nav-link {
          color: var(--text-body);
          font-size: 0.92rem;
          font-weight: 500;
          text-decoration: none;
          padding: 0.5rem 0.25rem;
          white-space: nowrap;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: var(--accent);
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }
        .icon-btn {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-heading);
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .icon-btn[aria-pressed='true'] {
          background: rgba(79, 151, 210, 0.12);
          border-color: var(--border-accent);
          color: var(--accent);
        }
        .header-cta {
          padding: 0.6rem 1.1rem;
          font-size: 0.88rem;
          white-space: nowrap;
          min-height: 44px;
        }
        .mobile-drawer {
          position: fixed;
          inset: 0;
          z-index: 99;
          background: rgba(3, 6, 17, 0.97);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          padding: 6rem 2rem 2rem;
        }
        .mobile-drawer-nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .mobile-nav-link {
          color: var(--text-heading);
          font-size: 1.35rem;
          font-weight: 600;
          text-decoration: none;
          padding: 0.6rem 1rem;
        }
        .mobile-nav-link:hover {
          color: var(--accent);
        }
        .mobile-sound-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          min-height: 44px;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-body);
          font-family: var(--font-display);
          font-size: 0.95rem;
          cursor: pointer;
        }
        @media (min-width: 1024px) {
          .desktop-nav { display: flex; }
          .mobile-nav-toggle { display: none; }
          .mobile-drawer { display: none; }
        }
        @media (max-width: 1023px) {
          .sound-toggle-desktop { display: none; }
        }
        @media (max-width: 639px) {
          .brand-sub { display: none; }
          .brand-mark { width: 32px; height: 32px; }
          .brand-name { font-size: 1.1rem; }
          .header-cta { padding: 0.55rem 0.95rem; font-size: 0.85rem; }
          .header-cta-icon { display: none; }
        }
      `}</style>
    </>
  );
}
