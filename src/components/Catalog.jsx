import React from 'react';
import { ChevronRight } from 'lucide-react';
import { robotCutout, robotHref, shortName } from '../data/robots';
import { waLink } from '../config/site';

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

export const CATALOG_CSS = `
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
