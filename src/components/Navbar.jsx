import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X, MessageCircle } from 'lucide-react';
import { waLink } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import Magnetic from './Magnetic';

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const { lang, setLang, t, languages } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sentinelRef = useRef(null);
  const toggleRef = useRef(null);

  const navItems = [
    { id: 'armada', label: t.nav.armada },
    { id: 'acara', label: t.nav.acara },
    { id: 'lab', label: t.nav.lab, href: '/casting/' }, // its own page: the 3D model is too heavy for the home page
    { id: 'layanan', label: t.nav.layanan },
    { id: 'faq', label: t.nav.faq }
  ];

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

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    setHidden(false);
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="nav-sentinel" />

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${hidden ? ' is-hidden' : ''}`}>
        <div className="container site-header-inner">
          <a href="/" onClick={handleNavClick} className="brand-lockup" aria-label={t.nav.homeLabel}>
            <img src="/assets/logo/rfi-mark-color.png" alt="" width="36" height="36" className="brand-mark" />
            <span className="brand-text">
              <span className="brand-name">
                Robotshow<span className="brand-tld">.id</span>
              </span>
            </span>
          </a>

          <nav aria-label="Navigasi utama" className="desktop-nav">
            {navItems.map((item) => (
              <a key={item.id} href={item.href ?? `/#${item.id}`} onClick={handleNavClick} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <div className="lang-switcher" role="group" aria-label={t.nav.switchLang}>
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`lang-btn ${lang === l.code ? 'is-active' : ''}`}
                  aria-pressed={lang === l.code}
                  title={l.name}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <Magnetic
              as="a"
              href={waLink(t.hero.waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber-primary header-cta"
              aria-label={`${t.nav.cta}, ${t.hero.viaWa}`}
            >
              <MessageCircle size={16} className="header-cta-icon" />
              <span>{t.nav.cta}</span>
            </Magnetic>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? t.nav.menuClose : t.nav.menuOpen}
              className="icon-btn mobile-nav-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="mobile-drawer">
          <div className="lang-switcher mobile-lang-switcher" role="group" aria-label={t.nav.switchLang}>
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`lang-btn ${lang === l.code ? 'is-active' : ''}`}
                aria-pressed={lang === l.code}
                title={l.name}
              >
                <span className="lang-flag">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>

          <nav aria-label="Menu utama" className="mobile-drawer-nav">
            {navItems.map((item) => (
              <a key={item.id} href={item.href ?? `/#${item.id}`} onClick={handleNavClick} className="mobile-nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <Magnetic
            as="a"
            href={waLink(t.hero.waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyber-primary mobile-cta"
            onClick={handleNavClick}
          >
            <MessageCircle size={18} />
            <span>{t.nav.cta}</span>
          </Magnetic>
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
          background-color: transparent;
          transform: translateY(0);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, padding 0.3s ease, border-color 0.3s ease;
          will-change: transform;
        }
        .site-header.is-hidden {
          transform: translateY(-100%);
        }
        .site-header.is-scrolled {
          padding: 0.6rem 0;
          background-color: rgba(11, 21, 51, 0.86);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom-color: rgba(242, 240, 236, 0.08);
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
          /* The colour mark vanishes on RFI blue: render it as a paper-white silhouette. */
          filter: brightness(0) invert(0.95);
        }
        .brand-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .brand-name {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--rfi-paper);
          letter-spacing: -0.02em;
          line-height: 1.2;
          white-space: nowrap;
        }
        .brand-tld { color: rgba(242, 240, 236, 0.6); }
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 1.75rem;
        }
        .nav-link {
          color: rgba(242, 240, 236, 0.82);
          font-size: 0.92rem;
          font-weight: 500;
          text-decoration: none;
          padding: 0.5rem 0.25rem;
          white-space: nowrap;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: var(--rfi-paper);
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
          background: rgba(242, 240, 236, 0.08);
          border: 1px solid rgba(242, 240, 236, 0.22);
          color: var(--rfi-paper);
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
        .icon-btn[aria-pressed='true'] {
          background: rgba(242, 240, 236, 0.16);
          border-color: var(--rfi-paper);
        }
        .header-cta {
          padding: 0.6rem 1.1rem;
          font-size: 0.88rem;
          white-space: nowrap;
          min-height: 44px;
          background: var(--rfi-paper);
          border-color: var(--rfi-paper);
          color: var(--rfi-navy);
          transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .header-cta:hover {
          background: #fcfbf9;
          border-color: #fcfbf9;
          color: var(--rfi-navy);
        }
        /* The hero carries the same action; the header only offers it once the hero is gone. */
        body:has(.hero) .site-header:not(.is-scrolled) .header-cta {
          opacity: 0;
          visibility: hidden;
        }
        .mobile-drawer {
          position: fixed;
          inset: 0;
          z-index: 99;
          background: var(--rfi-navy);
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
          color: var(--rfi-paper);
          font-size: 1.35rem;
          font-weight: 600;
          text-decoration: none;
          padding: 0.6rem 1rem;
        }
        .mobile-nav-link:hover {
          color: var(--rfi-titanium);
        }
        .lang-switcher {
          display: inline-flex;
          align-items: center;
          background: rgba(242, 240, 236, 0.08);
          border: 1px solid rgba(242, 240, 236, 0.2);
          border-radius: var(--radius-full, 9999px);
          padding: 3px;
          gap: 2px;
          backdrop-filter: blur(10px);
        }
        .lang-btn {
          background: transparent;
          border: none;
          color: rgba(242, 240, 236, 0.75);
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 0.28rem 0.65rem;
          border-radius: var(--radius-full, 9999px);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          line-height: 1;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .lang-btn:hover {
          color: var(--rfi-paper);
          background: rgba(242, 240, 236, 0.1);
        }
        .lang-btn.is-active {
          background: var(--rfi-paper);
          color: var(--rfi-navy);
          font-weight: 700;
        }
        .mobile-lang-switcher {
          padding: 5px;
          gap: 6px;
          margin-bottom: 0.5rem;
        }
        .mobile-lang-switcher .lang-btn {
          font-size: 0.95rem;
          padding: 0.55rem 1.1rem;
        }
        .lang-flag {
          font-size: 1.05rem;
          line-height: 1;
        }
        .mobile-cta {
          margin-top: 1rem;
          padding: 0.75rem 2rem;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (min-width: 1024px) {
          .desktop-nav { display: flex; }
          .mobile-nav-toggle { display: none; }
          .mobile-drawer { display: none; }
        }
        @media (max-width: 1023px) {
        }
        @media (max-width: 639px) {
          .brand-mark { width: 32px; height: 32px; }
          .brand-name { font-size: 1.05rem; }
          .lang-switcher:not(.mobile-lang-switcher) { display: none; }
          /* No room beside the mark and menu: the drawer and the hero carry the action. */
          .header-cta { display: none; }
        }
      `}</style>
    </>
  );
}
