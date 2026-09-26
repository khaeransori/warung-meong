import * as THREE from 'three';

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const E = new THREE.Euler();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();

// Cube particles in one InstancedMesh
export class Particles {
  constructor(scene, max = 360) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.mesh = new THREE.InstancedMesh(geo, mat, max);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.setColorAt(0, C.set('#ffffff'));
    this.mesh.castShadow = false;
    this.max = max;
    this.list = [];
    scene.add(this.mesh);
  }
  emit(pos, o = {}) {
    const n = o.count || 8;
    const cols = Array.isArray(o.color) ? o.color : [o.color || '#ffffff'];
    for (let i = 0; i < n; i++) {
      if (this.list.length >= this.max) this.list.shift();
      const a = Math.random() * Math.PI * 2;
      const sp = (o.speed ?? 2) * (0.5 + Math.random() * 0.7);
      const spread = o.spread ?? 1;
      const p = {
        x: pos.x + (Math.random() - 0.5) * (o.jitter || 0.1),
        y: pos.y + (Math.random() - 0.5) * (o.jitter || 0.1),
        z: pos.z + (Math.random() - 0.5) * (o.jitter || 0.1),
        vx: Math.cos(a) * sp * spread, vz: Math.sin(a) * sp * spread,
        vy: (o.up ?? 2) * (0.6 + Math.random() * 0.6),
        g: o.gravity ?? -6, drag: o.drag ?? 1.5,
        life: 0, max: (o.life || 0.8) * (0.7 + Math.random() * 0.6),
        size: (o.size || 0.12) * (0.7 + Math.random() * 0.6), grow: o.grow ?? -1,
        rx: Math.random() * 6, ry: Math.random() * 6, spin: (Math.random() - 0.5) * (o.spin ?? 8),
        col: cols[Math.floor(Math.random() * cols.length)],
      };
      this.list.push(p);
    }
  }
  update(dt) {
    const L = this.list;
    let j = 0;
    for (let i = 0; i < L.length; i++) {
      const p = L[i];
      p.life += dt;
      if (p.life >= p.max) continue;
      p.vy += p.g * dt;
      const d = Math.exp(-p.drag * dt);
      p.vx *= d; p.vz *= d;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      p.rx += p.spin * dt; p.ry += p.spin * dt * 0.7;
      const t = p.life / p.max;
      let s = p.size;
      if (p.grow < 0) s *= 1 - t * t;
      else s *= 1 + p.grow * t;
      if (p.grow >= 0 && t > 0.7) s *= (1 - t) / 0.3;
      E.set(p.rx, p.ry, 0);
      Q.setFromEuler(E);
      P.set(p.x, p.y, p.z);
      S.set(s, s, s);
      M.compose(P, Q, S);
      this.mesh.setMatrixAt(j, M);
      this.mesh.setColorAt(j, C.set(p.col));
      L[j++] = p;
    }
    L.length = j;
    this.mesh.count = j;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
  clear() { this.list.length = 0; this.mesh.count = 0; }

  // presets
  puff(pos, col = '#ffffff', n = 10) { this.emit(pos, { count: n, color: col, speed: 1.6, up: 1.4, gravity: 0.5, drag: 3, life: 0.7, size: 0.2, grow: 0.6, spin: 2 }); }
  smoke(pos, col = ['#555', '#777', '#3a3a3a']) { this.emit(pos, { count: 2, color: col, speed: 0.3, up: 1.2, gravity: 0.6, drag: 1, life: 1.3, size: 0.16, grow: 1.5, spin: 1 }); }
  steam(pos) { this.emit(pos, { count: 1, color: ['#ffffff', '#f2f6f8'], speed: 0.2, up: 1.0, gravity: 0.5, drag: 1, life: 1.2, size: 0.1, grow: 1.4, spin: 1, jitter: 0.25 }); }
  sparkle(pos, cols = ['#ffd23f', '#ffffff', '#ff8c42']) { this.emit(pos, { count: 14, color: cols, speed: 3, up: 2.5, gravity: -5, drag: 2, life: 0.8, size: 0.09, spin: 12 }); }
  confetti(pos, n = 40) { this.emit(pos, { count: n, color: ['#ef476f', '#ffd23f', '#2ec4b6', '#3d8bfd', '#9b6dff', '#ff8c42'], speed: 4, up: 6, gravity: -9, drag: 1.2, life: 2, size: 0.12, spin: 14, jitter: 0.6 }); }
  flame(pos) { this.emit(pos, { count: 1, color: ['#ff7b00', '#ffd23f', '#ff4d00'], speed: 0.2, up: 1.2, gravity: 1, drag: 2, life: 0.35, size: 0.1, spin: 4, jitter: 0.3 }); }
  hearts(pos) { this.emit(pos, { count: 8, color: ['#ff6fa7', '#ff4f8b', '#ffffff'], speed: 1.4, up: 2.5, gravity: -2, drag: 2, life: 1, size: 0.1, spin: 4 }); }
  crumbs(pos, cols) { this.emit(pos, { count: 10, color: cols || ['#c9a26b', '#fff', '#8fd16a'], speed: 2, up: 2.5, gravity: -9, drag: 1, life: 0.6, size: 0.07 }); }
}
