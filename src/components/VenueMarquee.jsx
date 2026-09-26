import React from 'react';
import { Building2, ShoppingBag, FerrisWheel, Sparkles, Compass, Landmark } from 'lucide-react';

const VENUES = [
  { icon: Building2, label: 'Exhibitions & Tech Summits' },
  { icon: ShoppingBag, label: 'Flagship Shopping Malls' },
  { icon: FerrisWheel, label: 'Theme Parks & Family Attractions' },
  { icon: Sparkles, label: 'Luxury Brand Activations' },
  { icon: Compass, label: 'Tourism & Experiential Galas' },
  { icon: Landmark, label: 'Museums & Cultural Pavilions' }
];

export default function VenueMarquee() {
  return (
    <section style={{ padding: '2.5rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(7, 13, 30, 0.4)' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Dipercaya untuk berbagai panggung dan aktivasi berskala nasional
        </p>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-content">
          {[...VENUES, ...VENUES, ...VENUES, ...VENUES].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="marquee-item">
                <Icon size={16} color="var(--accent)" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
