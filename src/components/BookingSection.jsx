import React, { useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ROBOTS, robotCutout, shortName } from '../data/robots';
import { TALENT } from '../data/talent';
import { waLink } from '../config/site';
import { useScrollMotion } from '../utils/motion';
import { useShots } from '../utils/shots';
import { useLanguage } from '../context/LanguageContext';

// Booking as a call sheet: pick the talent, date, city and kind of event, and the sheet becomes
// a WhatsApp message. Photos the visitor took in the hero are pinned to it; before any, the
// chosen talent's portraits are. Rows print in one after another as the sheet scrolls in.

const LOCALE = { id: 'id-ID', en: 'en-GB', zh: 'zh-CN' };
const CITIES = ['Jakarta', 'Surabaya', 'Bali']; // where RFI operates (footer)
const robotOf = (id) => ROBOTS.find((r) => r.id === id);
const OTHERS = ROBOTS.filter((r) => !r.rent); // the rest of the AgiBot line-up, on request
const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const STYLES = `
.booking {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 600px);
  gap: clamp(40px, 6vw, 120px);
  align-items: start;
  padding: calc(76px + 10svh) var(--pad-x) 14svh;
  background:
    radial-gradient(90% 70% at 70% 30%, color-mix(in oklab, var(--rfi-blue) 86%, white) 0%, var(--rfi-blue) 55%, color-mix(in oklab, var(--rfi-blue) 80%, black) 100%);
  color: var(--rfi-paper);
}
.booking-intro { position: sticky; top: calc(76px + 6svh); }
.booking-intro h2 {
  margin: 0 0 0.35em;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(48px, 6.2vw, 112px);
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: inherit;
}
.booking-sub { margin: 0 0 48px; max-width: 34ch; font-size: clamp(16px, 1.2vw, 19px); line-height: 1.55; color: rgba(242, 240, 236, 0.86); }
.booking-steps { margin: 0; padding: 0; list-style: none; counter-reset: step; max-width: 440px; }
.booking-steps li { counter-increment: step; display: grid; grid-template-columns: 40px 1fr; gap: 4px 12px; padding: 16px 0; border-top: 1px solid rgba(242, 240, 236, 0.22); }
.booking-steps li::before { content: counter(step); grid-row: span 2; font-family: var(--font-display); font-size: 15px; font-weight: 600; line-height: 1.5; opacity: 0.7; }
.booking-steps strong { font-weight: 600; font-size: 16px; }
.booking-steps span { font-size: 14px; line-height: 1.5; color: rgba(242, 240, 236, 0.76); }
.booking-others { margin: 28px 0 0; max-width: 440px; font-size: 14px; line-height: 1.6; color: rgba(242, 240, 236, 0.8); }
.booking-others a { color: var(--rfi-paper); font-weight: 600; text-underline-offset: 3px; }

.sheet {
  position: relative;
  padding: clamp(24px, 3vw, 44px);
  background: #f7f5f0;
  color: var(--rfi-navy);
  rotate: -1.2deg;
  box-shadow: 0 50px 90px -40px rgba(4, 10, 30, 0.75), 0 2px 8px rgba(4, 10, 30, 0.2);
}
.sheet-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding-bottom: 18px; border-bottom: 2px solid var(--rfi-navy); }
.sheet-head h3 { margin: 0; font-family: var(--font-serif); font-style: italic; font-weight: 400; font-size: clamp(30px, 2.6vw, 42px); letter-spacing: 0; color: inherit; }
.sheet-head p { margin: 0; font-size: 13px; color: rgba(11, 21, 51, 0.62); text-align: right; }
.sheet-pins { position: absolute; top: -34px; right: 28px; display: flex; pointer-events: none; }
.sheet-pin {
  width: clamp(84px, 7vw, 112px);
  aspect-ratio: 4 / 3;
  margin-left: -26px;
  padding: 4px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(4, 10, 30, 0.28);
  background-clip: content-box;
  background-repeat: no-repeat;
}
.sheet-pin:nth-child(1) { rotate: -6deg; }
.sheet-pin:nth-child(2) { rotate: 3deg; translate: 0 6px; }
.sheet-pin:nth-child(3) { rotate: 8deg; }
.sheet-row { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 16px; align-items: start; padding: 18px 0; border-bottom: 1px solid rgba(11, 21, 51, 0.14); margin: 0; min-width: 0; }
.sheet-row legend, .sheet-label { padding: 0; font-size: 13px; font-weight: 600; line-height: 2.6; color: rgba(11, 21, 51, 0.7); }
.sheet-row legend { float: left; width: 132px; margin-right: 16px; }
fieldset.sheet-row { display: block; border: 0; border-bottom: 1px solid rgba(11, 21, 51, 0.14); }
fieldset.sheet-row::after { content: ''; display: block; clear: both; }
.sheet-chips { display: flex; flex-wrap: wrap; gap: 8px; overflow: hidden; }
.sheet-chip { position: relative; }
.sheet-chip input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.sheet-chip span {
  display: inline-block;
  padding: 9px 14px;
  border: 1px solid rgba(11, 21, 51, 0.28);
  border-radius: 999px;
  font-size: 14px;
  line-height: 1;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.sheet-chip input:checked + span { background: var(--rfi-navy); border-color: var(--rfi-navy); color: var(--rfi-paper); }
.sheet-chip input:focus-visible + span { outline: 2px solid var(--rfi-blue); outline-offset: 2px; }
.sheet-chip:hover span { border-color: var(--rfi-navy); }
.sheet-field {
  width: 100%;
  min-width: 0;
  padding: 8px 0;
  border: 0;
  border-bottom: 1px solid rgba(11, 21, 51, 0.35);
  border-radius: 0;
  background: transparent;
  color: var(--rfi-navy);
  font: 400 16px/1.4 var(--font-display);
}
.sheet-field:focus { outline: none; border-bottom-color: var(--rfi-blue); box-shadow: 0 1px 0 var(--rfi-blue); }
textarea.sheet-field { resize: vertical; min-height: 64px; }
.sheet-field::placeholder { color: rgba(11, 21, 51, 0.45); }
/* No transform transition here: it fights the scroll reveal's transform tween and the button
   stayed 60px down, hanging off the sheet. */
.sheet-send { width: 100%; margin-top: 28px; transition-property: background-color, color, border-color; }

@media (max-width: 1023px) {
  .booking { grid-template-columns: 1fr; padding: calc(76px + 6svh) 20px 10svh; gap: 56px; }
  .booking-intro { position: static; }
  .booking-sub { margin-bottom: 28px; }
  .sheet { rotate: none; padding: 24px 18px; }
  .sheet-pins { right: 12px; top: -26px; }
  .sheet-row { grid-template-columns: 1fr; gap: 6px; }
  .sheet-row legend { float: none; width: auto; margin: 0 0 6px; line-height: 1.4; }
  .sheet-label { line-height: 1.4; }
}
`;

export default function BookingSection() {
  const { t, lang } = useLanguage();
  const b = t.booking;
  const sectionRef = useRef(null);
  useScrollMotion(sectionRef);
  const shots = useShots();
  const [talent, setTalent] = useState(['x2-ultra']);
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState(-1);
  const [notes, setNotes] = useState('');

  const chosen = TALENT.filter((item) => talent.includes(item.id));
  const when = date ? new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: 'long' }).format(new Date(`${date}T00:00`)) : b.pending;
  const message = b.message({
    talent: chosen.map((item) => shortName(robotOf(item.id).name)).join(', ') || b.pending,
    date: when,
    city: city.trim() || b.pending,
    type: type < 0 ? b.pending : b.types[type],
    notes: notes.trim()
  });
  // The visitor's own shots from the hero; before any, portraits of the chosen talent.
  const pins = shots.length
    ? shots.slice(-3).map((pose) => ({ backgroundImage: `url(/assets/studio/${pose}.webp)`, backgroundSize: 'cover', backgroundPosition: '60% 42%' }))
    : chosen.slice(0, 3).map((item) => ({ backgroundColor: item.bg, backgroundImage: `url(${robotCutout(robotOf(item.id))})`, backgroundSize: item.photo[0], backgroundPosition: item.photo[1] }));

  const toggle = (id) => setTalent((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const send = (e) => {
    e.preventDefault();
    window.open(waLink(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="layanan" ref={sectionRef} className="booking" aria-labelledby="booking-title" data-bg="#2F5FD8">
      <div className="booking-intro">
        <h2 id="booking-title" data-split>{b.title}</h2>
        <p className="booking-sub" data-reveal>{b.sub}</p>
        <ol className="booking-steps" data-stagger>
          {t.service.steps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
        <p className="booking-others" data-reveal>
          {b.others(OTHERS.map((r) => shortName(r.name)).join(', '))}{' '}
          <a href={waLink(b.othersMessage)} target="_blank" rel="noopener noreferrer">{b.othersLink}</a>
        </p>
      </div>

      <form className="sheet" onSubmit={send} aria-labelledby="sheet-title">
        {pins.length > 0 && (
          <div className="sheet-pins" aria-label={shots.length ? b.shots : b.portraits} role="img">
            {pins.map((style, i) => (
              <span key={i} className="sheet-pin" style={style} />
            ))}
          </div>
        )}
        <div data-stagger>
          <div className="sheet-head">
            <h3 id="sheet-title">{b.sheet}</h3>
            <p>
              Robotshow · {new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: 'medium' }).format(new Date())}
            </p>
          </div>
          <fieldset className="sheet-row">
            <legend>{b.talent}</legend>
            <div className="sheet-chips">
              {TALENT.map((item) => (
                <label key={item.id} className="sheet-chip">
                  <input type="checkbox" checked={talent.includes(item.id)} onChange={() => toggle(item.id)} />
                  <span>{shortName(robotOf(item.id).name)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sheet-row">
            <label className="sheet-label" htmlFor="sheet-date">{b.date}</label>
            <input id="sheet-date" className="sheet-field" type="date" min={localDay()} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="sheet-row">
            <label className="sheet-label" htmlFor="sheet-city">{b.city}</label>
            <input id="sheet-city" className="sheet-field" type="text" list="sheet-cities" placeholder={b.cityHint} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
            <datalist id="sheet-cities">
              {CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <fieldset className="sheet-row">
            <legend>{b.type}</legend>
            <div className="sheet-chips">
              {b.types.map((label, i) => (
                <label key={label} className="sheet-chip">
                  <input type="radio" name="sheet-type" checked={type === i} onChange={() => setType(i)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sheet-row">
            <label className="sheet-label" htmlFor="sheet-notes">{b.notes}</label>
            <textarea id="sheet-notes" className="sheet-field" rows="2" placeholder={b.notesHint} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button type="submit" className="btn-cyber-primary sheet-send">
            <MessageCircle size={18} aria-hidden="true" />
            <span>{b.send}</span>
          </button>
        </div>
      </form>
      <style>{STYLES}</style>
    </section>
  );
}
