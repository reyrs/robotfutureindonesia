// Converts the community AgiBot A2 description (media/a2-urdf, MPL-2.0, origin: GMR)
// into compressed GLB models with one node per joint, same layout as the X2 builder.
// Visual meshes are OBJ with MTL colour groups; collision STLs are ignored.
// Usage: npm run model
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, meshopt, prune, quantize, simplify, weld } from '@gltf-transform/functions';
import { BufferAttribute, BufferGeometry } from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const SRC = 'media/a2-urdf';
const URDF = join(SRC, 'A2.urdf');
const OUT = 'public/models';
const VARIANTS = [
  { name: 'a2', ratio: 0.12, error: 0.006 },
  { name: 'a2-mobile', ratio: 0.05, error: 0.02 }
];

const CREASE_ANGLE = (35 * Math.PI) / 180;

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
    const visual = body.match(/<visual[^>]*>([\s\S]*?)<\/visual>/);
    if (!visual) continue;
    const origin = visual[1].match(/<origin[^>]*\/>/);
    const mesh = visual[1].match(/<mesh[^>]*>/);
    links[name] = {
      xyz: nums(origin && attr(origin[0], 'xyz')),
      rpy: nums(origin && attr(origin[0], 'rpy')),
      mesh: mesh ? attr(mesh[0], 'filename')?.replace(/^\.\//, '') : null,
      scale: mesh ? nums(attr(mesh[0], 'scale'), [1, 1, 1]) : [1, 1, 1]
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

// Blender OBJ: positions only (normals are creased later), triangles grouped by `usemtl`.
// URDF mesh scale is baked in; negative scale flips triangle winding.
function readObj(path, scale = [1, 1, 1]) {
  const positions = [];
  const groups = new Map();
  const [sx, sy, sz] = scale;
  const flip = sx * sy * sz < 0;
  let current = null;
  const indexOf = (token) => {
    const n = parseInt(token.split('/')[0], 10);
    return n > 0 ? n - 1 : positions.length / 3 + n;
  };
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line.startsWith('v ')) {
      const p = line.split(/\s+/);
      positions.push(Number(p[1]) * sx, Number(p[2]) * sy, Number(p[3]) * sz);
    } else if (line.startsWith('usemtl ')) {
      const name = line.slice(7).trim();
      if (!groups.has(name)) groups.set(name, []);
      current = groups.get(name);
    } else if (line.startsWith('f ')) {
      if (!current) {
        const name = 'default';
        if (!groups.has(name)) groups.set(name, []);
        current = groups.get(name);
      }
      const verts = line.slice(2).trim().split(/\s+/);
      for (let i = 1; i < verts.length - 1; i++) {
        const a = indexOf(verts[0]);
        const b = indexOf(verts[i]);
        const c = indexOf(verts[i + 1]);
        if (flip) current.push(a, c, b);
        else current.push(a, b, c);
      }
    }
  }
  return { positions: new Float32Array(positions), groups };
}

// MTL: diffuse colour + shininess → approximate PBR factors.
function readMtl(path) {
  const map = new Map();
  let current = null;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line.startsWith('newmtl ')) {
      current = { name: line.slice(7).trim(), kd: [0.8, 0.8, 0.8], ns: 100 };
      map.set(current.name, current);
    } else if (current && line.startsWith('Kd ')) {
      current.kd = line.trim().split(/\s+/).slice(1, 4).map(Number);
    } else if (current && line.startsWith('Ns ')) {
      current.ns = Number(line.trim().split(/\s+/)[1]);
    }
  }
  return map;
}

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

async function build({ name, ratio, error }) {
  const { links, joints } = parseUrdf(readFileSync(URDF, 'utf8'));
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene('A2');
  const mtlCache = new Map();
  const materials = new Map();

  const materialFor = (objPath, mtlName) => {
    const dir = join(SRC, objPath, '..');
    if (!mtlCache.has(dir)) mtlCache.set(dir, readMtl(join(dir, 'materials.mtl')));
    const entry = mtlCache.get(dir).get(mtlName);
    const key = `${dir}:${mtlName}`;
    if (materials.has(key)) return materials.get(key);
    const kd = entry ? entry.kd : [0.8, 0.8, 0.8];
    const ns = entry ? entry.ns : 100;
    const mat = doc
      .createMaterial(mtlName || 'default')
      .setBaseColorFactor([srgbToLinear(kd[0]), srgbToLinear(kd[1]), srgbToLinear(kd[2]), 1])
      .setRoughnessFactor(Math.min(0.85, Math.max(0.15, 0.55 - ns / 2000)))
      .setMetallicFactor(0);
    materials.set(key, mat);
    return mat;
  };

  // ROS is Z-up; glTF is Y-up.
  const root = doc.createNode('a2').setRotation([-Math.SQRT1_2, 0, 0, Math.SQRT1_2]);
  scene.addChild(root);

  const linkNodes = {};
  const linkNode = (linkName) => {
    if (linkNodes[linkName]) return linkNodes[linkName];
    const node = doc.createNode(linkName);
    linkNodes[linkName] = node;
    const link = links[linkName];
    if (link?.mesh) {
      const { positions, groups } = readObj(join(SRC, link.mesh), link.scale);
      const position = doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer);
      const mesh = doc.createMesh(linkName);
      for (const [mtlName, indices] of groups) {
        if (!indices.length) continue;
        const prim = doc
          .createPrimitive()
          .setAttribute('POSITION', position)
          .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer))
          .setMaterial(materialFor(link.mesh, mtlName));
        mesh.addPrimitive(prim);
      }
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
copyFileSync(join(SRC, 'ORIGIN.md'), join(OUT, 'A2-CREDITS.txt'));
