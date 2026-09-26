// Converts AgiBot's official X2 Ultra URDF (media/x2-urdf, Mulan PSL v2) into compressed GLB models
// with one node per joint, so the site can pose the real kinematic chain.
// Usage: npm run model
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, quantize, simplify, weld } from '@gltf-transform/functions';
import { BufferAttribute, BufferGeometry } from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const SRC = 'media/x2-urdf';
const OUT = 'public/models';
const VARIANTS = [
  { name: 'x2-ultra', ratio: 0.12, error: 0.006 },
  { name: 'x2-ultra-mobile', ratio: 0.05, error: 0.02 }
];

// Material per link, matched to AgiBot's product photos. Everything is white shell unless listed here.
const MATERIAL_BY_LINK = {
  head_pitch_link: 'head',
  head_yaw_link: 'head',
  rgbd_head_front_link: 'glass',
  stereo_head_front_link: 'glass',
  rgb_head_rear_link: 'glass',
  rgb_head_center_link: 'glass',
  lidar_chest_front_link: 'glass',
  waist_yaw_link: 'joint',
  waist_pitch_link: 'joint',
  left_hip_roll_link: 'joint',
  right_hip_roll_link: 'joint',
  left_ankle_roll_link: 'joint',
  right_ankle_roll_link: 'joint',
  left_shoulder_roll_link: 'joint',
  right_shoulder_roll_link: 'joint',
  left_wrist_yaw_link: 'joint',
  right_wrist_yaw_link: 'joint',
  left_wrist_pitch_link: 'joint',
  right_wrist_pitch_link: 'joint'
};

const CREASE_ANGLE = (35 * Math.PI) / 180;

// Smooth normals on curved shells, hard edges kept where CAD faces meet at a sharp angle.
const creaseNormals = (doc) => {
  for (const mesh of doc.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(prim.getAttribute('POSITION').getArray(), 3));
      geometry.setIndex(new BufferAttribute(prim.getIndices().getArray(), 1));
      const creased = toCreasedNormals(geometry, CREASE_ANGLE);
      prim.getAttribute('POSITION').setArray(creased.getAttribute('position').array);
      prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(creased.getAttribute('normal').array).setBuffer(doc.getRoot().listBuffers()[0]));
      prim.setIndices(null);
    }
  }
};

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : null;
};
const nums = (s, fallback = [0, 0, 0]) => (s ? s.trim().split(/\s+/).map(Number) : fallback);

// URDF rpy = fixed-axis roll(X), pitch(Y), yaw(Z): R = Rz·Ry·Rx, as an [x, y, z, w] quaternion.
const rpyToQuat = ([r, p, y]) => {
  const cr = Math.cos(r / 2), sr = Math.sin(r / 2);
  const cp = Math.cos(p / 2), sp = Math.sin(p / 2);
  const cy = Math.cos(y / 2), sy = Math.sin(y / 2);
  return [
    sr * cp * cy - cr * sp * sy,
    cr * sp * cy + sr * cp * sy,
    cr * cp * sy - sr * sp * cy,
    cr * cp * cy + sr * sp * sy
  ];
};

function parseUrdf(xml) {
  const links = {};
  for (const [, name, body] of xml.matchAll(/<link name="([^"]+)"\s*>([\s\S]*?)<\/link>/g)) {
    const visual = body.match(/<visual>([\s\S]*?)<\/visual>/);
    if (!visual) continue;
    const origin = visual[1].match(/<origin[^>]*\/>/);
    const mesh = visual[1].match(/<mesh filename="([^"]+)"/);
    links[name] = {
      xyz: nums(origin && attr(origin[0], 'xyz')),
      rpy: nums(origin && attr(origin[0], 'rpy')),
      mesh: mesh ? mesh[1].replace(/^\.\//, '') : null
    };
  }
  const joints = [];
  for (const [, head, body] of xml.matchAll(/<joint ([^>]+)>([\s\S]*?)<\/joint>/g)) {
    const origin = body.match(/<origin[^>]*\/>/);
    const limit = body.match(/<limit[^>]*\/>/);
    joints.push({
      name: attr(head, 'name'),
      type: attr(head, 'type'),
      parent: body.match(/<parent link="([^"]+)"/)[1],
      child: body.match(/<child link="([^"]+)"/)[1],
      xyz: nums(origin && attr(origin[0], 'xyz')),
      rpy: nums(origin && attr(origin[0], 'rpy')),
      axis: nums(attr(body.match(/<axis[^>]*\/>/)?.[0] ?? '', 'xyz'), [0, 0, 1]),
      lower: limit ? Number(attr(limit[0], 'lower')) : 0,
      upper: limit ? Number(attr(limit[0], 'upper')) : 0
    });
  }
  return { links, joints };
}

function readStl(path) {
  const buffer = readFileSync(path);
  const count = buffer.readUInt32LE(80);
  const positions = new Float32Array(count * 9);
  for (let t = 0; t < count; t++) {
    const base = 84 + t * 50 + 12;
    for (let k = 0; k < 9; k++) positions[t * 9 + k] = buffer.readFloatLE(base + k * 4);
  }
  return positions;
}

async function build({ name, ratio, error }) {
  const { links, joints } = parseUrdf(readFileSync(join(SRC, 'X2-Ultra.urdf'), 'utf8'));
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene('X2-Ultra');

  const materials = {
    shell: doc.createMaterial('shell').setBaseColorFactor([0.93, 0.94, 0.95, 1]).setRoughnessFactor(0.32).setMetallicFactor(0),
    joint: doc.createMaterial('joint').setBaseColorFactor([0.09, 0.1, 0.11, 1]).setRoughnessFactor(0.45).setMetallicFactor(0.3),
    head: doc.createMaterial('head').setBaseColorFactor([0.018, 0.02, 0.024, 1]).setRoughnessFactor(0.22).setMetallicFactor(0.15),
    glass: doc.createMaterial('glass').setBaseColorFactor([0.02, 0.025, 0.03, 1]).setRoughnessFactor(0.12).setMetallicFactor(0.2)
  };

  // ROS is Z-up; glTF is Y-up.
  const root = doc.createNode('x2').setRotation([-Math.SQRT1_2, 0, 0, Math.SQRT1_2]);
  scene.addChild(root);

  const linkNodes = {};
  const linkNode = (linkName) => {
    if (linkNodes[linkName]) return linkNodes[linkName];
    const node = doc.createNode(linkName);
    linkNodes[linkName] = node;
    const link = links[linkName];
    if (link?.mesh) {
      const positions = readStl(join(SRC, link.mesh));
      const accessor = doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer);
      const prim = doc.createPrimitive().setAttribute('POSITION', accessor).setMaterial(materials[MATERIAL_BY_LINK[linkName] ?? 'shell']);
      const mesh = doc.createMesh(linkName).addPrimitive(prim);
      const visual = doc.createNode(`${linkName}_visual`).setMesh(mesh).setTranslation(link.xyz).setRotation(rpyToQuat(link.rpy));
      node.addChild(visual);
    }
    return node;
  };

  const children = new Set(joints.map((j) => j.child));
  const base = Object.keys(links).find((l) => !children.has(l));
  root.addChild(linkNode(base));
  for (const joint of joints) {
    const jointNode = doc.createNode(joint.name).setTranslation(joint.xyz).setRotation(rpyToQuat(joint.rpy));
    if (joint.type === 'revolute') jointNode.setExtras({ joint: true, axis: joint.axis, lower: joint.lower, upper: joint.upper });
    linkNode(joint.parent).addChild(jointNode);
    jointNode.addChild(linkNode(joint.child));
  }

  await MeshoptSimplifier.ready;
  await MeshoptEncoder.ready;
  await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio, error, lockBorder: false }));
  creaseNormals(doc);
  await doc.transform(
    weld(),
    dedup(),
    prune({ keepLeaves: true }),
    quantize(),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' })
  );

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  mkdirSync(OUT, { recursive: true });
  await io.write(join(OUT, `${name}.glb`), doc);
  const tris = doc.getRoot().listMeshes().reduce((sum, m) => sum + m.listPrimitives().reduce((s, p) => s + (p.getIndices()?.getCount() ?? 0) / 3, 0), 0);
  console.log(`${name}.glb: ${Math.round(tris)} triangles, ${joints.filter((j) => j.type === 'revolute').length} joints`);
}

for (const variant of VARIANTS) await build(variant);
copyFileSync(join(SRC, 'LICENSE'), join(OUT, 'X2-ULTRA-LICENSE.txt'));
