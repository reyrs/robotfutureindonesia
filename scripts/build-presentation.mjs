import fs from 'fs';
import path from 'path';

async function generate() {
  const { default: puppeteer } = await import('puppeteer-core');
  
  const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

  console.log('Capturing screenshots from dev server...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files']
  });

  const capturePage = await browser.newPage();
  await capturePage.setViewport({ width: 1440, height: 900 });

  // 1. Hero
  await capturePage.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  const heroBuffer = await capturePage.screenshot({ encoding: 'base64' });
  const heroImg = 'data:image/png;base64,' + heroBuffer;

  // 2. Talent
  await capturePage.evaluate(() => window.__lenis?.scrollTo('#armada', { immediate: true }));
  await new Promise(r => setTimeout(r, 1500));
  const talentBuffer = await capturePage.screenshot({ encoding: 'base64' });
  const talentImg = 'data:image/png;base64,' + talentBuffer;

  // 3. Teaser
  await capturePage.evaluate(() => window.__lenis?.scrollTo('#acara', { immediate: true }));
  await new Promise(r => setTimeout(r, 1500));
  const teaserBuffer = await capturePage.screenshot({ encoding: 'base64' });
  const teaserImg = 'data:image/png;base64,' + teaserBuffer;

  // 4. Booking
  await capturePage.evaluate(() => window.__lenis?.scrollTo('#layanan', { immediate: true }));
  await new Promise(r => setTimeout(r, 1500));
  const bookingBuffer = await capturePage.screenshot({ encoding: 'base64' });
  const bookingImg = 'data:image/png;base64,' + bookingBuffer;

  // 5. Casting Lab
  await capturePage.goto('http://localhost:5173/casting/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  const labBuffer = await capturePage.screenshot({ encoding: 'base64' });
  const labImg = 'data:image/png;base64,' + labBuffer;

  // 6. Robot Page
  await capturePage.goto('http://localhost:5173/robot/x2-ultra/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));
  const robotBuffer = await capturePage.screenshot({ encoding: 'base64' });
  const robotImg = 'data:image/png;base64,' + robotBuffer;

  await capturePage.close();
  console.log('Screenshots captured successfully.');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Robotshow.id — Platform Presentation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: 1920px 1080px;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #F8FAFC;
    background: #0B1533;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .slide {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    padding: 80px 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #0B1533;
  }

  .slide-cover {
    background: radial-gradient(120% 100% at 85% 20%, #16369A 0%, #0B1533 60%, #050A1A 100%);
  }
  .slide-light {
    background: #F8F9FA;
    color: #0B1533;
  }
  .slide-blue {
    background: radial-gradient(100% 90% at 50% 10%, #153896 0%, #0B1533 80%);
  }
  .slide-dark-grid {
    background: 
      linear-gradient(rgba(248, 250, 252, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(248, 250, 252, 0.03) 1px, transparent 1px),
      #0B1533;
    background-size: 60px 60px;
  }

  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid rgba(248, 250, 252, 0.14);
    padding-bottom: 24px;
    margin-bottom: 30px;
  }
  .slide-light .slide-header {
    border-bottom-color: rgba(11, 21, 51, 0.12);
  }
  .slide-category {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #38BDF8;
  }
  .slide-light .slide-category {
    color: #1E40AF;
  }
  .slide-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    opacity: 0.6;
    letter-spacing: 0.1em;
  }
  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(248, 250, 252, 0.14);
    padding-top: 20px;
    font-size: 13px;
    opacity: 0.6;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.08em;
  }
  .slide-light .slide-footer {
    border-top-color: rgba(11, 21, 51, 0.12);
  }

  .title-serif {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 700;
  }
  h1 {
    font-size: 76px;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
  }
  h2 {
    font-size: 46px;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }
  p {
    font-size: 20px;
    line-height: 1.6;
    opacity: 0.9;
  }

  .badge {
    display: inline-block;
    padding: 7px 18px;
    border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.08);
    color: #F8FAFC;
    border: 1px solid rgba(255, 255, 255, 0.22);
    margin-bottom: 22px;
  }
  .badge-blue {
    background: rgba(30, 64, 175, 0.08);
    color: #1E40AF;
    border-color: rgba(30, 64, 175, 0.25);
  }

  .content-split {
    display: grid;
    grid-template-columns: 1.05fr 1.35fr;
    gap: 60px;
    align-items: center;
    flex: 1;
  }
  .content-three {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 36px;
    flex: 1;
    align-items: stretch;
  }
  .content-four {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
    flex: 1;
    align-items: stretch;
  }

  .screen-frame {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.12);
    background: #000;
    height: 580px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .screen-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .card-feature {
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 16px;
    padding: 36px 32px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .slide-light .card-feature {
    background: #FFFFFF;
    border-color: rgba(11, 21, 51, 0.07);
    box-shadow: 0 12px 32px rgba(11, 21, 51, 0.04);
  }
  .card-feature h3 {
    font-size: 24px;
    margin: 16px 0 10px;
    font-weight: 700;
  }
  .card-feature p {
    font-size: 16px;
    line-height: 1.55;
  }
  .card-feature .num {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 38px;
    color: #38BDF8;
    line-height: 1;
  }
  .slide-light .card-feature .num {
    color: #1E40AF;
  }

  .bullet-list {
    list-style: none;
    margin-top: 24px;
  }
  .bullet-list li {
    position: relative;
    padding-left: 30px;
    margin-bottom: 16px;
    font-size: 18px;
    line-height: 1.5;
  }
  .bullet-list li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #38BDF8;
    font-weight: 700;
  }
  .slide-light .bullet-list li::before {
    color: #1E40AF;
  }
</style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <div class="slide slide-cover">
    <div class="slide-header" style="border: none;">
      <div class="slide-category">ROBOT FUTURE INDONESIA</div>
      <div class="slide-number">OFFICIAL AGIBOT FLEET</div>
    </div>
    <div style="max-width: 1200px; margin-top: 80px;">
      <span class="badge">PLATFORM ARCHITECTURE &amp; DESIGN SYSTEM</span>
      <h1 class="title-serif" style="font-size: 96px; margin-bottom: 24px;">Robotshow.id</h1>
      <p style="font-size: 32px; font-weight: 300; max-width: 900px; line-height: 1.4; color: rgba(248,250,252,0.9); margin-bottom: 48px;">
        Interactive Digital Platform, Editorial Craft, 3D Kinematic Simulation, and AgiBot Humanoid Rental Showcase.
      </p>
      <div style="display: flex; gap: 40px; font-family: 'JetBrains Mono', monospace; font-size: 15px; opacity: 0.85;">
        <div><strong>ARMADA:</strong> AgiBot X2 Ultra, A2 Ultra, A2 Lite, Robodog</div>
        <div><strong>STACK:</strong> React 19 · Vite 8 · Three.js · GSAP Suite</div>
        <div><strong>VERSION:</strong> 2.0 Production Ready</div>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — EXECUTIVE PLATFORM DOCUMENTATION</span>
      <span>PAGE 01 / 12</span>
    </div>
  </div>

  <!-- SLIDE 2: EXECUTIVE SUMMARY -->
  <div class="slide slide-dark-grid">
    <div class="slide-header">
      <div class="slide-category">01 — EXECUTIVE OVERVIEW &amp; VISION</div>
      <div class="slide-number">02 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">PURPOSE &amp; POSITIONING</span>
        <h2 class="title-serif">Humanoid Robot Talents for Next-Gen Events</h2>
        <p style="margin-bottom: 24px;">
          Robotshow.id is the official digital portal for commercial humanoid robot rentals in Indonesia, engineered specifically for <strong>product launches, international expos, stage choreographies, mall activations, and VIP hospitality</strong>.
        </p>
        <p>
          Far beyond a generic corporate brochure, the platform delivers an international agency-grade interactive experience that establishes immediate technological credibility for high-profile enterprise clients.
        </p>
        <ul class="bullet-list">
          <li><strong>Certified Field Operators:</strong> Professional handlers accompany every robot deployed on-site.</li>
          <li><strong>Custom Musical Choreography:</strong> Synchronization with client brand jingles, dances, or stage tracks.</li>
          <li><strong>Nationwide Coverage:</strong> Full turnkey logistics operating out of Jakarta, Surabaya, Bali, and across Indonesia.</li>
        </ul>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="card-feature">
          <div class="num">01</div>
          <h3>Photo Studio Hero</h3>
          <p>Tactile interactive photoshoot experience with real-time cursor tracking and physical draggable prints.</p>
        </div>
        <div class="card-feature">
          <div class="num">02</div>
          <h3>Real-Scale Roster</h3>
          <p>Anatomically accurate humanoid lineup featuring 3D tilting comp cards with flippable datasheets.</p>
        </div>
        <div class="card-feature">
          <div class="num">03</div>
          <h3>Cinematic Teaser</h3>
          <p>Curated 16:9 contact sheet with dynamic grease-pencil framing and zero-lag full HD video transitions.</p>
        </div>
        <div class="card-feature">
          <div class="num">04</div>
          <h3>3D Casting Lab</h3>
          <p>Independent real-time Three.js URDF joint kinematics and facial LED expression simulator.</p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — EXECUTIVE OVERVIEW</span>
      <span>PAGE 02 / 12</span>
    </div>
  </div>

  <!-- SLIDE 3: DESIGN SYSTEM & AESTHETICS -->
  <div class="slide slide-light">
    <div class="slide-header">
      <div class="slide-category">02 — DESIGN SYSTEM &amp; CRAFT</div>
      <div class="slide-number">03 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge badge-blue">REFINED EDITORIAL DIRECTION</span>
        <h2 class="title-serif">Contemporary Editorial &amp; Swiss Typographic Rigor</h2>
        <p style="margin-bottom: 20px;">
          Rejecting cliché dark-mode cyberpunk tropes and abrasive neon colors, the design adopts a <strong>prestigious editorial aesthetic</strong> inspired by high-end design houses like Lusion—balancing archival paper surfaces with deep naval tones.
        </p>
        <div style="display: flex; gap: 16px; margin: 32px 0;">
          <div style="background: #0B1533; color: #fff; padding: 20px; border-radius: 12px; flex: 1; text-align: center;">
            <div style="font-weight: 700; font-size: 17px;">Deep Navy</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 13px; opacity: 0.75;">#0B1533</div>
          </div>
          <div style="background: #F4F3EF; color: #0B1533; border: 1px solid #D1D5DB; padding: 20px; border-radius: 12px; flex: 1; text-align: center;">
            <div style="font-weight: 700; font-size: 17px;">Archival Paper</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 13px; opacity: 0.75;">#F4F3EF</div>
          </div>
          <div style="background: #153896; color: #fff; padding: 20px; border-radius: 12px; flex: 1; text-align: center;">
            <div style="font-weight: 700; font-size: 17px;">Studio Blue</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 13px; opacity: 0.75;">#153896</div>
          </div>
          <div style="background: #38BDF8; color: #0B1533; padding: 20px; border-radius: 12px; flex: 1; text-align: center;">
            <div style="font-weight: 700; font-size: 17px;">Electric Sky</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 13px; opacity: 0.75;">#38BDF8</div>
          </div>
        </div>
        <p style="font-size: 16px; opacity: 0.7;">
          Every color is balanced for extreme readability, WCAG AA compliance, and refined optical contrast on both desktop monitors and OLED mobile displays.
        </p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="card-feature">
          <span style="font-family: 'JetBrains Mono'; color: #1E40AF; font-size: 13px;">DISPLAY HEADINGS</span>
          <h3 class="title-serif" style="font-size: 38px; margin: 8px 0;">Bodoni Moda &amp; Playfair</h3>
          <p>Delivers architectural elegance and authoritative presence akin to an international fashion magazine masthead.</p>
        </div>
        <div class="card-feature">
          <span style="font-family: 'JetBrains Mono'; color: #1E40AF; font-size: 13px;">BODY &amp; UI INTERFACE</span>
          <h3 style="font-size: 28px; margin: 8px 0;">Plus Jakarta Sans &amp; Switzer</h3>
          <p>Clean geometric sans-serif ensuring flawless legibility across compact devices and varied viewing distances.</p>
        </div>
        <div class="card-feature">
          <span style="font-family: 'JetBrains Mono'; color: #1E40AF; font-size: 13px;">TECHNICAL METRICS</span>
          <h3 style="font-family: 'JetBrains Mono'; font-size: 24px; margin: 8px 0;">IBM Plex Mono</h3>
          <p>Precise monospace voice dedicated to joint degrees of freedom (DoF), torque metrics, dates, and call sheet labels.</p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — DESIGN ARCHITECTURE</span>
      <span>PAGE 03 / 12</span>
    </div>
  </div>

  <!-- SLIDE 4: HERO SECTION -->
  <div class="slide slide-blue">
    <div class="slide-header">
      <div class="slide-category">03 — SECTION BREAKDOWN</div>
      <div class="slide-number">04 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">LANDING EXPERIENCE</span>
        <h2 class="title-serif">Hero: Interactive Photo-Shoot Studio</h2>
        <p style="margin-bottom: 20px;">
          Presents the AgiBot X2 Ultra humanoid robot inside a simulated photography studio. Every frame is pre-rendered via Cycles from official factory CAD models.
        </p>
        <ul class="bullet-list">
          <li><strong>Pointer Head Tracking:</strong> The robot head fluidly follows visitor mouse coordinates in real time.</li>
          <li><strong>WCAG-Compliant Studio Flash:</strong> Clicks trigger a controlled studio flash pulse (strictly safety-capped under 2 flashes/sec) as the robot shifts poses.</li>
          <li><strong>Physics-Driven Draggable Prints:</strong> Captured photographs land in a polaroid pile that visitors can fling around using GSAP Inertia physics.</li>
          <li><strong>Seamless Direct WhatsApp CTA:</strong> Instant call-to-action routing event inquiries directly to marketing handlers.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${heroImg}" alt="Hero Section Preview">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — HERO SECTION</span>
      <span>PAGE 04 / 12</span>
    </div>
  </div>

  <!-- SLIDE 5: TALENT ROSTER SECTION -->
  <div class="slide slide-dark-grid">
    <div class="slide-header">
      <div class="slide-category">04 — SECTION BREAKDOWN</div>
      <div class="slide-number">05 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">FLEET CATALOG</span>
        <h2 class="title-serif">Talent Roster: True Scale &amp; Comp Cards</h2>
        <p style="margin-bottom: 20px;">
          Showcases robots as professional performance models against seamless paper backdrops that dynamically unroll on vertical scroll.
        </p>
        <ul class="bullet-list">
          <li><strong>True Anatomical Proportions:</strong> Illustrates authentic physical heights visually (X2 Ultra at 131 cm vs. adult-scale A2 Series at 169 cm).</li>
          <li><strong>Interactive 3D Comp Cards:</strong> Model cards tilt with mouse movement and feature responsive foil reflections on the RFI crest.</li>
          <li><strong>Dual-Sided Card Flip:</strong> Flips to reveal detailed engineering specifications (DoF, joint torque, battery duration) and booking triggers.</li>
          <li><strong>Instant Filter Tabs:</strong> Quick-navigation buttons allowing instant switching between individual humanoid units.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${talentImg}" alt="Talent Section Preview">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — TALENT ROSTER</span>
      <span>PAGE 05 / 12</span>
    </div>
  </div>

  <!-- SLIDE 6: TEASER VIDEO SECTION -->
  <div class="slide slide-blue">
    <div class="slide-header">
      <div class="slide-category">05 — SECTION BREAKDOWN</div>
      <div class="slide-number">06 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">EVENT SHOWCASE</span>
        <h2 class="title-serif">Teaser: 16:9 Cinematic Video Experience</h2>
        <p style="margin-bottom: 20px;">
          Documents genuine live stage spectacles—including synchronized Pencak Silat martial arts, mall grand openings, and corporate reveals.
        </p>
        <ul class="bullet-list">
          <li><strong>Curated 8-Frame Contact Sheet:</strong> High-resolution 16:9 widescreen stills capturing signature performance highlights.</li>
          <li><strong>Dynamic Grease Pencil Loop:</strong> An animated hand-drawn white circle marking the visitor's selected snapshot.</li>
          <li><strong>Zero-Lag 1:1 Video Zoom:</strong> On scroll, the encircled frame expands seamlessly into a centered 1080p Full HD video playing from the exact second.</li>
          <li><strong>Integrated Audio Toggle:</strong> Direct mute/unmute control accessible at the bottom-right corner.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${teaserImg}" alt="Teaser Section Preview">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — TEASER SECTION</span>
      <span>PAGE 06 / 12</span>
    </div>
  </div>

  <!-- SLIDE 7: CALL SHEET BOOKING SECTION -->
  <div class="slide slide-light">
    <div class="slide-header">
      <div class="slide-category">06 — SECTION BREAKDOWN</div>
      <div class="slide-number">07 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge badge-blue">BOOKING WORKFLOW</span>
        <h2 class="title-serif">Call Sheet: Production-Grade Booking Flow</h2>
        <p style="margin-bottom: 20px;">
          Re-imagines standard web forms into an authentic <strong>Production Call Sheet</strong>, streamlining event inquiries into immediate WhatsApp conversions.
        </p>
        <ul class="bullet-list">
          <li><strong>Visitor Photo Pinning:</strong> Polaroids taken by the visitor during their Hero studio photoshoot automatically attach to the booking sheet.</li>
          <li><strong>Structured Parameters:</strong> Client selects talent model, event dates, operational hub (Jakarta, Surabaya, Bali, etc.), and event format.</li>
          <li><strong>Automated Message Encoding:</strong> Converts user inputs into a structured, professional WhatsApp message pre-filled for one-tap sending.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${bookingImg}" alt="Booking Section Preview">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — BOOKING SECTION</span>
      <span>PAGE 07 / 12</span>
    </div>
  </div>

  <!-- SLIDE 8: 3D CASTING LAB -->
  <div class="slide slide-dark-grid">
    <div class="slide-header">
      <div class="slide-category">07 — STANDALONE INTERACTIVE SUITE</div>
      <div class="slide-number">08 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">THREE.JS HARDWARE SIMULATOR</span>
        <h2 class="title-serif">3D Casting Lab Simulator (/casting/)</h2>
        <p style="margin-bottom: 20px;">
          A standalone 3D sandbox allowing enterprise clients to inspect joint articulation, kinematic limits, and expressions of the AgiBot X2 Ultra prior to booking.
        </p>
        <ul class="bullet-list">
          <li><strong>URDF Real Joint Kinematics:</strong> Interactive drag manipulation across the robot's head, torso, upper arms, wrists, and knees.</li>
          <li><strong>Choreography Action Presets:</strong> Instant buttons for signature stage routines (wave, cheer, martial arts stance, point).</li>
          <li><strong>Facial LED Expressions &amp; Branding:</strong> Live toggle of facial LED moods (friendly, alert, neutral) and chest logo decals.</li>
          <li><strong>Decoupled Performance Architecture:</strong> Isolated route ensuring zero bundle overhead or frame drops on the main landing page.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${labImg}" alt="3D Casting Lab Preview">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — 3D CASTING LAB</span>
      <span>PAGE 08 / 12</span>
    </div>
  </div>

  <!-- SLIDE 9: INDIVIDUAL ROBOT PAGES -->
  <div class="slide slide-blue">
    <div class="slide-header">
      <div class="slide-category">08 — PRODUCT ARCHITECTURE &amp; SEO</div>
      <div class="slide-number">09 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">STATIC MULTI-PAGE GENERATION</span>
        <h2 class="title-serif">Dedicated Robot Pages (/robot/:id/)</h2>
        <p style="margin-bottom: 20px;">
          Every rentable unit features an independent, static landing page (e.g. <code>/robot/x2-ultra/</code>, <code>/robot/a2-lite/</code>) optimized for search engines and social link previews.
        </p>
        <ul class="bullet-list">
          <li><strong>Focused 3D Model Viewer:</strong> Dedicated 360-degree orbital inspection of high-fidelity compressed GLB models.</li>
          <li><strong>Animated Spec Counters:</strong> Hardware telemetry (degrees of freedom, weight, battery capacity, walking speed) count up upon page entry.</li>
          <li><strong>Tailored Stage S сценаrios:</strong> Curated lists of recommended acts suited to each model's mechanical footprint.</li>
          <li><strong>Custom OpenGraph Previews:</strong> Unique social banner images and meta descriptions generated for crisp WhatsApp message previews.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${robotImg}" alt="Robot Detail Page Preview">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — ROBOT DETAIL PAGES</span>
      <span>PAGE 09 / 12</span>
    </div>
  </div>

  <!-- SLIDE 10: I18N, FAQ & ACCESSIBILITY -->
  <div class="slide slide-light">
    <div class="slide-header">
      <div class="slide-category">09 — CLIENT EXPERIENCE &amp; INCLUSIVITY</div>
      <div class="slide-number">10 / 12</div>
    </div>
    <div class="content-three">
      <div class="card-feature">
        <div class="num">EN · ID · ZH</div>
        <h3>Trilingual Localization</h3>
        <p style="margin-bottom: 16px;">
          Seamless instant language switching across the entire platform:
        </p>
        <ul class="bullet-list">
          <li><strong>English (EN):</strong> Primary standard for multinational corporate clients.</li>
          <li><strong>Bahasa Indonesia (ID):</strong> Native localization for domestic markets.</li>
          <li><strong>Simplified Chinese (ZH):</strong> Direct alignment with AgiBot principals and international partners.</li>
        </ul>
      </div>

      <div class="card-feature">
        <div class="num">FAQ</div>
        <h3>Educational Accordion</h3>
        <p style="margin-bottom: 16px;">
          Proactively resolves critical operational queries before client outreach:
        </p>
        <ul class="bullet-list">
          <li>Optimal booking lead times (7–14 days in advance).</li>
          <li>Audience &amp; children safety protocols during live shows.</li>
          <li>Brand song synchronization and rehearsals.</li>
          <li>Hot-swappable battery management on-site.</li>
          <li>Flight-case freight logistics across Indonesia.</li>
        </ul>
      </div>

      <div class="card-feature">
        <div class="num">A11y</div>
        <h3>Inclusive Accessibility</h3>
        <p style="margin-bottom: 16px;">
          Engineered for diverse devices and accessibility requirements:
        </p>
        <ul class="bullet-list">
          <li><strong>Reduced Motion Support:</strong> Disables intensive motion for users with vestibular sensitivities.</li>
          <li><strong>Keyboard &amp; Screen Reader Skip Links:</strong> Direct navigation jumping to main content.</li>
          <li><strong>Smart Sticky Header:</strong> Context-aware navigation that hides on scroll down and reveals on scroll up.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — CLIENT EXPERIENCE</span>
      <span>PAGE 10 / 12</span>
    </div>
  </div>

  <!-- SLIDE 11: TECHNICAL STACK & ARCHITECTURE -->
  <div class="slide slide-dark-grid">
    <div class="slide-header">
      <div class="slide-category">10 — TECHNICAL STACK &amp; PERFORMANCE</div>
      <div class="slide-number">11 / 12</div>
    </div>
    <div class="content-four">
      <div class="card-feature">
        <span class="badge" style="margin-bottom: 12px;">CORE FOUNDATION</span>
        <h3 style="font-size: 26px;">React 19 &amp; Vite 8</h3>
        <p>Ultra-modern component tree with sub-second HMR compilation, pure ES modules, and dynamic route chunking.</p>
      </div>

      <div class="card-feature">
        <span class="badge" style="margin-bottom: 12px;">MOTION SUITE</span>
        <h3 style="font-size: 26px;">GSAP &amp; Lenis</h3>
        <p>GSAP ScrollTrigger, Draggable physics, and Lenis 1.3 delivering silky smooth 120Hz display refresh synchronization.</p>
      </div>

      <div class="card-feature">
        <span class="badge" style="margin-bottom: 12px;">3D PIPELINE</span>
        <h3 style="font-size: 26px;">Three.js &amp; Meshopt</h3>
        <p>WebGL2 shading, Meshopt compression decoders, orbital camera controls, and factory URDF kinematics parsing.</p>
      </div>

      <div class="card-feature">
        <span class="badge" style="margin-bottom: 12px;">DEPLOYMENT &amp; QA</span>
        <h3 style="font-size: 26px;">Oxlint &amp; Multi-Page SSG</h3>
        <p>0 Lint errors, pre-rendered static HTML routes for SEO and WhatsApp previews, and optimized WebP media delivery.</p>
      </div>
    </div>
    <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 18px;"><strong>Performance Benchmark:</strong> Sustained 60 FPS Desktop · Sub-Second Mobile Load Times · Zero Cumulative Layout Shift</div>
      <div style="font-family: 'JetBrains Mono'; font-size: 13px; color: #38BDF8; letter-spacing: 0.1em;">STATUS: 100% PRODUCTION READY</div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — TECHNICAL BENCHMARK</span>
      <span>PAGE 11 / 12</span>
    </div>
  </div>

  <!-- SLIDE 12: CONCLUSION -->
  <div class="slide slide-cover">
    <div class="slide-header">
      <div class="slide-category">11 — STRATEGIC IMPACT &amp; READINESS</div>
      <div class="slide-number">12 / 12</div>
    </div>
    <div style="max-width: 1150px; margin: auto 0;">
      <span class="badge">VALUE PROPOSITION</span>
      <h2 class="title-serif" style="font-size: 64px; margin-bottom: 24px;">Setting a New Digital Benchmark for Robotics in Indonesia</h2>
      <p style="font-size: 24px; line-height: 1.5; margin-bottom: 40px; color: rgba(248, 250, 252, 0.9);">
        Robotshow.id unites world-class AgiBot humanoid engineering with an internationally acclaimed interactive digital showcase—instilling immediate enterprise confidence in Robot Future Indonesia's capabilities.
      </p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;">
        <div style="background: rgba(255,255,255,0.05); padding: 26px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="color: #38BDF8; font-weight: 700; font-size: 20px; margin-bottom: 8px;">Institutional Trust</div>
          <p style="font-size: 15px; opacity: 0.85;">Editorial aesthetics position RFI as the undisputed premier distributor of AgiBot robotics.</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 26px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="color: #38BDF8; font-weight: 700; font-size: 20px; margin-bottom: 8px;">Frictionless Conversion</div>
          <p style="font-size: 15px; opacity: 0.85;">Seamless journey from interactive play and talent exploration to WhatsApp booking in under 60 seconds.</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 26px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="color: #38BDF8; font-weight: 700; font-size: 20px; margin-bottom: 8px;">Executive Ready</div>
          <p style="font-size: 15px; opacity: 0.85;">This documentation is structured for immediate presentation to C-level executives, partners, and event organizers.</p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — PRESENTATION COMPLETE</span>
      <span>PAGE 12 / 12</span>
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync('temp_presentation.html', html);
  console.log('HTML presentation written.');

  const printPage = await browser.newPage();
  await printPage.setViewport({ width: 1920, height: 1080 });
  
  const fullPath = 'file:///' + path.resolve('temp_presentation.html').replace(/\\/g, '/');
  console.log('Loading HTML template for print:', fullPath);
  await printPage.goto(fullPath, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const pdfPath = 'c:/codingan/robot/PRESENTASI_WEB_ROBOTSHOW_ID.pdf';
  await printPage.pdf({
    path: pdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    pageRanges: '1-12'
  });
  console.log('PDF generated at:', pdfPath);
  await browser.close();

  if (fs.existsSync('temp_presentation.html')) fs.unlinkSync('temp_presentation.html');
  console.log('Done! Generated clean English PDF presentation.');
}

generate().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
