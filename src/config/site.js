// Single source for contact details and section navigation.
// TODO: confirm this WhatsApp number before going live.
export const WA_NUMBER = '6281288880000';

export const WA_CTA_LABEL = 'Cek Jadwal';

export const waLink = (message = 'Halo Robotshow Indonesia, saya ingin cek jadwal sewa robot untuk event.') =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

export const NAV_ITEMS = [
  { id: 'lab', label: 'Teknologi' },
  { id: 'armada', label: 'Armada' },
  { id: 'calculator', label: 'Hitung Biaya' },
  { id: 'faq', label: 'FAQ' }
];
