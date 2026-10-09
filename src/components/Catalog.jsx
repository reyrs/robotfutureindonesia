import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { SERIES, ROBOTS, robotImage, robotCutout, robotHref, shortName } from '../data/robots';
import { waLink } from '../config/site';
import { useScrollMotion } from '../utils/motion';
import Magnetic from './Magnetic';

const askMessage = (robot) => `Halo Robotshow Indonesia, apakah ${robot.name} bisa disewa untuk event saya?`;

// One product tile, as on store.agibot.com: rentable units open their page, the rest ask on WhatsApp.
export function RobotTile({ robot, badge = true }) {
  const external = !robot.rent;
  return (
    <li className="tile">
      <a
        href={robot.rent ? robotHref(robot) : waLink(askMessage(robot))}
        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        <div className="tile-media">
          <img src={robotCutout(robot)} alt={robot.name} width="1100" height="1100" loading="lazy" decoding="async" />
          {robot.rent && badge && <span className="tile-badge">Siap disewa</span>}
        </div>
        <h3 className="tile-name">{shortName(robot.name)}</h3>
        <p className="tile-line">{robot.tagline}</p>
        <span className="tile-link">
          {robot.rent ? 'Lihat detail' : 'Tanya ketersediaan'}
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      </a>
    </li>
  );
}

export function RobotGrid({ robots }) {
  // A grid of nothing but rentable units says so in its heading; the badge would just repeat it.
  const badge = robots.some((robot) => !robot.rent);
  return (
    <ul className={`tile-grid${robots.length <= 2 ? ' is-wide' : ''}`} data-stagger style={{ '--cols': Math.min(robots.length, 4) }}>
      {robots.map((robot) => <RobotTile key={robot.id} robot={robot} badge={badge} />)}
    </ul>
  );
}

// `after` places extra bands right after a series, e.g. { x: <LabSection /> }.
export default function Catalog({ after = {} }) {
  const ref = useRef(null);
  useScrollMotion(ref);

  return (
    <div ref={ref} id="robot">
      <section className="catalog-intro container" aria-labelledby="catalog-title">
        <h2 id="catalog-title" className="catalog-title" data-reveal>Pilih robot untuk acara Anda.</h2>
        <p className="catalog-lead" data-reveal>Lima unit AgiBot siap disewa lengkap dengan operator. Unit lain dari lini AgiBot bisa ditanyakan ketersediaannya.</p>
        <nav className="series-strip" aria-label="Seri robot" data-stagger>
          {SERIES.map((series) => {
            const lead = ROBOTS.find((r) => r.series === series.id);
            return (
              <Magnetic as="a" key={series.id} href={`#seri-${series.id}`}>
                <img src={robotImage(lead)} alt="" width="1100" height="1100" loading="lazy" decoding="async" />
                <span>{series.name}</span>
              </Magnetic>
            );
          })}
        </nav>
      </section>

      {SERIES.map((series) => (
        <React.Fragment key={series.id}>
          <section id={`seri-${series.id}`} className="series" aria-labelledby={`seri-${series.id}-title`}>
            <div className="series-banner duotone" data-spotlight>
              <picture>
                <source media="(max-width: 767px)" srcSet={`/assets/agibot/${series.banner}-m.webp`} />
                <img src={`/assets/agibot/${series.banner}.webp`} alt="" loading="lazy" decoding="async" data-parallax="6" />
              </picture>
              <div className="container series-copy">
                <h2 id={`seri-${series.id}-title`} data-drift>{series.name}</h2>
                <p data-reveal>{series.text}</p>
              </div>
            </div>
            <div className="container">
              <RobotGrid robots={ROBOTS.filter((r) => r.series === series.id)} />
            </div>
          </section>
          {after[series.id]}
        </React.Fragment>
      ))}
      <style>{CATALOG_CSS}</style>
    </div>
  );
}

export const CATALOG_CSS = `
  .catalog-intro {
    padding-top: 6rem;
    padding-bottom: 3rem;
  }
  .catalog-title {
    font-size: clamp(2.2rem, 4.6vw, 3.8rem);
    letter-spacing: -0.04em;
    line-height: 1.02;
    color: var(--text-pure);
    max-width: 16ch;
  }
  .catalog-lead {
    max-width: 52ch;
    margin-top: 1rem;
    font-size: 1.08rem;
  }
  .series-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 3rem;
    border-top: 1px solid var(--border-subtle);
    padding-top: 1.5rem;
  }
  .series-strip a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: var(--radius-md);
    color: var(--text-heading);
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }
  .series-strip img {
    width: 96px;
    height: 96px;
    padding: 6px;
    object-fit: contain;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-md);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease;
  }
  .series-strip a:hover {
    background: transparent;
  }
  .series-strip a:hover img {
    transform: translateY(-6px) scale(1.06);
    background: rgba(255, 255, 255, 0.05);
  }

  .series {
    padding-bottom: 5rem;
  }
  /* Cinematic Hardware: dark void, seamless fade, and high-end reflections */
  .duotone {
    background: var(--bg-void, #050505);
  }
  .duotone img {
    mix-blend-mode: plus-lighter;
    opacity: 0.9;
  }
  .series-banner {
    position: relative;
    height: clamp(420px, 40vw, 620px);
    overflow: hidden;
    display: flex;
    align-items: center;
    color: #fff;
  }
  .series-banner img {
    position: absolute;
    left: 0;
    top: -10%;
    width: 100%;
    height: 120%;
    object-fit: cover;
    will-change: transform;
  }
  .series-banner::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, var(--bg-void, #050505) 0%, rgba(5,5,5,0.8) 35%, transparent 100%),
                linear-gradient(0deg, var(--bg-void, #050505) 0%, transparent 20%);
  }
  .series-copy {
    position: relative;
    z-index: 1;
  }
  .series-copy h2 {
    font-size: clamp(3.4rem, 11vw, 10rem);
    font-weight: 800;
    letter-spacing: -0.055em;
    line-height: 0.9;
    white-space: nowrap;
    color: #fff;
  }
  .series-copy p {
    max-width: 38ch;
    margin-top: 1rem;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .tile-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    gap: 1.25rem;
    margin-top: 2rem;
  }
  .tile a {
    display: block;
    color: inherit;
    text-decoration: none;
  }
  .tile-media {
    position: relative;
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid rgba(255,255,255,0.04);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
    overflow: hidden;
  }
  /* Two-robot rows get landscape tiles so they don't tower over the four-up rows. */
  .tile-grid.is-wide .tile-media {
    aspect-ratio: 16 / 10;
  }
  .tile-media img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .tile a:hover .tile-media img {
    transform: scale(1.06) translateY(-2%);
  }
  .tile-badge {
    position: absolute;
    top: 0.9rem;
    left: 0.9rem;
    padding: 0.3rem 0.7rem;
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: var(--text-pure);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .tile-name {
    margin-top: 1rem;
    font-size: 1.2rem;
    color: var(--text-pure);
  }
  .tile-line {
    margin-top: 0.2rem;
    font-size: 0.95rem;
  }
  .tile-link {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    margin-top: 0.6rem;
    min-height: 32px;
    color: var(--accent-strong);
    font-weight: 600;
    font-size: 0.95rem;
  }
  .tile-link svg {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .tile a:hover .tile-link svg {
    transform: translateX(4px);
  }

  @media (max-width: 767px) {
    .catalog-intro {
      padding-top: 4.5rem;
    }
    .series-strip {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
    .series-strip img {
      width: 64px;
      height: 64px;
    }
    .series {
      padding-bottom: 3.5rem;
    }
    .series-banner {
      height: min(115vw, 520px);
      align-items: flex-end;
      padding-bottom: 2.5rem;
    }
    .series-banner::after {
      background: linear-gradient(0deg, rgba(12, 14, 19, 0.55) 0%, transparent 60%);
    }
    .tile-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem 0.75rem;
    }
    .tile-name {
      font-size: 1.05rem;
    }
    .tile-line {
      font-size: 0.85rem;
    }
  }
`;
