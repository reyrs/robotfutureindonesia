import * as THREE from 'three';

// Shared rig for the official AgiBot X2 Ultra model (URDF → GLB via scripts/build-robot-model.mjs):
// poses, emotes and the lit eyes, used by the 3D lab and the home hero.

export const MODEL = { desktop: '/models/x2-ultra.glb', mobile: '/models/x2-ultra-mobile.glb' };

// Resting pose: arms slightly off the body. base_pitch tilts the pelvis (hips counter-rotate so legs stay planted).
export const NEUTRAL = {
  left_shoulder_roll_joint: 0.1,
  right_shoulder_roll_joint: -0.1,
  left_elbow_joint: -0.2,
  right_elbow_joint: -0.2
};

export const legs = (side, knee) => ({
  [`${side}_hip_pitch_joint`]: -knee * 0.5,
  [`${side}_knee_joint`]: knee,
  [`${side}_ankle_pitch_joint`]: -knee * 0.5
});

// Keyframes use absolute seconds; joints not listed keep their previous value. Every emote ends back at NEUTRAL.
export const EMOTES = [
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
    id: 'cheer',
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

// Eyes, as on AgiBot's X2 Ultra product photos: two tall rounded pills lit on the black face.
// Positions are fractions of the face panel found by raycasting the official head mesh.
const EYE = { y: 0.47, gap: 0.2, width: 0.15, height: 0.28 };
// Eye openness per emote: 1 = open, lower = a smiling squint.
export const EYE_MOOD = { wave: 0.5, handshake: 0.6, dance: 0.5, cheer: 0.42, bow: 0.3, point: 1 };

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

const tmpQ = new THREE.Quaternion();
const box = new THREE.Box3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

// `rig` holds robot, pelvis, feet, joints ({ node, axis, base }) and pose ({ jointName: radians, base_pitch }).
export function applyRigPose(state) {
const { joints, pose, pelvis, robot } = state;
  if (!robot) return;
  const base = pose.base_pitch ?? 0;
  for (const name in joints) {
    const j = joints[name];
    let v = pose[name] ?? 0;
    if (/hip_pitch(?:_joint)?$/.test(name)) v -= base;
    j.node.quaternion.copy(j.base).multiply(tmpQ.setFromAxisAngle(j.axis, v));
  }
  pelvis?.quaternion.setFromAxisAngle(Y_AXIS, base);
  // Keep the lower foot on the floor so bent knees lower the body instead of lifting the feet.
  robot.position.y = 0;
  robot.updateMatrixWorld(true);
  let minY = Infinity;
  for (const foot of state.feet) minY = Math.min(minY, box.setFromObject(foot).min.y);
  robot.position.y = -minY;
}

// Two lit pills on the black face panel, found by raycasting the head mesh. Sets state.eyes.
export function addRigEyes(state, clock) {
  const cfg = state.config ?? {};
  const E = { ...EYE, ...(cfg.eye ?? {}) };
  const head = state.meshes.find((m) => m.userData.link === (cfg.headLink ?? 'head_pitch_link'));
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
  const eyeY = top - (top - bottom) * E.y;
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
  const core = new THREE.MeshBasicMaterial({ color: cfg.eyeColor ?? '#f2fbff', toneMapped: false, transparent: true });
  const halo = new THREE.MeshBasicMaterial({ color: '#e3e9fb', map: glowTexture(), transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const w = faceW * E.width;
  const h = faceH * E.height;
  const items = [-1, 1].map((side) => {
    const hit = hitAt(mid + side * faceW * E.gap, eyeY) ?? { point: new THREE.Vector3(mid + side * faceW * E.gap, eyeY, bounds.max.z), normal: new THREE.Vector3(0, 0, 1) };
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
}

// AGIBOT wordmark over a blue light strip, as on AgiBot's product photos: the light runs in the
// arched panel seam above the LiDAR window, the wordmark sits small above it. The seam is read
// from the baked AO (scripts/bake-x2.py). Both are parented to the torso mesh so they follow
// poses and the lab's explode view with no per-frame bookkeeping.
export function addChestDecal(state) {
  const torso = state.meshes.find((m) => m.userData.link === 'torso_link');
  const lidar = state.meshes.find((m) => m.userData.link === 'lidar_chest_front_link');
  const ao = torso?.geometry.attributes.color;
  if (!lidar || !ao) return;
  torso.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(torso);
  const width = bounds.max.x - bounds.min.x;
  const mid = (bounds.min.x + bounds.max.x) / 2;
  const lidarTop = new THREE.Box3().setFromObject(lidar).max.y;
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(torso.matrixWorld);
  const ray = new THREE.Raycaster();
  const back = new THREE.Vector3(0, 0, -1);
  const hitAt = (x, y) => {
    ray.set(new THREE.Vector3(x, y, bounds.max.z + 0.2), back);
    const hit = ray.intersectObject(torso, false)[0];
    return hit ? { point: hit.point, face: hit.face, normal: hit.face.normal.clone().applyMatrix3(normalMatrix).normalize() } : null;
  };

  // The seam: per column across the arch, the darkest point of the outer shell between the window
  // and the neck, with the AO interpolated at the hit.
  const pos = torso.geometry.attributes.position;
  const tri = new THREE.Triangle();
  const bary = new THREE.Vector3();
  const aoAt = ({ point, face }) => {
    tri.setFromAttributeAndIndices(pos, face.a, face.b, face.c).getBarycoord(torso.worldToLocal(point.clone()), bary);
    return ao.getX(face.a) * bary.x + ao.getX(face.b) * bary.y + ao.getX(face.c) * bary.z;
  };
  const span = width * 0.2;
  const seam = [];
  for (let k = 0; k < 24; k++) {
    const x = mid - span + ((k + 0.5) / 24) * 2 * span;
    let best = null;
    for (let y = lidarTop + width * 0.03; y < lidarTop + width * 0.17; y += 0.0015) {
      const h = hitAt(x, y);
      if (!h || h.normal.z < 0.3) continue;
      const shade = aoAt(h);
      if (shade < 0.3 && shade < (best?.shade ?? 1)) best = { shade, ...h };
    }
    if (best) seam.push(best.point);
  }
  if (seam.length < 8) return;
  // The arch is symmetric and smooth on the real shell: fit y = a + c·x² through the picks
  // (least squares), then lay the strip on the shell along that curve.
  const sum = (f) => seam.reduce((t, q) => t + f(q), 0);
  const sq = (q) => (q.x - mid) ** 2;
  const bend = (seam.length * sum((q) => sq(q) * q.y) - sum(sq) * sum((q) => q.y)) / (seam.length * sum((q) => sq(q) ** 2) - sum(sq) ** 2);
  const y0 = (sum((q) => q.y) - bend * sum(sq)) / seam.length;
  const path = [];
  for (let k = 0; k <= 32; k++) {
    const x = mid + (k / 16 - 1) * width * 0.17;
    const h = hitAt(x, y0 + bend * (x - mid) ** 2);
    if (h) path.push(h.point.clone().addScaledVector(h.normal, 0.0015));
  }
  if (path.length < 8) return;

  // The wordmark is a fifth of the chest wide (the text fills ~3/4 of its print), centred above the arch.
  const w = width * 0.26;
  const hgt = w / 2;
  const printY = Math.max(...path.map((q) => q.y)) + width * 0.075;
  const center = hitAt(mid, printY);
  if (!center) return;
  const cols = 16;
  const rows = 8;
  const positions = new Float32Array(cols * rows * 3);
  const uvs = new Float32Array(cols * rows * 2);
  const indices = [];
  // Wrap the print around the chest horizontally only: one surface per column, the frontmost of
  // the band's top, centre and bottom lines, so a panel seam under one line can't sink the letters.
  const columns = Array.from({ length: cols }, (_, i) => {
    const x = mid - w / 2 + (i / (cols - 1)) * w;
    const hits = [printY + hgt / 2, printY, printY - hgt / 2].map((y) => hitAt(x, y)).filter(Boolean);
    return hits.length ? hits.reduce((a, b) => (b.point.z > a.point.z ? b : a)) : center;
  });
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1);
      const v = j / (rows - 1);
      const h = columns[i];
      // Lifted straight toward the viewer: along a tilted normal the lift would slide letters off the row.
      const p = new THREE.Vector3(mid - w / 2 + u * w, printY + hgt / 2 - v * hgt, h.point.z + 0.004);
      const local = torso.worldToLocal(p);
      const o = j * cols + i;
      positions.set([local.x, local.y, local.z], o * 3);
      uvs.set([u, 1 - v], o * 2);
    }
  }
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = j * cols + i;
      indices.push(a, a + cols, a + 1, a + 1, a + cols, a + cols + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Flat print (unlit), pulled well forward in depth: the meshopt-quantized shell fights
  // 1.6mm offsets, so bias the depth comparison instead of floating the decal off the chest.
  const mat = new THREE.MeshBasicMaterial({
    map: chestTexture(),
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -8,
    polygonOffsetUnits: -8
  });
  const decal = new THREE.Mesh(geometry, mat);
  decal.renderOrder = 6;
  decal.raycast = () => {}; // never intercept lab hover/drag picking

  const led = new THREE.MeshBasicMaterial({ color: '#8fb6f2', toneMapped: false, transparent: true });
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), 96, 0.002, 6);
  tube.applyMatrix4(torso.matrixWorld.clone().invert()); // built in world metres, stored in torso space
  const strip = new THREE.Mesh(tube, led);
  strip.raycast = () => {};
  torso.add(decal, strip);
  state.chest = { mat, led, mesh: decal };
}

// Sand-blasted finish on the white shell, as on the real casing: procedural micro-bump plus a
// little roughness variation, in object space because the CAD meshes have no UVs. The grain fades
// out where it gets finer than a pixel, so it never shimmers as the robot moves.
const GRAIN_GLSL = /* glsl */ `
varying vec3 vGrain;
float grainHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float grainNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(grainHash(i), grainHash(i + vec3(1, 0, 0)), f.x), mix(grainHash(i + vec3(0, 1, 0)), grainHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(grainHash(i + vec3(0, 0, 1)), grainHash(i + vec3(1, 0, 1)), f.x), mix(grainHash(i + vec3(0, 1, 1)), grainHash(i + 1.0), f.x), f.y),
    f.z);
}
vec3 grainPerturb(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDir) {
  vec3 sx = normalize(dFdx(surfPos));
  vec3 sy = normalize(dFdy(surfPos));
  vec3 r1 = cross(sy, surfNorm);
  vec3 r2 = cross(surfNorm, sx);
  float det = dot(sx, r1) * faceDir;
  return normalize(abs(det) * surfNorm - sign(det) * (dHdxy.x * r1 + dHdxy.y * r2));
}`;

export function addShellGrain(state, { size = 0.0012, bump = 0.12, rough = 0.1 } = {}) {
  for (const mesh of state.meshes) {
    const m = mesh.material;
    if (m.name !== 'shell') continue;
    m.customProgramCacheKey = () => 'shell-grain';
    m.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vGrain;')
        // Object space scaled to metres (the quantized meshes carry their scale on the node).
        .replace('#include <begin_vertex>', `#include <begin_vertex>\nvGrain = position * length(modelMatrix[0].xyz) / ${size.toFixed(5)};`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${GRAIN_GLSL}`)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          float grainH = grainNoise(vGrain);
          float grainFade = 1.0 - smoothstep(0.3, 0.8, length(fwidth(vGrain)));
          roughnessFactor = clamp(roughnessFactor + (grainH - 0.5) * ${rough.toFixed(3)} * grainFade, 0.0, 1.0);`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          normal = grainPerturb(-vViewPosition, normal, vec2(dFdx(grainH), dFdy(grainH)) * ${bump.toFixed(3)} * grainFade, faceDirection);`);
    };
    m.needsUpdate = true;
  }
}

// The URDF torso mesh also carries the internal bracket under the shell. On the real robot that
// sits in the dark waist, so paint everything below the shell's front rim the joint colour.
export function shadeTorsoUnderside(state) {
  const torso = state.meshes.find((m) => m.userData.link === 'torso_link');
  if (!torso) return;
  torso.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(torso);
  const ray = new THREE.Raycaster();
  const back = new THREE.Vector3(0, 0, -1);
  const cx = (bounds.min.x + bounds.max.x) / 2;
  let rimY = null;
  for (let k = 0; k <= 120 && rimY === null; k++) {
    const y = bounds.min.y + (k / 120) * (bounds.max.y - bounds.min.y) * 0.5;
    ray.set(new THREE.Vector3(cx, y, bounds.max.z + 0.2), back);
    const hit = ray.intersectObject(torso, false)[0];
    if (hit && hit.point.z > bounds.max.z - 0.035) rimY = y; // first hit on the outer shell
  }
  if (rimY === null) return;
  const pos = torso.geometry.attributes.position;
  const baked = torso.geometry.attributes.color; // AO from scripts/bake-x2.py, when present
  const colors = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const shade = (v.fromBufferAttribute(pos, i).applyMatrix4(torso.matrixWorld).y < rimY - 0.004 ? 0.025 : 1) * (baked ? baked.getX(i) : 1);
    colors.set([shade, shade, shade], i * 3);
  }
  torso.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  torso.material.vertexColors = true;
  torso.material.needsUpdate = true;
}

const chestTexture = () => {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 256);
  g.fillStyle = '#aeb4c2';
  g.font = '700 76px Arial, Helvetica, sans-serif';
  try { g.letterSpacing = '16px'; } catch { /* older engines draw tight, still legible */ }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('AGIBOT', 264, 128); // +8: letterSpacing trails the last letter
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// Collect joints, pelvis, feet and meshes from a loaded GLTF scene and stand the robot facing the camera.
// `cfg` switches the model-specific hooks (pelvis link, feet links, head link, resting pose, eye look).
export function buildRig(state, scene, cfg) {
  state.config = {
    pelvisName: 'pelvis',
    feetRe: /ankle_roll_link/,
    headLink: 'head_pitch_link',
    neutral: NEUTRAL,
    ...cfg
  };
  const robot = new THREE.Group();
  robot.add(scene);
  robot.rotation.y = -Math.PI / 2; // URDF faces +X; turn it toward the camera
  state.robot = robot;
  state.joints = {};
  state.meshes = [];
  scene.traverse((node) => {
    if (node.userData?.joint) {
      state.joints[node.name] = {
        node,
        axis: new THREE.Vector3(...node.userData.axis).normalize(),
        base: node.quaternion.clone(),
        lower: node.userData.lower,
        upper: node.userData.upper
      };
    }
    if (node.name === state.config.pelvisName) state.pelvis = node;
    if (node.isMesh) {
      node.material = node.material.clone();
      node.userData.link = node.parent.name;
      node.userData.basePos = node.position.clone();
      state.meshes.push(node);
    }
  });
  state.feet = state.meshes.filter((m) => state.config.feetRe.test(m.userData.link));
  state.pose = Object.fromEntries([...Object.keys(state.joints), 'base_pitch'].map((k) => [k, state.config.neutral[k] ?? 0]));
  applyRigPose(state);
  robot.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(robot);
  state.height = bounds.max.y - bounds.min.y;
  return robot;
}
