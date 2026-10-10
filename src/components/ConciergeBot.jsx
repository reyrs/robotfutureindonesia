import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MessageSquare, X, Send, RotateCcw, ArrowUpRight, Box } from 'lucide-react';
import { ROBOTS, robotHref } from '../data/robots';
import { waLink } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import Magnetic from './Magnetic';

// Luxury Editorial Event Concierge for Robotshow.id.
// Grounded domain consultation for AgiBot fleet riders, technical kinematics,
// stage safety protocols, custom music choreography, and 3D simulation.
// Quiet luxury aesthetic — zero neon glow, zero sci-fi clichés, zero AI slop.

const CONCIERGE_KNOWLEDGE = {
  id: {
    welcome: 'Halo, selamat datang di Robotshow Indonesia. Saya Concierge Armada RFI. Bagaimana kami dapat membantu persiapan panggung atau event Anda hari ini?',
    chips: [
      { id: 'recommend', label: 'Rekomendasi model robot' },
      { id: 'compare', label: 'Bandingkan X2 vs A2' },
      { id: 'pricing', label: 'Estimasi harga sewa & logistik' },
      { id: 'dance', label: 'Koreografi musik brand' },
      { id: 'lab', label: 'Coba 3D Casting Room' }
    ],
    replies: {
      recommend: {
        text: 'Untuk kebutuhan event, armada resmi kami siap tampil di seluruh kota:\n\n• **AgiBot X2 Ultra (131 cm):** Pilihan utama untuk tarian panggung sinkron, atraksi energik, dan gunting pita VIP.\n• **AgiBot A2 Ultra (169 cm):** Humanoid setinggi orang dewasa dengan postur berwibawa, ideal untuk keynote peluncuran produk.\n• **AgiBot D1 Pro:** Robodog lincah untuk interaksi pengunjung dan daya tarik visual mall/expo.',
        card: 'x2-ultra'
      },
      compare: {
        text: 'Perbandingan Seri X2 vs A2:\n\n• **X2 Ultra (Kompak & Lincah):** Tinggi 131 cm, berat 39 kg, 30 DoF, kecepatan 1,8 m/s. Keunggulannya adalah kelenturan gerak tari dan manuver panggung cepat.\n\n• **A2 Ultra (Skala Dewasa):** Tinggi 169 cm, berat 69 kg, torsi lutut 270 N·m. Keunggulannya adalah skala tubuh setinggi manusia dewasa yang prestisius untuk menyambut tamu VIP dan presentasi brand.',
        card: 'a2-ultra'
      },
      pricing: {
        text: 'Biaya sewa disesuaikan dengan:\n— Durasi acara (setengah hari, full-day, atau roadshow).\n— Jumlah unit dan model robot yang dipilih.\n— Kebutuhan koreografi tarian kustom.\n— Kota tujuan (unit dikirim dengan flight case pelindung).\n\nSetiap sewa **sudah termasuk tim operator bersertifikasi di lokasi** untuk mengoperasikan unit dan menjaga keamanan penuh.',
        waAction: 'Halo Robotshow Indonesia, boleh minta informasi paket sewa robot dan daftar harga untuk event saya?'
      },
      dance: {
        text: 'Ya, robot humanoid kami dapat diprogram menari mengikuti lagu tema, jingle brand, atau musik pengiring acara Anda. Koreografi disiapkan 7–14 hari sebelum hari H agar sesi rehearsal di studio berjalan sempurna.',
        card: 'x2-ultra'
      },
      lab: {
        text: 'Anda dapat menguji gerakan persendian 30 DoF, pose tarian (wave, cheer, point), dan ekspresi LED mata AgiBot X2 Ultra di simulator 3D interaktif kami.',
        labLink: true
      },
      safety: {
        text: 'Keamanan penonton adalah prioritas utama. Setiap unit selalu didampingi operator bersertifikasi yang memegang wireless emergency kill switch dengan batas perimeter panggung yang terkontrol.'
      },
      fallback: {
        text: 'Terima kasih atas pesan Anda. Untuk jadwal ketersediaan unit dan proposal teknis resmi, Anda dapat langsung terhubung dengan tim manajemen kami melalui WhatsApp.'
      }
    }
  },
  en: {
    welcome: 'Hello and welcome to Robotshow Indonesia. I am the RFI Fleet Concierge. How may we assist your upcoming event or stage production?',
    chips: [
      { id: 'recommend', label: 'Model recommendations' },
      { id: 'compare', label: 'Compare X2 vs A2 series' },
      { id: 'pricing', label: 'Rental pricing & logistics' },
      { id: 'dance', label: 'Custom brand choreography' },
      { id: 'lab', label: 'Open 3D Casting Room' }
    ],
    replies: {
      recommend: {
        text: 'For live events, our certified AgiBot fleet is available nationwide:\n\n• **AgiBot X2 Ultra (131 cm):** The premier performer for synchronized stage choreography, ribbon cuttings, and media shoots.\n• **AgiBot A2 Ultra (169 cm):** Full adult-height humanoid offering commanding presence for keynote speeches and brand reveals.\n• **AgiBot D1 Pro:** Agile robodog quadruped delivering dynamic motion and high audience engagement.',
        card: 'x2-ultra'
      },
      compare: {
        text: 'Series Comparison: X2 vs. A2:\n\n• **X2 Ultra (Agile Performer):** 131 cm, 39 kg, 30 DoF, 1.8 m/s speed. Engineered for expressive choreography and rapid stage movement.\n\n• **A2 Ultra (Human Scale):** 169 cm, 69 kg, 270 N·m knee torque. Engineered for full human presence and VIP executive hospitality.',
        card: 'a2-ultra'
      },
      pricing: {
        text: 'Rental proposals are tailored to:\n— Event duration (half-day, single-day, or multi-day roadshows).\n— Selected models and unit counts.\n— Custom choreography requirements.\n— Host city (transported in heavy-duty flight cases).\n\nEvery deployment **includes on-site certified technical operators** for complete safety and execution.',
        waAction: 'Hello Robotshow Indonesia, could you please provide a rental package and quotation for our event?'
      },
      dance: {
        text: 'Yes! Our humanoids can be custom-programmed to perform synchronized choreography to your brand anthem or jingle. We recommend locking bookings 7–14 days prior for choreography rehearsal.',
        card: 'x2-ultra'
      },
      lab: {
        text: 'You can test the 30 DoF kinematics, dance emotes (wave, cheer, point), and LED eye mood expressions of the AgiBot X2 Ultra in our real-time 3D simulation lab.',
        labLink: true
      },
      safety: {
        text: 'Audience safety is strictly managed. All deployments are supervised by certified technicians equipped with wireless emergency stops and defined stage safety perimeters.'
      },
      fallback: {
        text: 'Thank you for your inquiry. For schedule confirmation and customized technical riders, please connect directly with our dispatch liaisons on WhatsApp.'
      }
    }
  },
  zh: {
    welcome: '您好，欢迎来到 Robotshow Indonesia。我是 RFI 舰队礼宾专员。今天有什么可以为您协助的？',
    chips: [
      { id: 'recommend', label: '推荐活动机型' },
      { id: 'compare', label: '对比 X2 与 A2 系列' },
      { id: 'pricing', label: '租赁报价与物流' },
      { id: 'dance', label: '定制品牌音乐编舞' },
      { id: 'lab', label: '打开 3D 实验室' }
    ],
    replies: {
      recommend: {
        text: '我们提供智元 AgiBot 官方人形与四足机器人租赁服务：\n\n• **AgiBot X2 Ultra (131 cm):** 舞台舞蹈、开幕剪彩与媒体焦点首选。\n• **AgiBot A2 Ultra (169 cm):** 成人等高人形机器人，气场威严，适合高端发布会与 VIP 迎宾。\n• **AgiBot D1 Pro:** 四足机器狗，动作敏捷灵巧。',
        card: 'x2-ultra'
      },
      compare: {
        text: 'X2 与 A2 对比：\n\n• **X2 Ultra (敏捷型):** 高 131 cm，39 kg，30 自由度，最高速度 1.8 m/s，动作灵动。\n• **A2 Ultra (等高型):** 高 169 cm，69 kg，270 N·m 膝关节扭矩，真人等高，适合商务盛典。',
        card: 'a2-ultra'
      },
      pricing: {
        text: '租赁费用依据活动天数、机型数量、定制编舞需求以及目的地城市。\n\n所有租赁均**包含认证专业操作员驻场**，全程保障安全与演播顺利。',
        waAction: '您好 Robotshow Indonesia，我想了解活动机器人租赁报价方案。'
      },
      dance: {
        text: '可以！机器人可根据您的品牌歌曲或主题音乐定制同步舞蹈编排。建议提前 7-14 天预订以便排练。',
        card: 'x2-ultra'
      },
      lab: {
        text: '您可以在我们的 3D 在线实验室实时测试 X2 Ultra 的 30 个关节活动度及面部表情。',
        labLink: true
      },
      safety: {
        text: '安全第一。所有演示均由专业工程师全程遥控并配备急停机制。'
      },
      fallback: {
        text: '感谢咨询。如需具体排期与商务方案，请随时通过官方 WhatsApp 与我们联系。'
      }
    }
  }
};

const ROBOT_TAGS = {
  'x2-ultra': {
    id: 'Tarian panggung sinkron, atraksi energik, & gunting pita VIP.',
    en: 'Synchronized stage choreography, VIP reveals, & dynamic media shoots.',
    zh: '舞台同步舞蹈、VIP 剪彩迎宾及动态媒体拍摄首选。'
  },
  'a2-ultra': {
    id: 'Humanoid setinggi orang dewasa untuk presentasi panggung & reveal produk.',
    en: 'Full adult-scale humanoid for keynote speeches & premium product unveilings.',
    zh: '真人等高人形机器人，适合主题演讲及高端品牌发布会。'
  }
};

export default function ConciergeBot() {
  const { lang = 'id' } = useLanguage();
  const currentLang = ['id', 'en', 'zh'].includes(lang) ? lang : 'id';
  const dict = CONCIERGE_KNOWLEDGE[currentLang] || CONCIERGE_KNOWLEDGE.id;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    { id: 1, sender: 'bot', text: dict.welcome, time: '' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const msgIdCounter = useRef(10);
  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Entrance and exit animation for the panel
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    if (open) {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.96, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power3.out', display: 'flex' }
      );
      const timer = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(timer);
    } else {
      gsap.to(el, {
        opacity: 0,
        scale: 0.96,
        y: 14,
        duration: 0.28,
        ease: 'power2.in',
        onComplete: () => {
          if (el) el.style.display = 'none';
        }
      });
    }
  }, [open]);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleSend = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    msgIdCounter.current += 1;
    const userMsg = {
      id: msgIdCounter.current,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    const q = text.toLowerCase();
    let replyData = null;

    if (/x2|a2|banding|compare|vs|beda|difference/.test(q)) {
      replyData = dict.replies.compare;
    } else if (/harga|price|biaya|tarif|rate|paket|package|cost|how much|sewa/.test(q)) {
      replyData = dict.replies.pricing;
    } else if (/tari|dance|music|lagu|jingle|choreo|gerak/.test(q)) {
      replyData = dict.replies.dance;
    } else if (/lab|casting|simulat|3d|coba|test|joint|room/.test(q)) {
      replyData = dict.replies.lab;
    } else if (/aman|safe|safety|anak|bahaya|danger|fall/.test(q)) {
      replyData = dict.replies.safety;
    } else if (/rekomendasi|recommend|pilih|model|unit|event|acara/.test(q)) {
      replyData = dict.replies.recommend;
    } else {
      replyData = dict.replies.fallback;
    }

    setTimeout(() => {
      msgIdCounter.current += 1;
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdCounter.current,
          sender: 'bot',
          text: replyData.text,
          card: replyData.card,
          waAction: replyData.waAction,
          labLink: replyData.labLink,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  const handleChipClick = (chipLabel) => {
    handleSend(chipLabel);
  };

  const handleReset = () => {
    msgIdCounter.current += 1;
    setMessages([{ id: msgIdCounter.current, sender: 'bot', text: dict.welcome, time: '' }]);
  };

  const renderCleanText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const isBullet = line.startsWith('• ') || line.startsWith('— ');
      const content = isBullet ? line.slice(2) : line;

      const segments = content.split(/(\*\*.*?\*\*)/g).map((segment, sIdx) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
          return (
            <strong key={sIdx} className="rfi-bold-text">
              {segment.slice(2, -2)}
            </strong>
          );
        }
        return segment;
      });

      if (isBullet) {
        return (
          <div key={idx} className="rfi-bullet-row">
            <span className="rfi-bullet-mark">—</span>
            <span className="rfi-bullet-text">{segments}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="rfi-spacer" />;
      }

      return (
        <div key={idx} className="rfi-body-line">
          {segments}
        </div>
      );
    });
  };

  return (
    <>
      {/* 1. Quiet Luxury Floating Trigger Button (No neon, pure typography) */}
      <div className="rfi-concierge-dock" style={{ display: open ? 'none' : 'block' }}>
        <Magnetic>
          <button
            type="button"
            className="rfi-concierge-pill"
            onClick={() => setOpen(true)}
            aria-label="Open Concierge"
          >
            <MessageSquare size={15} strokeWidth={1.8} className="rfi-pill-ico" />
            <span className="rfi-pill-txt">Concierge</span>
          </button>
        </Magnetic>
      </div>

      {/* 2. Editorial Inquiry Dialog (Matte Obsidian Card, Zero Neon) */}
      <div
        ref={panelRef}
        className="rfi-concierge-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Concierge Inquiries"
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        style={{ display: 'none' }}
      >
        {/* Header */}
        <div className="rfi-modal-head">
          <div className="rfi-head-top">
            <span className="rfi-eyebrow">Robotshow Concierge</span>
            <div className="rfi-head-btns">
              <button
                type="button"
                className="rfi-head-btn"
                onClick={handleReset}
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={14} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                className="rfi-head-btn rfi-head-close"
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close concierge"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>
          </div>
          <h2 className="rfi-title">
            {currentLang === 'id' ? 'Liaison Acara & Armada' : currentLang === 'zh' ? '活动与舰队礼宾' : 'Event & Fleet Liaison'}
          </h2>
          <p className="rfi-subtitle">
            {currentLang === 'id'
              ? 'Konsultasi talenta AgiBot, riders panggung, & jadwal.'
              : currentLang === 'zh'
              ? '智元机器人机型咨询、舞台规格与档期确认。'
              : 'AgiBot talent advisory, stage technical riders, & bookings.'}
          </p>
        </div>

        {/* Message Stream */}
        <div
          ref={scrollRef}
          className="rfi-modal-stream"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {messages.map((m) => (
            <div key={m.id} className={`rfi-msg-row is-${m.sender}`}>
              <div className="rfi-msg-box">
                <div className={`rfi-bubble is-${m.sender}`}>
                  <div className="rfi-bubble-inner">{renderCleanText(m.text)}</div>

                  {/* Robot Specification Card */}
                  {m.card && (() => {
                    const r = ROBOTS.find((item) => item.id === m.card);
                    if (!r) return null;
                    const tag = ROBOT_TAGS[m.card]?.[currentLang] || r.tagline;
                    return (
                      <div className="rfi-robot-card">
                        <div className="rfi-card-header">
                          <span className="rfi-card-name">{r.name}</span>
                          <span className="rfi-card-specs">
                            {r.specs?.[0]?.value} · {r.specs?.[2]?.value}
                          </span>
                        </div>
                        <p className="rfi-card-desc">{tag}</p>
                        <div className="rfi-card-actions">
                          <a href={robotHref(r)} className="rfi-card-btn" target="_blank" rel="noreferrer">
                            <span>{currentLang === 'id' ? 'Spesifikasi' : currentLang === 'zh' ? '规格详情' : 'Specs'}</span>
                            <ArrowUpRight size={12} strokeWidth={2} />
                          </a>
                          <a href="/casting/" className="rfi-card-btn is-lab">
                            <span>3D Casting Room</span>
                            <Box size={12} strokeWidth={2} />
                          </a>
                          <a
                            href={waLink(currentLang === 'id' ? `Halo Robotshow Indonesia, saya tertarik booking ${r.name}.` : `Hello Robotshow Indonesia, I am interested in booking ${r.name}.`)}
                            className="rfi-card-btn is-book"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>WhatsApp</span>
                            <ArrowUpRight size={12} strokeWidth={2} />
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3D Lab Direct Link */}
                  {m.labLink && (
                    <a href="/casting/" className="rfi-action-link">
                      <Box size={15} strokeWidth={1.8} />
                      <span>
                        {currentLang === 'id'
                          ? 'Buka 3D Casting Room (/casting/)'
                          : currentLang === 'zh'
                          ? '打开 3D 实验室 (/casting/)'
                          : 'Open 3D Casting Room (/casting/)'}
                      </span>
                      <ArrowUpRight size={13} strokeWidth={2} />
                    </a>
                  )}

                  {/* WhatsApp Direct Action */}
                  {m.waAction && (
                    <a
                      href={waLink(m.waAction)}
                      target="_blank"
                      rel="noreferrer"
                      className="rfi-action-link is-whatsapp"
                    >
                      <span>
                        {currentLang === 'id'
                          ? 'Hubungi Tim Manajemen di WhatsApp'
                          : currentLang === 'zh'
                          ? '在 WhatsApp 联系管理团队'
                          : 'Contact Management on WhatsApp'}
                      </span>
                      <ArrowUpRight size={13} strokeWidth={2} />
                    </a>
                  )}
                </div>
                {m.time && <span className="rfi-timestamp">{m.time}</span>}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="rfi-msg-row is-bot">
              <div className="rfi-msg-box">
                <div className="rfi-bubble is-bot rfi-typing-bubble">
                  <span className="rfi-dot" />
                  <span className="rfi-dot" />
                  <span className="rfi-dot" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="rfi-chips-bar" data-lenis-prevent>
          <div className="rfi-chips-track" data-lenis-prevent onWheel={(e) => e.stopPropagation()}>
            {dict.chips.map((c) => (
              <button
                key={c.id}
                type="button"
                className="rfi-chip-btn"
                onClick={() => handleChipClick(c.label)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          className="rfi-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="rfi-input-field"
            placeholder={
              currentLang === 'id'
                ? 'Tulis pertanyaan atau kebutuhan event...'
                : currentLang === 'zh'
                ? '输入关于机型或活动的咨询...'
                : 'Ask about fleet models, riders, or events...'
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button
            type="submit"
            className="rfi-input-send"
            disabled={!inputVal.trim()}
            aria-label="Send"
          >
            <Send size={14} strokeWidth={2} />
          </button>
        </form>
      </div>

      <style>{`
        /* DOCK TRIGGER — Quiet Luxury (No neon, no pulsing) */
        .rfi-concierge-dock {
          position: fixed;
          bottom: clamp(20px, 4vh, 36px);
          right: clamp(16px, 3vw, 36px);
          z-index: 90;
        }
        .rfi-concierge-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 999px;
          background: rgba(11, 21, 51, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.45);
          cursor: pointer;
          color: #F8FAFC;
          transition: transform 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;
          user-select: none;
        }
        .rfi-concierge-pill:hover {
          background: #14285E;
          border-color: rgba(255, 255, 255, 0.32);
          transform: translateY(-2px);
        }
        .rfi-pill-ico {
          color: rgba(255, 255, 255, 0.75);
          transition: color 0.2s ease;
        }
        .rfi-concierge-pill:hover .rfi-pill-ico {
          color: #FFFFFF;
        }
        .rfi-pill-txt {
          font-family: var(--font-display, sans-serif);
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.02em;
          color: #F8FAFC;
        }

        /* MODAL PANEL — Matte Obsidian, Zero Neon Glow */
        .rfi-concierge-modal {
          position: fixed;
          bottom: clamp(16px, 3vh, 32px);
          right: clamp(16px, 2.5vw, 32px);
          width: min(440px, calc(100vw - 32px));
          height: min(620px, calc(100svh - 48px));
          background: #091124;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          box-shadow: 0 32px 72px -16px rgba(0, 0, 0, 0.75);
          display: flex;
          flex-direction: column;
          z-index: 120;
          overflow: hidden;
          font-family: var(--font-display, sans-serif);
          color: #F8FAFC;
          overscroll-behavior: contain;
          touch-action: pan-y;
        }

        /* MODAL HEAD */
        .rfi-modal-head {
          padding: 22px 22px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(11, 21, 51, 0.5);
          flex-shrink: 0;
        }
        .rfi-head-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .rfi-eyebrow {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(248, 250, 252, 0.45);
          font-weight: 500;
        }
        .rfi-head-btns {
          display: flex;
          gap: 6px;
        }
        .rfi-head-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: rgba(248, 250, 252, 0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .rfi-head-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
        }
        .rfi-title {
          font-family: var(--font-serif, serif);
          font-style: italic;
          font-size: 23px;
          font-weight: 400;
          line-height: 1.15;
          margin: 0;
          color: #FFFFFF;
        }
        .rfi-subtitle {
          margin: 4px 0 0;
          font-size: 12px;
          color: rgba(248, 250, 252, 0.55);
          line-height: 1.4;
        }

        /* STREAM */
        .rfi-modal-stream {
          flex: 1 1 0%;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-y;
          padding: 18px 20px 10px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rfi-modal-stream::-webkit-scrollbar {
          width: 4px;
        }
        .rfi-modal-stream::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
        }
        .rfi-msg-row {
          display: flex;
          max-width: 92%;
        }
        .rfi-msg-row.is-user {
          margin-left: auto;
        }
        .rfi-msg-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rfi-msg-row.is-user .rfi-msg-box {
          align-items: flex-end;
        }
        .rfi-bubble {
          padding: 13px 16px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          word-break: break-word;
        }
        .rfi-bubble.is-bot {
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #E2E8F0;
          border-top-left-radius: 4px;
        }
        .rfi-bubble.is-user {
          background: #17378A;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
          border-top-right-radius: 4px;
        }
        .rfi-body-line {
          margin-bottom: 3px;
        }
        .rfi-spacer {
          height: 8px;
        }
        .rfi-bold-text {
          color: #FFFFFF;
          font-weight: 600;
        }
        .rfi-bullet-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 6px 0;
          line-height: 1.5;
        }
        .rfi-bullet-mark {
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
          flex-shrink: 0;
        }
        .rfi-bullet-text {
          flex: 1;
        }
        .rfi-timestamp {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.35);
          padding: 0 4px;
        }

        /* ROBOT SPEC CARD — Quiet Luxury */
        .rfi-robot-card {
          margin-top: 12px;
          padding: 13px 15px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .rfi-card-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }
        .rfi-card-name {
          font-size: 13px;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }
        .rfi-card-specs {
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.55);
        }
        .rfi-card-desc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 10px;
          line-height: 1.4;
        }
        .rfi-card-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .rfi-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #F8FAFC;
          text-decoration: none;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .rfi-card-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }
        .rfi-card-btn.is-lab {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.18);
        }
        .rfi-card-btn.is-book {
          background: #1B733E;
          border-color: #1B733E;
          color: #FFFFFF;
        }
        .rfi-card-btn.is-book:hover {
          background: #238C4C;
        }

        /* ACTION LINKS */
        .rfi-action-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 10px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 500;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #F8FAFC;
          transition: background-color 0.2s ease;
        }
        .rfi-action-link:hover {
          background: rgba(255, 255, 255, 0.13);
        }
        .rfi-action-link.is-whatsapp {
          background: #1B733E;
          border-color: #1B733E;
          color: #FFFFFF;
        }
        .rfi-action-link.is-whatsapp:hover {
          background: #238C4C;
        }

        /* TYPING INDICATOR */
        .rfi-typing-bubble {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }
        .rfi-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.45);
          animation: rfi-dot-fade 1.4s infinite ease-in-out both;
        }
        .rfi-dot:nth-child(1) { animation-delay: -0.32s; }
        .rfi-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes rfi-dot-fade {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 0.85; transform: scale(1); }
        }

        /* CHIPS TRACK */
        .rfi-chips-bar {
          padding: 8px 16px 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          flex-shrink: 0;
        }
        .rfi-chips-track {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .rfi-chips-track::-webkit-scrollbar {
          display: none;
        }
        .rfi-chip-btn {
          flex-shrink: 0;
          padding: 6px 13px;
          border-radius: 999px;
          font-size: 11.5px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: rgba(255, 255, 255, 0.72);
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
          white-space: nowrap;
        }
        .rfi-chip-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.22);
          color: #FFFFFF;
        }

        /* INPUT TRAY */
        .rfi-input-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px 16px;
          background: rgba(11, 21, 51, 0.45);
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          flex-shrink: 0;
        }
        .rfi-input-field {
          flex: 1;
          height: 42px;
          padding: 0 15px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.11);
          color: #FFFFFF;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .rfi-input-field:focus {
          border-color: rgba(255, 255, 255, 0.32);
          background: rgba(255, 255, 255, 0.08);
        }
        .rfi-input-field::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }
        .rfi-input-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #183CA8;
          border: none;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }
        .rfi-input-send:hover:not(:disabled) {
          background: #214EC0;
          transform: scale(1.04);
        }
        .rfi-input-send:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .rfi-concierge-modal {
            right: 12px;
            left: 12px;
            bottom: 12px;
            width: auto;
            height: calc(100svh - 24px);
            border-radius: 18px;
          }
        }
      `}</style>
    </>
  );
}
