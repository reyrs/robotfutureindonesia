import { ArrowUp, Mail } from 'lucide-react';
import { playCyberClick } from '../utils/cyberAudio';
import { NAV_ITEMS, waLink } from '../config/site';
import { FLEET_MODELS } from '../data/promptsData';

const footerHeadingStyle = {
  fontSize: '0.9rem',
  color: '#fff',
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
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

export default function Footer() {
  return (
    <footer
      style={{
        background: '#02040a',
        borderTop: '1px solid var(--border-subtle)',
        padding: '5rem 0 3rem 0',
        position: 'relative'
      }}
    >
      <div className="container">
        
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) repeat(auto-fit, minmax(160px, 1fr))',
            gap: '3.5rem',
            marginBottom: '4rem'
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
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
                Robotshow<span style={{ color: 'var(--accent)' }}>.id</span>
              </span>
            </div>

            <p style={{ color: 'var(--text-body)', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '420px', marginBottom: '1.75rem' }}>
              Sewa robot humanoid dan robodog AgiBot untuk event, lengkap dengan kru dan asuransi. Dikelola PT Robotika Futuristik Indonesia (RFI).
            </p>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <a
                href="https://www.instagram.com/robotshow.id/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-body)',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <InstagramIcon size={16} color="var(--accent)" />
                <span>@robotshow.id</span>
              </a>

              <a
                href="mailto:info@robotshow.id"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-body)',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <Mail size={16} color="var(--accent)" aria-hidden="true" />
                <span>info@robotshow.id</span>
              </a>
            </div>
          </div>

          {/* Col: Company */}
          <nav aria-labelledby="footer-nav-heading">
            <h2 id="footer-nav-heading" style={footerHeadingStyle}>
              Perusahaan
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.65rem' }}>
              <li><a href="#top" className="footer-link">Beranda</a></li>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}><a href={`#${item.id}`} className="footer-link">{item.label}</a></li>
              ))}
            </ul>
          </nav>

          {/* Col: Products */}
          <div>
            <h2 style={footerHeadingStyle}>
              Armada Robot
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.65rem' }}>
              {FLEET_MODELS.map((model) => (
                <li key={model.id}><a href="#armada" className="footer-link">{model.name}</a></li>
              ))}
            </ul>
          </div>

          {/* Col: Booking */}
          <div>
            <h2 style={footerHeadingStyle}>
              Hubungi Kami
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.65rem' }}>
              <li>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ color: 'var(--accent)' }}
                >
                  WhatsApp
                </a>
              </li>
              <li><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Operasional: Jakarta &middot; Surabaya &middot; Bali</span></li>
              <li><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Senin - Minggu: 08:00 - 22:00 WIB</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
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
            &copy; {new Date().getFullYear()} PT Robotika Futuristik Indonesia (RFI).
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a
              href="#top"
              onClick={() => playCyberClick(800, 0.04)}
              aria-label="Kembali ke atas"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowUp size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

      </div>

      <style>{`
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
