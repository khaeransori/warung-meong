import * as THREE from 'three';
import { Blocks } from '../engine/blocks.js';
import { Particles } from '../engine/fx.js';
import { sound } from '../engine/audio.js';

// Shared base for house + warung: colliders, interactables, target ring, helper arrow.
export class PlayScene {
  constructor(app) {
    this.app = app;
    this.scene = new THREE.Scene();
    this.colliders = [];
    this.interactables = [];
    this.target = null;
    this.t = 0;
  }
  initCommon() {
    this.fx = new Particles(this.scene);
    // target ring
    const rg = new THREE.RingGeometry(0.42, 0.56, 28);
    rg.rotateX(-Math.PI / 2);
    this.ring = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false }));
    this.ring.renderOrder = 2;
    this.ring.visible = false;
    this.scene.add(this.ring);
    // helper arrow
    const b = new Blocks();
    b.box(0, 0.35, 0, 0.16, 0.42, 0.16, '#ff8c42', { mat: 'glow' });
    b.box(0, 0.23, 0, 0.44, 0.12, 0.44, '#ff8c42', { mat: 'glow' });
    b.box(0, 0.13, 0, 0.3, 0.1, 0.3, '#ff8c42', { mat: 'glow' });
    b.box(0, 0.05, 0, 0.14, 0.08, 0.14, '#ff8c42', { mat: 'glow' });
    b.box(0, 0.37, 0, 0.2, 0.42, 0.08, '#ffffff', { mat: 'glow' });
    b.box(0, 0.22, 0, 0.5, 0.14, 0.08, '#ffffff', { mat: 'glow' });
    this.arrow = b.build();
    this.arrow.visible = false;
    this.scene.add(this.arrow);
  }
  addBox(x0, x1, z0, z1, y0 = -5, y1 = 50) { this.colliders.push({ t: 'b', x0, x1, z0, z1, y0, y1 }); }
  addCircle(x, z, r, y0 = -5, y1 = 50) { this.colliders.push({ t: 'c', x, z, r, y0, y1 }); }
  collide(p, y, r) {
    for (let pass = 0; pass < 2; pass++) {
      for (const c of this.colliders) {
        if (y > c.y1 - 0.15 || y + 1.2 < c.y0) continue;
        if (c.t === 'c') {
          const dx = p.x - c.x, dz = p.z - c.z;
          const d = Math.hypot(dx, dz), m = c.r + r;
          if (d < m && d > 1e-6) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; }
          continue;
        }
        const cx = Math.max(c.x0, Math.min(p.x, c.x1));
        const cz = Math.max(c.z0, Math.min(p.z, c.z1));
        const dx = p.x - cx, dz = p.z - cz;
        const d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        if (d2 > 1e-8) {
          const d = Math.sqrt(d2);
          p.x = cx + dx / d * r; p.z = cz + dz / d * r;
        } else {
          const l = p.x - c.x0, rr = c.x1 - p.x, t = p.z - c.z0, bb = c.z1 - p.z;
          const m = Math.min(l, rr, t, bb);
          if (m === l) p.x = c.x0 - r; else if (m === rr) p.x = c.x1 + r; else if (m === t) p.z = c.z0 - r; else p.z = c.z1 + r;
        }
      }
    }
    if (this.bounds) {
      const B = this.bounds;
      p.x = Math.max(B.x0 + r, Math.min(B.x1 - r, p.x));
      p.z = Math.max(B.z0 + r, Math.min(B.z1 - r, p.z));
    }
  }
  groundY() { return 0; }

  addInteract(it) {
    it.range = it.range || 1.25;
    it.enabled = it.enabled !== false;
    this.interactables.push(it);
    return it;
  }
  findTarget() {
    const p = this.player;
    const fx = Math.sin(p.facing), fz = Math.cos(p.facing);
    let best = null, bestScore = Infinity;
    for (const it of this.interactables) {
      if (!it.enabled) continue;
      if (it.floorY !== undefined && Math.abs(it.floorY - p.y) > 1.0) continue;
      const dx = it.pos.x - p.pos.x, dz = it.pos.z - p.pos.z;
      const d = Math.hypot(dx, dz);
      if (d > it.range) continue;
      const act = it.action(this);
      if (!act) continue;
      const facing = d > 0.01 ? (dx * fx + dz * fz) / d : 1;
      const score = d - facing * 0.3 - (act.priority || 0);
      if (score < bestScore) { bestScore = score; best = { it, act }; }
    }
    return best;
  }
  updateTarget(dt) {
    this.target = this.findTarget();
    const ui = this.app.ui;
    if (this.target) {
      const a = this.target.act;
      ui.setAction({ label: a.label, icon: a.icon, color: a.color, svg: a.svg, pulse: a.pulse });
      const pos = this.target.it.ringPos || this.target.it.pos;
      this.ring.visible = true;
      this.ring.position.set(pos.x, (this.target.it.floorY || 0) + 0.03, pos.z);
      const s = 1 + Math.sin(this.t * 7) * 0.08;
      this.ring.scale.set(s, 1, s);
    } else {
      ui.setAction(null);
      this.ring.visible = false;
    }
    ui.setCarry(this.player.carryIcon);
  }
  doAction() {
    if (this.target) {
      this.target.act.run();
      this.target = null;
    } else {
      this.meow();
    }
  }
  meow() {
    const p = this.player;
    const pitch = this.app.save.char.gender === 'f' ? 1.25 : 1.0;
    sound.meow(pitch * (0.95 + Math.random() * 0.1));
    p.playPose('happy', 0.6);
    this.fx.hearts(new THREE.Vector3(p.pos.x, p.y + 1.6, p.pos.z));
  }
  showArrow(pos, dt) {
    if (!pos) { this.arrow.visible = false; return; }
    this.arrow.visible = true;
    const k = 1 - Math.exp(-dt * 10);
    if (!this.arrowInit) { this.arrow.position.copy(pos); this.arrowInit = true; }
    this.arrow.position.x += (pos.x - this.arrow.position.x) * k;
    this.arrow.position.z += (pos.z - this.arrow.position.z) * k;
    const by = pos.y + 0.15 + Math.abs(Math.sin(this.t * 4)) * 0.3;
    this.arrow.position.y += (by - this.arrow.position.y) * Math.min(1, k * 2);
    this.arrow.rotation.y += dt * 2;
  }
}
