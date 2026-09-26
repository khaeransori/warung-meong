import * as THREE from 'three';
import { tex } from './textures.js';

// Box faces of a unit cube, CCW from outside. u/v = texture axes for world-space UVs.
const FACES = [
  { k: 'px', n: [1, 0, 0], c: [[.5, -.5, .5], [.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5]], u: [0, 0, -1], v: [0, 1, 0] },
  { k: 'nx', n: [-1, 0, 0], c: [[-.5, -.5, -.5], [-.5, -.5, .5], [-.5, .5, .5], [-.5, .5, -.5]], u: [0, 0, 1], v: [0, 1, 0] },
  { k: 'py', n: [0, 1, 0], c: [[-.5, .5, .5], [.5, .5, .5], [.5, .5, -.5], [-.5, .5, -.5]], u: [1, 0, 0], v: [0, 0, -1] },
  { k: 'ny', n: [0, -1, 0], c: [[-.5, -.5, -.5], [.5, -.5, -.5], [.5, -.5, .5], [-.5, -.5, .5]], u: [1, 0, 0], v: [0, 0, 1] },
  { k: 'pz', n: [0, 0, 1], c: [[-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]], u: [1, 0, 0], v: [0, 1, 0] },
  { k: 'nz', n: [0, 0, -1], c: [[.5, -.5, -.5], [-.5, -.5, -.5], [-.5, .5, -.5], [.5, .5, -.5]], u: [-1, 0, 0], v: [0, 1, 0] },
];
const FACE_UV = [0, 0, 1, 0, 1, 1, 0, 1];
const TRI = [0, 1, 2, 0, 2, 3];

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const E = new THREE.Euler();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const NM = new THREE.Matrix3();
const V = new THREE.Vector3();
const N = new THREE.Vector3();
const UA = new THREE.Vector3();
const VA = new THREE.Vector3();
const COL = new THREE.Color();
const EMPTY = {};

let jitterSeed = 1;
function jit() { jitterSeed = (jitterSeed * 16807) % 2147483647; return (jitterSeed - 1) / 2147483646 - 0.5; }

export class Blocks {
  constructor() {
    this.groups = {};
    this.base = null;
    this.stack = [];
  }
  push(m) {
    this.stack.push(this.base);
    this.base = this.base ? this.base.clone().multiply(m) : m.clone();
    return this;
  }
  pop() { this.base = this.stack.pop(); return this; }
  // run fn with a translated / y-rotated frame
  at(x, y, z, ry, fn, rx = 0, rz = 0, s = 1) {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
      new THREE.Vector3(s, s, s));
    this.push(m); fn(this); this.pop();
    return this;
  }
  // x,z = center; y = bottom
  box(x, y, z, w, h, d, color, o = EMPTY) {
    const key = o.mat || 'base';
    const g = this.groups[key] || (this.groups[key] = { p: [], n: [], c: [], u: [] });
    COL.set(color);
    if (o.vary) {
      const k = 1 + jit() * o.vary;
      COL.r *= k; COL.g *= k; COL.b *= k;
    }
    E.set(o.rx || 0, o.ry || 0, o.rz || 0);
    Q.setFromEuler(E);
    P.set(x, y + h / 2, z);
    S.set(w, h, d);
    M.compose(P, Q, S);
    if (this.base) M.premultiply(this.base);
    NM.getNormalMatrix(M);
    const world = !!o.world;
    const tile = o.tile || 1;
    const skip = o.skip;
    for (let f = 0; f < 6; f++) {
      const F = FACES[f];
      if (skip && skip.indexOf(F.k) >= 0) continue;
      N.fromArray(F.n).applyMatrix3(NM).normalize();
      const quad = [];
      for (let i = 0; i < 4; i++) {
        V.fromArray(F.c[i]).applyMatrix4(M);
        quad.push(V.x, V.y, V.z);
      }
      let uvs = FACE_UV;
      if (world) {
        UA.fromArray(F.u).transformDirection(M);
        VA.fromArray(F.v).transformDirection(M);
        uvs = [];
        for (let i = 0; i < 4; i++) {
          V.set(quad[i * 3], quad[i * 3 + 1], quad[i * 3 + 2]);
          uvs.push(V.dot(UA) / tile, V.dot(VA) / tile);
        }
      }
      const shade = o.shade && F.k === 'py' ? o.shade : 1;
      for (let t = 0; t < 6; t++) {
        const i = TRI[t];
        g.p.push(quad[i * 3], quad[i * 3 + 1], quad[i * 3 + 2]);
        g.n.push(N.x, N.y, N.z);
        g.c.push(COL.r * shade, COL.g * shade, COL.b * shade);
        g.u.push(uvs[i * 2], uvs[i * 2 + 1]);
      }
    }
    return this;
  }
  // a stepped "round" blob: stack of boxes that look like a rounded shape
  blob(x, y, z, w, h, d, color, o = EMPTY) {
    const steps = o.steps || 3;
    const sh = h / steps;
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      const k = Math.sqrt(1 - Math.pow(t * 2 - 1, 2)) * 0.45 + 0.55;
      this.box(x, y + i * sh, z, w * k, sh, d * k, color, o);
    }
    return this;
  }
  isEmpty() { return Object.keys(this.groups).length === 0; }
  geometry(key = 'base') {
    const g = this.groups[key];
    if (!g) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(g.p, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.n, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(g.c, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.u, 2));
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    return geo;
  }
  build(opts = EMPTY) {
    const group = new THREE.Group();
    for (const key of Object.keys(this.groups)) {
      const geo = this.geometry(key);
      const mat = opts.materials && opts.materials[key] ? opts.materials[key] : getMat(key);
      const mesh = new THREE.Mesh(geo, mat);
      const noShadow = key === 'glass' || key === 'glow' || key === 'sky';
      mesh.castShadow = !!opts.cast && !noShadow;
      mesh.receiveShadow = opts.receive !== false && key !== 'glow' && key !== 'sky';
      mesh.name = key;
      group.add(mesh);
    }
    return group;
  }
  // build into single mesh (first material) — handy for small moving parts
  mesh(opts = EMPTY) {
    const g = this.build(opts);
    if (g.children.length === 1) {
      const m = g.children[0];
      g.remove(m);
      return m;
    }
    return g;
  }
}

const MATS = {};
export function getMat(key) {
  if (MATS[key]) return MATS[key];
  let m;
  switch (key) {
    case 'base': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('edge') }); break;
    case 'plain': m = new THREE.MeshLambertMaterial({ vertexColors: true }); break;
    case 'glow': m = new THREE.MeshBasicMaterial({ vertexColors: true }); break;
    case 'sky': m = new THREE.MeshBasicMaterial({ vertexColors: true }); break;
    case 'glass': m = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.42, depthWrite: false }); break;
    case 'tile': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('tile') }); break;
    case 'wood': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('wood') }); break;
    case 'wall': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('wall') }); break;
    case 'carpet': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('carpet') }); break;
    case 'grass': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('grass') }); break;
    case 'roof': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('roof') }); break;
    case 'brick': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('brick') }); break;
    case 'paving': m = new THREE.MeshLambertMaterial({ vertexColors: true, map: tex('paving') }); break;
    default: throw new Error('unknown material ' + key);
  }
  MATS[key] = m;
  return m;
}

// quick helper to build a single group from a function
export function model(fn, opts) {
  const b = new Blocks();
  fn(b);
  return b.build(opts);
}
