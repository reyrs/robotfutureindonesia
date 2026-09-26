import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { gsap } from 'gsap';
import { ArrowLeft, ArrowRight, RotateCcw, X } from 'lucide-react';
import { smoothstep, useMediaQuery } from '../utils/frames';
import { playCyberClick } from '../utils/cyberAudio';

// Official AgiBot X2 Ultra model (URDF → GLB via scripts/build-robot-model.mjs), one node per real joint.
const MODEL = { desktop: '/models/x2-ultra.glb', mobile: '/models/x2-ultra-mobile.glb' };
const FALLBACK = '/assets/lab-fallback.webp';
const clock = () => performance.now();
const hasWebGL = () => {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
};

// Resting pose: arms slightly off the body. base_pitch tilts the pelvis (hips counter-rotate so legs stay planted).
const NEUTRAL = {
  left_shoulder_roll_joint: 0.1,
  right_shoulder_roll_joint: -0.1,
  left_elbow_joint: -0.2,
  right_elbow_joint: -0.2
};

const legs = (side, knee) => ({
  [`${side}_hip_pitch_joint`]: -knee * 0.5,
  [`${side}_knee_joint`]: knee,
  [`${side}_ankle_pitch_joint`]: -knee * 0.5
});

// Keyframes use absolute seconds; joints not listed keep their previous value. Every emote ends back at NEUTRAL.
const EMOTES = [
  {
    id: 'wave',
    label: 'Lambai',
    keys: [
      { t: 0.7, pose: { right_shoulder_pitch_joint: -2.5, right_shoulder_roll_joint: -0.45, right_elbow_joint: -0.6, head_yaw_joint: -0.18, head_pitch_joint: -0.15 } },
      { t: 1.05, pose: { right_shoulder_roll_joint: -0.12 } },
      { t: 1.4, pose: { right_shoulder_roll_joint: -0.6 } },
      { t: 1.75, pose: { right_shoulder_roll_joint: -0.12 } },
      { t: 2.1, pose: { right_shoulder_roll_joint: -0.6 } },
      { t: 2.5, pose: { right_shoulder_roll_joint: -0.35 } }
    ]
  },
  {
    id: 'bow',
    label: 'Membungkuk',
    keys: [
      { t: 1, ease: 'power2.inOut', pose: { base_pitch: 0.5, waist_pitch_joint: 0.25, head_pitch_joint: 0.35, left_shoulder_pitch_joint: -0.3, right_shoulder_pitch_joint: -0.3, left_elbow_joint: -0.55, right_elbow_joint: -0.55 } },
      { t: 1.9, pose: { base_pitch: 0.5 } }
    ]
  },
  {
    id: 'handshake',
    label: 'Jabat tangan',
    keys: [
      { t: 0.8, pose: { right_shoulder_pitch_joint: -0.95, right_shoulder_roll_joint: -0.12, right_elbow_joint: -0.55, base_pitch: 0.06, head_pitch_joint: 0.12, head_yaw_joint: -0.08 } },
      { t: 1.05, pose: { right_elbow_joint: -0.75 } },
      { t: 1.3, pose: { right_elbow_joint: -0.5 } },
      { t: 1.55, pose: { right_elbow_joint: -0.75 } },
      { t: 1.8, pose: { right_elbow_joint: -0.55 } },
      { t: 2.4, pose: { right_elbow_joint: -0.55 } }
    ]
  },
  {
    id: 'dance',
    label: 'Tarian',
    keys: (() => {
      const a = { waist_yaw_joint: 0.35, head_yaw_joint: 0.2, left_shoulder_pitch_joint: -1.3, left_elbow_joint: -1.5, right_shoulder_pitch_joint: -0.3, right_elbow_joint: -1.2, ...legs('left', 0.5), ...legs('right', 0.1) };
      const b = { waist_yaw_joint: -0.35, head_yaw_joint: -0.2, right_shoulder_pitch_joint: -1.3, right_elbow_joint: -1.5, left_shoulder_pitch_joint: -0.3, left_elbow_joint: -1.2, ...legs('right', 0.5), ...legs('left', 0.1) };
      const up = { waist_yaw_joint: 0, head_yaw_joint: 0, head_pitch_joint: -0.2, left_shoulder_pitch_joint: -2.5, right_shoulder_pitch_joint: -2.5, left_shoulder_roll_joint: 0.4, right_shoulder_roll_joint: -0.4, left_elbow_joint: -0.5, right_elbow_joint: -0.5, ...legs('left', 0.35), ...legs('right', 0.35) };
      const reset = { head_pitch_joint: 0, left_shoulder_roll_joint: 0.1, right_shoulder_roll_joint: -0.1 };
      return [
        { t: 0.5, ease: 'power2.out', pose: a },
        { t: 1, ease: 'power2.out', pose: b },
        { t: 1.5, ease: 'power2.out', pose: a },
        { t: 2, ease: 'power2.out', pose: b },
        { t: 2.5, ease: 'power2.out', pose: up },
        { t: 3, ease: 'power2.out', pose: { ...reset, ...a } },
        { t: 3.5, ease: 'power2.out', pose: { ...reset, ...b } },
        { t: 4, ease: 'power2.out', pose: up }
      ];
    })()
  },
  {
    id: 'point',
    label: 'Menunjuk',
    keys: [
      { t: 0.8, pose: { right_shoulder_pitch_joint: -1.45, right_shoulder_roll_joint: -0.4, right_elbow_joint: -0.06, waist_yaw_joint: -0.15, head_yaw_joint: -0.3, head_pitch_joint: 0.05 } },
      { t: 2, pose: { right_shoulder_pitch_joint: -1.45 } }
    ]
  },
  {
    id: 'celebrate',
    label: 'Selebrasi',
    keys: [
      { t: 0.6, pose: { left_shoulder_pitch_joint: -2.8, right_shoulder_pitch_joint: -2.8, left_shoulder_roll_joint: 0.5, right_shoulder_roll_joint: -0.5, left_elbow_joint: -0.3, right_elbow_joint: -0.3, head_pitch_joint: -0.3, ...legs('left', 0.4), ...legs('right', 0.4) } },
      { t: 0.9, pose: { left_elbow_joint: -0.9, right_elbow_joint: -0.9, ...legs('left', 0.05), ...legs('right', 0.05) } },
      { t: 1.2, pose: { left_elbow_joint: -0.3, right_elbow_joint: -0.3, ...legs('left', 0.4), ...legs('right', 0.4) } },
      { t: 1.5, pose: { left_elbow_joint: -0.9, right_elbow_joint: -0.9, ...legs('left', 0.05), ...legs('right', 0.05) } },
      { t: 2.1, pose: { left_elbow_joint: -0.6, right_elbow_joint: -0.6 } }
    ]
  }
];

// Clickable body regions. `drag` maps screen movement (px) to joint deltas; `front` flips it when seen from behind.
const K = 0.008;
const GROUPS = [
  { id: 'head', label: 'Kepala', match: /^(head_|rgb|stereo)/, spec: 0 },
  { id: 'torso', label: 'Badan', match: /^(torso|waist|lidar|imu|pelvis)/, spec: 1 },
  { id: 'leftArm', label: 'Lengan kiri', match: /^left_(shoulder|elbow|wrist)/, spec: 3 },
  { id: 'rightArm', label: 'Lengan kanan', match: /^right_(shoulder|elbow|wrist)/, spec: 3 },
  { id: 'leftLeg', label: 'Kaki kiri', match: /^left_(hip|knee|ankle)/, spec: 2 },
  { id: 'rightLeg', label: 'Kaki kanan', match: /^right_(hip|knee|ankle)/, spec: 2 }
];
const dragJoints = (group, link, dx, dy, front) => {
  const lower = /(elbow|wrist|knee|ankle)/.test(link);
  switch (group) {
    case 'head':
      return { head_yaw_joint: dx * K * front, head_pitch_joint: dy * K };
    case 'torso':
      return { waist_yaw_joint: dx * K * front, waist_pitch_joint: dy * K * 0.5 };
    case 'leftArm':
    case 'rightArm': {
      const side = group === 'leftArm' ? 'left' : 'right';
      return lower
        ? { [`${side}_elbow_joint`]: dy * K }
        : { [`${side}_shoulder_pitch_joint`]: dy * K, [`${side}_shoulder_roll_joint`]: dx * K * front };
    }
    default: {
      const side = group === 'leftLeg' ? 'left' : 'right';
      return lower
        ? { [`${side}_knee_joint`]: -dy * K }
        : { [`${side}_hip_pitch_joint`]: dy * K, [`${side}_hip_roll_joint`]: dx * K * front };
    }
  }
};

const PARTS = [
  {
    id: 'lidar', label: 'Kepala', index: 'LiDAR 3D + RGB-D', big: 'LiDAR 3D', unit: 'dan kamera RGB-D di kepala',
    detail: 'Memindai panggung dan orang di sekitarnya, supaya robot tahu jarak aman saat tampil.', focus: 'head_pitch_link', zoom: 0.55
  },
  {
    id: 'brain', label: 'Otak', index: 'Jetson Orin NX', big: 'Orin NX', unit: 'komputer AI NVIDIA Jetson',
    detail: 'Mengolah data sensor dan mengatur setiap gerakan secara real-time, langsung di dalam badan robot.', focus: 'torso_link', zoom: 0.7
  },
  {
    id: 'joints', label: 'Sendi', index: '30 DoF', count: 30, unit: 'derajat gerak (DoF)',
    detail: 'Setiap cincin adalah sumbu putar asli dari model resmi AgiBot. Termasuk kepala dan pinggang.', focus: 'pelvis', zoom: 1
  },
  {
    id: 'reach', label: 'Jangkauan', index: '558 mm', count: 558, unit: 'mm jangkauan lengan',
    detail: 'Diukur dari bahu ke pergelangan. Pas untuk gunting pita, serah terima plakat, dan jabat tangan.', focus: 'right_elbow_link', zoom: 0.8
  },
  {
    id: 'thermal', label: 'Ketahanan', index: '-10 s.d. 40°C', big: '-10°C', unit: 'rentang suhu kerja: -10 s.d. 40°C',
    detail: 'Tetap bekerja normal di panggung outdoor yang panas maupun ruangan ber-AC dingin.', focus: 'torso_link', zoom: 1
  }
];

// Eyes, as on AgiBot's X2 Ultra product photos: two tall rounded pills lit on the black face.
// Positions are fractions of the face panel found by raycasting the official head mesh.
const EYE = { y: 0.47, gap: 0.2, width: 0.15, height: 0.28 };
// Eye openness per emote: 1 = open, lower = a smiling squint.
const EYE_MOOD = { wave: 0.5, handshake: 0.6, dance: 0.5, celebrate: 0.42, bow: 0.3, point: 1 };

const pillGeometry = (w, h) => {
  const r = Math.min(w, h) / 2;
  const shape = new THREE.Shape();
  shape.absarc(0, h / 2 - r, r, 0, Math.PI, false);
  shape.absarc(0, -h / 2 + r, r, Math.PI, Math.PI * 2, false);
  shape.closePath();
  return new THREE.ShapeGeometry(shape, 24);
};

const glowTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const radial = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  radial.addColorStop(0, 'rgba(255,255,255,0.9)');
  radial.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  radial.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = radial;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
};

const COLD = new THREE.Color('#8fd3ff');
const HOT = new THREE.Color('#ffae5c');

function createEngine({ canvas, isMobile, reducedMotion, ui }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.62;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.9;
  controls.rotateSpeed = 0.7;
  if (isMobile) controls.enableZoom = false;
  canvas.style.touchAction = 'pan-y';

  // Stage lighting: one top spot, two faint cyan rims, a dark fill.
  const key = new THREE.SpotLight('#ffffff', 55, 12, 0.42, 0.85, 1.6);
  key.position.set(0.4, 4.2, 1.6);
  key.castShadow = true;
  key.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key, key.target);
  const rimL = new THREE.DirectionalLight('#8fb9e6', 1.1);
  rimL.position.set(-3, 2.2, -2.5);
  const rimR = new THREE.DirectionalLight('#7fa9dd', 0.8);
  rimR.position.set(3, 1.6, -2.2);
  scene.add(rimL, rimR, new THREE.HemisphereLight('#1b2433', '#030611', 0.6));

  // Floor that fades into the page background, plus a turntable ring.
  const fade = document.createElement('canvas');
  fade.width = fade.height = 256;
  const f = fade.getContext('2d');
  const radial = f.createRadialGradient(128, 128, 0, 128, 128, 128);
  radial.addColorStop(0, '#ffffff');
  radial.addColorStop(0.45, '#9a9a9a');
  radial.addColorStop(1, '#000000');
  f.fillStyle = radial;
  f.fillRect(0, 0, 256, 256);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 64),
    new THREE.MeshStandardMaterial({ color: '#0b1220', roughness: 0.62, metalness: 0.1, transparent: true, alphaMap: new THREE.CanvasTexture(fade) })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.628, 128),
    new THREE.MeshBasicMaterial({ color: '#d6e5f7', transparent: true, opacity: 0.12, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.002;
  scene.add(ring);

  const fx = new THREE.Group();
  scene.add(fx);

  const state = {
    robot: null,
    pelvis: null,
    joints: {},
    pose: {},
    meshes: [],
    groups: {},
    height: 1.3,
    home: { target: new THREE.Vector3(), distance: 3 },
    shift: 0,
    explode: 0,
    xray: 0,
    thermal: 0,
    demo: null,
    demoT0: 0,
    timeline: null,
    running: false,
    visible: false,
    idleSince: 0,
    drag: null,
    hoverAt: 0,
    edgesReady: false,
    eyes: null
  };

  const tmpQ = new THREE.Quaternion();
  const tmpV = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();
  const box = new THREE.Box3();
  const Y_AXIS = new THREE.Vector3(0, 1, 0);

  const allPoseKeys = () => [...Object.keys(state.joints), 'base_pitch'];
  const neutralPose = () => Object.fromEntries(allPoseKeys().map((k) => [k, NEUTRAL[k] ?? 0]));

  const clampJoint = (name, value) => {
    const j = state.joints[name];
    return j ? Math.min(j.upper, Math.max(j.lower, value)) : value;
  };

  const applyPose = () => {
    const { joints, pose, pelvis, robot } = state;
    if (!robot) return;
    const base = pose.base_pitch ?? 0;
    for (const name in joints) {
      const j = joints[name];
      let v = pose[name] ?? 0;
      if (name.endsWith('hip_pitch_joint')) v -= base;
      j.node.quaternion.copy(j.base).multiply(tmpQ.setFromAxisAngle(j.axis, v));
    }
    pelvis.quaternion.setFromAxisAngle(Y_AXIS, base);
    // Keep the lower foot on the floor so bent knees lower the body instead of lifting the feet.
    robot.position.y = 0;
    robot.updateMatrixWorld(true);
    let minY = Infinity;
    for (const foot of state.feet) minY = Math.min(minY, box.setFromObject(foot).min.y);
    robot.position.y = -minY;
  };

  const setView = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    camera.setViewOffset(w, h, state.shift * w, 0, w, h);
    camera.updateProjectionMatrix();
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    setView();
  };

  const group = (mesh) => mesh.userData.group;
  const setHighlight = (groupId, amount) => {
    for (const mesh of state.meshes) {
      const on = groupId && group(mesh) === groupId;
      mesh.material.emissive.set('#4f97d2');
      mesh.material.emissiveIntensity = on ? amount : 0;
    }
  };

  // ---------- Model ----------
  const load = (url) => {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      url,
      (gltf) => {
        const robot = new THREE.Group();
        robot.add(gltf.scene);
        robot.rotation.y = -Math.PI / 2; // URDF faces +X; turn it toward the camera
        scene.add(robot);
        state.robot = robot;
        gltf.scene.traverse((node) => {
          if (node.userData?.joint) {
            state.joints[node.name] = {
              node,
              axis: new THREE.Vector3(...node.userData.axis).normalize(),
              base: node.quaternion.clone(),
              lower: node.userData.lower,
              upper: node.userData.upper
            };
          }
          if (node.name === 'pelvis') state.pelvis = node;
          if (node.isMesh) {
            const link = node.parent.name;
            node.material = node.material.clone();
            node.castShadow = true;
            node.receiveShadow = true;
            node.userData.link = link;
            node.userData.group = GROUPS.find((g) => g.match.test(link))?.id ?? 'torso';
            node.userData.baseColor = node.material.color.clone();
            node.userData.basePos = node.position.clone();
            state.meshes.push(node);
          }
        });
        state.feet = state.meshes.filter((m) => /ankle_roll_link/.test(m.userData.link));
        state.pose = neutralPose();
        applyPose();
        robot.updateMatrixWorld(true);

        // Explode directions, from the robot's centre, expressed in each mesh's parent space.
        const bounds = new THREE.Box3().setFromObject(robot);
        const center = bounds.getCenter(new THREE.Vector3());
        state.height = bounds.max.y - bounds.min.y;
        for (const mesh of state.meshes) {
          const c = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
          const dir = c.sub(center);
          dir.y *= 0.6;
          const worldTarget = mesh.getWorldPosition(new THREE.Vector3()).add(dir.multiplyScalar(0.55));
          mesh.userData.explodeTo = mesh.parent.worldToLocal(worldTarget);
        }

        addEyes();

        // On phones the title and tools sit above the robot, so it is framed smaller and lower.
        state.home.target.set(0, state.height * (isMobile ? 0.66 : 0.5), 0);
        state.home.distance = state.height * (isMobile ? 4.3 : 3.05);
        controls.minDistance = state.home.distance * 0.4;
        controls.maxDistance = state.home.distance * 1.4;
        controls.target.copy(state.home.target);
        camera.position.set(0, state.height * 0.6, state.home.distance);
        controls.update();
        ui.onLoaded();
      },
      (event) => {
        if (event.total) ui.onProgress(event.loaded / event.total);
      },
      () => ui.onError()
    );
  };

  // ---------- Face ----------
  const addEyes = () => {
    const head = state.meshes.find((m) => m.userData.link === 'head_pitch_link');
    if (!head) return;
    head.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(head);
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(head.matrixWorld);
    const ray = new THREE.Raycaster();
    const back = new THREE.Vector3(0, 0, -1);
    const hitAt = (x, y) => {
      ray.set(new THREE.Vector3(x, y, bounds.max.z + 0.2), back);
      const hit = ray.intersectObject(head, false)[0];
      return hit ? { point: hit.point, normal: hit.face.normal.clone().applyMatrix3(normalMatrix).normalize() } : null;
    };
    const facing = (hit) => hit && hit.normal.z > 0.8;

    // Face panel extent: scan the eye column vertically, then the eye row horizontally.
    const cx = (bounds.min.x + bounds.max.x) / 2;
    const probeX = cx - (bounds.max.x - bounds.min.x) * 0.15;
    let top = -Infinity;
    let bottom = Infinity;
    for (let k = 0; k <= 90; k++) {
      const y = bounds.min.y + (k / 90) * (bounds.max.y - bounds.min.y);
      if (facing(hitAt(probeX, y))) {
        top = Math.max(top, y);
        bottom = Math.min(bottom, y);
      }
    }
    if (!Number.isFinite(top)) return;
    const eyeY = top - (top - bottom) * EYE.y;
    let left = Infinity;
    let right = -Infinity;
    for (let k = 0; k <= 90; k++) {
      const x = bounds.min.x + (k / 90) * (bounds.max.x - bounds.min.x);
      if (facing(hitAt(x, eyeY))) {
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    }
    const faceW = right - left;
    const faceH = top - bottom;
    const mid = (left + right) / 2;

    const link = head.parent;
    const group = new THREE.Group();
    link.add(group);
    const linkQuat = link.getWorldQuaternion(new THREE.Quaternion()).invert();
    const core = new THREE.MeshBasicMaterial({ color: '#f2fbff', toneMapped: false, transparent: true });
    const halo = new THREE.MeshBasicMaterial({ color: '#dbe8f8', map: glowTexture(), transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    const w = faceW * EYE.width;
    const h = faceH * EYE.height;
    const items = [-1, 1].map((side) => {
      const hit = hitAt(mid + side * faceW * EYE.gap, eyeY) ?? { point: new THREE.Vector3(mid + side * faceW * EYE.gap, eyeY, bounds.max.z), normal: new THREE.Vector3(0, 0, 1) };
      const eye = new THREE.Group();
      const pill = new THREE.Mesh(pillGeometry(w, h), core);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(w * 3.2, h * 2.2), halo);
      glow.position.z = -0.0004;
      eye.add(glow, pill);
      const world = hit.point.clone().addScaledVector(hit.normal, 0.0012);
      eye.position.copy(link.worldToLocal(world));
      eye.quaternion.copy(linkQuat).multiply(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), hit.normal));
      eye.renderOrder = 5;
      group.add(eye);
      return eye;
    });
    state.eyes = { head, group, items, core, halo, open: 1, target: 1, blinkAt: -1e9, nextBlink: clock() + 1800 };
  };

  const updateEyes = (now, dt) => {
    const e = state.eyes;
    if (!e) return;
    if (!reducedMotion && now > e.nextBlink) {
      e.blinkAt = now;
      e.nextBlink = now + 2400 + Math.random() * 3600;
    }
    const p = (now - e.blinkAt) / 160;
    const blink = p >= 0 && p < 1 ? 1 - 0.92 * Math.sin(Math.PI * p) : 1;
    // A mood only lasts while its emote plays; dragging or inspecting stops the timeline and reopens the eyes.
    e.open += ((state.timeline ? e.target : 1) - e.open) * Math.min(1, dt / 110);
    const sy = Math.max(0.06, blink * e.open);
    for (const eye of e.items) eye.scale.set(1, sy, 1);
    // Follow the head shell when the robot is taken apart.
    e.group.position.subVectors(e.head.position, e.head.userData.basePos);
    const visible = 1 - 0.8 * state.xray;
    e.core.opacity = visible;
    e.halo.opacity = 0.3 * visible * (state.demo === 'thermal' ? 0.3 : 1);
  };

  // ---------- Effects ----------
  const clearFx = () => {
    for (const child of [...fx.children]) {
      fx.remove(child);
      child.geometry?.dispose();
      child.material?.dispose();
    }
    for (const j of Object.values(state.joints)) {
      if (j.ring) {
        j.node.remove(j.ring);
        j.ring = null;
      }
    }
  };

  const worldOf = (name, target = new THREE.Vector3()) => {
    let found = null;
    state.robot.traverse((n) => {
      if (!found && n.name === name) found = n;
    });
    return found ? found.getWorldPosition(target) : target.set(0, state.height * 0.5, 0);
  };

  const ringMaterial = (onTop = false) => new THREE.MeshBasicMaterial({ color: '#8fb9e6', transparent: true, opacity: 0, depthWrite: false, depthTest: !onTop, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });

  const startDemo = (part) => {
    clearFx();
    state.demo = part.id;
    state.demoT0 = clock() + (reducedMotion ? -5000 : 900);
    if (part.id === 'lidar') {
      for (let i = 0; i < 3; i++) {
        const wave = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 96), ringMaterial());
        wave.rotation.x = -Math.PI / 2;
        wave.userData.offset = i / 3;
        fx.add(wave);
      }
    }
    if (part.id === 'joints') {
      Object.values(state.joints).forEach((j, i) => {
        const torus = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.0035, 8, 48), ringMaterial(true));
        torus.renderOrder = 10;
        torus.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), j.axis);
        torus.userData.index = i;
        j.node.add(torus);
        j.ring = torus;
      });
    }
    if (part.id === 'reach') {
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 1, 12), new THREE.MeshBasicMaterial({ color: '#4f97d2', transparent: true, opacity: 0, depthTest: false }));
      rod.name = 'reach-line';
      rod.renderOrder = 10;
      fx.add(rod);
      for (const name of ['a', 'b']) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 16), new THREE.MeshBasicMaterial({ color: '#d6e5f7', transparent: true, opacity: 0, depthTest: false }));
        dot.renderOrder = 10;
        dot.name = `reach-${name}`;
        fx.add(dot);
      }
    }
  };

  const heatAt = (t) => (reducedMotion ? 1 : 0.5 - 0.5 * Math.cos(Math.max(0, t) * (Math.PI * 2) / 5));

  const updateDemo = (now) => {
    const t = (now - state.demoT0) / 1000;
    const demo = state.demo;
    if (!demo || t < 0) return t;
    if (demo === 'lidar') {
      const head = worldOf('head_pitch_link', tmpV);
      fx.children.forEach((wave) => {
        const p = reducedMotion ? 0.5 : (t / 1.6 + wave.userData.offset) % 1;
        wave.position.copy(head);
        wave.scale.setScalar(0.05 + p * 1.5);
        wave.material.opacity = 0.6 * (1 - p) * (1 - p);
      });
      if (!reducedMotion && !state.timeline) state.pose.head_yaw_joint = 0.42 * Math.sin(t * 1.4);
    }
    if (demo === 'joints') {
      for (const j of Object.values(state.joints)) {
        if (!j.ring) continue;
        const k = reducedMotion ? 1 : smoothstep(0, 0.3, t - j.ring.userData.index * 0.05);
        j.ring.scale.setScalar(Math.max(0.001, k));
        j.ring.material.opacity = 0.85 * k;
      }
    }
    if (demo === 'reach') {
      const a = worldOf('right_shoulder_roll_link', new THREE.Vector3());
      const b = worldOf('right_wrist_yaw_link', new THREE.Vector3());
      const k = reducedMotion ? 1 : smoothstep(0, 0.9, t);
      const rod = fx.getObjectByName('reach-line');
      const end = tmpV2.copy(a).lerp(b, k);
      const length = Math.max(0.0001, a.distanceTo(end));
      rod.position.copy(a).lerp(end, 0.5);
      rod.scale.set(1, length, 1);
      rod.quaternion.setFromUnitVectors(Y_AXIS, tmpV.copy(end).sub(a).normalize());
      rod.material.opacity = 1;
      fx.getObjectByName('reach-a').position.copy(a);
      fx.getObjectByName('reach-b').position.copy(end);
      fx.getObjectByName('reach-a').material.opacity = 1;
      fx.getObjectByName('reach-b').material.opacity = 1;
      const mid = a.clone().lerp(end, 0.5).project(camera);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ui.placeMeasure((mid.x * 0.5 + 0.5) * w, (-mid.y * 0.5 + 0.5) * h, smoothstep(0.6, 1, k));
    }
    if (demo === 'thermal') state.thermal = heatAt(t);
    if (demo === 'brain') {
      const beat = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 7);
      for (const mesh of state.meshes) {
        if (/^(torso_link|lidar_chest)/.test(mesh.userData.link)) {
          mesh.material.emissive.set('#4f97d2');
          mesh.material.emissiveIntensity = 0.08 + 0.18 * beat;
        }
      }
    }
    return t;
  };

  const applyMaterials = () => {
    const heat = state.thermal;
    for (const mesh of state.meshes) {
      const m = mesh.material;
      const shell = m.name === 'shell';
      if (state.demo === 'thermal' && shell) m.color.copy(COLD).lerp(HOT, heat).lerp(mesh.userData.baseColor, 0.12);
      else m.color.copy(mesh.userData.baseColor);
      m.transparent = state.xray > 0;
      m.opacity = 1 - 0.88 * state.xray;
      m.depthWrite = state.xray < 0.5;
      if (mesh.userData.edges) {
        mesh.userData.edges.visible = state.xray > 0.01;
        mesh.userData.edges.material.opacity = 0.9 * state.xray;
      }
      mesh.position.lerpVectors(mesh.userData.basePos, mesh.userData.explodeTo, state.explode);
    }
  };

  const buildEdges = () => {
    if (state.edgesReady) return;
    state.edgesReady = true;
    const material = new THREE.LineBasicMaterial({ color: '#8fb9e6', transparent: true, opacity: 0, depthWrite: false });
    for (const mesh of state.meshes) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), material);
      edges.visible = false;
      mesh.add(edges);
      mesh.userData.edges = edges;
    }
  };

  // ---------- Interaction ----------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pick = (clientX, clientY) => {
    if (!state.robot) return null;
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(state.meshes, false)[0];
    return hit ? hit.object : null;
  };
  const facingFront = () => {
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(state.robot.quaternion);
    return camera.position.clone().sub(controls.target).dot(forward) >= 0 ? 1 : -1;
  };

  const onDown = (e) => {
    state.idleSince = clock();
    const mesh = pick(e.clientX, e.clientY);
    if (!mesh || state.explode > 0.01) return;
    controls.enabled = false;
    state.drag = { mesh, x: e.clientX, y: e.clientY, moved: false, front: facingFront(), id: e.pointerId };
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    state.idleSince = clock();
    const drag = state.drag;
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      if (!drag.moved) {
        drag.moved = true;
        ui.onPose();
        state.timeline?.kill();
        state.timeline = null;
      }
      drag.x = e.clientX;
      drag.y = e.clientY;
      const deltas = dragJoints(group(drag.mesh), drag.mesh.userData.link, dx, dy, drag.front);
      for (const [name, d] of Object.entries(deltas)) state.pose[name] = clampJoint(name, (state.pose[name] ?? 0) + d);
      applyPose();
      return;
    }
    if (e.pointerType !== 'mouse' || e.buttons) return;
    const now = clock();
    if (now - state.hoverAt < 60) return;
    state.hoverAt = now;
    const mesh = pick(e.clientX, e.clientY);
    const g = mesh ? GROUPS.find((x) => x.id === group(mesh)) : null;
    ui.onHover(g && state.explode < 0.01 ? { label: g.label, x: e.clientX, y: e.clientY } : null);
    if (!state.demo) setHighlight(g?.id, 0.14);
    canvas.style.cursor = g ? 'grab' : '';
  };
  const onUp = () => {
    const drag = state.drag;
    if (!drag) return;
    state.drag = null;
    controls.enabled = true;
    if (!drag.moved) ui.onSelect(GROUPS.find((g) => g.id === group(drag.mesh)).spec);
  };
  const onLeave = () => ui.onHover(null);
  canvas.addEventListener('pointerdown', onDown, { capture: true });
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onLeave);
  controls.addEventListener('start', () => {
    state.idleSince = clock();
    controls.autoRotate = false;
  });

  // ---------- Camera ----------
  const flyTo = (target, distance, shift, duration = 1.1) => {
    const from = { tx: controls.target.x, ty: controls.target.y, tz: controls.target.z, d: camera.position.distanceTo(controls.target), s: state.shift };
    gsap.to(from, {
      tx: target.x,
      ty: target.y,
      tz: target.z,
      d: distance,
      s: shift,
      duration: reducedMotion ? 0 : duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        const dir = tmpV.copy(camera.position).sub(controls.target).normalize();
        controls.target.set(from.tx, from.ty, from.tz);
        camera.position.copy(controls.target).addScaledVector(dir, from.d);
        state.shift = from.s;
        setView();
      }
    });
  };
  const faceFront = () => {
    const offset = camera.position.clone().sub(controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    const holder = { theta: spherical.theta };
    const target = Math.round(spherical.theta / (Math.PI * 2)) * Math.PI * 2;
    gsap.to(holder, {
      theta: target,
      duration: reducedMotion ? 0 : 0.9,
      ease: 'power2.inOut',
      onUpdate: () => {
        spherical.theta = holder.theta;
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
      }
    });
  };

  // ---------- Public API ----------
  const api = {
    playEmote(id) {
      if (!state.robot) return;
      const emote = EMOTES.find((e) => e.id === id);
      api.release(true);
      controls.autoRotate = false;
      faceFront();
      state.timeline?.kill();
      if (state.eyes) state.eyes.target = EYE_MOOD[id] ?? 1;
      const timeline = gsap.timeline({
        onUpdate: applyPose,
        onComplete: () => {
          state.timeline = null;
          state.idleSince = clock();
          if (state.eyes) state.eyes.target = 1;
          ui.onEmoteEnd();
        }
      });
      let prev = 0;
      for (const key of emote.keys) {
        timeline.to(state.pose, { ...key.pose, duration: key.t - prev, ease: key.ease ?? 'sine.inOut' }, prev);
        prev = key.t;
      }
      timeline.to(state.pose, { ...neutralPose(), duration: 0.8, ease: 'power2.inOut' });
      state.timeline = timeline;
    },
    inspect(index) {
      if (!state.robot) return;
      const part = PARTS[index];
      state.timeline?.kill();
      state.timeline = null;
      controls.autoRotate = false;
      gsap.to(state, { explode: 0, xray: 0, duration: reducedMotion ? 0 : 0.5 });
      ui.onTools({ explode: false, xray: false });
      setHighlight(null, 0);
      startDemo(part);
      faceFront();
      if (part.id === 'reach') {
        gsap.to(state.pose, { ...neutralPose(), right_shoulder_pitch_joint: 0, right_shoulder_roll_joint: -1.45, right_elbow_joint: -0.02, duration: reducedMotion ? 0 : 0.9, ease: 'power2.inOut', onUpdate: applyPose });
      } else {
        gsap.to(state.pose, { ...neutralPose(), duration: reducedMotion ? 0 : 0.7, ease: 'power2.inOut', onUpdate: applyPose });
      }
      const focus = worldOf(part.focus, new THREE.Vector3());
      const target = state.home.target.clone().lerp(focus, 1 - part.zoom * 0.6);
      flyTo(target, state.home.distance * part.zoom, isMobile ? 0 : 0.14);
    },
    release(keepCamera = false) {
      if (!state.demo && keepCamera) return;
      clearFx();
      state.demo = null;
      state.thermal = 0;
      setHighlight(null, 0);
      ui.placeMeasure(0, 0, 0);
      if (!keepCamera) flyTo(state.home.target, state.home.distance, 0, 0.9);
      state.idleSince = clock();
    },
    setExplode(on) {
      api.release(true);
      state.timeline?.kill();
      state.timeline = null;
      if (on) gsap.to(state.pose, { ...neutralPose(), duration: reducedMotion ? 0 : 0.5, onUpdate: applyPose });
      gsap.to(state, { explode: on ? 1 : 0, duration: reducedMotion ? 0 : 1.2, ease: 'power3.inOut', delay: on && !reducedMotion ? 0.3 : 0 });
    },
    setXray(on) {
      if (on) buildEdges();
      gsap.to(state, { xray: on ? 1 : 0, duration: reducedMotion ? 0 : 0.6, ease: 'power2.inOut' });
    },
    reset() {
      state.timeline?.kill();
      state.timeline = null;
      api.release();
      gsap.to(state, { explode: 0, xray: 0, duration: reducedMotion ? 0 : 0.6 });
      gsap.to(state.pose, { ...neutralPose(), duration: reducedMotion ? 0 : 0.8, ease: 'power2.inOut', onUpdate: applyPose });
      controls.autoRotate = !reducedMotion;
    },
    setVisible(visible) {
      state.visible = visible;
      if (visible && !state.running) {
        state.running = true;
        renderer.setAnimationLoop(tick);
      } else if (!visible && state.running) {
        state.running = false;
        renderer.setAnimationLoop(null);
      }
    },
    load,
    dispose() {
      renderer.setAnimationLoop(null);
      gsap.killTweensOf(state);
      gsap.killTweensOf(state.pose);
      state.timeline?.kill();
      canvas.removeEventListener('pointerdown', onDown, { capture: true });
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
      controls.dispose();
      resizeObserver.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      });
      pmrem.dispose();
      renderer.dispose();
    }
  };

  let lastTick = clock();
  const tick = () => {
    const now = clock();
    if (!reducedMotion && !state.demo && !state.timeline && !state.drag && now - state.idleSince > 4000 && state.explode < 0.01) controls.autoRotate = true;
    controls.update();
    const t = updateDemo(now);
    if (state.demo === 'lidar' && state.robot && t > 0) applyPose();
    applyMaterials();
    updateEyes(now, Math.min(now - lastTick, 100));
    lastTick = now;
    ui.onFrame(state.demo, t, state.thermal);
    if (state.robot) {
      ring.material.opacity = 0.12 * (1 - state.explode);
    }
    renderer.render(scene, camera);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  if (import.meta.env.DEV) {
    // Lets headless checks jump to a point in an emote without waiting on slow software rendering.
    window.__lab = { api, state, camera, controls, gsap, seek: (t) => { state.timeline?.pause(); state.timeline?.seek(t); applyPose(); } };
  }
  return api;
}

export default function LabSection() {
  const isMobile = useMediaQuery('(max-width: 899px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const bigRef = useRef(null);
  const markerRef = useRef(null);
  const measureRef = useRef(null);
  const tipRef = useRef(null);
  const activeRef = useRef(null);
  const [webgl] = useState(hasWebGL);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(null);
  const [emote, setEmote] = useState(null);
  const [tools, setTools] = useState({ explode: false, xray: false });
  const [hover, setHover] = useState(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!webgl) return undefined;

    const ui = {
      onProgress: (p) => setProgress(p),
      onLoaded: () => setStatus('ready'),
      onError: () => setStatus('error'),
      onHover: (h) => setHover(h),
      onSelect: (index) => select(index),
      onPose: () => setEmote(null),
      onEmoteEnd: () => setEmote(null),
      onTools: (next) => setTools(next),
      placeMeasure: (x, y, alpha) => {
        const el = measureRef.current;
        if (!el) return;
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.style.opacity = String(alpha);
      },
      onFrame: (demo, t, heat) => {
        const index = activeRef.current;
        if (index === null || !bigRef.current) return;
        const part = PARTS[index];
        if (part.count) {
          const duration = part.id === 'joints' ? 1.9 : 0.9;
          const k = reducedMotion ? 1 : smoothstep(0, duration, t);
          bigRef.current.textContent = String(Math.round(part.count * k));
        } else if (part.id === 'thermal') {
          bigRef.current.textContent = `${Math.round(-10 + 50 * heat)}°C`;
          if (markerRef.current) markerRef.current.style.transform = `translateX(${heat * 100}%)`;
        }
      }
    };
    const select = (index) => {
      playCyberClick(720, 0.04);
      setActive(index);
      activeRef.current = index;
      setEmote(null);
      engineRef.current?.inspect(index);
    };

    const engine = createEngine({ canvas, isMobile, reducedMotion, ui });
    engineRef.current = engine;
    let requested = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !requested) {
        requested = true;
        setStatus('loading');
        engine.load(isMobile ? MODEL.mobile : MODEL.desktop);
      }
    }, { rootMargin: '80% 0px' });
    const visible = new IntersectionObserver(([entry]) => engine.setVisible(entry.isIntersecting));
    observer.observe(section);
    visible.observe(section);
    return () => {
      observer.disconnect();
      visible.disconnect();
      engine.dispose();
      engineRef.current = null;
      setStatus('idle');
      setActive(null);
    };
  }, [isMobile, reducedMotion, webgl]);

  const select = (index) => {
    playCyberClick(720, 0.04);
    setActive(index);
    activeRef.current = index;
    setEmote(null);
    engineRef.current?.inspect(index);
  };
  const release = () => {
    setActive(null);
    activeRef.current = null;
    engineRef.current?.release();
  };
  const playEmote = (id) => {
    playCyberClick(820, 0.05);
    setActive(null);
    activeRef.current = null;
    setEmote(id);
    setTools((t) => ({ ...t, explode: false }));
    engineRef.current?.setExplode(false);
    engineRef.current?.playEmote(id);
  };
  const toggle = (key) => {
    playCyberClick(760, 0.04);
    const next = { ...tools, [key]: !tools[key] };
    setTools(next);
    if (key === 'explode') {
      setActive(null);
      activeRef.current = null;
      engineRef.current?.setExplode(next.explode);
    } else engineRef.current?.setXray(next.xray);
  };
  const reset = () => {
    playCyberClick(600, 0.04);
    setActive(null);
    activeRef.current = null;
    setEmote(null);
    setTools({ explode: false, xray: false });
    engineRef.current?.reset();
  };
  const step = (direction) => select((active + direction + PARTS.length) % PARTS.length);

  const part = active === null ? null : PARTS[active];
  const next = active === null ? null : PARTS[(active + 1) % PARTS.length];
  const prev = active === null ? null : PARTS[(active - 1 + PARTS.length) % PARTS.length];
  const ready = status === 'ready';
  const failed = !webgl || status === 'error';

  return (
    <section
      id="lab"
      ref={sectionRef}
      className={`lab${part ? ' is-inspecting' : ''}`}
      aria-labelledby="lab-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && part) release();
      }}
    >
      <div className="lab-stage" aria-hidden={!ready}>
        <canvas ref={canvasRef} className="lab-canvas" role="img" aria-label="Model 3D AgiBot X2 Ultra yang bisa diputar dan digerakkan" />
        {failed && <img className="lab-fallback" src={FALLBACK} alt="AgiBot X2 Ultra" />}
        {status === 'loading' && (
          <div className="lab-loading" role="status">
            <span>Memuat model 3D</span>
            <span className="lab-loading-bar"><span style={{ transform: `scaleX(${progress})` }} /></span>
          </div>
        )}
        <span ref={measureRef} className="lab-measure" aria-hidden="true">558 mm</span>
      </div>

      {hover && finePointer && (
        <div ref={tipRef} className="lab-tip" style={{ transform: `translate(${hover.x + 16}px, ${hover.y + 16}px)` }} aria-hidden="true">
          <strong>{hover.label}</strong>
          <span>Tarik untuk menggerakkan, klik untuk detail</span>
        </div>
      )}

      <div className="container lab-head">
        <div>
          <h2 id="lab-title" className="lab-title">Kenali X2 Ultra.</h2>
          <p className="lab-sub">
            {finePointer
              ? 'Putar 360°, tarik lengan, kaki, atau kepalanya, atau pilih gerakan di samping.'
              : 'Geser untuk memutar 360°, ketuk bagian robot, atau pilih gerakan.'}
          </p>
        </div>
        <div className="lab-tools">
          <button type="button" className="btn-cyber-outline lab-tool" aria-pressed={tools.explode} onClick={() => toggle('explode')} disabled={!ready}>Urai</button>
          <button type="button" className="btn-cyber-outline lab-tool" aria-pressed={tools.xray} onClick={() => toggle('xray')} disabled={!ready}>Rangka</button>
          <button type="button" className="btn-cyber-outline lab-tool" onClick={reset} disabled={!ready} aria-label="Kembalikan posisi awal">
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {!part && (
        <div className="lab-emotes" role="group" aria-label="Gerakan robot">
          <p className="lab-emotes-label">Gerakan</p>
          {EMOTES.map((e) => (
            <button key={e.id} type="button" className="lab-emote" aria-pressed={emote === e.id} onClick={() => playEmote(e.id)} disabled={!ready}>
              {e.label}
            </button>
          ))}
        </div>
      )}

      {part && (
        <div key={part.id} className="lab-panel" role="region" aria-label={`Detail ${part.label}`}>
          <p className="lab-panel-label">{part.label}</p>
          <p className="lab-panel-big">
            <span ref={bigRef}>{part.count ? (reducedMotion ? part.count : 0) : part.big}</span>
          </p>
          <p className="lab-panel-unit">{part.unit}</p>
          {part.id === 'thermal' && (
            <div className="lab-thermal-scale" aria-hidden="true">
              <span className="lab-thermal-track" />
              <span ref={markerRef} className="lab-thermal-marker" />
              <span className="lab-thermal-ends">
                <span>-10°C</span>
                <span>40°C</span>
              </span>
            </div>
          )}
          <p className="lab-panel-detail">{part.detail}</p>
          <div className="lab-panel-nav">
            <button type="button" onClick={() => step(-1)} className="lab-nav-btn" aria-label={`Sebelumnya: ${prev.label}`}>
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} className="lab-nav-btn">
              <span>{next.label}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={release} className="lab-nav-btn lab-nav-close" aria-label="Tutup detail">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="container lab-bottom">
        <ul className="lab-index">
          {PARTS.map((p, i) => (
            <li key={p.id}>
              <button type="button" onClick={() => (active === i ? release() : select(i))} aria-pressed={active === i} className="lab-index-item" disabled={!ready}>
                <span className="lab-index-label">{p.label}</span>
                <span className="lab-index-value">{p.index}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="lab-credit">
          Model 3D resmi AgiBot X2 Ultra, <a href="/models/X2-ULTRA-LICENSE.txt" target="_blank" rel="noopener noreferrer">lisensi Mulan PSL v2</a>
        </p>
      </div>

      <style>{`
        .lab {
          position: relative;
          z-index: 1;
          height: 100svh;
          min-height: 700px;
          overflow: hidden;
          background:
            radial-gradient(36% 58% at 50% 30%, rgba(148, 163, 184, 0.14), transparent 70%),
            var(--bg-void);
        }
        .lab-stage {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .lab-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .lab-fallback {
          position: absolute;
          left: 50%;
          top: 50%;
          height: 70%;
          width: auto;
          transform: translate(-50%, -50%);
          -webkit-mask-image: radial-gradient(closest-side, #000 70%, transparent);
          mask-image: radial-gradient(closest-side, #000 70%, transparent);
        }
        .lab-loading {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          display: grid;
          gap: 0.75rem;
          justify-items: center;
          color: var(--text-body);
          font-size: 0.95rem;
        }
        .lab-loading-bar {
          width: 180px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        .lab-loading-bar span {
          display: block;
          height: 100%;
          background: var(--accent);
          transform-origin: left;
          transition: transform 0.2s ease;
        }
        .lab-measure {
          position: absolute;
          left: 0;
          top: 0;
          margin: -0.8rem 0 0 -3.5rem;
          padding: 0.2rem 0.5rem;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-pure);
          text-shadow: 0 1px 8px rgba(3, 6, 17, 0.9);
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
        }
        .lab-tip {
          position: fixed;
          left: 0;
          top: 0;
          z-index: 20;
          display: grid;
          gap: 0.15rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          background: rgba(3, 6, 17, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          pointer-events: none;
          font-size: 0.85rem;
          color: var(--text-body);
        }
        .lab-tip strong {
          color: var(--text-pure);
          font-size: 0.95rem;
        }
        .lab-head {
          position: absolute;
          top: 5.5rem;
          left: 0;
          right: 0;
          z-index: 3;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          pointer-events: none;
          transition: opacity 0.5s ease;
        }
        .lab.is-inspecting .lab-head > div:first-child {
          opacity: 0;
        }
        .lab-title {
          font-size: clamp(2rem, 3.4vw, 3rem);
          letter-spacing: -0.035em;
          line-height: 1.04;
          color: var(--text-pure);
          transition: opacity 0.4s ease;
        }
        .lab-sub {
          margin-top: 0.75rem;
          color: var(--text-body);
          font-size: 1.05rem;
          max-width: 46ch;
        }
        .lab-tools {
          display: flex;
          gap: 0.5rem;
          pointer-events: auto;
        }
        .lab-tool {
          min-height: 44px;
          min-width: 44px;
          padding: 0.55rem 1rem;
          font-size: 0.9rem;
          background: rgba(3, 6, 17, 0.6);
        }
        .lab-tool[aria-pressed='true'] {
          border-color: var(--accent);
          color: var(--accent);
        }
        .lab-tool:disabled,
        .lab-emote:disabled,
        .lab-index-item:disabled {
          opacity: 0.4;
          cursor: default;
        }
        .lab-emotes {
          position: absolute;
          z-index: 3;
          right: max(2.5rem, calc((100vw - 1360px) / 2 + 2.5rem));
          top: 50%;
          transform: translateY(-50%);
          display: grid;
          gap: 0.4rem;
          width: 190px;
        }
        .lab-emotes-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 0.25rem;
        }
        .lab-emote {
          min-height: 44px;
          padding: 0 1rem;
          text-align: left;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(3, 6, 17, 0.4);
          color: var(--text-heading);
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;
        }
        .lab-emote:hover {
          border-color: rgba(255, 255, 255, 0.35);
        }
        .lab-emote[aria-pressed='true'] {
          border-color: var(--accent);
          color: var(--accent);
        }
        .lab-panel {
          position: absolute;
          z-index: 3;
          right: max(2.5rem, calc((100vw - 1360px) / 2 + 2.5rem));
          top: 50%;
          width: min(340px, 30vw);
          transform: translateY(-50%);
        }
        .lab-panel > * {
          animation: labPanelIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .lab-panel > :nth-child(2) { animation-delay: 60ms; }
        .lab-panel > :nth-child(3) { animation-delay: 120ms; }
        .lab-panel > :nth-child(4) { animation-delay: 180ms; }
        .lab-panel > :nth-child(5) { animation-delay: 240ms; }
        .lab-panel > :nth-child(6) { animation-delay: 300ms; }
        @keyframes labPanelIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        .lab-panel-label {
          font-size: 0.95rem;
          color: var(--accent);
          font-weight: 600;
        }
        .lab-panel-big {
          margin-top: 0.35rem;
          font-size: clamp(2.8rem, 4.6vw, 4.2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--text-pure);
          font-variant-numeric: tabular-nums;
        }
        .lab-panel-unit {
          margin-top: 0.5rem;
          color: var(--text-heading);
        }
        .lab-panel-detail {
          margin-top: 1.25rem;
          color: var(--text-body);
          line-height: 1.6;
        }
        .lab-thermal-scale {
          position: relative;
          margin-top: 1.25rem;
          height: 30px;
        }
        .lab-thermal-track {
          position: absolute;
          left: 0;
          right: 0;
          top: 6px;
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, #8fd3ff, #ffae5c);
        }
        .lab-thermal-marker {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 15px;
        }
        .lab-thermal-marker::before {
          content: '';
          position: absolute;
          left: -1px;
          top: 0;
          width: 2px;
          height: 15px;
          background: #fff;
        }
        .lab-thermal-ends {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .lab-panel-nav {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.75rem;
        }
        .lab-nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-width: 44px;
          min-height: 44px;
          padding: 0 0.9rem;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: transparent;
          color: var(--text-pure);
          font-family: var(--font-display);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
        }
        .lab-nav-btn:hover {
          border-color: rgba(255, 255, 255, 0.45);
        }
        .lab-nav-close {
          margin-left: auto;
        }
        .lab-bottom {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 1.25rem;
          z-index: 3;
        }
        .lab-index {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          border-top: 1px solid var(--border-subtle);
        }
        .lab-index-item {
          width: 100%;
          min-height: 44px;
          padding: 1.1rem 1rem 0.4rem 0;
          background: none;
          border: 0;
          border-top: 2px solid transparent;
          margin-top: -1px;
          text-align: left;
          cursor: pointer;
          font-family: var(--font-display);
        }
        .lab-index-item:hover .lab-index-value,
        .lab-index-item[aria-pressed='true'] .lab-index-value {
          color: var(--text-pure);
        }
        .lab-index-item[aria-pressed='true'] {
          border-top-color: var(--accent);
        }
        .lab-index-label {
          display: block;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .lab-index-value {
          display: block;
          margin-top: 0.3rem;
          font-size: clamp(1.05rem, 1.7vw, 1.45rem);
          font-weight: 700;
          color: var(--text-body);
          font-variant-numeric: tabular-nums;
          transition: color 0.3s ease;
        }
        .lab-credit {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .lab-credit a {
          color: inherit;
        }
        @media (prefers-reduced-motion: reduce) {
          .lab-panel > * {
            animation: none;
          }
        }
        @media (max-width: 899px) {
          .lab {
            min-height: 660px;
          }
          .lab-head {
            top: 5rem;
            flex-direction: column;
            gap: 0.75rem;
          }
          .lab-sub {
            font-size: 0.95rem;
          }
          .lab-emotes {
            left: 1.5rem;
            right: 0;
            top: auto;
            bottom: 6.5rem;
            transform: none;
            width: auto;
            display: flex;
            gap: 0.5rem;
            overflow-x: auto;
            scrollbar-width: none;
            padding-right: 1.5rem;
          }
          .lab-emotes-label {
            display: none;
          }
          .lab-emote {
            flex: 0 0 auto;
          }
          .lab-panel {
            left: 1.5rem;
            right: 1.5rem;
            top: auto;
            bottom: 1.25rem;
            width: auto;
            transform: none;
            padding-top: 1rem;
            background: linear-gradient(180deg, rgba(3, 6, 17, 0), rgba(3, 6, 17, 0.9) 20%);
          }
          .lab-panel-big {
            font-size: 2.4rem;
          }
          .lab-panel-detail {
            margin-top: 0.6rem;
            font-size: 0.92rem;
          }
          .lab-panel-nav {
            margin-top: 0.9rem;
          }
          .lab.is-inspecting .lab-bottom {
            visibility: hidden;
          }
          .lab-index {
            display: flex;
            overflow-x: auto;
            gap: 1.5rem;
            scrollbar-width: none;
          }
          .lab-index li {
            flex: 0 0 auto;
          }
          .lab-index-item {
            padding-right: 0;
          }
          .lab-credit {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
