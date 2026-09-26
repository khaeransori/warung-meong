import * as THREE from 'three';
import { buildCat, animateChar, setHeld, disposeChar } from './characters.js';
import { buildItem, ingItem } from './items.js';

export class Player {
  constructor(charSave, opts = {}) {
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.y = 0;
    this.facing = 0;
    this.carry = null;
    this.baseSpeed = 3.7;
    this.speedMul = 1;
    this.radius = 0.34;
    this.pose = null;
    this.poseT = 0;
    this.apron = opts.apron !== false;
    this.rebuild(charSave);
  }
  rebuild(c) {
    const parent = this.root ? this.root.parent : null;
    if (this.ch) { parent && parent.remove(this.ch.root); disposeChar(this.ch); }
    this.ch = buildCat(c, { apron: this.apron });
    this.root = this.ch.root;
    if (parent) parent.add(this.root);
    this.setCarry(this.carry);
    this.sync();
  }
  // carry = {kind:'ing'|'dish'|'gosong', id}
  setCarry(obj) {
    this.carry = obj;
    if (!obj) { setHeld(this.ch, null); return; }
    const model = buildItem(obj.kind === 'ing' ? ingItem(obj.id) : obj.id);
    model.scale.setScalar(obj.kind === 'ing' ? 0.9 : 0.85);
    model.position.y = obj.kind === 'dish' && (obj.id === 'esteh' || obj.id === 'esjeruk') ? -0.05 : 0.02;
    setHeld(this.ch, model);
  }
  get carryIcon() {
    if (!this.carry) return null;
    return this.carry.kind === 'ing' ? ingItem(this.carry.id) : this.carry.id;
  }
  playPose(pose, t) { this.pose = pose; this.poseT = t; }
  place(x, z, y = 0, facing = 0) {
    this.pos.set(x, y, z); this.y = y; this.vel.set(0, 0, 0); this.facing = facing;
    this.sync();
  }
  sync() {
    this.root.position.set(this.pos.x, this.y, this.pos.z);
    this.root.rotation.y = this.facing;
  }
  update(dt, move, world, frozen) {
    const speed = this.baseSpeed * this.speedMul;
    let tx = 0, tz = 0;
    if (!frozen && (!this.pose || this.poseT <= 0)) { tx = move.x * speed; tz = move.y * speed; }
    const k = 1 - Math.exp(-dt * 14);
    this.vel.x += (tx - this.vel.x) * k;
    this.vel.z += (tz - this.vel.z) * k;
    const sp = Math.hypot(this.vel.x, this.vel.z);
    if (sp > 0.05) {
      const px = this.pos.x, pz = this.pos.z;
      this.pos.x += this.vel.x * dt;
      this.pos.z += this.vel.z * dt;
      world.collide(this.pos, this.y, this.radius);
      // update velocity to real movement (so we don't keep pushing into walls)
      if (dt > 0) { this.realSpeed = Math.hypot(this.pos.x - px, this.pos.z - pz) / dt; }
      if (Math.hypot(tx, tz) > 0.3) {
        const target = Math.atan2(this.vel.x, this.vel.z);
        let d = target - this.facing;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        this.facing += d * Math.min(1, dt * 16);
        if (this.facing > Math.PI) this.facing -= Math.PI * 2;
        if (this.facing < -Math.PI) this.facing += Math.PI * 2;
      }
    } else this.realSpeed = 0;
    const gy = world.groundY(this.pos.x, this.pos.z, this.y);
    this.y += (gy - this.y) * Math.min(1, dt * 20);
    if (Math.abs(gy - this.y) < 0.002) this.y = gy;
    this.pos.y = this.y;
    if (this.poseT > 0) { this.poseT -= dt; if (this.poseT <= 0) this.pose = null; }
    const moving = Math.min(1, (this.realSpeed || 0) / (this.baseSpeed));
    animateChar(this.ch, dt, { speed: moving, carry: !!this.carry, pose: this.pose || 'stand' });
    this.sync();
  }
  forward() { return new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing)); }
}
