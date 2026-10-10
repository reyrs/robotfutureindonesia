import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MessageSquare, X, Send, RotateCcw, ArrowUpRight, Box } from 'lucide-react';
import { ROBOTS, robotHref } from '../data/robots';
import { waLink } from '../config/site';
import { useLanguage } from '../context/LanguageContext';
import Magnetic from './Magnetic';

// High-end Awwwards-tier Concierge & Dispatch Liaison for Robotshow.id.
// Hand-crafted conversational engine grounded in actual fleet specifications,
// event logistics, choreography capabilities, and 3D simulation links.

const KNOWLEDGE_RESPONSES = {
  id: {
    welcome: 'Selamat datang di Robotshow Indonesia. Saya Concierge Armada RFI. Bagaimana saya dapat membantu kebutuhan event Anda hari ini? Anda dapat menanyakan rekomendasi talenta robot, spesifikasi teknis, koreografi musik, atau pengujian di 3D Lab.',
    chips: [
      { id: 'recommend', label: '(01) Rekomendasi Robot Event' },
      { id: 'compare', label: '(02) Bandingkan X2 vs A2 Series' },
      { id: 'pricing', label: '(03) Paket Harga & Logistik' },
      { id: 'dance', label: '(04) Koreografi Lagu Brand' },
      { id: 'lab', label: '(05) Buka 3D Casting Lab' }
    ],
    replies: {
      recommend: {
        text: 'Untuk event interaktif, kami memiliki armada humanoid dan quadruped kelas dunia:\n\n• **AgiBot X2 Ultra (131 cm):** Pilihan utama untuk tarian panggung, gunting pita VIP, dan atraksi energik.\n• **AgiBot A2 Ultra (169 cm):** Humanoid setinggi orang dewasa, paling berwibawa untuk presentasi panggung dan reveal produk.\n• **AgiBot D1 Pro:** Robodog lincah untuk atraksi lari, lompat, dan interaksi keluarga di mall/expo.',
        card: 'x2-ultra'
      },
      compare: {
        text: 'Perbandingan Seri X2 vs Seri A2:\n\n• **X2 Ultra (Kompak & Lincah):** Tinggi 131 cm, berat 39 kg, 30 DoF, kecepatan 1,8 m/s dengan sensor LiDAR 3D. Keunggulannya adalah keluwesan gerak tarian panggung dan atraksi cepat.\n\n• **A2 Ultra (Skala Dewasa):** Tinggi 169 cm, berat 69 kg, torsi lutut masif 270 N·m. Keunggulannya adalah postur tubuh setinggi manusia dewasa yang sangat prestisius untuk panggung pembicara dan VIP host.',
        card: 'a2-ultra'
      },
      pricing: {
        text: 'Biaya sewa dihitung berdasarkan:\n1. Durasi acara (setengah hari, full-day, atau multi-day).\n2. Jumlah unit & model robot yang dipilih.\n3. Kebutuhan koreografi tarian kustom.\n4. Kota tujuan (unit dikirim dengan flight case pelindung).\n\nSetiap sewa sudah **TERMASUK operator bersertifikasi di lokasi** untuk menjamin keamanan & kelancaran acara. Hubungi kami untuk penawaran proposal resmi.',
        waAction: 'Halo Robotshow Indonesia, boleh minta daftar harga dan paket sewa robot untuk event saya?'
      },
      dance: {
        text: 'Ya, robot humanoid kami bisa menari sinkron mengikuti lagu, jingle brand, atau musik tema acara Anda! Tim koreografer kami akan memprogram gerakan robot sebelum acara. Kami menyarankan pemesanan 7–14 hari sebelum hari H agar sesi latihan koreografi maksimal.',
        card: 'x2-ultra'
      },
      lab: {
        text: 'Anda dapat menguji langsung kemampuan mekanis, persendian URDF 30 DoF, pose tarian (wave, cheer, point), dan ekspresi LED mata AgiBot X2 Ultra di simulator 3D interaktif kami.',
        labLink: true
      },
      safety: {
        text: 'Keamanan pengunjung adalah prioritas utama kami. Setiap penampilan selalu didampingi operator bersertifikasi yang memegang kendali darurat (*kill switch*). Area panggung dan jarak aman penonton selalu diatur sesuai standar operasional.'
      },
      fallback: {
        text: 'Terima kasih atas pertanyaan Anda. Untuk informasi mendalam mengenai ketersediaan jadwal dan proposal teknis, Anda dapat langsung berdiskusi dengan tim operasional kami melalui WhatsApp resmi.'
      }
    }
  },
  en: {
    welcome: 'Welcome to Robotshow Indonesia. I am the RFI Fleet Concierge. How may I assist your event planning today? You can inquire about humanoid talent selection, technical specifications, custom choreographies, or live 3D simulation.',
    chips: [
      { id: 'recommend', label: '(01) Robot Recommendations' },
      { id: 'compare', label: '(02) Compare X2 vs A2 Series' },
      { id: 'pricing', label: '(03) Pricing & Logistics' },
      { id: 'dance', label: '(04) Custom Music Dance' },
      { id: 'lab', label: '(05) Open 3D Casting Lab' }
    ],
    replies: {
      recommend: {
        text: 'For premier events, we deploy official AgiBot humanoid and quadruped units:\n\n• **AgiBot X2 Ultra (131 cm):** The signature performer for synchronized stage dances, VIP reveals, and media shoots.\n• **AgiBot A2 Ultra (169 cm):** Full adult-height humanoid offering commanding stage presence for keynotes and brand launches.\n• **AgiBot D1 Pro:** Agile robodog quadruped capable of dynamic sprints, jumps, and high-engagement crowd interaction.',
        card: 'x2-ultra'
      },
      compare: {
        text: 'Series Comparison: X2 vs. A2:\n\n• **X2 Ultra (Agile & Compact):** 131 cm, 39 kg, 30 DoF, 1.8 m/s speed with 3D LiDAR. Ideal for complex choreography and dynamic stage entertainment.\n\n• **A2 Ultra (Full Human Scale):** 169 cm, 69 kg, 270 N·m knee torque. Engineered for adult human presence, VIP welcoming, and corporate unveilings.',
        card: 'a2-ultra'
      },
      pricing: {
        text: 'Rental pricing is customized based on:\n1. Event duration (half-day, full-day, or multi-day roadshows).\n2. Model selection and fleet count.\n3. Custom song choreography requirements.\n4. Venue city (Jakarta, Surabaya, Bali, or nationwide freight).\n\nEvery booking **always includes certified on-site technical operators** for complete safety and operational peace of mind.',
        waAction: 'Hello Robotshow Indonesia, could you please provide a quotation and rental package for my upcoming event?'
      },
      dance: {
        text: 'Yes! Our humanoids can be custom-programmed to dance in sync with your brand jingle, corporate anthem, or stage music. We recommend confirming 7–14 days prior to the event for choreography programming and rehearsals.',
        card: 'x2-ultra'
      },
      lab: {
        text: 'You can interactively test the full 30 DoF joint kinematics, choreographic emotes (wave, cheer, point), and LED facial moods of the AgiBot X2 Ultra in our real-time 3D Casting Lab.',
        labLink: true
      },
      safety: {
        text: 'Audience safety is strictly guaranteed. Certified RFI operators manage every session with dedicated wireless emergency overrides. Clear stage perimeters are maintained at all times.'
      },
      fallback: {
        text: 'Thank you for your inquiry. For specific technical riders, scheduling availability, and bespoke proposals, our dispatch team is available directly on WhatsApp.'
      }
    }
  },
  zh: {
    welcome: '欢迎来到 Robotshow Indonesia。我是 RFI 舰队礼宾专员。今天有什么可以为您协助的？您可以咨询机器人推荐、规格对比、音乐编舞或进入 3D 实验室。',
    chips: [
      { id: 'recommend', label: '(01) 推荐活动机器人' },
      { id: 'compare', label: '(02) 对比 X2 与 A2 系列' },
      { id: 'pricing', label: '(03) 租赁价格与物流' },
      { id: 'dance', label: '(04) 定制音乐舞蹈' },
      { id: 'lab', label: '(05) 打开 3D 实验室' }
    ],
    replies: {
      recommend: {
        text: '我们提供智元 AgiBot 官方人形与四足机器人租赁：\n\n• **X2 Ultra (131 cm):** 舞台舞蹈、剪彩迎宾首选。\n• **A2 Ultra (169 cm):** 成人等高人形机器人，气场威严，适合高端发布会。\n• **D1 Pro 机器狗:** 灵活奔跑跳跃，吸引全场焦点。',
        card: 'x2-ultra'
      },
      compare: {
        text: 'X2 与 A2 对比：\n\n• **X2 Ultra:** 高 131 cm，39 kg，30 自由度，最高速度 1.8 m/s，动作敏捷灵动。\n• **A2 Ultra:** 高 169 cm，69 kg，270 N·m 膝关节扭矩，真人等高威严。',
        card: 'a2-ultra'
      },
      pricing: {
        text: '租赁费用依据活动天数、选定机型、定制编舞及目的地城市（雅加达、泗水、巴厘岛等）。\n\n所有租赁均**包含现场专业认证操作员**确保万无一失。',
        waAction: '您好 Robotshow Indonesia，我想了解活动机器人租赁报价方案。'
      },
      dance: {
        text: '可以！机器人可根据您的品牌歌曲或音乐定制同步编舞。建议提前 7-14 天预订以便编排练习。',
        card: 'x2-ultra'
      },
      lab: {
        text: '您可以在我们的 3D 在线实验室实时测试 X2 Ultra 的 30 个关节活动度及面部 LED 表情。',
        labLink: true
      },
      safety: {
        text: '安全第一。现场均有认证工程师随行并配备急停遥控器。'
      },
      fallback: {
        text: '感谢咨询。如需具体排期与商务方案，请随时通过官方 WhatsApp 与我们联系。'
      }
    }
  }
};

export default function ConciergeBot() {
  const { lang = 'id' } = useLanguage();
  const currentLang = ['id', 'en', 'zh'].includes(lang) ? lang : 'id';
  const dict = KNOWLEDGE_RESPONSES[currentLang] || KNOWLEDGE_RESPONSES.id;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [
    { id: 1, sender: 'bot', text: dict.welcome, time: 'Just now' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const msgIdCounter = useRef(10);
  const panelRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new message
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
        { opacity: 0, scale: 0.94, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power4.out', display: 'flex' }
      );
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    } else {
      gsap.to(el, {
        opacity: 0,
        scale: 0.94,
        y: 20,
        duration: 0.35,
        ease: 'power3.in',
        onComplete: () => {
          if (el) el.style.display = 'none';
        }
      });
    }
  }, [open]);

  // Keyboard close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleOpen = () => {
    setHasUnread(false);
    setOpen(true);
  };

  const handleSend = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    msgIdCounter.current += 1;
    const currentId = msgIdCounter.current;
    const userMsg = {
      id: currentId,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Analyze intent
    const q = text.toLowerCase();
    let replyData = null;

    if (/x2|a2|banding|compare|vs|beda|difference/.test(q)) {
      replyData = dict.replies.compare;
    } else if (/harga|price|biaya|tarif|rate|paket|package|cost|how much/.test(q)) {
      replyData = dict.replies.pricing;
    } else if (/tari|dance|music|lagu|jingle|choreo|gerak|pencak/.test(q)) {
      replyData = dict.replies.dance;
    } else if (/lab|casting|simulat|3d|coba|test|joint/.test(q)) {
      replyData = dict.replies.lab;
    } else if (/aman|safe|safety|anak|bahaya|danger|fall/.test(q)) {
      replyData = dict.replies.safety;
    } else if (/rekomendasi|recommend|pilih|model|unit|sewa|rent|event|acara/.test(q)) {
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
    }, 650);
  };

  const handleChipClick = (chipId) => {
    const chip = dict.chips.find((c) => c.id === chipId);
    if (!chip) return;
    handleSend(chip.label.replace(/^\(\d+\)\s*/, ''));
  };

  const handleReset = () => {
    msgIdCounter.current += 1;
    setMessages([{ id: msgIdCounter.current, sender: 'bot', text: dict.welcome, time: 'Just now' }]);
  };

  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      const isBullet = line.startsWith('• ') || line.startsWith('- ');
      const content = isBullet ? line.slice(2) : line;

      const segments = content.split(/(\*\*.*?\*\*)/g).map((segment, sIdx) => {
        if (segment.startsWith('**') && segment.endsWith('**')) {
          return (
            <strong key={sIdx} className="rfi-text-bold">
              {segment.slice(2, -2)}
            </strong>
          );
        }
        return segment;
      });

      if (isBullet) {
        return (
          <div key={idx} className="rfi-bullet-item">
            <span className="rfi-bullet-glyph">▸</span>
            <span className="rfi-bullet-content">{segments}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="rfi-text-spacer" />;
      }

      return (
        <div key={idx} className="rfi-text-line">
          {segments}
        </div>
      );
    });
  };

  const ROBOT_CARD_TAGS = {
    'x2-ultra': {
      id: 'Tarian panggung sinkron, atraksi energik, dan gunting pita VIP.',
      en: 'Synchronized stage choreography, VIP reveals, and dynamic media shoots.',
      zh: '舞台同步舞蹈、VIP 剪彩迎宾及动态媒体拍摄首选。'
    },
    'a2-ultra': {
      id: 'Humanoid setinggi orang dewasa untuk presentasi panggung dan reveal produk.',
      en: 'Full adult-scale humanoid for keynote speeches and premium product unveilings.',
      zh: '真人等高人形机器人，适合主题演讲及高端品牌发布会。'
    }
  };

  return (
    <>
      {/* 1. Launch Dock Pill (Awwwards Doppelrand Nested Architecture) */}
      <div className="rfi-concierge-dock" style={{ display: open ? 'none' : 'block' }}>
        <Magnetic>
          <button
            type="button"
            className="rfi-concierge-pill"
            onClick={handleOpen}
            aria-label="Open RFI Fleet Concierge"
          >
            <span className="rfi-beacon-dot" />
            <span className="rfi-pill-label">
              <span className="rfi-pill-mono">SYS // DISPATCH</span>
              <span className="rfi-pill-title">RFI Concierge</span>
            </span>
            <span className="rfi-pill-icon">
              <MessageSquare size={15} strokeWidth={2} />
              {hasUnread && <span className="rfi-unread-badge" />}
            </span>
          </button>
        </Magnetic>
      </div>

      {/* 2. Expanded Concierge Terminal (Double-Bezel Obsidian Frame) */}
      <div
        ref={panelRef}
        className="rfi-concierge-terminal"
        role="dialog"
        aria-modal="true"
        aria-label="Fleet Concierge Terminal"
        style={{ display: 'none' }}
      >
        {/* Terminal Header */}
        <div className="rfi-term-header">
          <div className="rfi-term-status">
            <span className="rfi-term-dot" />
            <span className="rfi-term-mono">SYS // RFI.LIAISON.ONLINE</span>
          </div>
          <div className="rfi-term-title-row">
            <div>
              <h2 className="rfi-term-title">Fleet Concierge</h2>
              <p className="rfi-term-sub">Official AgiBot Event Specialist</p>
            </div>
            <div className="rfi-term-actions">
              <button
                type="button"
                className="rfi-term-btn"
                onClick={handleReset}
                title="Reset Conversation"
                aria-label="Reset chat"
              >
                <RotateCcw size={15} strokeWidth={1.7} />
              </button>
              <button
                type="button"
                className="rfi-term-btn rfi-term-close"
                onClick={() => setOpen(false)}
                title="Close Concierge"
                aria-label="Close chat"
              >
                <X size={17} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div ref={scrollRef} className="rfi-term-stream">
          {messages.map((m) => (
            <div key={m.id} className={`rfi-bubble-row is-${m.sender}`}>
              {m.sender === 'bot' && (
                <div className="rfi-avatar">
                  <span className="rfi-avatar-glyph">RFI</span>
                </div>
              )}
              <div className="rfi-bubble-wrap">
                <div className={`rfi-bubble is-${m.sender}`}>
                  <div className="rfi-bubble-text">{renderFormattedText(m.text)}</div>

                  {/* Rich Robot Card if applicable */}
                  {m.card && (() => {
                    const r = ROBOTS.find((item) => item.id === m.card);
                    if (!r) return null;
                    const localizedTag = ROBOT_CARD_TAGS[m.card]?.[currentLang] || r.tagline;
                    return (
                      <div className="rfi-robot-card">
                        <div className="rfi-card-meta">
                          <span className="rfi-card-badge">{r.name}</span>
                          <span className="rfi-card-stat">{r.specs?.[0]?.value} · {r.specs?.[2]?.value}</span>
                        </div>
                        <p className="rfi-card-tag">{localizedTag}</p>
                        <div className="rfi-card-links">
                          <a href={robotHref(r)} className="rfi-card-btn" target="_blank" rel="noreferrer">
                            <span>{currentLang === 'id' ? 'Detail' : currentLang === 'zh' ? '规格详情' : 'Specs'}</span>
                            <ArrowUpRight size={13} />
                          </a>
                          <a href="/casting/" className="rfi-card-btn is-highlight">
                            <span>{currentLang === 'id' ? '3D Lab' : currentLang === 'zh' ? '3D 试验' : '3D Lab'}</span>
                            <Box size={13} />
                          </a>
                          <a
                            href={waLink(currentLang === 'id' ? `Halo Robotshow Indonesia, saya tertarik sewa ${r.name}.` : `Hello Robotshow Indonesia, I am interested in booking ${r.name}.`)}
                            className="rfi-card-btn is-wa"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>{currentLang === 'id' ? 'Booking' : currentLang === 'zh' ? '预订' : 'Book'}</span>
                            <ArrowUpRight size={13} />
                          </a>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3D Lab Direct Link */}
                  {m.labLink && (
                    <a href="/casting/" className="rfi-lab-direct-btn">
                      <Box size={16} />
                      <span>
                        {currentLang === 'id'
                          ? 'Buka 3D Casting Lab (/casting/)'
                          : currentLang === 'zh'
                          ? '打开 3D 实验室 (/casting/)'
                          : 'Open 3D Casting Lab (/casting/)'}
                      </span>
                      <ArrowUpRight size={14} />
                    </a>
                  )}

                  {/* WhatsApp Direct Action */}
                  {m.waAction && (
                    <a
                      href={waLink(m.waAction)}
                      target="_blank"
                      rel="noreferrer"
                      className="rfi-wa-direct-btn"
                    >
                      <span>
                        {currentLang === 'id'
                          ? 'Hubungi Tim Dispatch di WhatsApp'
                          : currentLang === 'zh'
                          ? '通过 WhatsApp 联系调度团队'
                          : 'Chat with Dispatch on WhatsApp'}
                      </span>
                      <ArrowUpRight size={15} />
                    </a>
                  )}
                </div>
                <span className="rfi-bubble-time">{m.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="rfi-bubble-row is-bot">
              <div className="rfi-avatar">
                <span className="rfi-avatar-glyph">RFI</span>
              </div>
              <div className="rfi-bubble is-bot rfi-typing">
                <span className="rfi-typing-dot" />
                <span className="rfi-typing-dot" />
                <span className="rfi-typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="rfi-chips-container">
          <div className="rfi-chips-scroll">
            {dict.chips.map((c) => (
              <button
                key={c.id}
                type="button"
                className="rfi-chip"
                onClick={() => handleChipClick(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar with Button-in-Button Trailing Action */}
        <form
          className="rfi-term-input-tray"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="rfi-term-input"
            placeholder={
              currentLang === 'id'
                ? 'Ketik pertanyaan armada atau event...'
                : currentLang === 'zh'
                ? '输入关于机器人或活动的问题...'
                : 'Ask about fleet models, pricing, or events...'
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button
            type="submit"
            className="rfi-send-btn"
            disabled={!inputVal.trim()}
            aria-label="Send message"
          >
            <Send size={15} strokeWidth={2.2} />
          </button>
        </form>
      </div>

      <style>{`
        /* DOCK TRIGGER */
        .rfi-concierge-dock {
          position: fixed;
          bottom: clamp(20px, 4vh, 36px);
          right: clamp(16px, 3vw, 36px);
          z-index: 90;
        }
        .rfi-concierge-pill {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 6px 8px 6px 18px;
          border-radius: 999px;
          background: rgba(11, 21, 51, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 20px 48px -10px rgba(0, 5, 20, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08);
          cursor: pointer;
          color: #F8FAFC;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s, border-color 0.3s;
          user-select: none;
        }
        .rfi-concierge-pill:hover {
          background: rgba(15, 28, 68, 0.94);
          border-color: rgba(56, 189, 248, 0.45);
          transform: translateY(-2px);
        }
        .rfi-beacon-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #38BDF8;
          box-shadow: 0 0 12px #38BDF8;
          animation: rfi-pulse 2.2s infinite ease-in-out;
        }
        @keyframes rfi-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }
        .rfi-pill-label {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.1;
        }
        .rfi-pill-mono {
          font-family: var(--font-mono, monospace);
          font-size: 9.5px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #38BDF8;
        }
        .rfi-pill-title {
          font-family: var(--font-display, sans-serif);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #F8FAFC;
        }
        .rfi-pill-icon {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F8FAFC;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s;
        }
        .rfi-concierge-pill:hover .rfi-pill-icon {
          background: #153896;
          transform: scale(1.06);
        }
        .rfi-unread-badge {
          position: absolute;
          top: 1px;
          right: 1px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #38BDF8;
          border: 2px solid #0B1533;
        }

        /* TERMINAL PANEL */
        .rfi-concierge-terminal {
          position: fixed;
          bottom: clamp(16px, 3vh, 32px);
          right: clamp(16px, 2.5vw, 32px);
          width: min(440px, calc(100vw - 32px));
          height: min(640px, calc(100svh - 48px));
          background: #080F24;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 24px;
          box-shadow: 0 35px 80px -15px rgba(0, 3, 15, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          display: flex;
          flex-direction: column;
          z-index: 120;
          overflow: hidden;
          font-family: var(--font-display, sans-serif);
          color: #F8FAFC;
        }

        /* HEADER */
        .rfi-term-header {
          padding: 20px 22px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(11, 21, 51, 0.65);
        }
        .rfi-term-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .rfi-term-dot {
          width: 6.5px;
          height: 6.5px;
          border-radius: 50%;
          background: #38BDF8;
          box-shadow: 0 0 8px #38BDF8;
        }
        .rfi-term-mono {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          letter-spacing: 0.14em;
          color: #38BDF8;
          text-transform: uppercase;
        }
        .rfi-term-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .rfi-term-title {
          font-family: var(--font-serif, serif);
          font-style: italic;
          font-size: 24px;
          font-weight: 500;
          line-height: 1.1;
          margin: 0;
          color: #FFFFFF;
        }
        .rfi-term-sub {
          margin: 3px 0 0;
          font-size: 12px;
          color: rgba(248, 250, 252, 0.62);
        }
        .rfi-term-actions {
          display: flex;
          gap: 6px;
        }
        .rfi-term-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(248, 250, 252, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .rfi-term-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #FFFFFF;
        }
        .rfi-term-close:hover {
          transform: rotate(90deg);
        }

        /* STREAM */
        .rfi-term-stream {
          flex: 1;
          overflow-y: auto;
          padding: 20px 20px 10px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          scroll-behavior: smooth;
        }
        .rfi-term-stream::-webkit-scrollbar {
          width: 4px;
        }
        .rfi-term-stream::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
        }
        .rfi-bubble-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          max-width: 90%;
        }
        .rfi-bubble-row.is-user {
          margin-left: auto;
          flex-direction: row-reverse;
        }
        .rfi-avatar {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #153896;
          border: 1px solid rgba(56, 189, 248, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .rfi-avatar-glyph {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          color: #38BDF8;
        }
        .rfi-bubble-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .rfi-bubble-row.is-user .rfi-bubble-wrap {
          align-items: flex-end;
        }
        .rfi-bubble {
          padding: 13px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.55;
          position: relative;
          word-break: break-word;
        }
        .rfi-bubble.is-bot {
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(248, 250, 252, 0.92);
          border-top-left-radius: 4px;
        }
        .rfi-bubble.is-user {
          background: #183CA8;
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-top-right-radius: 4px;
        }
        .rfi-bubble-text {
          white-space: normal;
        }
        .rfi-text-line {
          margin-bottom: 3px;
        }
        .rfi-text-spacer {
          height: 8px;
        }
        .rfi-text-bold {
          color: #FFFFFF;
          font-weight: 600;
        }
        .rfi-bullet-item {
          display: flex;
          align-items: baseline;
          gap: 7px;
          margin: 6px 0;
          line-height: 1.5;
        }
        .rfi-bullet-glyph {
          color: #38BDF8;
          font-size: 11px;
          line-height: 1;
          flex-shrink: 0;
        }
        .rfi-bullet-content {
          flex: 1;
        }
        .rfi-bubble-time {
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          color: rgba(248, 250, 252, 0.4);
          padding: 0 4px;
        }

        /* ROBOT EMBEDDED CARD */
        .rfi-robot-card {
          margin-top: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          background: rgba(11, 21, 51, 0.65);
          border: 1px solid rgba(56, 189, 248, 0.25);
        }
        .rfi-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
        }
        .rfi-card-badge {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          color: #38BDF8;
          text-transform: uppercase;
        }
        .rfi-card-stat {
          font-size: 12px;
          opacity: 0.75;
          font-family: var(--font-mono, monospace);
        }
        .rfi-card-tag {
          font-size: 12.5px;
          margin: 0 0 12px;
          opacity: 0.85;
          line-height: 1.4;
        }
        .rfi-card-links {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .rfi-card-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #F8FAFC;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .rfi-card-btn:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .rfi-card-btn.is-highlight {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.35);
          color: #38BDF8;
        }
        .rfi-card-btn.is-highlight:hover {
          background: rgba(56, 189, 248, 0.25);
        }
        .rfi-card-btn.is-wa {
          background: #25D366;
          border-color: #25D366;
          color: #0B1533;
          font-weight: 600;
        }

        /* ACTIONS */
        .rfi-lab-direct-btn,
        .rfi-wa-direct-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 9px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .rfi-lab-direct-btn {
          background: rgba(56, 189, 248, 0.14);
          border: 1px solid rgba(56, 189, 248, 0.35);
          color: #38BDF8;
        }
        .rfi-lab-direct-btn:hover {
          background: rgba(56, 189, 248, 0.24);
          transform: translateY(-1px);
        }
        .rfi-wa-direct-btn {
          background: #25D366;
          border: 1px solid #25D366;
          color: #061124;
          font-weight: 600;
        }
        .rfi-wa-direct-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        /* TYPING INDICATOR */
        .rfi-typing {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 12px 18px;
        }
        .rfi-typing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(248, 250, 252, 0.6);
          animation: rfi-bounce 1.4s infinite ease-in-out both;
        }
        .rfi-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .rfi-typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes rfi-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }

        /* CHIPS CONTAINER */
        .rfi-chips-container {
          padding: 8px 16px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rfi-chips-scroll {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .rfi-chips-scroll::-webkit-scrollbar {
          display: none;
        }
        .rfi-chip {
          flex-shrink: 0;
          padding: 6px 13px;
          border-radius: 999px;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          letter-spacing: 0.03em;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(248, 250, 252, 0.82);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .rfi-chip:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.4);
          color: #38BDF8;
        }

        /* INPUT TRAY (Double-Bezel Architecture) */
        .rfi-term-input-tray {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px 18px;
          background: rgba(11, 21, 51, 0.6);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .rfi-term-input {
          flex: 1;
          height: 44px;
          padding: 0 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #FFFFFF;
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.25s ease, background-color 0.25s ease;
        }
        .rfi-term-input:focus {
          border-color: #38BDF8;
          background: rgba(255, 255, 255, 0.09);
        }
        .rfi-term-input::placeholder {
          color: rgba(248, 250, 252, 0.38);
        }
        .rfi-send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #38BDF8;
          border: none;
          color: #061124;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }
        .rfi-send-btn:hover:not(:disabled) {
          transform: scale(1.08);
          background: #7DD3FC;
        }
        .rfi-send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .rfi-concierge-terminal {
            right: 12px;
            left: 12px;
            bottom: 12px;
            width: auto;
            height: calc(100svh - 24px);
            border-radius: 20px;
          }
        }
      `}</style>
    </>
  );
}
