import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { code: 'id', label: 'ID', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'EN', name: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', name: '简体中文', flag: '🇨🇳' }
];

export const DICTIONARY = {
  id: {
    // Nav
    nav: {
      acara: 'Teaser',
      armada: 'Talenta',
      lab: 'Ruang casting',
      layanan: 'Booking',
      faq: 'FAQ',
      cta: 'Booking talenta',
      skipLink: 'Lewati ke konten',
      menuOpen: 'Buka menu',
      menuClose: 'Tutup menu',
      homeLabel: 'Robotshow.id, beranda',
      switchLang: 'Pilih Bahasa'
    },
    // Hero
    hero: {
      title: 'Talenta robot untuk acara Anda.',
      sub: 'Sewa robot humanoid dan robodog AgiBot untuk pameran, mall, dan peluncuran produk. Operator kami ikut di setiap acara.',
      cta: 'Booking talenta',
      hint: 'Klik untuk memotret',
      hintTouch: 'Ketuk untuk memotret',
      shots: 'Hasil jepretan',
      alt: 'X2 Ultra di studio foto',
      viaWa: 'lewat WhatsApp',
      ctaPrice: 'Minta daftar harga',
      waMessage: 'Halo Robotshow Indonesia, saya ingin cek jadwal sewa robot untuk event.',
      waPriceMessage: 'Halo Robotshow Indonesia, boleh minta daftar harga sewa robot?'
    },
    // Fleet
    booking: {
      title: 'Booking talenta',
      sub: 'Isi call sheet ini, lalu kirim lewat WhatsApp. Idealnya 7-14 hari sebelum acara.',
      sheet: 'Call sheet',
      talent: 'Talenta',
      date: 'Tanggal acara',
      city: 'Kota',
      cityHint: 'Jakarta, Surabaya, Bali, atau kota lain',
      type: 'Jenis acara',
      types: ['Pameran', 'Mall', 'Peluncuran produk', 'Acara perusahaan', 'Lainnya'],
      notes: 'Catatan',
      notesHint: 'Lagu untuk koreografi, lama tampil, atau hal lain (opsional)',
      shots: 'Jepretan Anda dari sesi foto',
      portraits: 'Talenta yang dipilih',
      send: 'Kirim lewat WhatsApp',
      pending: 'belum ditentukan',
      others: (names) => `Butuh unit AgiBot lain? ${names} bisa ditanyakan ketersediaannya.`,
      othersLink: 'Tanya lewat WhatsApp',
      othersMessage: 'Halo Robotshow Indonesia, saya ingin tanya ketersediaan unit AgiBot lain untuk event saya.',
      message: (m) => 'Halo Robotshow Indonesia, saya ingin booking talenta.' + '\nTalenta: ' + m.talent + '\nTanggal acara: ' + m.date + '\nKota: ' + m.city + '\nJenis acara: ' + m.type + (m.notes ? '\nCatatan: ' + m.notes : '')
    },
    teaser: {
      title: 'Teaser RFI',
      sub: 'Potongan gambar dari video teaser RFI. Klik satu frame, lalu gulir untuk menonton dari detik itu.',
      subTouch: 'Potongan gambar dari video teaser RFI. Ketuk satu frame, lalu gulir untuk menonton dari detik itu.',
      pick: (n) => `Tonton dari frame ${n}`,
      video: 'Video teaser RFI',
      soundOn: 'Nyalakan suara',
      soundOff: 'Matikan suara'
    },
    talent: {
      title: 'Daftar talenta',
      detail: 'Detail',
      back: 'Kembali',
      book: (name) => `Booking ${name}`
    },
    fleet: {
      askRobot: (name) => `Halo Robotshow Indonesia, apakah ${name} bisa disewa untuk event saya?`,
      robots: {
        'a2-ultra': {
          tagline: 'Peluncuran produk dan presentasi',
          summary: 'Humanoid setinggi orang dewasa dengan gerak lebih cepat dari A2 Lite. Cocok untuk peluncuran produk, presentasi di panggung, dan menyapa tamu VIP.',
          specs: [
            { label: 'Tinggi', value: '± 169 cm' },
            { label: 'Berat', value: '± 69 kg' },
            { label: 'Kecepatan maks.', value: '1,2 m/s' },
            { label: 'Torsi lutut', value: '270 N·m' },
            { label: 'Baterai', value: 'Bisa ditukar di lokasi' }
          ]
        },
        'a2-lite': {
          tagline: 'Penyambut tamu dan host booth',
          summary: 'Humanoid setinggi orang dewasa untuk menyambut tamu dan menjadi host booth. Bisa menari, Taiji, dan gerakan pemandu sorak.',
          specs: [
            { label: 'Tinggi', value: '± 169 cm' },
            { label: 'Berat', value: '± 64 kg' },
            { label: 'Derajat gerak', value: '23 DoF' },
            { label: 'Kecepatan maks.', value: '0,8 m/s' },
            { label: 'Waktu operasi', value: '± 4,5 jam berdiri' },
            { label: 'Baterai', value: 'Bisa ditukar di lokasi' }
          ]
        },
        'x2-ultra': {
          tagline: 'Tarian panggung dan sambutan VIP',
          summary: 'Humanoid kompak dengan kamera RGB-D dan LiDAR 3D. Gerakannya luwes untuk tarian panggung, sambutan VIP, dan sesi foto dengan pengunjung.',
          specs: [
            { label: 'Tinggi', value: '± 131 cm' },
            { label: 'Berat', value: '± 39 kg' },
            { label: 'Derajat gerak', value: '30 DoF' },
            { label: 'Kecepatan maks.', value: '1,8 m/s' },
            { label: 'Baterai', value: '± 500 Wh' },
            { label: 'Waktu operasi', value: '± 2 jam' }
          ]
        },
        'x2': {
          tagline: 'Tarian dan interaksi dengan pengunjung',
          summary: 'Bentuk dan tinggi sama dengan X2 Ultra, tanpa LiDAR. Pilihan hemat untuk tarian, sambutan, dan interaksi di booth.',
          specs: [
            { label: 'Tinggi', value: '± 131 cm' },
            { label: 'Berat', value: '± 35 kg' },
            { label: 'Derajat gerak', value: '25 DoF' },
            { label: 'Kecepatan maks.', value: '1,8 m/s' },
            { label: 'Baterai', value: '± 500 Wh' },
            { label: 'Waktu operasi', value: '± 2 jam' }
          ]
        },
        'd1-pro': {
          tagline: 'Atraksi lari dan lompat',
          summary: 'Robodog lincah yang bisa berlari, melompat, dan naik tangga. Selalu jadi pusat perhatian keluarga dan anak-anak.',
          specs: [
            { label: 'Berat', value: '15,5 kg' },
            { label: 'Kecepatan maks.', value: '3,5 m/s' },
            { label: 'Tinggi lompatan', value: '35 cm' },
            { label: 'Naik tangga', value: '16 cm' },
            { label: 'Beban', value: '5 kg' },
            { label: 'Waktu operasi', value: '1-2 jam' }
          ]
        }
      }
    },
    // Lab
    lab: {
      title: 'Ruang casting',
      subDesktop: 'Putar 360°, tarik lengan, kaki, atau kepalanya, atau pilih gerakan di samping.',
      subMobile: 'Geser untuk memutar 360°, ketuk bagian robot, atau pilih gerakan.',
      loading: 'Memuat model 3D',
      tipDrag: 'Tarik untuk menggerakkan, klik untuk detail',
      btnExplode: 'Urai',
      btnSkeleton: 'Rangka',
      btnReset: 'Kembalikan posisi awal',
      emotesLabel: 'Gerakan',
      emotes: {
        wave: 'Lambai',
        bow: 'Membungkuk',
        handshake: 'Jabat tangan',
        dance: 'Tarian',
        point: 'Menunjuk',
        cheer: 'Selebrasi'
      },
      parts: [
        {
          id: 'lidar', label: 'Kepala', index: 'LiDAR 3D + RGB-D', big: 'LiDAR 3D', unit: 'dan kamera RGB-D di kepala',
          detail: 'Memindai panggung dan orang di sekitarnya, supaya robot tahu jarak aman saat tampil.'
        },
        {
          id: 'brain', label: 'Otak', index: 'Jetson Orin NX', big: 'Orin NX', unit: 'komputer AI NVIDIA Jetson',
          detail: 'Mengolah data sensor dan mengatur setiap gerakan secara real-time, langsung di dalam badan robot.'
        },
        {
          id: 'joints', label: 'Sendi', index: '30 DoF', count: 30, unit: 'derajat gerak (DoF)',
          detail: 'Setiap cincin adalah sumbu putar asli dari model resmi AgiBot. Termasuk kepala dan pinggang.'
        },
        {
          id: 'reach', label: 'Jangkauan', index: '558 mm', count: 558, unit: 'mm jangkauan lengan',
          detail: 'Diukur dari bahu ke pergelangan. Pas untuk gunting pita, serah terima plakat, dan jabat tangan.'
        },
        {
          id: 'thermal', label: 'Ketahanan', index: '-10 s.d. 40°C', big: '-10°C', unit: 'rentang suhu kerja: -10 s.d. 40°C',
          detail: 'Tetap bekerja normal di panggung outdoor yang panas maupun ruangan ber-AC dingin.'
        }
      ],
      prev: 'Sebelumnya',
      close: 'Tutup detail'
    },
    // Robot Viewer (/robot/<id>)
    viewer: {
      dragHint: 'Seret untuk memutar',
      credit: 'Model 3D — kredit & lisensi'
    },
    // Service
    service: {
      title: ['Anda fokus ke acara,', 'robotnya kami yang urus.'],
      sub: 'Satu kontrak untuk robot, operator, pengiriman, dan pemasangan di lokasi.',
      steps: [
        { title: 'Kirim tanggal dan lokasi', text: 'Lewat WhatsApp, idealnya 7-14 hari sebelum acara.' },
        { title: 'Pilih unit dan aksinya', text: 'Lima unit bisa dikombinasikan: tarian, sambutan, atau koreografi dengan atribut brand Anda.' },
        { title: 'Kami antar dan pasang', text: 'Robot dan perlengkapan tiba sebelum acara dan dipasang oleh tim kami.' },
        { title: 'Tampil dengan 2 operator', text: 'Operator mengendalikan robot sepanjang acara, lalu kami bongkar.' }
      ]
    },
    // FAQ
    faq: {
      title: 'Pertanyaan yang sering diajukan.',
      items: [
        {
          q: 'Berapa hari sebelum acara kami harus memesan?',
          a: 'Idealnya 7-14 hari sebelum acara, supaya ada waktu menyiapkan aksi dan pengiriman. Untuk acara mendadak, tanyakan saja, kami cek unit yang masih tersedia.'
        },
        {
          q: 'Apakah robot aman untuk pengunjung dan anak-anak?',
          a: 'Ya. Setiap pertunjukan didampingi operator kami yang memegang kendali robot dan bisa menghentikannya kapan saja. Area tampil diberi batas, dan jarak pengunjung diatur selama atraksi berlangsung.'
        },
        {
          q: 'Apakah robot bisa menari dengan lagu kami?',
          a: 'Bisa. Tim kami menyusun koreografi robot mengikuti lagu atau jingle brand Anda. Kirim lagunya saat pemesanan supaya ada waktu untuk latihan.'
        },
        {
          q: 'Berapa lama robot bisa tampil?',
          a: 'Tergantung robotnya: X2 dan X2 Ultra sekitar 2 jam, D1 Pro 1-2 jam, dan A2 Lite sekitar 4,5 jam saat berdiri. Untuk acara seharian, baterai diganti atau diisi di sela sesi, dan jadwal tampil kami atur mengikuti itu.'
        },
        {
          q: 'Apakah bisa untuk acara di luar Jakarta?',
          a: 'Bisa. Robot dikirim dalam flight case bersama operator kami, dan biaya pengiriman dihitung sesuai kota tujuan.'
        }
      ]
    },
    // Footer
    footer: {
      desc: 'Sewa robot humanoid dan robodog AgiBot untuk event, lengkap dengan operator, pengiriman, dan pemasangan. Dikelola PT Robotika Futuristik Indonesia (RFI).',
      company: 'Perusahaan',
      home: 'Beranda',
      readyRent: 'Robot siap sewa',
      contact: 'Hubungi Kami',
      operational: 'Operasional: Jakarta, Surabaya, dan Bali',
      hours: 'Senin – Minggu: 08:00 – 22:00 WIB',
      rights: 'PT Robotika Futuristik Indonesia (RFI). Hak cipta dilindungi.',
      backToTop: 'Kembali ke atas'
    }
  },

  en: {
    // Nav
    nav: {
      acara: 'Teaser',
      armada: 'Talent',
      lab: 'Casting room',
      layanan: 'Booking',
      faq: 'FAQ',
      cta: 'Book the talent',
      skipLink: 'Skip to content',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      homeLabel: 'Robotshow.id, home',
      switchLang: 'Select Language'
    },
    // Hero
    hero: {
      title: 'Robot talent for your event.',
      cta: 'Book the talent',
      hint: 'Click to take a photo',
      hintTouch: 'Tap to take a photo',
      shots: 'Your shots',
      alt: 'X2 Ultra in a photo studio',
      viaWa: 'via WhatsApp',
      sub: 'Rent AgiBot humanoid robots and robodogs for expos, malls, and product launches. Professional operators included at every event.',
      ctaPrice: 'Get price list',
      waMessage: 'Hello Robotshow Indonesia, I would like to check robot rental availability for our event.',
      waPriceMessage: 'Hello Robotshow Indonesia, could you provide the robot rental price list?'
    },
    // Fleet
    booking: {
      title: 'Book the talent',
      sub: 'Fill in this call sheet, then send it over WhatsApp. Ideally 7-14 days before the event.',
      sheet: 'Call sheet',
      talent: 'Talent',
      date: 'Event date',
      city: 'City',
      cityHint: 'Jakarta, Surabaya, Bali, or another city',
      type: 'Event type',
      types: ['Exhibition', 'Mall', 'Product launch', 'Corporate event', 'Other'],
      notes: 'Notes',
      notesHint: 'Song for the choreography, show length, or anything else (optional)',
      shots: 'Your shots from the photo session',
      portraits: 'Selected talent',
      send: 'Send via WhatsApp',
      pending: 'not decided yet',
      others: (names) => `Need another AgiBot unit? Ask us about ${names}.`,
      othersLink: 'Ask on WhatsApp',
      othersMessage: 'Hello Robotshow Indonesia, I would like to ask about the availability of other AgiBot units for our event.',
      message: (m) => 'Hello Robotshow Indonesia, I would like to book talent.' + '\nTalent: ' + m.talent + '\nEvent date: ' + m.date + '\nCity: ' + m.city + '\nEvent type: ' + m.type + (m.notes ? '\nNotes: ' + m.notes : '')
    },
    teaser: {
      title: 'Teaser RFI',
      sub: 'Stills from the RFI teaser. Click a frame, then scroll to watch from that moment.',
      subTouch: 'Stills from the RFI teaser. Tap a frame, then scroll to watch from that moment.',
      pick: (n) => `Watch from frame ${n}`,
      video: 'RFI teaser video',
      soundOn: 'Sound on',
      soundOff: 'Sound off'
    },
    talent: {
      title: 'Talent roster',
      detail: 'Details',
      back: 'Back',
      book: (name) => `Book ${name}`
    },
    fleet: {
      askRobot: (name) => `Hello Robotshow Indonesia, is ${name} available for rent for our event?`,
      robots: {
        'a2-ultra': {
          tagline: 'Product launches & keynote presentations',
          summary: 'Adult-sized humanoid with high agility and speed. Ideal for flagship launches, keynote presentations, and VIP receptions.',
          specs: [
            { label: 'Height', value: '± 169 cm' },
            { label: 'Weight', value: '± 69 kg' },
            { label: 'Max Speed', value: '1.2 m/s' },
            { label: 'Knee Torque', value: '270 N·m' },
            { label: 'Battery', value: 'Hot-swappable on site' }
          ]
        },
        'a2-lite': {
          tagline: 'Guest greeter & booth host',
          summary: 'Full-height humanoid for guest welcoming and booth hosting. Capable of dance routines, Taiji, and cheerleading moves.',
          specs: [
            { label: 'Height', value: '± 169 cm' },
            { label: 'Weight', value: '± 64 kg' },
            { label: 'Degrees of Freedom', value: '23 DoF' },
            { label: 'Max Speed', value: '0.8 m/s' },
            { label: 'Operating Time', value: '± 4.5 hrs standing' },
            { label: 'Battery', value: 'Hot-swappable on site' }
          ]
        },
        'x2-ultra': {
          tagline: 'Stage dance & VIP greetings',
          summary: 'Compact agile humanoid equipped with RGB-D camera and 3D LiDAR. Fluent fluid motions for stage dance, VIP welcoming, and guest photo-ops.',
          specs: [
            { label: 'Height', value: '± 131 cm' },
            { label: 'Weight', value: '± 39 kg' },
            { label: 'Degrees of Freedom', value: '30 DoF' },
            { label: 'Max Speed', value: '1.8 m/s' },
            { label: 'Battery', value: '± 500 Wh' },
            { label: 'Operating Time', value: '± 2 hrs' }
          ]
        },
        'x2': {
          tagline: 'Dance routines & guest interaction',
          summary: 'Identical form factor and height as X2 Ultra, streamlined without LiDAR. Cost-effective choice for dance, greeting, and booth engagement.',
          specs: [
            { label: 'Height', value: '± 131 cm' },
            { label: 'Weight', value: '± 35 kg' },
            { label: 'Degrees of Freedom', value: '25 DoF' },
            { label: 'Max Speed', value: '1.8 m/s' },
            { label: 'Battery', value: '± 500 Wh' },
            { label: 'Operating Time', value: '± 2 hrs' }
          ]
        },
        'd1-pro': {
          tagline: 'Running & jumping stunts',
          summary: 'Agile quadruped robodog capable of running, jumping, and climbing stairs. Guaranteed crowd puller for families and kids.',
          specs: [
            { label: 'Weight', value: '15.5 kg' },
            { label: 'Max Speed', value: '3.5 m/s' },
            { label: 'Jump Height', value: '35 cm' },
            { label: 'Stair Climbing', value: '16 cm' },
            { label: 'Payload', value: '5 kg' },
            { label: 'Operating Time', value: '1-2 hrs' }
          ]
        }
      }
    },
    // Lab
    lab: {
      title: 'Casting room',
      subDesktop: 'Rotate 360°, drag limbs or head, or trigger poses from the sidebar.',
      subMobile: 'Swipe to rotate 360°, tap robot joints, or choose an animation.',
      loading: 'Loading 3D model',
      tipDrag: 'Drag to pose joints, click for specifications',
      btnExplode: 'Explode',
      btnSkeleton: 'Wireframe',
      btnReset: 'Reset orientation',
      emotesLabel: 'Motions',
      emotes: {
        wave: 'Wave',
        bow: 'Bow',
        handshake: 'Handshake',
        dance: 'Dance',
        point: 'Point',
        cheer: 'Cheer'
      },
      parts: [
        {
          id: 'lidar', label: 'Head', index: '3D LiDAR + RGB-D', big: '3D LiDAR', unit: 'and RGB-D cameras in head',
          detail: 'Scans the stage and surrounding crowd to maintain safe operating distances during performances.'
        },
        {
          id: 'brain', label: 'Processor', index: 'Jetson Orin NX', big: 'Orin NX', unit: 'NVIDIA Jetson AI edge computer',
          detail: 'Processes real-time sensor streams and computes complex joint kinematics onboard.'
        },
        {
          id: 'joints', label: 'Actuators', index: '30 DoF', count: 30, unit: 'Degrees of Freedom (DoF)',
          detail: 'Every articulated ring represents authentic high-torque servo joints including neck and dual-axis waist.'
        },
        {
          id: 'reach', label: 'Arm Reach', index: '558 mm', count: 558, unit: 'mm arm extension reach',
          detail: 'Measured from shoulder to wrist. Ideal for ribbon cutting, plaque handover, and handshakes.'
        },
        {
          id: 'thermal', label: 'Thermal Range', index: '-10 to 40°C', big: '-10°C', unit: 'operating temperature range: -10 to 40°C',
          detail: 'Functions seamlessly on hot outdoor festival stages as well as climate-controlled convention centers.'
        }
      ],
      prev: 'Previous',
      close: 'Close specs'
    },
    // Robot Viewer (/robot/<id>)
    viewer: {
      dragHint: 'Drag to rotate',
      credit: '3D Model — credit & license'
    },
    // Service
    service: {
      title: ['Focus on your event,', "we'll handle the robots."],
      sub: 'One turnkey contract covers robots, dedicated operators, transport, and on-site setup.',
      steps: [
        { title: 'Share date & location', text: 'Via WhatsApp, ideally 7-14 days prior to your event.' },
        { title: 'Choose units & routine', text: 'Mix and match up to five units: dance, greetings, or custom brand choreographies.' },
        { title: 'Delivery & setup', text: 'Units arrive in flight cases ahead of time, assembled and tested by our engineering crew.' },
        { title: 'Live show with 2 operators', text: 'Dedicated operators supervise robot execution throughout, followed by swift tear-down.' }
      ]
    },
    // FAQ
    faq: {
      title: 'Frequently asked questions.',
      items: [
        {
          q: 'How many days in advance should we book?',
          a: 'Ideally 7-14 days prior to the event to allow rehearsal and logistics prep. For last-minute dates, contact us to check real-time fleet availability.'
        },
        {
          q: 'Are the robots safe around visitors and children?',
          a: 'Yes. Every performance is strictly monitored by our operators who hold real-time emergency stops. Physical perimeters and safe spectator distances are maintained.'
        },
        {
          q: 'Can the robots dance to our custom brand song?',
          a: 'Absolutely. Our engineers script custom choreographies to your specific corporate jingle or playlist. Provide audio files during booking.'
        },
        {
          q: 'How long can the robots operate continuously?',
          a: 'Varies by unit: X2 and X2 Ultra approx. 2 hours, D1 Pro 1-2 hours, and A2 Lite up to 4.5 hours standing. For full-day events, battery swaps occur between show intervals.'
        },
        {
          q: 'Do you support events outside Jakarta?',
          a: 'Yes. Robots travel in reinforced flight cases accompanied by our crew nationwide (Jakarta, Surabaya, Bali, and across Indonesia).'
        }
      ]
    },
    // Footer
    footer: {
      desc: 'Rent AgiBot humanoid robots and robodogs for events, complete with operators, delivery, and setup. Managed by PT Robotika Futuristik Indonesia (RFI).',
      company: 'Company',
      home: 'Home',
      readyRent: 'Rentable Fleet',
      contact: 'Contact Us',
      operational: 'Operations: Jakarta, Surabaya, & Bali',
      hours: 'Mon – Sun: 08:00 – 22:00 WIB',
      rights: 'PT Robotika Futuristik Indonesia (RFI). All rights reserved.',
      backToTop: 'Back to top'
    }
  },

  zh: {
    // Nav
    nav: {
      acara: '宣传片',
      armada: '艺人',
      lab: '试镜室',
      layanan: '预约',
      faq: '常见问题',
      cta: '预约艺人',
      skipLink: '跳转至主要内容',
      menuOpen: '打开菜单',
      menuClose: '关闭菜单',
      homeLabel: 'Robotshow.id 首页',
      switchLang: '选择语言'
    },
    // Hero
    hero: {
      title: '为您的活动签约机器人艺人。',
      cta: '预约艺人',
      hint: '点击拍照',
      hintTouch: '轻触拍照',
      shots: '拍摄的照片',
      alt: '摄影棚中的 X2 Ultra',
      viaWa: '通过 WhatsApp',
      sub: '面向展会、商场、发布会提供远征AgiBot人形机器人与四足机器狗租赁。每场活动均配备资深现场技术飞手。',
      ctaPrice: '索取报价单',
      waMessage: '您好 Robotshow Indonesia，我想了解活动机器人租赁档期与方案。',
      waPriceMessage: '您好 Robotshow Indonesia，请发送一份机器人租赁价目表。'
    },
    // Fleet
    booking: {
      title: '预约艺人',
      sub: '填写这份通告单，然后通过 WhatsApp 发送。最好在活动前 7-14 天预约。',
      sheet: '通告单',
      talent: '艺人',
      date: '活动日期',
      city: '城市',
      cityHint: '雅加达、泗水、巴厘岛或其他城市',
      type: '活动类型',
      types: ['展会', '商场', '新品发布', '企业活动', '其他'],
      notes: '备注',
      notesHint: '编舞用的歌曲、表演时长或其他事项（选填）',
      shots: '您在拍摄环节拍的照片',
      portraits: '已选艺人',
      send: '通过 WhatsApp 发送',
      pending: '待定',
      others: (names) => `需要其他 AgiBot 机型？可咨询 ${names} 的档期。`,
      othersLink: '通过 WhatsApp 咨询',
      othersMessage: '您好 Robotshow Indonesia，我想咨询其他 AgiBot 机型的活动档期。',
      message: (m) => '您好 Robotshow Indonesia，我想预约艺人。' + '\n艺人：' + m.talent + '\n活动日期：' + m.date + '\n城市：' + m.city + '\n活动类型：' + m.type + (m.notes ? '\n备注：' + m.notes : '')
    },
    teaser: {
      title: 'Teaser RFI',
      sub: '摘自 RFI 宣传片的画面。点击任意一帧，然后向下滚动，从那一刻开始观看。',
      subTouch: '摘自 RFI 宣传片的画面。轻触任意一帧，然后向下滚动，从那一刻开始观看。',
      pick: (n) => `从第 ${n} 帧开始观看`,
      video: 'RFI 宣传片视频',
      soundOn: '打开声音',
      soundOff: '关闭声音'
    },
    talent: {
      title: '艺人名册',
      detail: '详情',
      back: '返回',
      book: (name) => `预约 ${name}`
    },
    fleet: {
      askRobot: (name) => `您好 Robotshow Indonesia，请问 ${name} 在我们活动期间是否有租赁档期？`,
      robots: {
        'a2-ultra': {
          tagline: '新品发布会与高规格演讲',
          summary: '成人等身比例全尺寸人形机器人，动态响应较A2 Lite更为敏捷。极为契合重磅发布会、舞台路演与VIP贵宾接待。',
          specs: [
            { label: '身高', value: '约 169 cm' },
            { label: '体重', value: '约 69 kg' },
            { label: '最大行进速度', value: '1.2 m/s' },
            { label: '膝关节峰值扭矩', value: '270 N·m' },
            { label: '电池支持', value: '现场支持快速热插拔' }
          ]
        },
        'a2-lite': {
          tagline: '礼仪迎宾与展位代言人',
          summary: '全尺寸人形机器人，专职迎宾接引与展位主持。可执行舞蹈、太极与啦啦队欢呼等多类趣味肢体动作。',
          specs: [
            { label: '身高', value: '约 169 cm' },
            { label: '体重', value: '约 64 kg' },
            { label: '整机自由度', value: '23 DoF' },
            { label: '最大速度', value: '0.8 m/s' },
            { label: '续航能力', value: '站立工作约 4.5 小时' },
            { label: '电池支持', value: '现场支持快速热插拔' }
          ]
        },
        'x2-ultra': {
          tagline: '舞台齐舞与贵宾剪彩礼仪',
          summary: '轻量敏捷双足人形，搭载RGB-D深度相机与3D激光雷达。肢体极度柔韧，擅长音乐齐舞、剪彩授牌与合影吸睛。',
          specs: [
            { label: '身高', value: '约 131 cm' },
            { label: '体重', value: '约 39 kg' },
            { label: '整机自由度', value: '30 DoF' },
            { label: '最大速度', value: '1.8 m/s' },
            { label: '电池容量', value: '约 500 Wh' },
            { label: '连续工作时长', value: '约 2 小时' }
          ]
        },
        'x2': {
          tagline: '动感热舞与观众近距离互动',
          summary: '造型与尺寸与X2 Ultra一致，精简激光雷达。舞台群舞、商场巡游及展台近景互动的超高性价比之选。',
          specs: [
            { label: '身高', value: '约 131 cm' },
            { label: '体重', value: '约 35 kg' },
            { label: '整机自由度', value: '25 DoF' },
            { label: '最大速度', value: '1.8 m/s' },
            { label: '电池容量', value: '约 500 Wh' },
            { label: '连续工作时长', value: '约 2 小时' }
          ]
        },
        'd1-pro': {
          tagline: '敏捷奔跑与特技跳跃',
          summary: '动作极速灵动的高性能四足机器狗，能奔跑、跳跃及稳健攀爬台阶。现场家庭与儿童的绝对吸引力核心。',
          specs: [
            { label: '自重', value: '15.5 kg' },
            { label: '最高时速', value: '3.5 m/s' },
            { label: '跳跃高度', value: '35 cm' },
            { label: '攀爬台阶', value: '16 cm' },
            { label: '有效载荷', value: '5 kg' },
            { label: '续航时间', value: '1-2 小时' }
          ]
        }
      }
    },
    // Lab
    lab: {
      title: '试镜室',
      subDesktop: '360°自由旋转，拖拽四肢或头部关节，或点击右侧指令触发特技动作。',
      subMobile: '滑动屏幕360°旋转，轻触机器人关节部件，或选择预设动作。',
      loading: '正在载入 3D 仿真模型',
      tipDrag: '按住拖动可改变姿态，点击查看参数细节',
      btnExplode: '爆炸分解',
      btnSkeleton: '骨骼透视',
      btnReset: '复位默认姿态',
      emotesLabel: '预设动作',
      emotes: {
        wave: '招手挥动',
        bow: '鞠躬致礼',
        handshake: '礼貌握手',
        dance: '节奏律动',
        point: '引导指示',
        cheer: '欢呼庆祝'
      },
      parts: [
        {
          id: 'lidar', label: '头部传感', index: '3D 激光雷达 + RGB-D', big: '3D LiDAR', unit: '头部集成RGB-D双目深度相机',
          detail: '毫秒级感知舞台地形与周边人群，自动规划演出期间的安全避障距离。'
        },
        {
          id: 'brain', label: '算力大脑', index: 'Jetson Orin NX', big: 'Orin NX', unit: 'NVIDIA Jetson 边缘计算平台',
          detail: '机载端到端处理多模态传感器数据，并在本体内毫秒级求解复杂运动学算法。'
        },
        {
          id: 'joints', label: '关节自由度', index: '30 DoF', count: 30, unit: '全身活动自由度 (DoF)',
          detail: '每个关节环均为官方原厂一体化关节模组，涵盖高精度颈部与双轴腰部旋转。'
        },
        {
          id: 'reach', label: '手臂臂展', index: '558 mm', count: 558, unit: 'mm 机械手臂有效延伸半径',
          detail: '肩关节至腕关节工作范围，完美配合剪彩、授牌仪式、证书传递与握手礼仪。'
        },
        {
          id: 'thermal', label: '温控适应', index: '-10 至 40°C', big: '-10°C', unit: '工作环境温区：-10 至 40°C',
          detail: '无论是炎炎夏日露天音乐节，还是强劲冷气会议中心，皆能恒温稳定运行。'
        }
      ],
      prev: '上一部件',
      close: '关闭详情'
    },
    // Robot Viewer (/robot/<id>)
    viewer: {
      dragHint: '拖拽旋转',
      credit: '3D 模型 — 版权与许可'
    },
    // Service
    service: {
      title: ['您专注文案与流程，', '机器人由我们全面护航。'],
      sub: '一站式全包合同：含设备机身、工程师操作飞手、往返物流押运与现场联调。',
      steps: [
        { title: '提供日期与场地', text: '通过微信或WhatsApp联络，建议提前7-14天锁定黄金档期。' },
        { title: '挑选机队与定制动作', text: '支持最多5台机型协同作业：齐舞合唱、双语迎宾或配合品牌调性定制编排。' },
        { title: '安全押运与现场布设', text: '航空防护箱提前抵沪/抵场，由官方工程师组装校准与走位彩排。' },
        { title: '双飞手现场保障演艺', text: '2名资深飞手全程实时监控与遥控护航，演出完毕后迅速撤场归档。' }
      ]
    },
    // FAQ
    faq: {
      title: '常见咨询解答。',
      items: [
        {
          q: '我们通常需要提前多久预订？',
          a: '建议提前 7 至 14 天预约，以便留出充足时间进行动作编程与物流调度。遇紧急突发活动，亦可随时垂询核对现有机队库存。'
        },
        {
          q: '机器人在观众与儿童周围是否足够安全？',
          a: '绝对安全。每台机器人演出全程由工程师实时监控并配备无线急停系统，现场均设有清晰安全警戒距离。'
        },
        {
          q: '机器人可以配合我们的品牌歌曲跳舞吗？',
          a: '可以。我们专业编舞团队可根据您的企业主题曲或特定曲目量身定制动作编排，预订时提供音频即可。'
        },
        {
          q: '机器人单次出场可以运作多长时间？',
          a: '依机型而定：X2 与 X2 Ultra 约 2 小时，D1 Pro 约 1-2 小时，A2 Lite 静态站立可达 4.5 小时。全天候活动可在场次间隙快速轮换备用电池。'
        },
        {
          q: '是否承接雅加达以外其他省市及跨国活动？',
          a: '承接。机队使用专业防震航空箱，技术团队随车护送，覆盖雅加达、泗水、巴厘岛及印尼全境主要城市。'
        }
      ]
    },
    // Footer
    footer: {
      desc: '专业提供远征AgiBot人形机器人与四足机器狗商业租赁，涵盖专业操作团队、干线运输与现场联调。由 PT Robotika Futuristik Indonesia (RFI) 独家运营。',
      company: '企业导览',
      home: '返回首页',
      readyRent: '可租机型',
      contact: '联系我们',
      operational: '常设枢纽：雅加达、泗水与巴厘岛',
      hours: '周一至周日：08:00 – 22:00 (印尼西部时间)',
      rights: 'PT Robotika Futuristik Indonesia (RFI). 版权所有。',
      backToTop: '返回顶部'
    }
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('rs_lang');
      if (saved && ['id', 'en', 'zh'].includes(saved)) return saved;
      const browserLang = navigator.language?.toLowerCase() || '';
      if (browserLang.startsWith('zh')) return 'zh';
      if (browserLang.startsWith('en')) return 'en';
      return 'id';
    } catch {
      return 'id';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('rs_lang', lang);
      document.documentElement.lang = lang;
    } catch { }
  }, [lang]);

  const t = DICTIONARY[lang] || DICTIONARY.id;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
