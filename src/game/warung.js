import * as THREE from 'three';
import { PlayScene } from './playscene.js';
import { Blocks } from '../engine/blocks.js';
import { canvasTex } from '../engine/textures.js';
import * as props from './props.js';
import { Player } from './player.js';
import { buildItem, ingItem, ICON_CANVAS } from './items.js';
import { buildAnimal, animateChar, disposeChar } from './characters.js';
import { RECIPES, INGREDIENTS, STATIONS, dayConfig, menuForDay, newRecipeOnDay, CUSTOMERS, VIP, JURI, DAYS } from './data.js';
import { sound } from '../engine/audio.js';
import { el, SVG } from '../ui/ui.js';

const AISLE_Z = 2.65;
const TABLE_Z = 1.6;
const SEAT_OFF = 0.82;
const DOOR = [new THREE.Vector3(9.5, 0, 4.6), new THREE.Vector3(6.15, 0, 4.1), new THREE.Vector3(6.15, 0, AISLE_Z)];

const BACK = [-5.6, -4.48, -3.36, -2.24, -1.12, 0, 1.12, 2.24, 3.36, 4.48, 5.6];
const BACK_SLOTS = ['c:nasi', 'c:telur', 's:wajan', 's:wajan2', 'c:mie', 'trash', 's:panci', 'c:bakso', 's:bakar', 's:bakar2', 'c:ayam'];
const BACK_TOP_Z = -2.95, BACK_FRONT_Z = -1.9;
const SIDE = [-0.85, 0.35];
const LEFT_SLOTS = ['s:teh', 'c:pisang'];
const RIGHT_SLOTS = ['c:jeruk', 's:jus'];
const SIDE_TOP_X = 6.55, SIDE_FRONT_X = 5.5;

function isSubset(a, b) {
  const c = b.slice();
  for (const x of a) { const i = c.indexOf(x); if (i < 0) return false; c.splice(i, 1); }
  return true;
}
function sameSet(a, b) { return a.length === b.length && isSubset(a, b); }
function diff(b, a) { const c = b.slice(); for (const x of a) { const i = c.indexOf(x); if (i >= 0) c.splice(i, 1); } return c; }
function rand(a, b) { return a + Math.random() * (b - a); }
function ingName(id) { return INGREDIENTS[id].name; }

export class Warung extends PlayScene {
  constructor(app) {
    super(app);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
    this.bot = false;
  }

  // ======================= BUILD =======================
  build(dayN) {
    // fresh scene each day (upgrades / unlocks may change the layout)
    if (this.scene) this.disposeScene();
    this.scene = new THREE.Scene();
    this.colliders = [];
    this.interactables = [];
    this.stations = [];
    this.seats = [];
    this.customers = [];
    this.crates = {};
    this.signTex = {};
    this.texToDispose = [];
    this.initCommon();
    const S = this.app.save;
    const up = S.upgrades;
    this.menu = menuForDay(dayN);
    const unlockedIng = new Set();
    for (const id of this.menu) for (const g of RECIPES[id].ing) unlockedIng.add(g);
    const stOn = (st) => this.menu.some(id => RECIPES[id].station === st);

    // lights
    this.scene.add(new THREE.HemisphereLight(0xfff4e6, 0x9c8674, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.55);
    sun.position.set(4, 13, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 8, bottom: -8, near: 1, far: 40 });
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);

    const b = new Blocks();
    // floor + outside
    b.box(0, -0.2, 0, 14.4, 0.2, 7.3, '#ffffff', { mat: 'tile', world: true, tile: 1 });
    b.box(0, -0.25, 5.2, 30, 0.2, 2.8, '#e9e3da', { mat: 'paving', world: true, tile: 1 });
    b.box(0, -0.3, 8.6, 30, 0.2, 4.0, '#6c757d');
    for (let x = -14; x < 15; x += 3) b.box(x, -0.2, 8.6, 1.4, 0.02, 0.2, '#ffffff');
    b.box(-11, -0.25, 0, 8, 0.2, 7.6, '#ffffff', { mat: 'grass', world: true, tile: 2 });
    b.box(11, -0.25, 0, 8, 0.2, 7.6, '#ffffff', { mat: 'grass', world: true, tile: 2 });
    // walls
    b.box(0, -0.2, -3.7, 15.4, 3.6, 0.5, '#ffd98a', { mat: 'wall', world: true });
    b.box(-7.45, -0.2, 0, 0.5, 3.6, 7.9, '#ffd98a', { mat: 'wall', world: true });
    b.box(7.45, -0.2, 0, 0.5, 3.6, 7.9, '#ffd98a', { mat: 'wall', world: true });
    b.box(0, 3.3, -3.55, 15.4, 0.14, 0.3, '#e76f51');
    b.box(0, 0.9, -3.445, 14.4, 0.9, 0.02, '#f0fffd', { mat: 'tile', world: true, tile: 0.5 });
    b.box(-7.185, 0.9, -1.2, 0.02, 0.9, 4.4, '#f0fffd', { mat: 'tile', world: true, tile: 0.5 });
    b.box(7.185, 0.9, -1.2, 0.02, 0.9, 4.4, '#f0fffd', { mat: 'tile', world: true, tile: 0.5 });
    // front half-wall with planter
    b.box(-1.1, 0, 3.55, 12.2, 0.55, 0.35, '#ffffff', { mat: 'brick', world: true, tile: 1 });
    b.box(-1.1, 0.55, 3.55, 12.3, 0.08, 0.42, '#e76f51');
    for (let x = -6.8; x < 4.8; x += 0.9) {
      b.box(x, 0.63, 3.55, 0.5, 0.12, 0.26, '#52b788');
      if (Math.round(x * 10) % 2 === 0) b.box(x + 0.1, 0.74, 3.58, 0.12, 0.1, 0.12, ['#ff6fa7', '#ffd23f', '#9b6dff'][Math.abs(Math.round(x)) % 3]);
    }
    b.box(5.15, 0, 3.55, 0.3, 1.6, 0.35, '#e76f51');
    b.box(7.25, 0, 3.55, 0.3, 1.6, 0.35, '#e76f51');
    b.box(6.1, 0, 2.95, 1.6, 0.02, 0.8, '#ef476f', { mat: 'carpet', world: true });
    b.box(6.1, 0.02, 2.95, 1.2, 0.005, 0.5, '#ffd23f', { mat: 'carpet', world: true });
    // outside decorations
    props.tree(b, -10, -0.15, 1.8, 1.1);
    props.tree(b, 10.5, -0.15, -1.5, 1.2);
    props.bush(b, -9, -0.15, 4.6, 1, '#ff6fa7');
    props.bush(b, 9.4, -0.15, 3.0, 1.1, '#ffd23f');
    b.at(3.9, -0.15, 4.7, -0.3, () => {
      b.box(0, 0, 0, 0.9, 1.2, 0.12, '#8d5a36', { rx: 0.15 });
      b.box(0, 0.35, 0.1, 0.72, 0.6, 0.03, '#2f3e46', { rx: 0.15 });
      b.box(0, 0.5, 0.14, 0.5, 0.14, 0.02, '#ffd23f', { rx: 0.15 });
      b.box(0, 0.7, 0.18, 0.4, 0.06, 0.02, '#ffffff', { rx: 0.15 });
    });
    props.shelfWithJars(b, -5.2, 2.2, -3.3, 2.8);
    props.shelfWithJars(b, 5.2, 2.2, -3.3, 2.8);
    props.wallClock(b, -7.15, 2.1, 1.6, Math.PI / 2);

    // counters (back counter has a gap for the trash bin)
    props.counterBlock(b, -3.8, 0, -2.95, 6.4, 0.9);
    props.counterBlock(b, 3.8, 0, -2.95, 6.4, 0.9);
    props.counterBlock(b, -6.55, 0, -0.75, 0.9, 3.5);
    props.counterBlock(b, 6.55, 0, -0.75, 0.9, 3.5);
    this.addBox(-7.5, 7.5, -4.2, -2.45);
    this.addBox(-7.5, -6.05, -4.2, 1.0);
    this.addBox(6.05, 7.5, -4.2, 1.0);
    this.addBox(-7.5, 5.3, 3.36, 3.9);
    this.addBox(7.05, 7.5, 3.36, 3.9);
    this.bounds = { x0: -7.1, x1: 7.1, z0: -3.4, z1: 3.28 };

    this.addSignAndMenu();

    const dyn = (x, y, z, ry) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; this.scene.add(g); return g; };
    const turbo = !!up.turbo, anti = !!up.antigosong;
    const cookOn = {
      wajan: stOn('wajan'), wajan2: stOn('wajan') && !!up.wajan2, panci: stOn('panci'),
      bakar: stOn('bakar'), bakar2: stOn('bakar') && !!up.bakar2, teh: stOn('teh'), jus: stOn('jus'),
    };
    const slot = (spec, top, front, ry, i) => {
      const [kind, id] = spec.split(':');
      // little picture sign on the wall behind each slot
      const signPos = new THREE.Vector3(top.x - Math.sin(ry) * 0.36, 1.42, top.z - Math.cos(ry) * 0.36);
      if (kind === 'c') {
        if (unlockedIng.has(id)) { this.addCrate(b, id, top, front, ry); this.wallSign(ingItem(id), signPos, ry); }
        else this.decorEmpty(b, top, i, ry);
      } else if (kind === 's') {
        const st = id.replace('2', '');
        if (cookOn[id]) { this.addCookStation(b, st, top, front, ry, dyn, { turbo, anti }); this.wallSign('st_' + st, signPos, ry); }
        else this.decorEmpty(b, top, i, ry);
      }
    };
    BACK_SLOTS.forEach((spec, i) => {
      const x = BACK[i];
      if (spec === 'trash') return;
      slot(spec, new THREE.Vector3(x, 0.92, BACK_TOP_Z), new THREE.Vector3(x, 0, BACK_FRONT_Z), 0, i);
    });
    LEFT_SLOTS.forEach((spec, i) => slot(spec, new THREE.Vector3(-SIDE_TOP_X, 0.92, SIDE[i]), new THREE.Vector3(-SIDE_FRONT_X, 0, SIDE[i]), Math.PI / 2, 20 + i));
    RIGHT_SLOTS.forEach((spec, i) => slot(spec, new THREE.Vector3(SIDE_TOP_X, 0.92, SIDE[i]), new THREE.Vector3(SIDE_FRONT_X, 0, SIDE[i]), -Math.PI / 2, 30 + i));

    // trash bin in the counter gap
    const TX = BACK[BACK_SLOTS.indexOf('trash')];
    props.trashBin(b, TX, 0, -3.0);
    const lid = new Blocks();
    lid.box(0, 0, 0, 0.7, 0.08, 0.7, '#25a468');
    lid.box(0, 0.08, 0, 0.2, 0.06, 0.1, '#1b8a55');
    this.trashLid = lid.build({ cast: true });
    this.trashLid.position.set(TX, 0.8, -3.0);
    this.scene.add(this.trashLid);
    this.trashPos = new THREE.Vector3(TX, 1.2, -3.0);
    this.trashOpen = 0;
    this.trash = this.addInteract({
      kind: 'trash', pos: new THREE.Vector3(TX, 0, BACK_FRONT_Z), look: new THREE.Vector3(TX, 1.0, -3.0), range: 1.0,
      action: () => {
        const c = this.player.carry;
        if (!c) return null;
        return { label: 'Buang', icon: this.player.carryIcon, color: 'red', priority: -0.5, run: () => this.throwAway() };
      },
    });

    // ---------- tables ----------
    // tables sit a bit left of centre so the big action button (bottom-right) doesn't hide a seat
    const tx = up.meja4 ? [-5.0, -1.95, 1.1, 4.15] : [-3.9, -0.3, 3.3];
    const cloths = ['#ff8fa3', '#8ecae6', '#b8e0a0', '#ffd6a5'];
    const stools = ['#ef476f', '#2ec4b6', '#ffd23f', '#9b6dff'];
    tx.forEach((x, i) => {
      props.table(b, x, 0, TABLE_Z, { round: true, w: 1.1, d: 1.1, top: '#c68b59', cloth: cloths[i % 4] });
      this.addCircle(x, TABLE_Z, 0.56);
      for (const s of [-1, 1]) {
        const sx = x + s * SEAT_OFF;
        props.stool(b, sx, 0, TABLE_Z, stools[i % 4]);
        this.addCircle(sx, TABLE_Z, 0.2);
        const seat = {
          x: sx, z: TABLE_Z, face: s < 0 ? Math.PI / 2 : -Math.PI / 2, tableX: x,
          dish: new THREE.Vector3(x + s * 0.28, 0.75, TABLE_Z),
          cust: null, dirty: false, dirtyModels: [],
        };
        seat.it = this.addInteract({
          kind: 'seat', seat, pos: new THREE.Vector3(sx, 0, TABLE_Z), look: new THREE.Vector3(sx, 1.9, TABLE_Z), range: 1.45,
          action: () => this.seatAction(seat),
        });
        this.seats.push(seat);
      }
      b.box(x + 0.05, 0.75, TABLE_Z - 0.25, 0.14, 0.18, 0.08, '#ffffff');
      b.box(x - 0.08, 0.75, TABLE_Z - 0.28, 0.07, 0.2, 0.07, '#e63946');
      b.box(x - 0.18, 0.75, TABLE_Z - 0.28, 0.07, 0.2, 0.07, '#5a3d2b');
    });

    // ---------- upgrades that are decoration ----------
    props.plant(b, -6.7, 0, 2.8, 1.0);
    if (up.tanaman) {
      props.plant(b, 6.75, 0, 1.8, 0.9, '#2ec4b6');
      props.flowerPot(b, -6.4, 0.92, -2.1, '#ff6fa7');
      props.flowerPot(b, 6.4, 0.92, -2.1, '#ffd23f');
      props.flowerPot(b, 0.9, 0.92, -3.2, '#9b6dff');
    }
    if (up.radio) {
      b.at(-3.6, 2.26, -3.3, 0, () => {
        b.box(0, 0, 0, 0.6, 0.36, 0.26, '#e63946');
        b.box(-0.12, 0.06, 0.135, 0.24, 0.24, 0.01, '#343a40');
        b.box(0.18, 0.2, 0.135, 0.14, 0.06, 0.01, '#ffd23f');
        b.box(0.18, 0.1, 0.135, 0.06, 0.06, 0.01, '#ffffff');
        b.box(0.22, 0.36, 0, 0.02, 0.3, 0.02, '#adb5bd');
      });
      this.radioPos = new THREE.Vector3(-3.6, 2.8, -3.2);
    }
    if (up.kipas) {
      b.at(-6.7, 0, 1.75, 0, () => {
        b.box(0, 0, 0, 0.5, 0.06, 0.5, '#3d8bfd');
        b.box(0, 0.06, 0, 0.08, 1.2, 0.08, '#adb5bd');
        b.box(0, 1.15, -0.05, 0.26, 0.26, 0.2, '#3d8bfd');
      });
      this.addCircle(-6.7, 1.75, 0.3);
      const fan = new Blocks();
      fan.box(0, -0.06, 0, 0.12, 0.12, 0.06, '#ffffff');
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2;
        fan.box(Math.cos(a) * 0.24, Math.sin(a) * 0.24 - 0.05, 0, 0.36, 0.14, 0.02, '#caf0f8', { rz: a });
      }
      this.fanBlades = fan.build();
      const fg = new THREE.Group();
      fg.position.set(-6.62, 1.3, 1.9);
      fg.rotation.y = 0.9;
      fg.add(this.fanBlades);
      this.scene.add(fg);
    }
    if (up.lampu) {
      const cols = ['#ff6b6b', '#ffd23f', '#2ec4b6', '#9b6dff', '#ff8c42'];
      const L = new Blocks();
      for (let i = 0; i < 26; i++) {
        const x = -7 + i * 0.56;
        const y = 3.15 - Math.sin((i % 6) / 5 * Math.PI) * 0.25;
        L.box(x, y, -3.4, 0.12, 0.16, 0.12, cols[i % cols.length], { mat: 'glow' });
      }
      for (let i = 0; i < 13; i++) {
        const z = -3.4 + i * 0.56;
        const y = 3.15 - Math.sin((i % 6) / 5 * Math.PI) * 0.25;
        L.box(-7.15, y, z, 0.12, 0.16, 0.12, cols[i % cols.length], { mat: 'glow' });
        L.box(7.15, y, z, 0.12, 0.16, 0.12, cols[(i + 2) % cols.length], { mat: 'glow' });
      }
      this.scene.add(L.build());
    }

    const stat = b.build({ cast: true });
    stat.traverse(o => { o.updateMatrix(); if (o.isMesh) o.matrixAutoUpdate = false; });
    this.scene.add(stat);

    const P = this.player = new Player(S.char);
    this.scene.add(P.root);
    P.place(0, -0.8, 0, 0);
    P.speedMul = (up.sepatu ? 1.2 : 1) * (S.breakfast ? 1.1 : 1);

    this.resize();
  }

  wallSign(iconId, pos, ry) {
    this.signTex = this.signTex || {};
    let tex = this.signTex[iconId];
    if (!tex) {
      tex = canvasTex(128, 128, (g, w, h) => {
        g.fillStyle = '#ffffff'; rr(g, 4, 4, w - 8, h - 8, 26); g.fill();
        g.lineWidth = 6; g.strokeStyle = '#ffb37a'; g.stroke();
        const ic = ICON_CANVAS[iconId];
        if (ic) g.drawImage(ic, 10, 10, w - 20, h - 20);
      });
      this.signTex[iconId] = tex;
      (this.texToDispose = this.texToDispose || []).push(tex);
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.66), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.position.copy(pos);
    m.position.y += 0.05;
    m.rotation.order = 'YXZ';
    m.rotation.set(-0.55, ry, 0);
    this.scene.add(m);
  }

  decorEmpty(b, top, i, ry = 0) {
    // an unused counter slot gets a little decoration
    const k = i % 4;
    if (k === 0) props.flowerPot(b, top.x, top.y, top.z, '#ff8fa3');
    else if (k === 1) b.at(top.x, top.y, top.z, ry, () => { b.box(-0.15, 0, 0, 0.2, 0.3, 0.2, '#90e0ef'); b.box(0.15, 0, 0.05, 0.22, 0.22, 0.22, '#ffd6a5'); });
    else if (k === 2) b.at(top.x, top.y, top.z, ry, () => { b.box(0, 0, 0, 0.5, 0.06, 0.36, '#d4a373'); b.box(0, 0.06, 0, 0.4, 0.04, 0.26, '#f1faee'); });
    else b.at(top.x, top.y, top.z, ry, () => { b.box(0, 0, 0, 0.3, 0.35, 0.3, '#e9f5f9', { mat: 'glass' }); b.box(0, 0, 0, 0.24, 0.2, 0.24, '#ffb703'); });
  }

  addSignAndMenu() {
    const sign = canvasTex(1024, 220, (g, w, h) => {
      g.fillStyle = '#ff8c42';
      rr(g, 8, 8, w - 16, h - 16, 60); g.fill();
      g.lineWidth = 12; g.strokeStyle = '#ffffff'; g.stroke();
      g.fillStyle = '#ffffff';
      g.font = '700 124px Fredoka, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('WARUNG MEONG', w / 2, h / 2 + 8);
      paw(g, 70, h / 2, 34, '#ffd23f');
      paw(g, w - 70, h / 2, 34, '#ffd23f');
    });
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 0.8), new THREE.MeshBasicMaterial({ map: sign, transparent: true }));
    sm.position.set(0, 2.98, -3.42);
    this.scene.add(sm);

    const items = this.menu;
    const board = canvasTex(640, 360, (g, w, h) => {
      g.fillStyle = '#8d5a36'; rr(g, 0, 0, w, h, 26); g.fill();
      g.fillStyle = '#2f3e46'; rr(g, 16, 16, w - 32, h - 32, 18); g.fill();
      g.fillStyle = '#ffd23f'; g.font = '700 44px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('MENU', w / 2, 52);
      const cols = items.length > 4 ? 2 : 1;
      const rows = Math.ceil(items.length / cols);
      const rowH = Math.min(62, (h - 110) / rows);
      items.forEach((id, i) => {
        const cx = cols === 1 ? 150 : (i < rows ? 40 : 330);
        const y = 100 + (i % rows) * rowH + rowH / 2;
        const ic = ICON_CANVAS[id];
        if (ic) g.drawImage(ic, cx, y - rowH / 2, rowH, rowH);
        g.fillStyle = '#ffffff'; g.font = `600 ${cols === 1 ? 32 : 26}px Fredoka, sans-serif`; g.textAlign = 'left';
        g.fillText(RECIPES[id].name, cx + rowH + 8, y);
        g.fillStyle = '#ffd23f'; g.textAlign = 'right';
        g.fillText(String(RECIPES[id].price), cx + (cols === 1 ? 330 : 270), y);
      });
    });
    const bm = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.35), new THREE.MeshLambertMaterial({ map: board }));
    bm.position.set(0, 1.85, -3.42);
    this.scene.add(bm);
    this.texToDispose = (this.texToDispose || []).concat([sign, board]);
  }

  addCrate(b, g, top, front, ry) {
    const x = top.x, z = top.z, y = top.y;
    const place = (id, dx, dy, dz, s = 1, r = 0) => {
      const m = buildItem(id);
      m.scale.setScalar(s);
      // local offsets are relative to the counter's facing
      const c = Math.cos(ry), sn = Math.sin(ry);
      m.position.set(x + dx * c + dz * sn, y + dy, z - dx * sn + dz * c);
      m.rotation.y = ry + r;
      m.traverse(o => { if (o.isMesh) o.castShadow = true; });
      this.scene.add(m);
    };
    switch (g) {
      case 'nasi':
        props.riceCooker(b, x, 0, z, ry);
        place('nasi', 0, 0.62, 0, 0.9);
        break;
      case 'telur':
        props.crateBox(b, x, -0.15, z, ry, '#c9a26b');
        place('telur', -0.15, 0.2, 0, 1.1);
        place('telur', 0.15, 0.2, 0.05, 1.1, 0.8);
        break;
      case 'mie':
        props.crateBox(b, x, -0.12, z, ry, '#ffd166');
        place('mie', 0, 0.2, 0, 1.2);
        place('mie', 0.05, 0.32, 0, 1.1, 0.3);
        break;
      case 'jeruk':
        props.crateBox(b, x, -0.12, z, ry, '#d4a373');
        place('jeruk', -0.12, 0.2, -0.08, 1.2);
        place('jeruk', 0.14, 0.2, 0.08, 1.2, 1);
        place('jeruk', 0, 0.36, 0, 1.1, 2);
        break;
      case 'ayam':
        props.crateBox(b, x, -0.1, z, ry, '#90e0ef');
        place('ayam', 0, 0.22, 0, 1.2);
        break;
      case 'bakso':
        props.crateBox(b, x, -0.1, z, ry, '#bde0fe');
        place('bakso_raw', 0, 0.22, 0, 1.2);
        break;
      case 'pisang':
        b.at(x, y, z, ry, () => {
          b.box(0, 0, 0, 0.6, 0.06, 0.4, '#8d5a36');
          b.box(0, 0.06, -0.1, 0.06, 0.9, 0.06, '#8d5a36');
          b.box(0, 0.92, -0.02, 0.06, 0.06, 0.24, '#8d5a36');
        });
        place('pisang', 0, 0.55, 0.08, 1.3, 0.2);
        place('pisang', 0, 0.06, 0, 1.2, -0.3);
        break;
    }
    const it = this.addInteract({
      kind: 'crate', ing: g, pos: front, look: new THREE.Vector3(x, 1.5, z),
      action: () => {
        const c = this.player.carry;
        if (!c) return { label: 'Ambil ' + ingName(g), icon: ingItem(g), color: '', run: () => { this.player.setCarry({ kind: 'ing', id: g }); sound.pickup(); this.player.playPose('stir', 0.12); } };
        if (c.kind === 'ing' && c.id === g) return { label: 'Kembalikan', icon: ingItem(g), color: 'gray', priority: -0.2, run: () => { this.player.setCarry(null); sound.place(); } };
        return null;
      },
    });
    this.crates = this.crates || {};
    this.crates[g] = it;
  }

  addCookStation(b, st, top, front, ry, dyn, o) {
    const x = top.x, z = top.z;
    const s = {
      kind: 'cook', st, top, contents: [], phase: 'idle', t: 0, dur: 1, recipe: null, over: 0, boostCd: 0, beepT: 0,
      burnTime: o.anti ? 18 : 9, turbo: o.turbo,
    };
    s.group = dyn(x, top.y, z, ry);
    s.content = new THREE.Group();
    s.group.add(s.content);
    const g = new Blocks();
    if (st === 'wajan' || st === 'panci') props.stoveBody(b, x, 0, z, ry);
    if (st === 'wajan') {
      const col = o.anti ? '#2a9d8f' : '#3d405b';
      g.box(0, 0.08, 0, 0.3, 0.05, 0.3, '#2b2d42');
      g.box(0, 0.13, 0, 0.5, 0.06, 0.5, col);
      g.box(0, 0.19, 0, 0.64, 0.06, 0.64, col);
      g.box(0, 0.25, 0, 0.66, 0.02, 0.66, '#22223b', { skip: ['ny'] });
      g.box(0.45, 0.18, 0.12, 0.34, 0.05, 0.07, '#8d5a36', { ry: -0.3 });
      s.wok = g.build({ cast: true });
      s.group.add(s.wok);
      s.contentY = 0.27;
      s.flames = this.makeFlames(o.turbo);
      s.flames.position.y = 0.06;
      s.group.add(s.flames);
    } else if (st === 'panci') {
      g.box(0, 0.08, 0, 0.6, 0.5, 0.6, '#ced4da');
      g.box(0, 0.55, 0, 0.64, 0.05, 0.64, '#adb5bd');
      g.box(-0.36, 0.42, 0, 0.1, 0.06, 0.2, '#495057');
      g.box(0.36, 0.42, 0, 0.1, 0.06, 0.2, '#495057');
      g.box(0, 0.6, 0, 0.56, 0.006, 0.56, '#d9a45f', { skip: ['ny'] });
      s.pot = g.build({ cast: true });
      s.group.add(s.pot);
      const l = new Blocks();
      l.box(0, 0, 0, 0.62, 0.05, 0.62, '#dee2e6');
      l.box(0, 0.05, 0, 0.14, 0.08, 0.14, '#343a40');
      s.lid = l.build({ cast: true });
      s.lid.position.set(0.5, 0.0, 0.2);
      s.lid.rotation.z = -1.2;
      s.group.add(s.lid);
      s.contentY = 0.62;
      s.flames = this.makeFlames(o.turbo);
      s.flames.position.y = 0.06;
      s.group.add(s.flames);
    } else if (st === 'bakar') {
      props.grillBody(b, x, 0, z, ry);
      s.contentY = 0.2;
    } else if (st === 'teh') {
      b.at(x, 0.92, z, ry, () => {
        b.box(0, 0, -0.1, 0.6, 0.32, 0.46, '#ff8c42');
        b.box(0, 0.32, -0.1, 0.52, 0.7, 0.44, '#e6f7ff', { mat: 'glass' });
        b.box(0, 0.33, -0.1, 0.46, 0.5, 0.38, '#b8631c');
        for (let i = 0; i < 4; i++) b.box(-0.12 + i * 0.08, 0.8, -0.1 + (i % 2) * 0.1, 0.07, 0.07, 0.07, '#eefcff');
        b.box(0, 1.02, -0.1, 0.56, 0.08, 0.48, '#e76f51');
        b.box(0, 1.1, -0.1, 0.2, 0.06, 0.2, '#e76f51');
        b.box(0, 0.22, 0.16, 0.1, 0.1, 0.12, '#adb5bd');
        b.box(0, 0.3, 0.2, 0.04, 0.08, 0.04, '#ef476f');
        b.box(0, 0.12, 0.22, 0.03, 0.03, 0.03, '#b8631c');
        b.box(0, 0, 0.3, 0.3, 0.03, 0.22, '#adb5bd');
      });
      s.contentY = 0.03;
      s.contentZ = 0.3;
    } else if (st === 'jus') {
      b.at(x, 0.92, z, ry, () => {
        b.box(0, 0, 0, 0.36, 0.22, 0.36, '#ef476f');
        b.box(0.1, 0.06, 0.185, 0.06, 0.06, 0.02, '#ffffff');
        b.box(-0.08, 0.06, 0.185, 0.06, 0.06, 0.02, '#ffd23f');
        b.box(0, 0.22, 0, 0.24, 0.05, 0.24, '#adb5bd');
      });
      const j = new Blocks();
      j.box(0, 0, 0, 0.3, 0.46, 0.3, '#e6f7ff', { mat: 'glass' });
      j.box(0, 0.46, 0, 0.32, 0.06, 0.32, '#343a40');
      j.box(0.18, 0.2, 0, 0.06, 0.2, 0.06, '#e6f7ff', { mat: 'glass' });
      s.jar = j.build();
      s.jar.position.y = 0.27;
      s.group.add(s.jar);
      const liq = new Blocks();
      liq.box(0, 0, 0, 0.26, 1, 0.26, '#ffa31a');
      s.liquid = liq.build();
      s.liquid.position.y = 0.28;
      s.liquid.scale.y = 0.001;
      s.group.add(s.liquid);
      s.contentY = 0.3;
    }
    s.it = this.addInteract({
      kind: 'cook', st: s, pos: new THREE.Vector3(front.x, 0, front.z),
      look: new THREE.Vector3(x, 1.6, z), range: 1.25,
      action: () => this.cookAction(s),
    });
    // DOM ring
    const ring = el('div', 'ring hidden', '<div><img alt=""></div><i class="check"></i>');
    s.ringEl = ring;
    s.ringImg = ring.querySelector('img');
    s.ui = this.app.wui.add(ring, new THREE.Vector3(x + Math.sin(ry) * 0.5, top.y + 1.05, z + Math.cos(ry) * 0.5), 'center');
    s.uiState = '';
    this.stations.push(s);
  }

  makeFlames(turbo) {
    const f = new Blocks();
    const cols = turbo ? ['#4cc9f0', '#90e0ef', '#3a86ff'] : ['#ff7b00', '#ffd23f', '#ff4d00'];
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      f.box(Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14, 0.07, 0.12, 0.07, cols[i % 3], { mat: 'glow' });
    }
    const g = f.build();
    g.visible = false;
    return g;
  }

  // ======================= DAY FLOW =======================
  start(dayN) {
    this.dayN = dayN;
    this.cfg = dayConfig(dayN);
    this.build(dayN);
    this.timeLeft = this.cfg.dur;
    this.spawnT = 1.2;
    this.earned = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.served = 0;
    this.angry = 0;
    this.dishCount = {};
    this.finished = false;
    this.closedAnnounced = false;
    this.juriDone = false;
    this.lastKinds = [];
    this.idleT = 0;
    this.t = 0;
    this.help = null;
    this.maxCust = dayN === 1 ? 2 : dayN === 2 ? 3 : dayN === 3 ? 4 : 99;
    const S = this.app.save;
    const up = S.upgrades;
    this.patMul = 1 + (up.radio ? 0.15 : 0) + (up.kipas ? 0.15 : 0);
    this.tipMul = 1 + (up.tanaman ? 0.12 : 0) + (up.lampu ? 0.12 : 0);
    this.tutorial = dayN <= 2;
    this.showCoach = S.settings.helper && dayN <= 3;
    this.running = false;
  }
  begin() { this.running = true; }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const cam = this.camera;
    cam.aspect = w / h;
    const portrait = w / h < 1.05;
    cam.fov = portrait ? 52 : 40;
    cam.updateProjectionMatrix();
    // fit the room: search the camera distance along a fixed viewing direction,
    // keeping the top strip free for the HUD
    const pitch = THREE.MathUtils.degToRad(portrait ? 58 : 55);
    this.camDir = new THREE.Vector3(0, Math.sin(pitch), Math.cos(pitch));
    const pts = [];
    for (const x of [-7.1, 7.1]) { pts.push(new THREE.Vector3(x, 0, 3.2)); pts.push(new THREE.Vector3(x, 0.95, -3.4)); }
    for (const x of [-5.6, 5.6]) pts.push(new THREE.Vector3(x, 1.45, -3.0));
    const TOP = 1 - 2 * Math.min(0.2, 62 / h), BOT = -0.98;
    const center = new THREE.Vector3(0, 0, 0);
    const extent = (d) => {
      cam.position.copy(center).addScaledVector(this.camDir, d);
      cam.lookAt(center);
      cam.updateMatrixWorld();
      let top = -9, bot = 9, side = 0;
      for (const p of pts) {
        const v = p.clone().project(cam);
        top = Math.max(top, v.y); bot = Math.min(bot, v.y); side = Math.max(side, Math.abs(v.x));
      }
      return { top, bot, side };
    };
    let dist = 20;
    for (let iter = 0; iter < 5; iter++) {
      let lo = 4, hi = 60;
      for (let i = 0; i < 26; i++) {
        const m = (lo + hi) / 2;
        const e = extent(m);
        if (e.side <= 0.99 && (e.top - e.bot) <= (TOP - BOT)) hi = m; else lo = m;
      }
      dist = hi;
      const e = extent(dist);
      // shift the look-at point so the room sits inside [BOT, TOP]
      const mid = (e.top + e.bot) / 2, want = (TOP + BOT) / 2;
      center.z -= (mid - want) * 2.5;
    }
    // nudge the room left a little: the big action button sits bottom-right
    if (!portrait) center.x = 0.35;
    const maxD = portrait ? 15 : 30;
    this.follow = dist > maxD;
    this.camDist = Math.min(dist, maxD);
    this.camCenter = center.clone();
    this.updateCamera(1, true);
  }
  updateCamera(dt, snap) {
    const cam = this.camera;
    let tx = this.camCenter.x, tz = this.camCenter.z;
    if (this.follow && this.player) {
      tx = THREE.MathUtils.clamp(this.player.pos.x, -4.2, 4.2);
      tz = THREE.MathUtils.clamp(this.player.pos.z - 0.3, -1.2, 0.9);
    }
    if (!this.camTarget || snap) this.camTarget = new THREE.Vector3(tx, 0, tz);
    const k = snap ? 1 : 1 - Math.exp(-dt * 5);
    this.camTarget.x += (tx - this.camTarget.x) * k;
    this.camTarget.z += (tz - this.camTarget.z) * k;
    cam.position.copy(this.camTarget).addScaledVector(this.camDir, this.camDist);
    cam.lookAt(this.camTarget);
  }

  // ======================= CUSTOMERS =======================
  freeSeat() {
    const free = this.seats.filter(s => !s.cust && !s.dirty);
    if (!free.length) return null;
    return free[Math.floor(Math.random() * free.length)];
  }
  pickKind(vip, juri) {
    if (juri) return JURI;
    if (vip) return VIP;
    const pool = CUSTOMERS.filter(c => !this.lastKinds.includes(c.kind));
    const k = pool[Math.floor(Math.random() * pool.length)];
    this.lastKinds.push(k.kind);
    if (this.lastKinds.length > 4) this.lastKinds.shift();
    return k;
  }
  makeOrder(juri) {
    const menu = this.menu;
    const nr = newRecipeOnDay(this.dayN);
    const weighted = [];
    for (const id of menu) { weighted.push(id); if (id === nr) weighted.push(id, id); }
    const foods = menu.filter(id => !RECIPES[id].drink);
    const drinks = menu.filter(id => RECIPES[id].drink);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    if (juri) {
      const f1 = pick(foods);
      let f2 = pick(foods);
      if (foods.length > 1) while (f2 === f1) f2 = pick(foods);
      return [f1, f2, pick(drinks)];
    }
    const first = pick(weighted);
    const items = [first];
    if (menu.length > 1 && Math.random() < this.cfg.two) {
      if (RECIPES[first].drink && foods.length) items.push(pick(foods));
      else if (drinks.length) items.push(pick(drinks));
    }
    return items;
  }
  spawnCustomer(forceJuri) {
    const seat = this.freeSeat();
    if (!seat) return false;
    const juri = !!forceJuri;
    const vip = !juri && this.cfg.vip && Math.random() < this.cfg.vip;
    const info = this.pickKind(vip, juri);
    const order = this.makeOrder(juri);
    const ch = buildAnimal(info.kind);
    ch.root.position.copy(DOOR[0]);
    this.scene.add(ch.root);
    const pat = this.cfg.pat * this.patMul * (1 + 0.4 * (order.length - 1)) * (vip ? 0.85 : 1) * (juri ? 1.1 : 1);
    const c = {
      info, name: info.name, kind: info.kind, ch, seat, vip, juri,
      order: order.map(d => ({ dish: d, done: false })),
      maxPat: pat, pat, state: 'in', t: 0,
      path: [DOOR[1].clone(), DOOR[2].clone(), new THREE.Vector3(seat.x, 0, AISLE_Z), new THREE.Vector3(seat.x, 0, seat.z)],
      dishes: [], speed: juri ? 1.7 : 2.1, pose: 'stand',
    };
    seat.cust = c;
    this.customers.push(c);
    sound.bell();
    if (juri) this.app.ui.banner('Juri datang!', 'Layani Juri Pinguin dengan cepat!', 'teal');
    return true;
  }
  makeBubble(c) {
    const b = el('div', 'bubble' + (c.vip || c.juri ? ' vip' : ''));
    const items = el('div', 'items');
    c.itemEls = c.order.map(o => {
      const d = el('div', 'it', `<img src="${this.app.icons[o.dish]}" alt="">`);
      items.appendChild(d);
      return d;
    });
    b.appendChild(items);
    const pat = el('div', 'pat', '<i></i>');
    b.appendChild(pat);
    if (c.vip) b.appendChild(el('div', 'tag', 'VIP'));
    if (c.juri) b.appendChild(el('div', 'tag', 'JURI'));
    c.patEl = pat.querySelector('i');
    c.bubbleEl = b;
    if (c.bubble) c.bubble.remove();
    c.bubble = this.app.wui.add(b, new THREE.Vector3(c.seat.x, 2.05, c.seat.z), 'bottom');
  }
  thinkBubble(c) {
    const b = el('div', 'bubble thinking', '<div class="dots"><b></b><b></b><b></b></div>');
    c.bubble = this.app.wui.add(b, new THREE.Vector3(c.seat.x, 2.05, c.seat.z), 'bottom');
  }
  updateCustomers(dt) {
    for (const c of [...this.customers]) {
      c.t += dt;
      const root = c.ch.root;
      if (c.state === 'in' || c.state === 'out' || c.state === 'angry') {
        const tgt = c.path[0];
        if (tgt) {
          const dx = tgt.x - root.position.x, dz = tgt.z - root.position.z;
          const d = Math.hypot(dx, dz);
          const sp = c.speed * (c.state === 'angry' ? 1.35 : 1);
          if (d < 0.08) { c.path.shift(); }
          else {
            const step = Math.min(d, sp * dt);
            root.position.x += dx / d * step;
            root.position.z += dz / d * step;
            const target = Math.atan2(dx, dz);
            let a = target - root.rotation.y;
            while (a > Math.PI) a -= Math.PI * 2;
            while (a < -Math.PI) a += Math.PI * 2;
            root.rotation.y += a * Math.min(1, dt * 10);
          }
          root.position.y += (0 - root.position.y) * Math.min(1, dt * 10);
          animateChar(c.ch, dt, { speed: 1, pose: c.state === 'angry' ? 'angry' : 'stand' });
        } else if (c.state === 'in') {
          // sit down
          c.state = 'think'; c.t = 0;
          root.position.set(c.seat.x, 0.16, c.seat.z);
          root.rotation.y = c.seat.face;
          this.thinkBubble(c);
        } else {
          this.removeCustomer(c);
          continue;
        }
      } else if (c.state === 'think') {
        animateChar(c.ch, dt, { pose: 'sit' });
        if (c.t > 1.1) {
          c.state = 'wait'; c.t = 0;
          this.makeBubble(c);
          sound.voice(c.kind);
        }
      } else if (c.state === 'wait') {
        c.pat -= dt;
        const f = Math.max(0, c.pat / c.maxPat);
        c.patEl.style.transform = `scaleX(${f.toFixed(3)})`;
        const col = f > 0.5 ? '#2ec27e' : f > 0.25 ? '#ffb703' : '#ef476f';
        if (c.patCol !== col) { c.patCol = col; c.patEl.style.background = col; c.bubbleEl.classList.toggle('urgent', f <= 0.25); }
        const pose = c.happyT > 0 ? 'happy' : f < 0.25 ? 'angry' : 'sit';
        if (c.happyT > 0) c.happyT -= dt;
        animateChar(c.ch, dt, { pose, seated: true });
        if (c.pat <= 0) this.customerAngry(c);
      } else if (c.state === 'eat') {
        animateChar(c.ch, dt, { pose: c.t < 0.7 ? 'happy' : 'eat', seated: true });
        if (Math.random() < dt * 3) this.fx.crumbs(new THREE.Vector3(c.seat.x, 1.3, c.seat.z));
        if (c.t > 2.4) this.customerPay(c);
      }
    }
  }
  customerAngry(c) {
    c.state = 'angry';
    c.t = 0;
    if (c.bubble) { c.bubble.remove(); c.bubble = null; }
    this.clearTableDishes(c);
    this.angry++;
    this.combo = 0;
    sound.angry();
    sound.voice(c.kind, 'angry');
    this.app.wui.float('Hmph!', new THREE.Vector3(c.seat.x, 2.1, c.seat.z), 'bad');
    this.fx.puff(new THREE.Vector3(c.seat.x, 1.8, c.seat.z), '#ff8fa3', 8);
    c.path = [new THREE.Vector3(c.seat.x, 0, AISLE_Z), DOOR[2].clone(), DOOR[1].clone(), DOOR[0].clone()];
    c.seat.cust = null;
    c.ch.root.position.y = 0;
  }
  customerPay(c) {
    const base = c.order.reduce((s, o) => s + RECIPES[o.dish].price, 0);
    const mult = c.juri ? 2.5 : c.vip ? 2 : 1;
    const frac = Math.max(0, c.payFrac ?? 0.5);
    const tip = Math.round(base * (0.1 + 0.4 * frac) * this.tipMul);
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const bonus = Math.min(this.combo - 1, 10);
    const total = Math.round(base * mult) + tip + bonus;
    this.earned += total;
    this.served++;
    for (const o of c.order) this.dishCount[o.dish] = (this.dishCount[o.dish] || 0) + 1;
    const pos = new THREE.Vector3(c.seat.x, 2.0, c.seat.z);
    this.app.wui.float('+' + total, pos, 'coin');
    if (this.combo >= 2) setTimeout(() => this.app.wui.float('Combo x' + this.combo, new THREE.Vector3(c.seat.x, 2.6, c.seat.z), 'good'), 250);
    this.fx.sparkle(pos);
    sound.coin();
    this.app.ui.setCoins(this.earned, true);
    this.app.ui.setStarBar(this.earned, this.cfg.stars);
    // leave dishes: dirty or cleared
    this.clearTableDishes(c);
    if (this.cfg.dirty) {
      c.seat.dirty = true;
      const m = buildItem('kotor');
      m.position.copy(c.seat.dish);
      this.scene.add(m);
      c.seat.dirtyModels.push(m);
    }
    c.state = 'out';
    c.t = 0;
    c.path = [new THREE.Vector3(c.seat.x, 0, AISLE_Z), DOOR[2].clone(), DOOR[1].clone(), DOOR[0].clone()];
    c.seat.cust = null;
    c.ch.root.position.y = 0;
  }
  clearTableDishes(c) {
    for (const m of c.dishes) { this.scene.remove(m); m.traverse(o => o.geometry && o.geometry.dispose()); }
    c.dishes = [];
  }
  removeCustomer(c) {
    this.scene.remove(c.ch.root);
    disposeChar(c.ch);
    if (c.bubble) c.bubble.remove();
    this.customers.splice(this.customers.indexOf(c), 1);
  }
  deliver(c, dish) {
    const o = c.order.find(x => !x.done && x.dish === dish);
    if (!o) return;
    o.done = true;
    const idx = c.order.indexOf(o);
    c.itemEls[idx].classList.add('done');
    this.player.setCarry(null);
    sound.happy();
    sound.voice(c.kind);
    const m = buildItem(dish);
    const k = c.dishes.length;
    m.position.copy(c.seat.dish);
    m.position.z += (k - (c.order.length - 1) / 2) * 0.32;
    m.scale.setScalar(0.8);
    this.scene.add(m);
    c.dishes.push(m);
    this.fx.hearts(new THREE.Vector3(c.seat.x, 1.9, c.seat.z));
    c.happyT = 0.6;
    if (c.order.every(x => x.done)) {
      c.payFrac = c.pat / c.maxPat;
      c.state = 'eat';
      c.t = 0;
      if (c.bubble) { c.bubble.remove(); c.bubble = null; }
      sound.eat();
      this.app.wui.float('Nyam!', new THREE.Vector3(c.seat.x, 2.1, c.seat.z), 'good');
    } else {
      c.pat = Math.min(c.maxPat, c.pat + c.maxPat * 0.25);
    }
  }
  seatAction(seat) {
    const c = seat.cust;
    const carry = this.player.carry;
    if (c && c.state === 'wait' && carry) {
      if (carry.kind === 'dish' && c.order.some(o => !o.done && o.dish === carry.id)) {
        return { label: 'Antar', icon: carry.id, color: 'green', priority: 0.7, pulse: true, run: () => this.deliver(c, carry.id) };
      }
      return {
        label: 'Bukan pesanan', icon: this.player.carryIcon, color: 'gray', priority: -0.45, run: () => {
          sound.nope();
          this.app.wui.float(carry.kind === 'gosong' ? 'Iih, gosong!' : 'Bukan itu!', new THREE.Vector3(seat.x, 2.2, seat.z), 'bad');
        },
      };
    }
    if (!c && seat.dirty && !carry) {
      return { label: 'Bersihkan', icon: 'kotor', color: 'teal', run: () => this.cleanSeat(seat) };
    }
    return null;
  }
  cleanSeat(seat) {
    for (const m of seat.dirtyModels) { this.scene.remove(m); m.traverse(o => o.geometry && o.geometry.dispose()); }
    seat.dirtyModels = [];
    seat.dirty = false;
    sound.sparkle();
    this.player.playPose('stir', 0.35);
    this.fx.sparkle(new THREE.Vector3(seat.x, 0.9, seat.z), ['#ffffff', '#90e0ef', '#caf0f8']);
  }

  // ======================= STATIONS =======================
  matchRecipe(st, contents) {
    for (const id of this.menu) {
      const r = RECIPES[id];
      if (r.station === st && r.ing.length > 0 && sameSet(r.ing, contents)) return id;
    }
    return null;
  }
  canAccept(s, ing) {
    const next = [...s.contents, ing];
    return this.menu.some(id => RECIPES[id].station === s.st && isSubset(next, RECIPES[id].ing));
  }
  noIngRecipe(st) {
    return this.menu.find(id => RECIPES[id].station === st && RECIPES[id].ing.length === 0) || null;
  }
  cookAction(s) {
    const P = this.player, c = P.carry;
    const stName = STATIONS[s.st].name;
    if (s.phase === 'idle') {
      if (c && c.kind === 'ing') {
        if (this.canAccept(s, c.id)) return { label: 'Masukkan', icon: ingItem(c.id), color: 'teal', priority: 0.2, run: () => this.putIn(s) };
        return {
          label: 'Tidak cocok', icon: ingItem(c.id), color: 'gray', priority: -0.6, run: () => {
            sound.nope();
            this.app.wui.float('Bukan di sini!', new THREE.Vector3(s.top.x, 2.0, s.top.z), 'bad');
          },
        };
      }
      if (!c) {
        const r = this.noIngRecipe(s.st);
        if (r && s.contents.length === 0) return { label: 'Buat ' + RECIPES[r].name, icon: r, color: 'teal', run: () => this.startCook(s, r) };
        if (s.contents.length) {
          const last = s.contents[s.contents.length - 1];
          return { label: 'Keluarkan', icon: ingItem(last), color: 'gray', priority: -0.3, run: () => { s.contents.pop(); P.setCarry({ kind: 'ing', id: last }); sound.pickup(); this.refreshStation(s); } };
        }
      }
      return null;
    }
    if (s.phase === 'cook') {
      if (!c) return { label: STATIONS[s.st].verb + '!', icon: s.recipe, color: 'purple', priority: 0.1, run: () => this.boost(s) };
      return null;
    }
    if (s.phase === 'done') {
      if (!c) return { label: 'Ambil', icon: s.recipe, color: 'green', pulse: true, priority: 0.4, run: () => this.takeFrom(s) };
      return null;
    }
    if (s.phase === 'burnt') {
      if (!c) return { label: 'Ambil', icon: 'gosong', color: 'gray', priority: 0.2, run: () => this.takeFrom(s) };
      return null;
    }
    void stName;
    return null;
  }
  putIn(s) {
    const P = this.player;
    s.contents.push(P.carry.id);
    P.setCarry(null);
    sound.plop();
    P.playPose('stir', 0.2);
    const r = this.matchRecipe(s.st, s.contents);
    if (r) this.startCook(s, r);
    else this.refreshStation(s);
  }
  startCook(s, r) {
    s.phase = 'cook';
    s.recipe = r;
    s.t = 0;
    s.dur = RECIPES[r].time * (s.turbo ? 0.72 : 1);
    s.over = 0;
    if (s.st === 'teh') sound.pour();
    else if (s.st === 'jus') sound.blend();
    else sound.whoosh();
    this.player.playPose('stir', 0.25);
    this.refreshStation(s);
  }
  boost(s) {
    if (s.boostCd > 0) return;
    s.boostCd = 0.14;
    s.t += s.turbo ? 0.55 : 0.45;
    sound.stir();
    this.player.playPose('stir', 0.3);
    s.toss = 0.25;
    if (s.st === 'bakar') this.fx.puff(new THREE.Vector3(s.top.x, s.top.y + 0.4, s.top.z), '#dddddd', 3);
    else this.fx.emit(new THREE.Vector3(s.top.x, s.top.y + 0.4, s.top.z), { count: 3, color: ['#ffd23f', '#ff8c42'], speed: 1, up: 2, life: 0.4, size: 0.06 });
  }
  takeFrom(s) {
    const P = this.player;
    if (s.phase === 'burnt') P.setCarry({ kind: 'gosong', id: 'gosong' });
    else P.setCarry({ kind: 'dish', id: s.recipe });
    s.phase = 'idle'; s.contents = []; s.recipe = null; s.t = 0; s.over = 0;
    sound.pickup();
    this.refreshStation(s);
  }
  throwAway() {
    const P = this.player;
    const id = P.carryIcon;
    P.setCarry(null);
    sound.trash();
    this.trashOpen = 0.6;
    this.fx.puff(this.trashPos, '#c8c8c8', 6);
    void id;
  }
  refreshStation(s) {
    // rebuild the contents models
    const C = s.content;
    for (const ch of [...C.children]) { C.remove(ch); ch.traverse(o => o.geometry && o.geometry.dispose()); }
    const y = s.contentY || 0.2;
    const zOff = s.contentZ || 0;
    const add = (id, sc, x = 0, z = 0, r = 0) => {
      const m = buildItem(id);
      m.scale.setScalar(sc);
      m.position.set(x, y, z + zOff);
      m.rotation.y = r;
      C.add(m);
      return m;
    };
    if (s.flames) s.flames.visible = s.phase === 'cook' || s.phase === 'done';
    if (s.st === 'panci' && s.lid) {
      if (s.phase === 'cook') { s.lid.position.set(0, 0.6, 0); s.lid.rotation.z = 0; }
      else { s.lid.position.set(0.5, 0.0, 0.2); s.lid.rotation.z = -1.2; }
    }
    if (s.st === 'jus') {
      s.liquid.scale.y = s.phase === 'done' ? 0.36 : 0.001;
      if (s.phase === 'idle' && s.contents.length) add('jeruk', 0.8, 0, 0);
      if (s.phase === 'done') add('esjeruk', 0.8, 0, 0.42);
      return;
    }
    if (s.st === 'teh') {
      if (s.phase === 'cook') { s.fill = add('esteh', 0.8); s.fill.scale.y = 0.2; }
      if (s.phase === 'done') add('esteh', 0.8);
      return;
    }
    if (s.phase === 'idle' || s.phase === 'cook') {
      s.contents.forEach((g, i) => {
        const n = s.contents.length;
        add(ingItem(g), s.st === 'bakar' ? 0.95 : 0.6, (i - (n - 1) / 2) * 0.22, 0, i * 0.7);
      });
    } else if (s.phase === 'done') {
      add(s.recipe, s.st === 'panci' ? 0.72 : s.st === 'bakar' ? 0.95 : 0.68);
    } else if (s.phase === 'burnt') {
      add('gosong', 0.68);
    }
  }
  updateStations(dt) {
    let sizzle = 0, bubble = 0;
    for (const s of this.stations) {
      s.boostCd -= dt;
      if (s.phase === 'cook') {
        s.t += dt;
        if (s.st === 'wajan' || s.st === 'bakar') sizzle++;
        if (s.st === 'panci') bubble++;
        if (s.st === 'bakar' && Math.random() < dt * 5) this.fx.smoke(new THREE.Vector3(s.top.x, s.top.y + 0.3, s.top.z), ['#cfcfcf', '#e8e8e8', '#b5b5b5']);
        if (s.st === 'panci' && Math.random() < dt * 6) this.fx.steam(new THREE.Vector3(s.top.x, s.top.y + 0.75, s.top.z));
        if (s.st === 'wajan' && Math.random() < dt * 4) this.fx.steam(new THREE.Vector3(s.top.x, s.top.y + 0.45, s.top.z));
        if (s.fill) s.fill.scale.y = Math.min(0.8, 0.15 + (s.t / s.dur) * 0.65);
        if (s.st === 'jus') s.liquid.scale.y = Math.min(0.36, (s.t / s.dur) * 0.36) + 0.001;
        if (s.t >= s.dur) {
          s.phase = 'done'; s.over = 0; s.fill = null;
          sound.ding();
          this.fx.sparkle(new THREE.Vector3(s.top.x, s.top.y + 0.6, s.top.z));
          this.refreshStation(s);
        }
      } else if (s.phase === 'done') {
        if (s.st === 'wajan' || s.st === 'bakar') sizzle += 0.5;
        if (STATIONS[s.st].burns) {
          s.over += dt;
          const left = s.burnTime - s.over;
          if (left < 3.2) {
            s.beepT -= dt;
            if (s.beepT <= 0) { sound.beep(); s.beepT = 0.5; }
            if (Math.random() < dt * 6) this.fx.smoke(new THREE.Vector3(s.top.x, s.top.y + 0.4, s.top.z));
          }
          if (left <= 0) {
            s.phase = 'burnt';
            sound.burn();
            this.fx.puff(new THREE.Vector3(s.top.x, s.top.y + 0.5, s.top.z), ['#333', '#555', '#222'], 14);
            this.app.wui.float('Gosong!', new THREE.Vector3(s.top.x, s.top.y + 1.4, s.top.z), 'dark');
            this.refreshStation(s);
          }
        }
      } else if (s.phase === 'burnt') {
        if (Math.random() < dt * 4) this.fx.smoke(new THREE.Vector3(s.top.x, s.top.y + 0.4, s.top.z));
      }
      // animation
      const C = s.content;
      if (s.phase === 'cook' && (s.st === 'wajan' || s.st === 'bakar')) {
        const j = s.toss > 0 ? Math.sin((0.25 - s.toss) / 0.25 * Math.PI) * 0.18 : Math.abs(Math.sin(this.t * 9)) * 0.03;
        C.position.y = j;
        C.rotation.y = Math.sin(this.t * 3) * 0.2;
      } else { C.position.y = 0; C.rotation.y = 0; }
      if (s.toss > 0) s.toss -= dt;
      if (s.wok) s.wok.position.y = s.phase === 'cook' ? Math.abs(Math.sin(this.t * 9)) * 0.02 : 0;
      if (s.flames && s.flames.visible) {
        s.flames.children.forEach((m, i) => { m.scale.y = 0.7 + Math.random() * 0.8; void i; });
      }
      if (s.st === 'panci' && s.phase === 'cook' && s.lid) s.lid.position.y = 0.6 + Math.abs(Math.sin(this.t * 14)) * 0.04;
      if (s.st === 'jus' && s.jar) s.jar.position.x = s.phase === 'cook' ? Math.sin(this.t * 60) * 0.015 : 0;
      this.updateRing(s);
    }
    sound.setLoop('sizzle', Math.min(1.2, sizzle * 0.6));
    sound.setLoop('bubble', Math.min(1, bubble * 0.8));
  }
  updateRing(s) {
    let state = 'hidden', icon = null, p = 0;
    if (s.phase === 'cook') { state = 'cook'; icon = s.recipe; p = Math.min(1, s.t / s.dur); }
    else if (s.phase === 'done') {
      const left = s.burnTime - s.over;
      if (STATIONS[s.st].burns && left < 3.2) { state = 'warn'; p = Math.max(0, left / 3.2); }
      else { state = 'done'; p = 1; }
      icon = s.recipe;
    } else if (s.phase === 'burnt') { state = 'burnt'; icon = 'gosong'; p = 1; }
    else if (s.contents.length) {
      const cands = this.menu.filter(id => RECIPES[id].station === s.st && isSubset(s.contents, RECIPES[id].ing));
      state = 'need';
      if (cands.length === 1) icon = ingItem(diff(RECIPES[cands[0]].ing, s.contents)[0] || s.contents[0]);
      else icon = ingItem(s.contents[0]);
      p = 0;
    }
    const key = state + '|' + icon;
    if (key !== s.uiState) {
      s.uiState = key;
      s.ringEl.className = 'ring ' + (state === 'hidden' ? 'hidden' : state);
      if (icon) s.ringImg.src = this.app.icons[icon];
      s.ringImg.style.opacity = state === 'need' ? '0.55' : '1';
    }
    if (state !== 'hidden') s.ringEl.style.setProperty('--p', p.toFixed(3));
  }

  // ======================= HELPER / PLANNER =======================
  plan() {
    const P = this.player, carry = P.carry;
    const waiting = this.customers.filter(c => c.state === 'wait').sort((a, b) => a.pat - b.pat);
    const demand = [];
    for (const c of waiting) for (const o of c.order) if (!o.done) demand.push({ dish: o.dish, cust: c, ready: true });
    const jobs = [];
    const used = new Set();
    let carryUsed = false;
    for (const d of demand) {
      const r = RECIPES[d.dish];
      if (carry && carry.kind === 'dish' && carry.id === d.dish && !carryUsed) { carryUsed = true; jobs.push({ type: 'deliver', d }); continue; }
      let s = this.stations.find(x => !used.has(x) && x.phase === 'done' && x.recipe === d.dish);
      if (s) { used.add(s); jobs.push({ type: 'pick', s, d }); continue; }
      s = this.stations.find(x => !used.has(x) && x.phase === 'cook' && x.recipe === d.dish);
      if (s) { used.add(s); jobs.push({ type: 'wait', s, d }); continue; }
      s = this.stations.find(x => !used.has(x) && x.phase === 'idle' && x.st === r.station && x.contents.length > 0 && isSubset(x.contents, r.ing));
      if (!s) s = this.stations.find(x => !used.has(x) && x.phase === 'idle' && x.st === r.station && x.contents.length === 0);
      if (s) {
        used.add(s);
        const missing = diff(r.ing, s.contents);
        jobs.push({ type: missing.length ? 'bring' : 'start', s, missing, d });
        continue;
      }
      jobs.push({ type: 'blocked', d });
    }
    return jobs;
  }
  computeHelp() {
    const P = this.player, carry = P.carry;
    const jobs = this.plan();
    const dn = (id) => RECIPES[id].name;
    if (carry) {
      if (carry.kind === 'gosong') return { it: this.trash, text: 'Yah gosong! Buang ke tempat sampah.' };
      if (carry.kind === 'dish') {
        const j = jobs.find(x => x.type === 'deliver');
        if (j) return { it: j.d.cust.seat.it, text: `Antar ${dn(carry.id)} ke ${j.d.cust.name}!` };
        return { it: this.trash, text: 'Tidak ada yang pesan ini. Buang saja.' };
      }
      // ingredient
      const j = jobs.find(x => x.type === 'bring' && x.missing.includes(carry.id));
      if (j) return { it: j.s.it, text: `Masukkan ${ingName(carry.id)} ke ${STATIONS[j.s.st].name}.` };
      // any station that can take it for something a customer wants
      const wanted = this.customers.filter(c => c.state === 'wait').flatMap(c => c.order.filter(o => !o.done).map(o => o.dish));
      for (const d of wanted) {
        const r = RECIPES[d];
        if (!r.ing.includes(carry.id)) continue;
        const st = this.stations.find(x => x.phase === 'idle' && x.st === r.station && isSubset([...x.contents, carry.id], r.ing));
        if (st) return { it: st.it, text: `Masukkan ${ingName(carry.id)} ke ${STATIONS[st.st].name}.` };
      }
      return { it: this.crates[carry.id], text: `${ingName(carry.id)} belum perlu. Kembalikan dulu.` };
    }
    // hands empty
    const pick = jobs.find(x => x.type === 'pick');
    if (pick) return { it: pick.s.it, text: `${dn(pick.s.recipe)} sudah matang! Ambil sekarang.` };
    // rescue food about to burn even if nobody wants it
    const burning = this.stations.find(s => s.phase === 'done' && STATIONS[s.st].burns && s.burnTime - s.over < 4);
    if (burning) return { it: burning.s ? burning.s.it : burning.it, text: 'Cepat angkat sebelum gosong!' };
    const burnt = this.stations.find(s => s.phase === 'burnt');
    if (burnt) return { it: burnt.it, text: 'Ambil yang gosong, lalu buang.' };
    for (const j of jobs) {
      if (!j.d.ready && j.type !== 'bring' && j.type !== 'start') continue;
      if (j.type === 'bring') {
        const g = j.missing[0];
        return { it: this.crates[g], text: `Ambil ${ingName(g)} untuk ${dn(j.d.dish)}.` };
      }
      if (j.type === 'start') return { it: j.s.it, text: `Buat ${dn(j.d.dish)} di ${STATIONS[j.s.st].name}.` };
    }
    const w = jobs.find(x => x.type === 'wait');
    if (w) return { it: w.s.it, text: `Tunggu ${dn(w.s.recipe)} matang... tekan ${STATIONS[w.s.st].verb}! biar cepat.`, wait: true };
    const dirty = this.seats.find(s => s.dirty && !s.cust);
    if (dirty) return { it: dirty.it, text: 'Meja kotor! Bersihkan supaya pelanggan bisa duduk.' };
    const done = this.stations.find(s => s.phase === 'done');
    if (done) return { it: done.it, text: `Ambil ${dn(done.recipe)} dari ${STATIONS[done.st].name}.` };
    if (this.timeLeft > 0) return { it: null, text: 'Tunggu pelanggan datang...' };
    return { it: null, text: 'Warung sudah tutup. Layani pelanggan terakhir!' };
  }

  // ======================= UPDATE =======================
  update(dt) {
    this.t += dt;
    const app = this.app;
    const P = this.player;
    if (this.running && !this.finished) {
      // clock & spawning
      if (this.timeLeft > 0) {
        this.timeLeft -= dt;
        this.spawnT -= dt;
        const active = this.customers.filter(c => c.state !== 'out' && c.state !== 'angry').length;
        if (this.spawnT <= 0) {
          if (active < this.maxCust && this.spawnCustomer(false)) this.spawnT = rand(this.cfg.gap[0], this.cfg.gap[1]);
          else this.spawnT = 1.2;
        }
        if (this.cfg.juri && !this.juriDone && this.timeLeft < this.cfg.dur * 0.55) {
          if (this.spawnCustomer(true)) this.juriDone = true;
        }
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          if (!this.closedAnnounced) {
            this.closedAnnounced = true;
            app.ui.banner('Warung Tutup!', this.customers.length ? 'Layani pelanggan terakhir' : '', 'red');
            sound.jingle();
          }
        }
      } else if (this.customers.length === 0) {
        this.finish();
      }
      app.ui.setClock(1 - this.timeLeft / this.cfg.dur, this.timeLeft);
    }
    this.updateCustomers(dt);
    this.updateStations(dt);

    // bot / player
    let move = app.input.vector();
    if (this.bot) move = this.botMove(dt);
    const frozen = !this.running || this.finished;
    P.update(dt, move, this, frozen);
    if (!frozen) {
      this.updateTarget(dt);
      if (app.input.consumeAction() || this.botPress) { this.botPress = false; this.doAction(); }
    } else {
      app.input.consumeAction();
      this.ring.visible = false;
    }
    // helper arrow & coach
    this.helpT = (this.helpT || 0) - dt;
    if (this.helpT <= 0 || this.bot) { this.help = this.computeHelp(); this.helpT = 0.15; }
    const H = this.help;
    const helper = app.save.settings.helper && this.running && !this.finished;
    if (helper && H && H.it) {
      const lp = H.it.look || H.it.pos;
      this.showArrow(new THREE.Vector3(lp.x, lp.y + 0.35, lp.z), dt);
    } else this.showArrow(null, dt);
    // show coach during early days, or when idle a while
    const moving = Math.hypot(move.x, move.y) > 0.1;
    this.idleT = moving ? 0 : this.idleT + dt;
    if (this.running && !this.finished && H && (this.showCoach || (app.save.settings.helper && this.idleT > 5))) app.ui.coach(H.text);
    else app.ui.coach(null);

    // decorations
    if (this.fanBlades) this.fanBlades.rotateZ(dt * 14);
    if (this.trashOpen > 0) { this.trashOpen -= dt; this.trashLid.rotation.x = -Math.min(1, this.trashOpen * 4) * 1.1; }
    else this.trashLid.rotation.x = 0;
    if (this.radioPos && Math.random() < dt * 1.2) this.fx.emit(this.radioPos, { count: 1, color: ['#9b6dff', '#ff6fa7', '#2ec4b6'], speed: 0.3, up: 0.8, gravity: 0.2, drag: 1, life: 1.5, size: 0.1, spin: 2 });
    if (this.lights) this.lights.children.forEach(m => { m.visible = true; });
    this.fx.update(dt);
    this.updateCamera(dt);
  }

  // ---------- bot (for automated testing / demo) ----------
  botMove(dt) {
    const H = this.help;
    const P = this.player;
    const K = this.botSkill || { delay: 0, speed: 1, stir: true, wander: 0 };
    this.botCd = (this.botCd || 0) - dt;
    if (!H || !H.it) return { x: 0, y: 0 };
    // "kid mode": think a bit when the goal changes, sometimes wander around
    const key = H.text;
    if (key !== this.botKey) { this.botKey = key; this.botThink = K.delay * (0.5 + Math.random()); }
    if (this.botThink > 0) { this.botThink -= dt; return { x: 0, y: 0 }; }
    if (this.botWander > 0) { this.botWander -= dt; return this.botWDir; }
    if (Math.random() < K.wander * dt) { this.botWander = 0.8; const a = Math.random() * 6.28; this.botWDir = { x: Math.cos(a) * K.speed, y: Math.sin(a) * K.speed }; }
    if (H.wait && !K.stir) return { x: 0, y: 0 };
    const tgt = H.it.pos;
    const dx = tgt.x - P.pos.x, dz = tgt.z - P.pos.z;
    const d = Math.hypot(dx, dz);
    const inRange = d < H.it.range * 0.8;
    if (inRange) {
      const t = this.findTarget();
      if (t && t.it === H.it) {
        if (this.botCd <= 0) { this.botPress = true; this.botCd = H.wait ? 0.16 : 0.3; }
        return { x: 0, y: 0 };
      }
      // wrong thing targeted: keep walking toward it so the cat turns to face it
      const face = H.it.look || H.it.pos;
      const fx = face.x - P.pos.x, fz = face.z - P.pos.z, fd = Math.hypot(fx, fz) || 1;
      return { x: fx / fd * 0.6, y: fz / fd * 0.6 };
    }
    // stuck detection: nudge sideways
    this.botStuck = (P.realSpeed || 0) < 0.4 && d > 0.8 ? (this.botStuck || 0) + dt : 0;
    let mx = dx / d, mz = dz / d;
    if (this.botStuck > 0.35) { const s = Math.sin(this.t * 1.3) > 0 ? 1 : -1; const ox = -mz * s, oz = mx * s; mx = mx * 0.3 + ox; mz = mz * 0.3 + oz; }
    const m = Math.hypot(mx, mz);
    return { x: mx / m * K.speed, y: mz / m * K.speed };
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    sound.stopLoops();
    const th = this.cfg.stars;
    const stars = this.earned >= th[2] ? 3 : this.earned >= th[1] ? 2 : this.earned >= th[0] ? 1 : 0;
    this.player.playPose('cheer', 3);
    this.app.onDayFinished({
      day: this.dayN, earned: this.earned, stars, served: this.served, angry: this.angry,
      bestCombo: this.bestCombo, dishCount: this.dishCount,
    });
  }

  disposeScene() {
    if (!this.scene) return;
    for (const s of this.stations || []) if (s.ui) s.ui.remove();
    for (const c of this.customers || []) if (c.bubble) c.bubble.remove();
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && o.material.map && this.texToDispose && this.texToDispose.includes(o.material.map)) o.material.dispose();
    });
    for (const t of this.texToDispose || []) t.dispose();
    this.texToDispose = [];
    sound.stopLoops();
  }
  exit() {
    this.disposeScene();
    this.app.wui.clear();
    this.scene = new THREE.Scene();
  }
}

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function paw(g, x, y, s, col) {
  g.fillStyle = col;
  g.beginPath(); g.ellipse(x, y + s * 0.25, s * 0.5, s * 0.42, 0, 0, Math.PI * 2); g.fill();
  for (const [dx, dy] of [[-0.55, -0.25], [0.55, -0.25], [-0.22, -0.62], [0.22, -0.62]]) {
    g.beginPath(); g.arc(x + dx * s, y + dy * s, s * 0.2, 0, Math.PI * 2); g.fill();
  }
}
export { rr, paw };
