// Specs follow AgiBot's published figures (agibot.com and authorised resellers).
// Match them against each unit's datasheet before quoting them in a proposal.
export const FLEET_MODELS = [
  {
    id: 'x2-ultra',
    name: 'AgiBot X2 Ultra',
    type: 'Humanoid kompak',
    summary: 'Humanoid lincah untuk tarian panggung, sambutan VIP, dan sesi foto bersama pengunjung.',
    description: 'Humanoid kompak dengan 30 derajat gerak dan sensor LiDAR 3D. Gerakannya luwes untuk koreografi tari, cukup ringan untuk tampil dekat pengunjung di mall dan booth pameran.',
    specs: [
      { label: 'Tinggi', value: '± 131 cm' },
      { label: 'Berat', value: '± 39 kg' },
      { label: 'Derajat gerak', value: '30 DoF' },
      { label: 'Sensor', value: 'LiDAR 3D + RGB-D' }
    ],
    acts: [
      'Tarian panggung sinkron dengan musik',
      'Sambutan VIP dan gunting pita',
      'Reveal produk di panggung',
      'Sesi foto dengan pengunjung'
    ],
    image: '/assets/robots/hero-agibot-dance.png',
    imageWidth: 474,
    imageHeight: 590
  },
  {
    id: 'a2-lite',
    name: 'AgiBot A2 Lite',
    type: 'Humanoid seukuran manusia',
    summary: 'Humanoid setinggi orang dewasa untuk menyambut tamu dan menjadi host booth.',
    description: 'Humanoid setinggi orang dewasa dengan waktu operasi hingga sekitar 4,5 jam. Kehadirannya terasa di pintu masuk, booth pameran, dan panggung peluncuran produk.',
    specs: [
      { label: 'Tinggi', value: '± 169 cm' },
      { label: 'Berat', value: '± 63 kg' },
      { label: 'Derajat gerak', value: '23 DoF' },
      { label: 'Waktu operasi', value: 'hingga ± 4,5 jam' }
    ],
    acts: [
      'Menyambut tamu di pintu masuk',
      'Host booth pameran',
      'Reveal produk di panggung',
      'Sesi foto dengan pengunjung'
    ],
    image: '/assets/robots/agibot-a2lite-stance.png',
    imageWidth: 800,
    imageHeight: 731
  },
  {
    id: 'd1-pro',
    name: 'AgiBot D1 Pro',
    type: 'Robodog',
    summary: 'Robodog untuk atraksi salto, lompat, dan menyapa anak-anak.',
    description: 'Robot berkaki empat dengan kendali gerak berbasis reinforcement learning. Bisa salto, melompat, naik tangga, dan berdiri dengan dua kaki, jadi selalu menarik perhatian keluarga.',
    specs: [
      { label: 'Kecepatan maks.', value: '3,5 m/s' },
      { label: 'Beban', value: '5 kg' },
      { label: 'Torsi sendi', value: '48 N·m' },
      { label: 'Atraksi', value: 'Salto, lompat, naik tangga' }
    ],
    acts: [
      'Salto dan atraksi lompat',
      'Berdiri dua kaki dan menyapa',
      'Tampil bersama robot humanoid',
      'Sesi foto dengan anak-anak'
    ],
    image: '/assets/robots/robodog-white.png',
    imageWidth: 559,
    imageHeight: 434
  }
];

export const INCLUDED_SERVICES = [
  {
    title: 'Dual-Certified Operator Crew',
    desc: 'Setiap sewa sudah mencakup 2 operator profesional tersertifikasi resmi yang mengendalikan dan memantau telemetri panggung secara real-time.'
  },
  {
    title: 'On-Site Safety Officer',
    desc: 'Protokol keselamatan standar internasional dengan supervisor panggung bersertifikat untuk memastikan interaksi pengunjung 100% aman.'
  },
  {
    title: 'Hot-Swap Battery Management',
    desc: 'Modul baterai cadangan dan sistem swap tanpa jeda, memastikan pertunjukan robot Anda berjalan tanpa gangguan low-battery.'
  },
  {
    title: 'Nationwide Indonesia Logistics',
    desc: 'Pengiriman aman dengan flight case berstandar militer ke Jakarta, Surabaya, Bali, Bandung, Medan, Yogyakarta, hingga luar pulau.'
  },
  {
    title: 'Modular Act Choreography',
    desc: 'Pilihan lebih dari 8+ katalog koreografi tari panggung, salam formal kenegaraan, hingga custom sound cue sesuai tema event Anda.'
  },
  {
    title: 'Fully Insured & Show-Ready',
    desc: 'Perlindungan asuransi komprehensif untuk publik dan peralatan dalam satu kontrak legal terpadu di bawah PT Robotika Futuristik Indonesia (RFI).'
  }
];

export const VENUE_CATEGORIES = [
  {
    title: 'Exhibitions & Expos',
    subtitle: 'Jakarta International Expo, ICE BSD, Grand City Surabaya',
    image: '/assets/venues/exhibitions.jpg'
  },
  {
    title: 'Shopping Malls',
    subtitle: 'Grand Indonesia, Senayan City, Pakuwon Mall, Beachwalk Bali',
    image: '/assets/venues/mall.jpg'
  },
  {
    title: 'Theme Parks & Family',
    subtitle: 'Taman Impian Jaya Ancol, Trans Studio, Jatim Park',
    image: '/assets/venues/theme-park.jpg'
  },
  {
    title: 'Brand Campaigns & Launches',
    subtitle: 'Automotive reveals, smartphone launches, luxury galas',
    image: '/assets/venues/brand-campaigns.jpg'
  },
  {
    title: 'Tourism & Experiential',
    subtitle: 'Bali Beach Clubs, cultural summits, luxury hotel conventions',
    image: '/assets/venues/tourism.jpg'
  },
  {
    title: 'Museums & Cultural Centers',
    subtitle: 'National tech pavilions, science centers, futuristic galleries',
    image: '/assets/venues/museums.jpg'
  }
];

export const FAQS = [
  {
    q: 'Berapa hari sebelum event kami harus melakukan booking?',
    a: 'Kami menyarankan booking minimal 7–14 hari kerja sebelum acara agar tim koreografi dapat memprogram formasi panggung dan mengurus jadwal logistik flight-case. Namun untuk kebutuhan mendesak di area Jabodetabek atau Surabaya, kami memiliki tim siaga dengan konfirmasi kilat (tergantung ketersediaan armada).'
  },
  {
    q: 'Apakah pertunjukan robot aman bagi pengunjung dan anak-anak?',
    a: 'Sangat aman. Setiap robot AgiBot dan Robodog dilengkapi sensor LiDAR 360°, depth camera, dan auto-braking ultrasonik. Ditambah lagi, setiap sesi panggung didampingi oleh On-site Safety Supervisor dan 2 certified flight crew yang memegang safety emergency cut-off nirkabel.'
  },
  {
    q: 'Apakah robot bisa menari dengan musik atau lagu khusus kami?',
    a: 'Tentu bisa! Tim technical RFI dapat memprogram timecode audio dan sinkronisasi koreografi robot dengan lagu tema brand atau jingle kampanye Anda via pembaruan Over-the-Air (OTA).'
  },
  {
    q: 'Berapa lama robot bisa beroperasi secara kontinu?',
    a: 'Satu set baterai bertahan rata-rata 3 hingga 4 jam sesi aktif. Namun, dengan sistem baterai modular hot-swap RFI, kru kami dapat mengganti baterai dalam waktu kurang dari 60 detik sehingga pertunjukan dapat berlangsung sepanjang hari tanpa jeda.'
  },
  {
    q: 'Apakah mencakup pengiriman ke luar kota Jakarta?',
    a: 'Ya, Robotshow Indonesia melayani seluruh Indonesia termasuk Surabaya, Bali, Bandung, Medan, Makassar, Balikpapan, dan kota lainnya dengan kemasan flight-case berstandar kargo pesawat udara dan kru lokal yang berpengalaman.'
  }
];
