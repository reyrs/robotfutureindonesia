# SPEC: Fase 1 — Hero Dark Premium (X2 Ultra Close-up → Pull-back)

## Tujuan
Mengubah Hero dari light Lusion (#f0f1fa) ke **dark premium (#0a0c10 + lime #c1ff00)** dengan framing **close-up wajah X2 Ultra** yang pull-back reveal full body saat scroll, mirip landonorris.com vertical drive.

---

## 1. heroStage.js — Rewrite Total

### 1.1 Konstanta & Palet
```js
const DARK_BG     = new THREE.Color('#0a0c10');   // Canvas bg / fog
const FOG_COLOR   = new THREE.Color('#05060a');   // Fog jauh
const LIME        = new THREE.Color('#c1ff00');   // Accent utama
const LIME_DIM    = new THREE.Color('#8fd400');   // Accent dimmed
const LIME_GLOW   = new THREE.Color('#c1ff00');   // Glow additive
const WHITE_HOT   = new THREE.Color('#ffffff');   // Key light
```

### 1.2 Kamera & Framing (Scroll Progress 0→1)
| Progress | dist (×H) | lift (×H) | fov | Keterangan |
|----------|-----------|-----------|-----|------------|
| 0.0      | 1.55      | 0.88      | 32  | Close-up helm + mata LED |
| 0.2      | 1.85      | 0.78      | 30  | Pull-back mulai |
| 0.5      | 2.35      | 0.62      | 28  | Upper body terlihat |
| 1.0      | 3.20      | 0.42      | 28  | Full body + floor |

`H` = robot height (~1.3m X2 Ultra). Rumus di `frame()`:
```js
const dist = H * (1.55 + progress * 1.65);
const lift = H * (0.88 - progress * 0.46);
const fov  = 32 - progress * 4;
```

### 1.3 Lighting — Close-up Optimized
```js
// KEY: Spot dari atas-depan (catchlight di mata LED)
const key = new THREE.SpotLight(WHITE_HOT, 0, 14, 0.22, 0.5, 1.0);
key.position.set(0, 6.2, 1.4);      // Dekat, tajam
key.castShadow = !isMobile;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0003;
key.shadow.normalBias = 0.015;

// RIM LIME: Glow di sisi helm
const rimL = new THREE.DirectionalLight(LIME, 0);
rimL.position.set(-2.8, 2.4, -1.6);
const rimR = new THREE.DirectionalLight(LIME_DIM, 0);
rimR.position.set(2.8, 2.0, -2.2);

// FILL SUBTLE
scene.add(new THREE.HemisphereLight('#0a0c10', '#141822', 0.25));

// CONE LIGHT (lime additive)
coneMat uniforms uColor = LIME_GLOW
```

**Scroll Timeline Lights (di `setLights()`):**
```js
const k = lights.k; // 0→1 dari gsap.to(lights, {k:1, duration:1.6})
spot.intensity      = 90  * k * (1 - progress * 0.5);
rimL.intensity      = 2.0 * k;
rimR.intensity      = 1.4 * k;
coneMat.uOpacity    = 0.5 * k * (1 - progress * 0.6);
pool.material.opacity = 0.18 * k;
word?.material.uOpacity = Math.min(1, k * 1.5);
```

### 1.4 Word "ROBOTSHOW" — Lime Outline
- Font: Switzer 900 (local)
- Fill: transparent, stroke: `#c1ff00` 2px
- Warp shader pakai LIME (bukan cobalt)
- Posisi: di belakang kepala robot, scale ~94% viewport width

### 1.5 Floor & Pool — Dark Reflective
```js
// Floor: dark metal reflect
floorMat: color '#0a0c10', metalness 0.45, roughness 0.28, envMapIntensity 0.7
floorFade: radial #0a0c10 → #05060a (transparent edges)

// Pool: lime radial additive
poolMat: map lime radial (center rgba(193,255,0,0.4) → edge transparent), additiveBlending
```

### 1.6 Eye Catchlights (X2 Ultra Mata LED)
- `addRigEyes` sudah bikin 2 pill mesh per mata
- Tambah **catchlight plane** per mata:
  - PlaneGeometry(0.04, 0.04) di depan mata (z +0.002)
  - Material: additive, lime `#c1ff00`, opacity `lights.k * 0.6`
  - LookAt camera setiap frame

### 1.7 Mouse Parallax (Reduced)
- `look.tyaw/tpitch` clamp ±0.35 (lebih subtle untuk close-up)
- Head yaw/pitch follow smoothed
- Word warp hanya saat hover dekat (distance < 2m)

### 1.8 API Baru (dipakai StorySection)
```js
pinRobot(on) { this.pinned = on; }
setChapterPose(chapterId) { 
  if (!this.pinned) return;
  const pose = CHAPTER_POSES[chapterId];
  gsap.to(state.pose, { ...pose, duration: 1.2, ease: 'power2.inOut' });
}
```

---

## 2. Hero.jsx — Dark Styling

### 2.1 CSS Variables (inline style block)
```css
.hero { background: #0a0c10; }
.hero-glow { 
  background: radial-gradient(circle, rgba(193,255,0,0.035) 0%, transparent 50%); 
}
.hero-word { 
  color: transparent; 
  -webkit-text-stroke: 1px rgba(193,255,0,0.35); 
}
.hero::after { 
  background: linear-gradient(180deg, transparent 88%, rgba(10,12,16,0.65) 97%, #0a0c10 100%); 
}
.hero-title { color: #ffffff; }
.hero-sub { color: rgba(255,255,255,0.68); }
.btn-cyber-primary { background: #c1ff00; color: #0a0c10; border-color: #c1ff00; }
.btn-cyber-primary:hover { background: #d4ff33; }
.btn-cyber-outline { border-color: #c1ff00; color: #c1ff00; }
.btn-cyber-outline:hover { background: rgba(193,255,0,0.08); }
```

### 2.2 Preloader (sudah pakai `var(--color-bg)` → otomatis dark)

---

## 3. index.css — Dark Theme Scope (Optional untuk Fase 4)
Tidak perlu ubah sekarang; Hero & heroStage self-contained. Fase 4 nanti bikin `[data-theme="dark"]` global.

---

## 4. Asset & Performance
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2.5))`
- Shadow map 2048 (mobile 1024)
- Texture anisotropy 16 (model)
- Preload hero GLB: `<link rel="preload" as="model" href="/models/x2-ultra.glb">` di `index.html`

---

## 5. Testing Checklist
- [ ] Close-up wajah: mata LED terlihat jelas, catchlight lime
- [ ] Scroll 0→1: pull-back smooth, lights fade-in natural
- [ ] Reduced motion: jump ke progress=1, lights full, no wave
- [ ] Mobile: dist/lift/fov adjusted (isMobile branch)
- [ ] No console errors, 60fps desktop, 30fps+ mobile
- [ ] i18n hint/credit tetap jalan (sudah Fase 6)

---

## 6. File yang Diubah
1. `src/three/heroStage.js` — **REWRITE** (≈400 lines)
2. `src/components/Hero.jsx` — **UPDATE** styling block
3. `public/index.html` — add preload link (optional)

---

## 7. Rollback Plan
Git commit sebelum mulai. Jika visual tidak sesuai, `git checkout HEAD -- src/three/heroStage.js src/components/Hero.jsx`.

---

**Siap implementasi?** Lanjut ke kode.