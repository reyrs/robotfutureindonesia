// AgiBot line-up shown on the site. Cutouts are official AgiBot product shots (store.agibot.com).
// Specs follow agibot.com (re-checked 10 Oct 2026); match them against each unit's datasheet before quoting in a proposal.
// `rent: true` = in the RFI fleet, has its own page at /robot/<id>/. The rest only get an availability check,
// named in the booking section.

export const ROBOTS = [
  {
    id: 'a2-ultra',
    series: 'a',
    name: 'AgiBot A2 Ultra',
    rent: true,
    model: 'a2',
    tagline: 'Peluncuran produk dan presentasi',
    summary: 'Humanoid setinggi orang dewasa dengan gerak lebih cepat dari A2 Lite. Cocok untuk peluncuran produk, presentasi di panggung, dan menyapa tamu VIP.',
    specs: [
      { label: 'Tinggi', value: '± 169 cm' },
      { label: 'Berat', value: '± 69 kg' },
      { label: 'Kecepatan maks.', value: '1,2 m/s' },
      { label: 'Torsi lutut', value: '270 N·m' },
      { label: 'Baterai', value: 'Bisa ditukar di lokasi' }
    ],
    acts: ['Membuka acara dan peluncuran produk', 'Presentasi di panggung', 'Menyapa tamu VIP', 'Sesi foto dengan pengunjung']
  },
  {
    id: 'a2-lite',
    series: 'a',
    name: 'AgiBot A2 Lite',
    rent: true,
    model: 'a2',
    tagline: 'Penyambut tamu dan host booth',
    summary: 'Humanoid setinggi orang dewasa untuk menyambut tamu dan menjadi host booth. Bisa menari, Taiji, dan gerakan pemandu sorak.',
    specs: [
      { label: 'Tinggi', value: '± 169 cm' },
      { label: 'Berat', value: '± 64 kg' },
      { label: 'Derajat gerak', value: '23 DoF' },
      { label: 'Kecepatan maks.', value: '0,8 m/s' },
      { label: 'Waktu operasi', value: '± 4,5 jam berdiri' },
      { label: 'Baterai', value: 'Bisa ditukar di lokasi' }
    ],
    acts: ['Menyambut tamu di pintu masuk', 'Host booth pameran', 'Tari, Taiji, dan pemandu sorak', 'Sesi foto dengan pengunjung']
  },
  { id: 'a3', series: 'a', name: 'AgiBot A3', tagline: 'Pertunjukan langsung dan hiburan' },
  { id: 'a3-ultra', series: 'a', name: 'AgiBot A3 Ultra', tagline: 'Layanan, interaksi, dan tugas kerja' },
  {
    id: 'x2-ultra',
    series: 'x',
    name: 'AgiBot X2 Ultra',
    rent: true,
    model: 'x2',
    tagline: 'Tarian panggung dan sambutan VIP',
    summary: 'Humanoid kompak dengan kamera RGB-D dan LiDAR 3D. Gerakannya luwes untuk tarian panggung, sambutan VIP, dan sesi foto dengan pengunjung.',
    specs: [
      { label: 'Tinggi', value: '± 131 cm' },
      { label: 'Berat', value: '± 39 kg' },
      { label: 'Derajat gerak', value: '30 DoF' },
      { label: 'Kecepatan maks.', value: '1,8 m/s' },
      { label: 'Baterai', value: '± 500 Wh' },
      { label: 'Waktu operasi', value: '± 2 jam' }
    ],
    acts: ['Tarian panggung sinkron dengan musik', 'Sambutan VIP dan gunting pita', 'Reveal produk di panggung', 'Sesi foto dengan pengunjung']
  },
  {
    id: 'x2',
    series: 'x',
    name: 'AgiBot X2',
    rent: true,
    model: 'x2',
    tagline: 'Tarian dan interaksi dengan pengunjung',
    summary: 'Bentuk dan tinggi sama dengan X2 Ultra, tanpa LiDAR. Pilihan hemat untuk tarian, sambutan, dan interaksi di booth.',
    specs: [
      { label: 'Tinggi', value: '± 131 cm' },
      { label: 'Berat', value: '± 35 kg' },
      { label: 'Derajat gerak', value: '25 DoF' },
      { label: 'Kecepatan maks.', value: '1,8 m/s' },
      { label: 'Baterai', value: '± 500 Wh' },
      { label: 'Waktu operasi', value: '± 2 jam' }
    ],
    acts: ['Tarian bersama di panggung', 'Menyapa pengunjung mall', 'Interaksi di booth pameran', 'Sesi foto dengan pengunjung']
  },
  {
    id: 'd1-pro',
    series: 'd1',
    name: 'AgiBot D1 Pro',
    rent: true,
    tagline: 'Atraksi lari dan lompat',
    summary: 'Robodog lincah yang bisa berlari, melompat, dan naik tangga. Selalu jadi pusat perhatian keluarga dan anak-anak.',
    specs: [
      { label: 'Berat', value: '15,5 kg' },
      { label: 'Kecepatan maks.', value: '3,5 m/s' },
      { label: 'Tinggi lompatan', value: '35 cm' },
      { label: 'Naik tangga', value: '16 cm' },
      { label: 'Beban', value: '5 kg' },
      { label: 'Waktu operasi', value: '1-2 jam' }
    ],
    acts: ['Atraksi lari dan lompat', 'Berdiri dua kaki dan menyapa', 'Tampil bersama robot humanoid', 'Sesi foto dengan anak-anak']
  },
  { id: 'd1-ultra', series: 'd1', name: 'AgiBot D1 Ultra', tagline: 'Inspeksi, riset, dan hiburan' },
  { id: 'd1-max', series: 'd1', name: 'AgiBot D1 Max', tagline: 'Robodog beroda untuk inspeksi dan patroli' },
  { id: 'd1-maxpro', series: 'd1', name: 'AgiBot D1 MaxPro', tagline: 'Angkut beban berat dan misi penyelamatan' },
  { id: 'g2', series: 'g', name: 'AgiBot G2', tagline: 'Penanganan barang dan interaksi' },
  { id: 'c5', series: 'g', name: 'AgiBot C5', tagline: 'Robot pembersih komersial' }
];

export const robotCutout = (robot) => `/assets/robots/${robot.id}.webp`;
export const robotHref = (robot) => `/robot/${robot.id}/`;
export const shortName = (name) => name.replace('AgiBot ', '');
export const RENTABLE = ROBOTS.filter((r) => r.rent);
