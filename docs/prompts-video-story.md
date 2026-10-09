# Prompt video untuk bab cerita di beranda

Satu cara, lima prompt. Jangan generate dari teks kosong: **animasikan foto yang sudah ada.**
Komposisi, bentuk robot, dan suasananya sudah benar di foto itu, jadi model tinggal menggerakkan.
Ini yang paling jarang gagal pada model cepat berdurasi 4 detik, dan hasilnya tetap keluar 1080p
walaupun fotonya 1376 px.

## Setelan

- Mode **Frames to Video**. Frame pertama: file di `public/assets/story/` sesuai babnya.
- Durasi **4 detik**, rasio **16:9**, resolusi tertinggi yang ada.
- Prompt hanya mendeskripsikan gerakan. Jangan mendeskripsikan ulang robot, ruangan, atau cahaya:
  semuanya sudah ada di frame pertama, dan menulis ulang justru membuat model mengubahnya.
- Tempel kalimat pengunci di akhir setiap prompt.

Sudah jadi dan sudah terpasang: **persiapan**, **sambutan**, **panggung**. Sisa yang belum:
**kerumunan** dan **brosur**. Bab tanpa video tetap memakai fotonya, jadi boleh dicicil.

## Pengunci (tempel di akhir setiap prompt)

```
Keep the robot, the people, the room and the lighting exactly as in the first frame. No new
objects, no logos, no text, no extra limbs, no morphing hands.
```

---

## 01 — persiapan

Frame pertama: `public/assets/story/persiapan.webp`

```
Animate this photograph. The technician holding the tablet taps it once; the other technician's
hands stay still on the robot. The robot's head turns a few degrees toward the camera and its face
plate lights up. The camera pushes in very slowly.
```

## 02 — sambutan

Frame pertama: `public/assets/story/sambutan.webp`

```
Animate this photograph. The robot extends its arm a little further toward the guests and its head
turns to follow them. The guests keep walking forward at a calm pace. The camera drifts slowly
forward at chest height.
```

## 03 — panggung

Frame pertama: `public/assets/story/panggung.webp`

```
Animate this photograph. Both robots continue the same dance move in sync, arms rising, bodies
turning slightly. Haze drifts through the spotlight beam and the phone screens in the crowd
flicker. The camera arcs slowly to the left.
```

## 04 — kerumunan

Frame pertama: `public/assets/story/kerumunan.webp`

Robodognya berjalan. Kuncinya ada di tiga hal: langkahnya pelan, pola kakinya disebutkan, dan
kamera bergerak sejajar dengan kecepatan yang sama supaya sudut pandang ke kaki tidak berubah.

```
Animate this photograph. The robot dog walks forward at a slow, unhurried pace, using a steady
diagonal gait: front-left leg and rear-right leg swing together, then front-right and rear-left.
Its body stays level, head steady, and every foot lands flat on the floor with a small contact
shadow. The children behind the barrier turn their heads to follow it. The camera moves beside the
robot dog at the same slow speed, parallel to it, keeping the same distance so the view of its legs
does not change.
```

Pengunci khusus klip ini, menggantikan pengunci umum:

```
Keep the robot dog, the people, the floor and the lighting exactly as in the first frame. Exactly
four legs at all times, never more, legs never merging or crossing through each other, feet
touching the floor on every step, no sliding, no floating, no bouncing body, no new objects, no
logos, no text.
```

Kalau kakinya masih rusak, ubah satu hal saja: tambahkan `walking very slowly, almost in slow
motion` di kalimat pertama. Gerak lambat adalah penawar utama artefak kaki.

## 05 — brosur

Frame pertama: `public/assets/story/brosur.webp`

```
Animate this photograph. The visitor takes the brochure from the robot's hand and looks down at
it; the robot's arm lowers slowly. The people behind keep standing where they are. The camera
drifts slowly to the right at eye height.
```

---

## Setelah video jadi

1. Ekspor MP4 (H.264) ke `public/assets/story/` dengan nama persis: `persiapan.mp4`,
   `sambutan.mp4`, `panggung.mp4`, `kerumunan.mp4`, `brosur.mp4`.
2. Tambahkan id-nya ke `HAS_VIDEO` di `src/components/StorySection.jsx`, contoh:
   `const HAS_VIDEO = new Set(['panggung', 'kerumunan']);`

Halaman memutarnya sekali pada 0,85x lalu menahan frame terakhir, jadi klip 4 detik terbaca
sekitar 4,7 detik.

## Cara menilai hasilnya

Putar pelan. Tolak kalau jumlah kaki atau tangan berubah, telapak menyeret di lantai, wajah orang
berubah bentuk, atau ada benda baru muncul. Re-roll dengan satu perubahan saja; biasanya cukup
memperlambat gerakannya.
