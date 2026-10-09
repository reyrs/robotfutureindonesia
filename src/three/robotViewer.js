import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildRig, addRigEyes, addChestDecal, applyRigPose } from './x2Rig';

// Compact stage for the /robot/<id> pages: the lab's dark lighting in a light layout tile,
// drag-to-orbit turntable, idle blink, optional AGIBOT chest print for X2, plus the idle
// choreography shared with the lab — soft breathing and the occasional emote.
export function createRobotViewer({ canvas, url, rigConfig, chest = false, emotes, eyeMood, breath, isMobile, reducedMotion, onProgress, onReady, onError }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.5;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minPolarAngle = 0.5;
  controls.maxPolarAngle = 1.62;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.8;
  controls.rotateSpeed = 0.7;
  if (isMobile) controls.enableZoom = false;
  canvas.style.touchAction = 'pan-y';

  // Lighting mirrors the lab so the dark tile reads as the same stage.
  const key = new THREE.SpotLight('#ffffff', 45, 12, 0.45, 0.85, 1.6);
  key.position.set(0.4, 4.2, 1.6);
  key.castShadow = true;
  key.shadow.mapSize.set(isMobile ? 1024 : 1536, isMobile ? 1024 : 1536);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key, key.target);
  const rimL = new THREE.DirectionalLight('#a9bdf7', 1.0);
  rimL.position.set(-3, 2.2, -2.5);
  const rimR = new THREE.DirectionalLight('#86a2f4', 0.75);
  rimR.position.set(3, 1.6, -2.2);
  scene.add(rimL, rimR, new THREE.HemisphereLight('#22262f', '#0c0e13', 0.55));

  // Grounding disc that fades into the tile, plus the lab's turntable ring.
  const fade = document.createElement('canvas');
  fade.width = fade.height = 256;
  const f = fade.getContext('2d');
  const radial = f.createRadialGradient(128, 128, 0, 128, 128, 128);
  radial.addColorStop(0, '#ffffff');
  radial.addColorStop(0.45, '#9a9a9a');
  radial.addColorStop(1, '#000000');
  f.fillStyle = radial;
  f.fillRect(0, 0, 256, 256);
  const fadeTexture = new THREE.CanvasTexture(fade);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 64),
    new THREE.MeshStandardMaterial({ color: '#15181f', roughness: 0.62, metalness: 0.1, transparent: true, alphaMap: fadeTexture })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.506, 128),
    new THREE.MeshBasicMaterial({ color: '#dfe6fb', transparent: true, opacity: 0.14, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.002;
  scene.add(ring);

  const state = {
    robot: null,
    pelvis: null,
    joints: {},
    pose: {},
    meshes: [],
    feet: [],
    height: 1.4,
    eyes: null,
    chest: null,
    timeline: null,
    lastEmote: null,
    lastPointerAt: -1e9,
    nextEmoteAt: Infinity,
    firstEmote: true
  };

  const clock = () => performance.now();

  // All pose keys (every joint + base_pitch) reset to their resting value — mirrors the lab.
  const neutralPose = () =>
    Object.fromEntries(Object.keys(state.pose).map((k) => [k, state.config?.neutral?.[k] ?? 0]));

  const pickEmote = () => {
    if (!emotes?.length) return null;
    if (state.firstEmote && emotes.some((e) => e.id === 'wave')) {
      state.firstEmote = false;
      return 'wave';
    }
    const pool = emotes.filter((e) => e.id !== state.lastEmote);
    return (pool.length ? pool : emotes)[Math.floor(Math.random() * (pool.length || emotes.length))].id;
  };

  // One emote at a time: eases out of any running tween, then returns to the resting pose.
  const playEmote = (id) => {
    if (!state.robot || !id) return;
    const emote = emotes.find((e) => e.id === id);
    if (!emote) return;
    state.timeline?.kill();
    state.lastEmote = id;
    controls.autoRotate = false;
    if (state.eyes) state.eyes.target = eyeMood?.[id] ?? 1;
    const timeline = gsap.timeline({
      onUpdate: () => applyRigPose(state),
      onComplete: () => {
        state.timeline = null;
        if (state.eyes) state.eyes.target = 1;
        controls.autoRotate = !reducedMotion;
        state.lastPointerAt = clock();
        state.nextEmoteAt = clock() + 9000 + Math.random() * 6000;
      }
    });
    let prev = 0;
    for (const key of emote.keys) {
      timeline.to(state.pose, { ...key.pose, duration: key.t - prev, ease: key.ease ?? 'sine.inOut' }, prev);
      prev = key.t;
    }
    timeline.to(state.pose, { ...neutralPose(), duration: 0.8, ease: 'power2.inOut' });
    state.timeline = timeline;
  };

  controls.addEventListener('start', () => {
    state.lastPointerAt = clock();
  });
  controls.addEventListener('end', () => {
    state.lastPointerAt = clock();
  });

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let disposed = false;
  const load = () => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      url,
      (gltf) => {
        if (disposed) return;
        const robot = buildRig(state, gltf.scene, rigConfig ?? undefined);
        scene.add(robot);
        for (const node of state.meshes) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
        addRigEyes(state, clock);
        if (chest) addChestDecal(state);

        const bounds = new THREE.Box3().setFromObject(robot);
        state.height = bounds.max.y - bounds.min.y;
        const distance = state.height * (isMobile ? 3.4 : 2.4);
        const target = new THREE.Vector3(0, state.height * 0.5, 0);
        controls.minDistance = distance * 0.55;
        controls.maxDistance = distance * 1.5;
        controls.target.copy(target);
        camera.position.set(state.height * 0.12, state.height * 0.58, distance);
        controls.update();
        key.target.position.copy(target);
        const s = Math.max(1, state.height / 1.5);
        floor.scale.setScalar(s);
        ring.scale.setScalar(s);
        if (!reducedMotion && emotes?.length) state.nextEmoteAt = clock() + 4200;
        onReady?.();
      },
      (event) => {
        if (event.total) onProgress?.(event.loaded / event.total);
      },
      () => onError?.()
    );
  };

  const blinkState = { next: -1e9, last: performance.now() };
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - blinkState.last) / 1000);
    blinkState.last = now;

    const e = state.eyes;
    if (e && !reducedMotion) {
      if (now > blinkState.next) {
        e.blinkAt = now;
        blinkState.next = now + 2400 + Math.random() * 3600;
      }
      const p = (now - e.blinkAt) / 160;
      const blink = p >= 0 && p < 1 ? 1 - 0.92 * Math.sin(Math.PI * p) : 1;
      // Mood (eyeMood) eases the resting openness; blinks momentarily scale it down.
      e.open += (e.target - e.open) * Math.min(1, dt * 9);
      const sy = Math.max(0.06, blink * e.open);
      for (const eye of e.items) eye.scale.set(1, sy, 1);
    }

    // Idle choreography: pause while an emote runs or the pointer is busy, otherwise
    // breathe softly and fire the next scheduled emote.
    if (state.robot && !state.timeline && !reducedMotion) {
      if (breath) {
        const t = now / 1000;
        for (const k in breath) {
          const phase = /joint4|elbow/.test(k) ? Math.PI / 2 : 0;
          state.pose[k] = (state.config.neutral?.[k] ?? 0) + breath[k] * Math.sin(t * 0.85 + phase);
        }
        applyRigPose(state);
      }
      if (now > state.nextEmoteAt && now - state.lastPointerAt > 2600) playEmote(pickEmote());
    }

    controls.update();
    renderer.render(scene, camera);
  });

  return {
    load,
    state,
    dispose() {
      disposed = true;
      state.timeline?.kill();
      state.timeline = null;
      gsap.killTweensOf(state.pose);
      renderer.setAnimationLoop(null);
      ro.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.geometry?.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const mat of mats) {
          mat.map?.dispose();
          mat.alphaMap?.dispose();
          mat.dispose();
        }
      });
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    }
  };
}
