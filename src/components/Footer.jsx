import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowUp, Mail } from 'lucide-react';
import { waLink } from '../config/site';
import { RENTABLE, robotHref } from '../data/robots';
import { useLanguage } from '../context/LanguageContext';
import Magnetic from './Magnetic';

const footerHeadingStyle = {
  marginBottom: '1.25rem'
};

function InstagramIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Footer() {
  const { t } = useLanguage();
  const wordRef = useRef(null);

  const footerNavItems = [
    { id: 'armada', label: t.nav.armada },
    { id: 'acara', label: t.nav.acara },
    { id: 'lab', label: t.nav.lab, href: '/casting/' },
    { id: 'layanan', label: t.nav.layanan },
    { id: 'faq', label: t.nav.faq }
  ];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const split = SplitText.create(wordRef.current, { type: 'chars' });
    const tween = gsap.from(split.chars, {
      yPercent: 70,
      opacity: 0,
      duration: 1.2,
      stagger: 0.045,
      ease: 'expo.out',
      scrollTrigger: { trigger: wordRef.current, start: 'top 98%', once: true }
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, []);

  return (
    <footer
      data-bg="#F2F0EC"
      style={{
        borderTop: 'var(--hairline)',
        padding: 'clamp(5rem, 8vw, 7rem) 0 3rem 0',
        position: 'relative'
      }}
    >
      <div className="container">

        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'clamp(2.5rem, 4vw, 4rem)',
            marginBottom: '4.5rem'
          }}
          className="footer-layout"
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <img
                src="/assets/logo/rfi-mark-color.png"
                alt=""
                width="40"
                height="40"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                Robotshow<span style={{ color: 'var(--accent)' }}>.id</span>
              </span>
            </div>

            <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '420px', marginBottom: '1.75rem' }}>
              {t.footer?.desc || 'Sewa robot humanoid dan robodog AgiBot untuk event, lengkap dengan operator, pengiriman, dan pemasangan. Dikelola PT Robotika Futuristik Indonesia (RFI).'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://www.instagram.com/robotshow.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-chip"
              >
                <InstagramIcon size={16} color="var(--accent)" />
                <span>@robotshow.id</span>
              </a>

              <a
                href="mailto:info@robotshow.id"
                className="footer-chip"
              >
                <Mail size={16} color="var(--accent)" aria-hidden="true" />
                <span>info@robotshow.id</span>
              </a>
            </div>
          </div>

          {/* Col: Company */}
          <nav aria-labelledby="footer-nav-heading">
            <h2 id="footer-nav-heading" className="mono-label footer-col-title" style={footerHeadingStyle}>
              {t.footer?.company || 'Perusahaan'}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.65rem' }}>
              <li><a href="/" className="footer-link">{t.footer?.home || 'Beranda'}</a></li>
              {footerNavItems.map((item) => (
                <li key={item.id}><a href={item.href ?? `/#${item.id}`} className="footer-link">{item.label}</a></li>
              ))}
            </ul>
          </nav>

          {/* Col: Products */}
          <div>
            <h2 className="mono-label footer-col-title" style={footerHeadingStyle}>
              {t.footer?.readyRent || 'Robot siap sewa'}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.65rem' }}>
              {RENTABLE.map((model) => (
                <li key={model.id}><a href={robotHref(model)} className="footer-link">{model.name}</a></li>
              ))}
            </ul>
          </div>

          {/* Col: Booking */}
          <div>
            <h2 className="mono-label footer-col-title" style={footerHeadingStyle}>
              {t.footer?.contact || 'Hubungi Kami'}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.65rem' }}>
              <li>
                <a
                  href={waLink(t.hero.waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ color: 'var(--accent)' }}
                >
                  WhatsApp
                </a>
              </li>
              <li><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.footer?.operational || 'Operasional: Jakarta, Surabaya, dan Bali'}</span></li>
              <li><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.footer?.hours || 'Senin - Minggu: 08:00 - 22:00 WIB'}</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: 'var(--hairline)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} {t.footer?.rights || 'PT Robotika Futuristik Indonesia (RFI). Hak cipta dilindungi.'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Magnetic as="a"
              href="#top"
              aria-label={t.footer?.backToTop || 'Kembali ke atas'}
              className="footer-top"
            >
              <ArrowUp size={16} aria-hidden="true" />
            </Magnetic>
          </div>
        </div>

      </div>

      {/* The name, once, at full volume: the last thing the page says. */}
      <div ref={wordRef} className="footer-wordmark" aria-hidden="true">ROBOTSHOW</div>

      <style>{`
        .footer-wordmark {
          margin-top: clamp(2rem, 5vw, 4rem);
          /* Bookends the hero masthead: same face, navy on paper. */
          font: 400 clamp(2.6rem, 14.6vw, 15rem) / 0.8 var(--font-serif);
          letter-spacing: -0.012em;
          text-align: center;
          color: var(--rfi-navy);
          white-space: nowrap;
          overflow: hidden;
          user-select: none;
          translate: 0 0.16em;
        }
        .footer-col-title {
          color: var(--text-muted);
        }
        .footer-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.1rem;
          font-size: 0.88rem;
          color: var(--text-body);
          text-decoration: none;
          background: var(--color-white);
          border: var(--hairline);
          border-radius: var(--radius-full);
          transition: border-color 0.25s ease, color 0.25s ease;
        }
        .footer-chip:hover {
          border-color: var(--color-ink);
          color: var(--text-pure);
        }
        .footer-top {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-white);
          border: var(--hairline);
          color: var(--accent);
          transition: border-color 0.25s ease;
        }
        .footer-top:hover {
          border-color: var(--color-ink);
        }
        .footer-link {
          color: var(--text-body);
          text-decoration: none;
          font-size: 0.88rem;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: var(--accent);
        }
        @media (max-width: 860px) {
          .footer-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
