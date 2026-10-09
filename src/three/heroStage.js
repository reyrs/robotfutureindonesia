import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { MODEL, EMOTES, NEUTRAL, buildRig, applyRigPose, addRigEyes, addChestDecal } from './x2Rig';

const PAPER = new THREE.Color('#f0f1fa');
const WORD = 'ROBOTSHOW';

// The giant word behind the robot, drawn once into a texture. Returns the texture and its aspect.
async function wordTexture() {
  await document.fonts.load('900 200px Outfit').catch(() => { });
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 400;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '900 300px Outfit, sans-serif';
  if ('letterSpacing' in g) g.letterSpacing = '-14px';
  const scale = Math.min(1, (c.width * 0.98) / g.measureText(WORD).width);
  g.font = `900 ${Math.floor(300 * scale)}px Outfit, sans-serif`;
  g.fillText(WORD, c.width / 2, c.height / 2 + 12);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: c.width / c.height };
}

// Cursor near the word warps it and splits it into cobalt and pale ghosts (the brand's only colour).
const wordMaterial = (tex) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTex: { value: tex },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uAspect: { value: 5 }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform vec2 uMouse;
      uniform float uHover, uTime, uOpacity, uAspect;
      varying vec2 vUv;
      void main() {
        vec2 d = vUv - uMouse;
        d.x *= uAspect;
        float f = exp(-dot(d, d) * 7.0) * uHover;
        vec2 warp = vec2(sin(vUv.y * 38.0 + uTime * 3.0), cos(vUv.x * 22.0 - uTime * 2.2)) * 0.014 * f;
        vec2 shift = normalize(d + 1e-4) * vec2(0.035 / uAspect * 4.0, 0.035) * f;
        float a = texture2D(uTex, vUv + warp).r;
        float b = texture2D(uTex, vUv + warp + shift).r;
        float c = texture2D(uTex, vUv + warp - shift * 0.7).r;
        // Lit from the spot above: brighter toward the top centre.
        float lit = mix(0.62, 1.0, smoothstep(0.95, 0.0, length((vUv - vec2(0.5, 1.1)) * vec2(1.6, 1.0))));
        vec3 col = vec3(0.0, 0.086, 0.925) * lit;
        col = max(col, vec3(0.525, 0.635, 0.957) * c * f);
        col = max(col, vec3(0.169, 0.18, 0.227) * b * f * 0.8);
        float alpha = max(a * lit, max(b, c) * f) * uOpacity;
        gl_FragColor = vec4(col, alpha);
      }
    `
  });

// Soft round sprite for haze specks and the light pool.
const softTexture = (stops) => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([at, color]) => r.addColorStop(at, color));
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};

export function createHeroStage({ canvas, isMobile, reducedMotion, onReady, onError }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(PAPER, 7, 15);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;
  const camera = new THREE.PerspectiveCamera(isMobile ? 34 : 28, 1, 0.05, 40);

  // ---------- Stage ----------
  const spot = new THREE.SpotLight('#ffffff', 0, 14, 0.34, 0.75, 1.3);
  spot.position.set(0, 5.4, 0.9);
  spot.castShadow = !isMobile;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.bias = -0.0004;
  spot.shadow.normalBias = 0.02;
  scene.add(spot, spot.target);
  const rimL = new THREE.DirectionalLight('#86a2f4', 0);
  rimL.position.set(-3, 2.4, -2.6);
  const rimR = new THREE.DirectionalLight('#2f5fd8', 0);
  rimR.position.set(3, 1.8, -2.2);
  scene.add(rimL, rimR, new THREE.HemisphereLight('#ffffff', '#c9ccdd', 0.5));

  // Visible light cone: an open cone, additive, fading toward the floor and its edges.
  const coneMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity; varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main() {
        float edge = pow(1.0 - abs(dot(vN, vView)), 2.0);
        float fall = smoothstep(0.0, 1.0, vUv.y);
        gl_FragColor = vec4(vec3(0.82, 0.86, 1.0), (1.0 - edge) * fall * 0.11 * uOpacity);
      }
    `
  });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.25, 5.2, 64, 1, true), coneMat);
  scene.add(cone);

  const floorFade = softTexture([[0, '#ffffff'], [0.5, '#8a8a8a'], [1, '#000000']]);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4, 64),
    new THREE.MeshStandardMaterial({ color: '#0a0b0f', roughness: 0.55, metalness: 0.15, transparent: true, opacity: 0.22, alphaMap: floorFade })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 48),
    new THREE.MeshBasicMaterial({ map: softTexture([[0, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.003;
  scene.add(pool);

  // ---------- Word ----------
  let word = null;
  wordTexture().then(({ tex, aspect }) => {
    const mat = wordMaterial(tex);
    mat.uniforms.uAspect.value = aspect;
    mat.uniforms.uOpacity.value = Math.min(1, lights.k * 1.4);
    word = new THREE.Mesh(new THREE.PlaneGeometry(aspect, 1), mat);
    scene.add(word);
    frame();
  });

  // ---------- Robot ----------
  const state = { pose: {}, joints: {}, meshes: [], height: 1.3, eyes: null, robot: null };
  const look = { yaw: 0, pitch: 0, tyaw: 0, tpitch: 0, busy: false };
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(isMobile ? MODEL.mobile : MODEL.desktop, (gltf) => {
    const robot = buildRig(state, gltf.scene);
    for (const m of state.meshes) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    scene.add(robot);
    addRigEyes(state, () => performance.now());
    addChestDecal(state);
    frame();
    onReady?.();
  }, undefined, () => onError?.());

  // ---------- Framing ----------
  const view = { progress: 0 };
  const frame = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const H = state.height;
    // On phones the copy fills the lower half, so the robot is framed smaller and higher.
    const dist = H * (isMobile ? 4.7 : 3.0) * (1 + view.progress * 0.5);
    const lift = H * (0.46 + view.progress * 0.25);
    camera.position.set(0, lift, dist);
    camera.lookAt(0, H * (isMobile ? 0.12 : 0.52), 0);
    camera.updateProjectionMatrix();
    spot.target.position.set(0, H * 0.5, 0);
    cone.position.set(0, 5.2 / 2 + H * 0.15, 0);
    if (word) {
      // Fill ~94% of the view width at the word's depth, just behind the robot's head.
      const z = -1.5;
      const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (dist - z);
      const width = vh * camera.aspect * (isMobile ? 1.02 : 0.94);
      const aspect = word.material.uniforms.uAspect.value;
      word.scale.set(width / aspect, width / aspect, 1);
      word.position.set(0, H * (isMobile ? 0.7 : 0.72) + view.progress * H * 0.4, z);
    }
  };

  // ---------- Show ----------
  const lights = { k: 0 };
  const setLights = () => {
    spot.intensity = 70 * lights.k * (1 - view.progress * 0.6);
    rimL.intensity = 1.6 * lights.k;
    rimR.intensity = 1.2 * lights.k;
    coneMat.uniforms.uOpacity.value = 0.45 * lights.k * (1 - view.progress * 0.7);
    pool.material.opacity = 0.15 * lights.k;
    if (word) word.material.uniforms.uOpacity.value = Math.min(1, lights.k * 1.4);
  };
  const wave = () => {
    if (reducedMotion || !state.robot) return;
    const keys = EMOTES.find((e) => e.id === 'wave').keys;
    const tl = gsap.timeline({ onStart: () => (look.busy = true), onComplete: () => (look.busy = false) });
    let prev = 0;
    for (const k of keys) {
      tl.to(state.pose, { ...k.pose, duration: k.t - prev, ease: k.ease || 'sine.inOut' });
      prev = k.t;
    }
    const rest = Object.fromEntries(Object.keys(keys.reduce((a, k) => ({ ...a, ...k.pose }), {})).map((j) => [j, NEUTRAL[j] ?? 0]));
    tl.to(state.pose, { ...rest, duration: 0.7, ease: 'power2.inOut' });
  };
  // Lights come up on the robot, then it waves.
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    if (reducedMotion) {
      lights.k = 1;
      setLights();
      return;
    }
    gsap.to(lights, { k: 1, duration: 1.6, ease: 'power2.inOut', onUpdate: setLights, onComplete: wave });
  };

  // ---------- Pointer ----------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let lastMove = 0;
  let hover = 0;
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    look.tyaw = THREE.MathUtils.clamp(ndc.x * 0.7, -0.6, 0.6);
    look.tpitch = THREE.MathUtils.clamp(-ndc.y * 0.35, -0.3, 0.35);
    if (word) {
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(word, false)[0];
      if (hit) {
        word.material.uniforms.uMouse.value.copy(hit.uv);
        const now = performance.now();
        hover = Math.min(1, hover + Math.min(1, (now - lastMove) / 16) * 0.12);
        lastMove = now;
      }
    }
  };
  if (!reducedMotion) window.addEventListener('pointermove', onMove, { passive: true });

  // ---------- Loop ----------
  let raf = 0;
  let running = false;
  let last = performance.now();
  const tick = (now) => {
    raf = 0;
    const dt = Math.min(64, now - last);
    last = now;
    const t = now / 1000;
    if (state.robot) {
      if (!look.busy) {
        look.yaw += (look.tyaw - look.yaw) * Math.min(1, dt / 160);
        look.pitch += (look.tpitch - look.pitch) * Math.min(1, dt / 160);
        state.pose.head_yaw_joint = look.yaw;
        state.pose.head_pitch_joint = look.pitch;
      }
      if (!reducedMotion) state.pose.waist_yaw_joint = (state.pose.waist_yaw_joint ?? 0) * 0.9 + look.yaw * 0.25 * 0.1;
      applyRigPose(state);
      const e = state.eyes;
      if (e) {
        if (!reducedMotion && now > e.nextBlink) {
          e.blinkAt = now;
          e.nextBlink = now + 2600 + Math.random() * 3400;
        }
        const p = (now - e.blinkAt) / 150;
        const s = p >= 0 && p < 1 ? Math.max(0.08, 1 - 0.92 * Math.sin(Math.PI * p)) : 1;
        for (const eye of e.items) eye.scale.set(1, s, 1);
        e.core.opacity = lights.k;
        e.halo.opacity = 0.3 * lights.k;
      }
    }
    if (word) {
      hover *= 0.95;
      word.material.uniforms.uHover.value = hover;
      word.material.uniforms.uTime.value = t;
    }
    renderer.render(scene, camera);
    if (running) raf = requestAnimationFrame(tick);
  };
  const setVisible = (on) => {
    running = on && !document.hidden;
    if (running && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  const onVisibility = () => setVisible(!document.hidden);
  document.addEventListener('visibilitychange', onVisibility);
  const ro = new ResizeObserver(frame);
  ro.observe(canvas);
  frame();

  return {
    start,
    setVisible,
    setProgress(p) {
      view.progress = p;
      frame();
      setLights();
      if (!running) renderer.render(scene, camera);
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
      gsap.killTweensOf(lights);
      gsap.killTweensOf(state.pose);
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose(); });
      });
      pmrem.dispose();
      renderer.dispose();
    }
  };
}
