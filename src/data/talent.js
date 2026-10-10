// The talent roster's studio per robot, shared by the roster and the booking call sheet.
// Cutouts (public/assets/robots) are 1100 px squares; top/bottom are the robot's body rows in them
// (alpha > 0.9). h = displayed body height relative to the A2 (X2 131 cm, A2 169 cm); the robodog
// is sized for presence, not to scale. photo = portrait crop of the same cutout: background size
// and position. Backdrops are RFI logo colours; dark = light text on them.
export const CUTOUT_SIZE = 1100;

export const TALENT = [
  { id: 'x2-ultra', bg: '#2f5fd8', dark: true, top: 152, bottom: 987, h: 131 / 169, photo: ['230%', '50% 15%'] },
  { id: 'x2', bg: '#223f8f', dark: true, top: 152, bottom: 987, h: 131 / 169, photo: ['230%', '50% 15%'] },
  { id: 'a2-ultra', bg: '#0b1533', dark: true, top: 102, bottom: 987, h: 1, photo: ['250%', '50% 9%'] },
  { id: 'a2-lite', bg: '#f2f0ec', dark: false, top: 102, bottom: 986, h: 1, photo: ['250%', '50% 9%'] },
  { id: 'd1-pro', bg: '#b8b1ab', dark: false, top: 335, bottom: 989, h: 0.62, photo: ['170%', '4% 36%'] }
];
