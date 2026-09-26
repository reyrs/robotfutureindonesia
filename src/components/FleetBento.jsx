import React, { useState } from 'react';
import { ArrowUpRight, Check, MessageCircle, X } from 'lucide-react';
import { FLEET_MODELS } from '../data/promptsData';
import { playCyberClick } from '../utils/cyberAudio';
import { WA_CTA_LABEL, waLink } from '../config/site';
import Modal from './Modal';

const STAGE_ACTS = [
  'Tarian panggung',
  'Sambutan VIP',
  'Gunting pita',
  'Reveal produk',
  'Sesi foto',
  'Flash mob',
  'Sinkron jingle brand'
];

function SpecList({ specs, columns }) {
  return (
    <dl className="fleet-specs" style={{ gridTemplateColumns: columns }}>
      {specs.map((spec) => (
        <div key={spec.label}>
          <dt>{spec.label}</dt>
          <dd>{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailButton({ model, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(model)}
      className="btn-cyber-outline fleet-detail-btn"
      aria-label={`Lihat detail ${model.name}`}
    >
      <span>Lihat detail</span>
      <ArrowUpRight size={14} />
    </button>
  );
}

export default function FleetBento() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [featured, ...compact] = FLEET_MODELS;

  const openModal = (model) => {
    playCyberClick(800, 0.05);
    setSelectedModel(model);
  };

  return (
    <section id="fleet" style={{ padding: '6rem 0', position: 'relative' }}>
      <div className="container">

        <div style={{ maxWidth: '850px', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
            Armada robot panggung resmi AgiBot.
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
            Dua humanoid dan satu robodog, semuanya dioperasikan langsung oleh teknisi RFI di setiap event.
          </p>
        </div>

        <div className="bento-grid fleet-grid">

          {/* Featured humanoid (2 cols x 2 rows) */}
          <article
            className="cyber-card col-span-2 row-span-2 fleet-card"
            style={{
              padding: '2rem',
              border: '1px solid rgba(79, 151, 210, 0.3)',
              background: 'linear-gradient(145deg, rgba(13, 23, 49, 0.85) 0%, rgba(4, 8, 20, 0.9) 100%)'
            }}
          >
            <div className="fleet-card-head">
              <div>
                <p className="fleet-type">{featured.type}</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{featured.name}</h3>
                <p className="fleet-summary">{featured.summary}</p>
              </div>
              <DetailButton model={featured} onOpen={openModal} />
            </div>

            <div className="fleet-featured-media">
              <img
                src={featured.image}
                alt={featured.name}
                width={featured.imageWidth}
                height={featured.imageHeight}
                loading="lazy"
                decoding="async"
              />
            </div>

            <SpecList specs={featured.specs} columns="repeat(auto-fit, minmax(130px, 1fr))" />
          </article>

          {compact.map((model) => (
            <article
              key={model.id}
              className="cyber-card col-span-1 row-span-1 fleet-card"
              style={{ padding: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div>
                <p className="fleet-type">{model.type}</p>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>{model.name}</h3>
                <p className="fleet-summary" style={{ fontSize: '0.9rem' }}>{model.summary}</p>
              </div>

              <div className="fleet-compact-media">
                <img
                  src={model.image}
                  alt={model.name}
                  width={model.imageWidth}
                  height={model.imageHeight}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <DetailButton model={model} onOpen={openModal} />
            </article>
          ))}

          {/* Stage acts (full width) */}
          <article
            className="cyber-card fleet-card"
            style={{ gridColumn: '1 / -1', padding: '1.75rem 2rem', border: '1px solid rgba(79, 151, 210, 0.2)' }}
          >
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              Koreografi tari, gunting pita, dan flash mob
            </h3>
            <ul className="fleet-acts">
              {STAGE_ACTS.map((act) => (
                <li key={act}>{act}</li>
              ))}
            </ul>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
              Gerakan dan musik bisa disesuaikan dengan jingle atau tema kampanye brand Anda.
            </p>
          </article>

        </div>
      </div>

      <Modal isOpen={Boolean(selectedModel)} onClose={() => setSelectedModel(null)} labelledBy="fleet-modal-title">
        {selectedModel && (
          <div style={{ padding: '2rem' }}>
            <div className="fleet-modal-head">
              <div>
                <p className="fleet-type">{selectedModel.type}</p>
                <h2 id="fleet-modal-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
                  {selectedModel.name}
                </h2>
              </div>
              <button type="button" onClick={() => setSelectedModel(null)} aria-label="Tutup" className="fleet-modal-close">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
              <img
                src={selectedModel.image}
                alt={selectedModel.name}
                width={selectedModel.imageWidth}
                height={selectedModel.imageHeight}
                style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
              />

              <div>
                <p style={{ color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {selectedModel.description}
                </p>

                <SpecList specs={selectedModel.specs} columns="repeat(2, minmax(0, 1fr))" />

                <h3 style={{ fontSize: '1rem', color: '#fff', margin: '1.5rem 0 0.6rem' }}>Aksi panggung</h3>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', display: 'grid', gap: '0.4rem' }}>
                  {selectedModel.acts.map((act) => (
                    <li key={act} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', color: 'var(--text-body)' }}>
                      <Check size={14} color="var(--accent)" aria-hidden="true" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={waLink(`Halo Robotshow Indonesia, saya ingin cek jadwal sewa ${selectedModel.name} untuk event.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cyber-primary"
                  style={{ width: '100%', padding: '0.9rem' }}
                  aria-label={`${WA_CTA_LABEL} ${selectedModel.name} lewat WhatsApp`}
                >
                  <MessageCircle size={18} />
                  <span>{WA_CTA_LABEL}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media (min-width: 1024px) {
          .fleet-grid {
            grid-template-rows: minmax(280px, auto) minmax(280px, auto) auto;
          }
        }
        .fleet-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 1.25rem;
        }
        .fleet-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .fleet-type {
          font-size: 0.85rem;
          color: var(--accent);
          margin-bottom: 0.25rem;
        }
        .fleet-summary {
          color: var(--text-body);
          margin-top: 0.35rem;
          max-width: 46ch;
          line-height: 1.5;
        }
        .fleet-detail-btn {
          padding: 0.55rem 1rem;
          font-size: 0.85rem;
          min-height: 44px;
          align-self: flex-start;
          white-space: nowrap;
        }
        .fleet-featured-media {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
        }
        .fleet-featured-media img {
          max-height: 440px;
          width: auto;
          height: auto;
          max-width: 100%;
          filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5));
        }
        .fleet-compact-media {
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 1;
          min-height: 150px;
          border-radius: var(--radius-md);
          background: radial-gradient(60% 70% at 50% 55%, rgba(148, 163, 184, 0.16), transparent 75%);
        }
        .fleet-compact-media img {
          max-height: 170px;
          width: auto;
          height: auto;
          max-width: 100%;
          filter: drop-shadow(0 14px 22px rgba(0, 0, 0, 0.5));
        }
        .fleet-specs {
          display: grid;
          gap: 1rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-subtle);
        }
        .fleet-specs dt {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .fleet-specs dd {
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
        }
        .fleet-acts {
          list-style: none;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0.25rem 0;
        }
        .fleet-acts li {
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          color: #fff;
        }
        .fleet-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .fleet-modal-close {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: #fff;
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}
