import fs from 'fs';
import path from 'path';

async function generate() {
  const { default: puppeteer } = await import('puppeteer-core');
  
  const toBase64 = (file) => {
    try {
      const bitmap = fs.readFileSync(file);
      return 'data:image/png;base64,' + bitmap.toString('base64');
    } catch {
      return '';
    }
  };

  const heroImg = toBase64('slide_hero.png');
  const talentImg = toBase64('slide_talent.png');
  const teaserImg = toBase64('slide_teaser.png');
  const bookingImg = toBase64('slide_booking.png');
  const labImg = toBase64('slide_lab.png');
  const robotImg = toBase64('slide_robot.png');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Presentasi Website Robotshow.id</title>
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
    color: #F2F0EC;
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
    background: radial-gradient(120% 100% at 80% 20%, #1A3FB8 0%, #0B1533 60%, #060B1C 100%);
  }
  .slide-light {
    background: #F4F3EF;
    color: #0B1533;
  }
  .slide-blue {
    background: radial-gradient(100% 90% at 50% 10%, #183CA8 0%, #0B1533 80%);
  }
  .slide-dark-grid {
    background: 
      linear-gradient(rgba(242, 240, 236, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(242, 240, 236, 0.03) 1px, transparent 1px),
      #0B1533;
    background-size: 60px 60px;
  }

  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-bottom: 1px solid rgba(242, 240, 236, 0.15);
    padding-bottom: 24px;
    margin-bottom: 30px;
  }
  .slide-light .slide-header {
    border-bottom-color: rgba(11, 21, 51, 0.15);
  }
  .slide-category {
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #C1FF00;
  }
  .slide-light .slide-category {
    color: #13308F;
  }
  .slide-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px;
    opacity: 0.6;
  }
  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(242, 240, 236, 0.15);
    padding-top: 20px;
    font-size: 14px;
    opacity: 0.65;
    font-family: 'JetBrains Mono', monospace;
  }
  .slide-light .slide-footer {
    border-top-color: rgba(11, 21, 51, 0.15);
  }

  .title-serif {
    font-family: 'Playfair Display', Georgia, serif;
    font-weight: 700;
  }
  h1 {
    font-size: 72px;
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
    opacity: 0.88;
  }
  .badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    background: rgba(193, 255, 0, 0.15);
    color: #C1FF00;
    border: 1px solid #C1FF00;
    margin-bottom: 20px;
  }
  .badge-blue {
    background: rgba(19, 48, 143, 0.12);
    color: #13308F;
    border-color: #13308F;
  }

  .content-split {
    display: grid;
    grid-template-columns: 1.05fr 1.35fr;
    gap: 60px;
    align-items: center;
    flex: 1;
  }
  .content-equal {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    flex: 1;
    align-items: center;
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
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12);
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 36px 32px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .slide-light .card-feature {
    background: #FFFFFF;
    border-color: rgba(11, 21, 51, 0.08);
    box-shadow: 0 12px 32px rgba(11, 21, 51, 0.05);
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
    font-size: 40px;
    color: #C1FF00;
    line-height: 1;
  }
  .slide-light .card-feature .num {
    color: #13308F;
  }

  .bullet-list {
    list-style: none;
    margin-top: 24px;
  }
  .bullet-list li {
    position: relative;
    padding-left: 32px;
    margin-bottom: 16px;
    font-size: 18px;
    line-height: 1.5;
  }
  .bullet-list li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #C1FF00;
    font-weight: 700;
  }
  .slide-light .bullet-list li::before {
    color: #13308F;
  }
</style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <div class="slide slide-cover">
    <div class="slide-header" style="border: none;">
      <div class="slide-category">ROBOT FUTURE INDONESIA</div>
      <div class="slide-number">RESMI &amp; EKSKLUSIF</div>
    </div>
    <div style="max-width: 1200px; margin-top: 80px;">
      <span class="badge">PLATFORM SEWA &amp; SHOWCASE AGIBOT</span>
      <h1 class="title-serif" style="font-size: 96px; margin-bottom: 24px;">Robotshow.id</h1>
      <p style="font-size: 32px; font-weight: 300; max-width: 900px; line-height: 1.4; color: rgba(242,240,236,0.9); margin-bottom: 48px;">
        Presentasi Arsitektur Web, Konsep Desain Editorial, Interaktivitas 3D, dan Katalog Talenta Robot Humanoid.
      </p>
      <div style="display: flex; gap: 40px; font-family: 'JetBrains Mono', monospace; font-size: 16px; opacity: 0.8;">
        <div><strong>ARMADA:</strong> AgiBot X2 Ultra, A2 Ultra, A2 Lite, Robodog</div>
        <div><strong>FORMAT:</strong> Multi-Page SSR / Static Web Application</div>
        <div><strong>TANGGAL:</strong> Oktober 2026</div>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — DOKUMENTASI LENGKAP PLATFORM</span>
      <span>HALAMAN 01 / 12</span>
    </div>
  </div>

  <!-- SLIDE 2: EXECUTIVE SUMMARY -->
  <div class="slide slide-dark-grid">
    <div class="slide-header">
      <div class="slide-category">01 — IKHTISAR &amp; VISI UTAMA</div>
      <div class="slide-number">02 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">LATAR BELAKANG &amp; TUJUAN</span>
        <h2 class="title-serif">Talenta Robot Humanoid untuk Event Masa Depan</h2>
        <p style="margin-bottom: 24px;">
          Robotshow.id adalah portal resmi penyewaan robot humanoid berteknologi tinggi di Indonesia untuk kebutuhan <strong>peluncuran produk, expo, pertunjukan panggung, mall festival, dan sambutan tamu VIP</strong>.
        </p>
        <p>
          Bukan sekadar situs profil biasa, web ini dirancang dengan standar agensi interaktif internasional untuk memberikan kesan pertama yang futuristik, kredibel, dan berkelas tinggi kepada calon klien korporat.
        </p>
        <ul class="bullet-list">
          <li><strong>Operator Tersertifikasi:</strong> Setiap unit didampingi operator profesional di lokasi.</li>
          <li><strong>Koreografi Musik:</strong> Robot dapat diprogram menari sesuai lagu atau jingle brand.</li>
          <li><strong>Jangkauan Luas:</strong> Layanan operasional utama di Jakarta, Surabaya, Bali, dan kota lainnya.</li>
        </ul>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="card-feature">
          <div class="num">01</div>
          <h3>Photo Studio Hero</h3>
          <p>Pengalaman memotret robot interaktif pertama di web dengan pencahayaan flash nyata dan hasil foto polaroid.</p>
        </div>
        <div class="card-feature">
          <div class="num">02</div>
          <h3>Roster Skala Nyata</h3>
          <p>Katalog talenta dengan tinggi proporsi asli manusia dan kartu comp cards berteknologi 3D tilt.</p>
        </div>
        <div class="card-feature">
          <div class="num">03</div>
          <h3>Video Contact Sheet</h3>
          <p>Pratinjau video aksi panggung dengan transisi pembesaran lensa mulus tanpa reload.</p>
        </div>
        <div class="card-feature">
          <div class="num">04</div>
          <h3>3D Casting Lab</h3>
          <p>Simulasi persendian URDF dan mimik wajah LED real-time berbasis Three.js di halaman khusus.</p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — ARSITEKTUR PLATFORM</span>
      <span>HALAMAN 02 / 12</span>
    </div>
  </div>

  <!-- SLIDE 3: DESIGN SYSTEM & AESTHETICS -->
  <div class="slide slide-light">
    <div class="slide-header">
      <div class="slide-category">02 — IDENTITAS DESAIN &amp; TIPOGRAFI</div>
      <div class="slide-number">03 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge badge-blue">DESIGN SYSTEM &amp; PALET WARNA</span>
        <h2 class="title-serif">Estetika Editorial Lusion &amp; Akurasi Swiss</h2>
        <p style="margin-bottom: 20px;">
          Menghindari gaya klise cyberpunk murahan (neon berlebihan &amp; dark mode generik), website ini mengadopsi <strong>arahan seni editorial kontemporer</strong> yang memadukan tipografi serif klasik dengan presisi monospace teknis.
        </p>
        <div style="display: flex; gap: 16px; margin: 32px 0;">
          <div style="background: #0B1533; color: #fff; padding: 20px; border-radius: 12px; flex: 1; text-align: center;">
            <div style="font-weight: 700; font-size: 18px;">Navy</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 13px; opacity: 0.8;">#0B1533</div>
          </div>
          <div style="background: #F2F0EC; color: #0B1533; border: 1px solid #ccc; padding: 20px; border-radius: 12px; flex: 1; text-align: center;">
            <div style="font-weight: 700; font-size: 18px;">Paper</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 13px; opacity: 0.8;">#F2F0EC</div>
          </div>
          <div style="background: #13308F; color: #fff; padding: 20px; border-radius: 12px; flex: 1; text-align: center;">
            <div style="font-weight: 700; font-size: 18px;">Electric Blue</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 13px; opacity: 0.8;">#13308F</div>
          </div>
          <div style="background: #C1FF00; color: #0B1533; padding: 20px; border-radius: 12px; flex: 1; text-align: center;">
            <div style="font-weight: 700; font-size: 18px;">Acid Lime</div>
            <div style="font-family: 'JetBrains Mono'; font-size: 13px; opacity: 0.8;">#C1FF00</div>
          </div>
        </div>
        <p style="font-size: 16px; opacity: 0.7;">
          Kombinasi warna dirancang untuk memberikan visibilitas tinggi, kontras tajam, serta kenyamanan mata pengguna baik di desktop maupun perangkat mobile.
        </p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="card-feature">
          <span style="font-family: 'JetBrains Mono'; color: #13308F; font-size: 13px;">DISPLAY HEADINGS</span>
          <h3 class="title-serif" style="font-size: 38px; margin: 8px 0;">Bodoni Moda &amp; Playfair</h3>
          <p>Memberikan kesan mewah, prestisius, dan artistik seperti sampul majalah desain arsitektur internasional.</p>
        </div>
        <div class="card-feature">
          <span style="font-family: 'JetBrains Mono'; color: #13308F; font-size: 13px;">BODY &amp; UI TEXT</span>
          <h3 style="font-size: 28px; margin: 8px 0;">Plus Jakarta Sans &amp; Switzer</h3>
          <p>Huruf sans-serif geometris modern yang bersih dan memiliki keterbacaan optimal pada semua resolusi layar.</p>
        </div>
        <div class="card-feature">
          <span style="font-family: 'JetBrains Mono'; color: #13308F; font-size: 13px;">DATA &amp; SPECS</span>
          <h3 style="font-family: 'JetBrains Mono'; font-size: 24px; margin: 8px 0;">IBM Plex Mono</h3>
          <p>Digunakan untuk penandaan teknis (DoF, torsi, tinggi, berat, tanggal, dan nomor indeks bab).</p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — DESIGN SYSTEM</span>
      <span>HALAMAN 03 / 12</span>
    </div>
  </div>

  <!-- SLIDE 4: HERO SECTION -->
  <div class="slide slide-blue">
    <div class="slide-header">
      <div class="slide-category">03 — SECTION WALKTHROUGH</div>
      <div class="slide-number">04 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">BERANDA UTAMA</span>
        <h2 class="title-serif">Hero: Photo-Shoot Studio Interaktif</h2>
        <p style="margin-bottom: 20px;">
          Menampilkan robot humanoid AgiBot X2 Ultra di dalam studio foto profesional. Setiap frame menggunakan render Cycles resolusi tinggi dari CAD resmi pabrikan.
        </p>
        <ul class="bullet-list">
          <li><strong>Pointer Head Tracking:</strong> Kepala robot secara cerdas melacak pergerakan mouse pengunjung secara real-time.</li>
          <li><strong>Studio Flash Photography:</strong> Setiap klik memicu kilatan flash kamera (aman &amp; diatur di bawah batas WCAG 2.3.1), lalu robot berganti pose secara dinamis.</li>
          <li><strong>Draggable Polaroid Prints:</strong> Foto hasil jepretan otomatis jatuh ke tumpukan polaroid yang bisa ditarik, digeser, dan dilempar bebas dengan inersia fisika.</li>
          <li><strong>Direct WhatsApp CTA:</strong> Tombol booking instan yang mengarahkan pesan langsung ke tim Robotshow.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${heroImg}" alt="Hero Screenshot">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — HERO SECTION</span>
      <span>HALAMAN 04 / 12</span>
    </div>
  </div>

  <!-- SLIDE 5: TALENT ROSTER SECTION -->
  <div class="slide slide-dark-grid">
    <div class="slide-header">
      <div class="slide-category">04 — SECTION WALKTHROUGH</div>
      <div class="slide-number">05 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">KATALOG ARMADA</span>
        <h2 class="title-serif">Talent Roster: Skala Nyata &amp; Comp Cards</h2>
        <p style="margin-bottom: 20px;">
          Menghadirkan robot selayaknya model profesional dalam format <em>Talent Comp Cards</em>. Setiap model disajikan dengan latar gulungan kertas studio bertingkat saat di-scroll.
        </p>
        <ul class="bullet-list">
          <li><strong>Proporsi Fisik Akurat:</strong> Menampilkan tinggi komparatif robot asli secara visual (X2 Ultra setinggi 131 cm dan A2 Ultra/Lite setinggi 169 cm).</li>
          <li><strong>Comp Cards Interaktif:</strong> Kartu dapat dimiringkan (*tilt*) mengikuti posisi kursor dengan efek kilau foil (*foil sheen*) pada logo RFI.</li>
          <li><strong>Flip Card Mode:</strong> Kartu dapat dibalik untuk melihat rincian spesifikasi teknis lengkap, keahlian gerak, dan tautan booking langsung.</li>
          <li><strong>Filter Navigasi Cepat:</strong> Pengunjung bisa langsung berpindah model robot melalui tab nama di bagian atas.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${talentImg}" alt="Talent Section Screenshot">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — TALENT ROSTER</span>
      <span>HALAMAN 05 / 12</span>
    </div>
  </div>

  <!-- SLIDE 6: TEASER VIDEO SECTION -->
  <div class="slide slide-blue">
    <div class="slide-header">
      <div class="slide-category">05 — SECTION WALKTHROUGH</div>
      <div class="slide-number">06 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">DOKUMENTASI EVENT</span>
        <h2 class="title-serif">Teaser: Contact Sheet &amp; Video Sinematik</h2>
        <p style="margin-bottom: 20px;">
          Menampilkan rekaman video aksi nyata robot di berbagai panggung (Pencak Silat, Pembukaan Mall, Peluncuran Produk, dan Pameran).
        </p>
        <ul class="bullet-list">
          <li><strong>Galeri 8 Frame Contact Sheet:</strong> Cuplikan still 16:9 yang mewakili berbagai momen terbaik pertunjukan robot.</li>
          <li><strong>Lingkaran Pensil Dinamis:</strong> Animasi garis pensil putih (*grease pencil*) yang melingkari frame yang dipilih pengunjung.</li>
          <li><strong>Transisi Zoom 1:1 Sinematik:</strong> Saat halaman digulir, frame yang dilingkari membesar secara mulus dan langsung bertransformasi menjadi video Full HD 1080p yang berputar otomatis dari detik yang sama.</li>
          <li><strong>Audio Toggle:</strong> Tombol kontrol suara terintegrasi dengan aksesibilitas ramah pengguna.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${teaserImg}" alt="Teaser Section Screenshot">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — TEASER SECTION</span>
      <span>HALAMAN 06 / 12</span>
    </div>
  </div>

  <!-- SLIDE 7: CALL SHEET BOOKING SECTION -->
  <div class="slide slide-light">
    <div class="slide-header">
      <div class="slide-category">06 — SECTION WALKTHROUGH</div>
      <div class="slide-number">07 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge badge-blue">INTEGRASI PEMESANAN</span>
        <h2 class="title-serif">Call Sheet: Booking Instan Terhubung WhatsApp</h2>
        <p style="margin-bottom: 20px;">
          Menyulap formulir pemesanan konvensional yang kaku menjadi <strong>Production Call Sheet</strong> interaktif yang menyenangkan dan langsung siap pakai.
        </p>
        <ul class="bullet-list">
          <li><strong>Sinkronisasi Foto Pengunjung:</strong> Hasil jepretan foto polaroid yang diambil pengunjung saat bermain di Hero Section otomatis disematkan di lembar call sheet.</li>
          <li><strong>Parameter Event Lengkap:</strong> Memilih jenis talenta, tanggal pelaksanaan, kota tujuan (Jakarta, Surabaya, Bali, dll), serta jenis acara.</li>
          <li><strong>Generator Pesan Otomatis:</strong> Data formulir otomatis di-encode menjadi format pesan WhatsApp terstruktur dan profesional yang langsung dikirimkan ke tim marketing.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${bookingImg}" alt="Booking Section Screenshot">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — BOOKING SECTION</span>
      <span>HALAMAN 07 / 12</span>
    </div>
  </div>

  <!-- SLIDE 8: 3D CASTING LAB -->
  <div class="slide slide-dark-grid">
    <div class="slide-header">
      <div class="slide-category">07 — FITUR EKSKLUSIF STANDALONE</div>
      <div class="slide-number">08 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">SIMULASI REAL-TIME THREE.JS</span>
        <h2 class="title-serif">Ruang Casting 3D Lab (/casting/)</h2>
        <p style="margin-bottom: 20px;">
          Aplikasi simulator interaktif 3D mandiri yang memungkinkan klien menguji coba dan melihat langsung kemampuan mekanis robot AgiBot X2 Ultra sebelum menyewa.
        </p>
        <ul class="bullet-list">
          <li><strong>Rigging Persendian URDF Nyata:</strong> Pengunjung dapat mengklik dan menggeser langsung lengan, kepala, torso, dan kaki robot.</li>
          <li><strong>Presets Emote Gerakan:</strong> Tombol instan untuk pose aksi panggung seperti melambai (*wave*), bersorak (*cheer*), dan menunjuk (*point*).</li>
          <li><strong>Kendali LED Mata &amp; Logo:</strong> Memilih ragam ekspresi LED mata robot (ramah, fokus, gembira) dan stiker logo dada.</li>
          <li><strong>Arsitektur Terpisah:</strong> Dipisahkan dari beranda utama untuk menjaga kecepatan muat landing page tetap instan.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${labImg}" alt="3D Casting Lab Screenshot">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — 3D CASTING LAB</span>
      <span>HALAMAN 08 / 12</span>
    </div>
  </div>

  <!-- SLIDE 9: INDIVIDUAL ROBOT PAGES -->
  <div class="slide slide-blue">
    <div class="slide-header">
      <div class="slide-category">08 — DETAIL PRODUK &amp; SEO MULTI-PAGE</div>
      <div class="slide-number">09 / 12</div>
    </div>
    <div class="content-split">
      <div>
        <span class="badge">HALAMAN STATIS TERDEDIKASI</span>
        <h2 class="title-serif">Halaman Detail Robot (/robot/:id/)</h2>
        <p style="margin-bottom: 20px;">
          Setiap robot rental memiliki halaman web statis khusus (misalnya <code>/robot/x2-ultra/</code>, <code>/robot/a2-lite/</code>) yang siap diindeks Google dan dibagikan ke WhatsApp.
        </p>
        <ul class="bullet-list">
          <li><strong>Viewer 3D Model Terisolasi:</strong> Pengunjung dapat memutar dan menginspeksi model 3D robot 360 derajat.</li>
          <li><strong>Counter Spesifikasi Animatif:</strong> Angka spesifikasi (DoF gerak, berat, daya tahan baterai, kecepatan jalan) teranimasi menghitung naik saat halaman dibuka.</li>
          <li><strong>Rekomendasi Aksi Panggung:</strong> Daftar skenario pertunjukan yang paling ideal untuk tipe robot tersebut.</li>
          <li><strong>OpenGraph Tags Khusus:</strong> Dilengkapi metadata gambar preview dan judul khusus saat link dikirim lewat chat WhatsApp.</li>
        </ul>
      </div>
      <div class="screen-frame">
        <img src="${robotImg}" alt="Robot Detail Page Screenshot">
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — ROBOT DETAIL PAGES</span>
      <span>HALAMAN 09 / 12</span>
    </div>
  </div>

  <!-- SLIDE 10: I18N, FAQ & ACCESSIBILITY -->
  <div class="slide slide-light">
    <div class="slide-header">
      <div class="slide-category">09 — USER EXPERIENCE &amp; ACCESSIBILITY</div>
      <div class="slide-number">10 / 12</div>
    </div>
    <div class="content-three">
      <div class="card-feature">
        <div class="num">ID · EN · ZH</div>
        <h3>Multi-Bahasa Lengkap</h3>
        <p style="margin-bottom: 16px;">
          Website dilengkapi sistem lokalisasi multi-bahasa terintegrasi:
        </p>
        <ul class="bullet-list">
          <li><strong>Bahasa Indonesia (ID):</strong> Bahasa utama operasional nasional.</li>
          <li><strong>English (EN):</strong> Untuk audiens korporat multinasional &amp; ekspatriat.</li>
          <li><strong>Mandarin (ZH):</strong> Memudahkan komunikasi dengan prinsipal AgiBot &amp; delegasi internasional.</li>
        </ul>
      </div>

      <div class="card-feature">
        <div class="num">FAQ</div>
        <h3>Edukasi &amp; FAQ Accordion</h3>
        <p style="margin-bottom: 16px;">
          Menjawab pertanyaan paling krusial sebelum klien memutuskan menyewa:
        </p>
        <ul class="bullet-list">
          <li>Waktu ideal pemesanan (7–14 hari kerja).</li>
          <li>Protokol keselamatan pengunjung &amp; anak-anak saat atraksi.</li>
          <li>Sinkronisasi lagu dan tarian brand.</li>
          <li>Ketahanan baterai dan ketersediaan baterai cadangan di lokasi.</li>
          <li>Pengiriman aman via <em>flight case</em> khusus.</li>
        </ul>
      </div>

      <div class="card-feature">
        <div class="num">A11y</div>
        <h3>Standar Aksesibilitas Tinggi</h3>
        <p style="margin-bottom: 16px;">
          Menjamin website ramah untuk semua jenis pengunjung dan perangkat:
        </p>
        <ul class="bullet-list">
          <li><strong>Reduced Motion:</strong> Menonaktifkan animasi berat jika sistem perangkat meminta hemat daya/sensitif gerak.</li>
          <li><strong>Skip to Content Link:</strong> Navigasi keyboard cepat untuk pembaca layar (screen reader).</li>
          <li><strong>Sticky Smart Navbar:</strong> Navigasi otomatis menyembunyikan diri saat scroll ke bawah dan kembali saat scroll ke atas.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — UX &amp; AKSESIBILITAS</span>
      <span>HALAMAN 10 / 12</span>
    </div>
  </div>

  <!-- SLIDE 11: TECHNICAL STACK & ARCHITECTURE -->
  <div class="slide slide-dark-grid">
    <div class="slide-header">
      <div class="slide-category">10 — ARSITEKTUR TEKNOLOGI &amp; PERFORMA</div>
      <div class="slide-number">11 / 12</div>
    </div>
    <div class="content-four">
      <div class="card-feature">
        <span class="badge" style="margin-bottom: 12px;">CORE FRAMEWORK</span>
        <h3 style="font-size: 26px;">React 19 &amp; Vite 8</h3>
        <p>Arsitektur komponen modern dengan performa kompilasi sub-detik, modul ES murni, dan pemisahan bundle dinamis.</p>
      </div>

      <div class="card-feature">
        <span class="badge" style="margin-bottom: 12px;">ANIMASI PROFESIONAL</span>
        <h3 style="font-size: 26px;">GSAP Suite + Lenis</h3>
        <p>GSAP ScrollTrigger, Draggable dengan inersia fisika, serta Lenis 1.3 untuk smooth scroll yang halus di layar 120Hz.</p>
      </div>

      <div class="card-feature">
        <span class="badge" style="margin-bottom: 12px;">3D WEB ENGINE</span>
        <h3 style="font-size: 26px;">Three.js + Meshopt</h3>
        <p>WebGL2 shading, dekoder kompresi Meshopt, orbit controls, dan pipeline konversi URDF persendian asli.</p>
      </div>

      <div class="card-feature">
        <span class="badge" style="margin-bottom: 12px;">BUILD &amp; KUALITAS</span>
        <h3 style="font-size: 26px;">Oxlint &amp; Multi-Page SSG</h3>
        <p>0 Lint error, build statis teroptimasi untuk SEO &amp; WhatsApp link previews, dan kompresi aset gambar WebP modern.</p>
      </div>
    </div>
    <div style="background: rgba(193, 255, 0, 0.08); border: 1px solid rgba(193, 255, 0, 0.3); border-radius: 12px; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 18px;"><strong>Target Skor Performa:</strong> 60 FPS Animasi Konstan Desktop · Waktu Muat Cepat Mobile · Zero Lag</div>
      <div style="font-family: 'JetBrains Mono'; font-size: 14px; color: #C1FF00;">STATUS: 100% PRODUCTION READY</div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — TECH STACK</span>
      <span>HALAMAN 11 / 12</span>
    </div>
  </div>

  <!-- SLIDE 12: CONCLUSION -->
  <div class="slide slide-cover">
    <div class="slide-header">
      <div class="slide-category">11 — PENUTUP &amp; KESIAPAN</div>
      <div class="slide-number">12 / 12</div>
    </div>
    <div style="max-width: 1100px; margin: auto 0;">
      <span class="badge">KESIMPULAN &amp; POTENSI BISNIS</span>
      <h2 class="title-serif" style="font-size: 64px; margin-bottom: 24px;">Siap Menjadi Standar Baru Robot Showcase di Indonesia</h2>
      <p style="font-size: 24px; line-height: 1.5; margin-bottom: 40px; color: rgba(242, 240, 236, 0.88);">
        Platform web Robotshow.id memadukan kekuatan teknologi robot humanoid AgiBot dengan pengalaman digital kelas dunia yang memukau. Klien korporat mendapatkan keyakinan penuh akan profesionalisme, kredibilitas, dan kualitas layanan Robot Future Indonesia.
      </p>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;">
        <div style="background: rgba(255,255,255,0.06); padding: 24px; border-radius: 12px;">
          <div style="color: #C1FF00; font-weight: 700; font-size: 20px; margin-bottom: 8px;">Kredibilitas Tinggi</div>
          <p style="font-size: 15px;">Desain berstandar internasional membuktikan status RFI sebagai distributor resmi armada AgiBot.</p>
        </div>
        <div style="background: rgba(255,255,255,0.06); padding: 24px; border-radius: 12px;">
          <div style="color: #C1FF00; font-weight: 700; font-size: 20px; margin-bottom: 8px;">Konversi Booking Cepat</div>
          <p style="font-size: 15px;">Alur interaksi dari melihat foto, memilih talenta, hingga chat WhatsApp terstruktur dan minim hambatan.</p>
        </div>
        <div style="background: rgba(255,255,255,0.06); padding: 24px; border-radius: 12px;">
          <div style="color: #C1FF00; font-weight: 700; font-size: 20px; margin-bottom: 8px;">Siap Dipresentasikan</div>
          <p style="font-size: 15px;">Materi presentasi ini dapat langsung ditunjukkan kepada pimpinan perusahaan, EO, dan mitra strategis.</p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>ROBOTSHOW.ID — PRESENTASI SELESAI</span>
      <span>HALAMAN 12 / 12</span>
    </div>
  </div>

</body>
</html>`;

  fs.writeFileSync('temp_presentation.html', html);
  console.log('HTML presentation written.');

  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const fullPath = 'file:///' + path.resolve('temp_presentation.html').replace(/\\/g, '/');
  console.log('Loading:', fullPath);
  await page.goto(fullPath, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const pdfPath = 'c:/codingan/robot/PRESENTASI_WEB_ROBOTSHOW_ID.pdf';
  await page.pdf({
    path: pdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    pageRanges: '1-12'
  });
  console.log('PDF generated at:', pdfPath);
  await browser.close();

  // Clean temporary files
  if (fs.existsSync('temp_presentation.html')) fs.unlinkSync('temp_presentation.html');
  const tempScreens = ['slide_hero.png', 'slide_talent.png', 'slide_teaser.png', 'slide_booking.png', 'slide_lab.png', 'slide_robot.png'];
  for (const f of tempScreens) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
  console.log('Cleaned temporary files.');
}

generate().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
