import * as THREE from 'three';
import { PlayScene } from './playscene.js';
import { Blocks } from '../engine/blocks.js';
import * as props from './props.js';
import { Player } from './player.js';
import { buildItem } from './items.js';
import { TROPHIES } from './data.js';
import { sound } from '../engine/audio.js';
import { SVG } from '../ui/ui.js';

const F2 = 3.0;          // upper floor height
const STAIR = { x0: -6.0, x1: -4.4, zTop: -2.4, zBot: 1.6 };

const LIGHTS = {
  morning: { hemiSky: 0xfff8ee, hemiGround: 0x9c8a7a, hemi: 1.55, sun: 0xfff1d6, sunI: 1.5, sky: ['#8fd3ff', '#d6f1ff'], lamp: false, body: 'sky-morning' },
  evening: { hemiSky: 0xa594ff, hemiGround: 0x4a3a58, hemi: 0.78, sun: 0xff9a5c, sunI: 0.65, sky: ['#3d3478', '#ff9f7a'], lamp: true, body: 'sky-evening' },
};

export class House extends PlayScene {
  constructor(app) {
    super(app);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.mode = 'title';
    this.built = false;
    this.camPos = new THREE.Vector3(0, 6, 18);
    this.camLook = new THREE.Vector3(0, 2.5, 0);
    this.camAnim = null;
    this.upperShown = true;
    this.balls = [];
  }

  build() {
    if (this.built) return;
    this.built = true;
    this.initCommon();
    const sc = this.scene;
    this.hemi = new THREE.HemisphereLight(0xfff8ee, 0x9c8a7a, 1.5);
    sc.add(this.hemi);
    const sun = this.sun = new THREE.DirectionalLight(0xfff1d6, 1.5);
    sun.position.set(6, 14, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -9, near: 1, far: 50 });
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.02;
    sc.add(sun);
    sc.add(sun.target);
    this.lamp1 = new THREE.PointLight(0xffc27a, 0, 12, 1.4);
    this.lamp1.position.set(1.2, 2.2, -1.5);
    sc.add(this.lamp1);
    this.lamp2 = new THREE.PointLight(0xffc27a, 0, 12, 1.4);
    this.lamp2.position.set(2.2, F2 + 1.6, -1.8);
    sc.add(this.lamp2);

    this.g1 = new THREE.Group();
    this.g2 = new THREE.Group();
    this.g2inner = new THREE.Group();
    this.g2.add(this.g2inner);
    sc.add(this.g1, this.g2);

    this.buildOutside();
    this.buildFloor1();
    this.buildFloor2();
    this.buildFacadeAndRoof();

    this.player = new Player(this.app.save.char, { apron: false });
    this.player.root.visible = false;
    sc.add(this.player.root);
    this.player.place(-0.5, -2.2, F2, 0);
    this.refreshTrophies();
    this.setTime(this.app.save.time || 'morning');
    this.resize();
  }

  // ------------------------------------------------------------------
  buildOutside() {
    const b = new Blocks();
    b.box(0, -0.4, 0, 60, 0.33, 50, '#ffffff', { mat: 'grass', world: true, tile: 2 });
    // path from side door
    for (let i = 0; i < 7; i++) b.box(7.4 + i * 0.95, -0.02, 1.5 + Math.sin(i) * 0.3, 0.7, 0.05, 0.9, '#e9e3da', { mat: 'paving', world: true });
    for (let i = 0; i < 6; i++) b.box(12.8 + Math.sin(i) * 0.2, -0.02, 2.6 + i * 0.9, 0.9, 0.05, 0.7, '#e9e3da', { mat: 'paving', world: true });
    b.box(0, -0.02, 11, 60, 0.05, 3, '#e9e3da', { mat: 'paving', world: true, tile: 1 });
    props.fence(b, -14, 11.5, 0, 8.8);
    props.fence(b, 14.3, 20, 0, 8.8);
    props.tree(b, -10, 0, -2, 1.3);
    props.tree(b, -12, 0, 4, 1.0);
    props.tree(b, 11, 0, -4.5, 1.2);
    props.tree(b, 17, 0, 3, 1.1);
    props.bush(b, -8, 0, 5.8, 1.1, '#ff6fa7');
    props.bush(b, 8.5, 0, 6.3, 1, '#ffd23f');
    props.bush(b, 9.5, 0, -1.8, 1.2, '#ff6fa7');
    props.bush(b, -7.6, 0, -4.8, 1, null);
    for (let i = 0; i < 10; i++) {
      const x = -6 + i * 1.3;
      props.flowerPot(b, x, 0, 5.4 + (i % 2) * 0.3, ['#ff6fa7', '#ffd23f', '#9b6dff', '#ff8c42'][i % 4]);
    }
    // mailbox
    b.at(12.8, 0, 8.2, 0, () => {
      b.box(0, 0, 0, 0.12, 1.1, 0.12, '#8d5a36');
      b.box(0, 1.1, 0, 0.4, 0.34, 0.6, '#3d8bfd');
      b.box(0.22, 1.25, 0.1, 0.03, 0.3, 0.12, '#ef476f');
    });
    const g = b.build({ cast: true });
    this.outside = g;
    this.scene.add(g);
    // clouds
    const c = new Blocks();
    props.cloud(c, -9, 13, -12, 1.4);
    props.cloud(c, 6, 15, -16, 1.8);
    props.cloud(c, 16, 12, -8, 1.2);
    props.cloud(c, -18, 14, -6, 1.5);
    this.clouds = c.build();
    this.scene.add(this.clouds);
  }

  buildFloor1() {
    const b = new Blocks();
    const sky = new Blocks();
    // floor
    b.box(0, -0.25, 0, 12.8, 0.25, 8.8, '#ffffff', { mat: 'wood', world: true, tile: 2 });
    // walls
    const wc = '#ffe3b3';
    b.box(0, 0, -4.2, 12.8, 2.8, 0.4, wc, { mat: 'wall', world: true });
    b.box(-6.2, 0, 0, 0.4, 2.8, 8.8, wc, { mat: 'wall', world: true });
    b.box(6.2, 0, -1.6, 0.4, 2.8, 5.6, wc, { mat: 'wall', world: true });
    b.box(6.2, 0, 3.3, 0.4, 2.8, 2.2, wc, { mat: 'wall', world: true });
    b.box(6.2, 2.15, 1.5, 0.4, 0.65, 1.4, wc, { mat: 'wall', world: true });
    // exterior brick shell (seen from outside only)
    const ex = '#ffd6a5';
    b.box(0, 0, -4.45, 13.2, 3.0, 0.1, ex, { mat: 'brick', world: true });
    b.box(-6.45, 0, 0, 0.1, 3.0, 9.0, ex, { mat: 'brick', world: true });
    b.box(6.45, 0, -1.6, 0.1, 3.0, 5.6, ex, { mat: 'brick', world: true });
    b.box(6.45, 0, 3.3, 0.1, 3.0, 2.2, ex, { mat: 'brick', world: true });
    b.box(6.45, 2.15, 1.5, 0.1, 0.85, 1.4, ex, { mat: 'brick', world: true });
    b.box(6.62, 2.3, 1.5, 0.4, 0.1, 1.9, '#e76f51');
    b.box(6.5, 0, 2.6, 0.2, 0.9, 0.2, '#52b788');
    // wall trims + wainscot
    b.box(0, 0, -3.98, 12, 0.9, 0.05, '#e8b98a', { mat: 'wood', world: true });
    b.box(0, 0.9, -3.96, 12, 0.07, 0.08, '#c68b59');
    b.box(0, 2.8, -4.2, 12.9, 0.12, 0.5, '#e76f51');
    b.box(-6.2, 2.8, 0, 0.5, 0.12, 8.9, '#e76f51');
    b.box(6.2, 2.8, 0, 0.5, 0.12, 8.9, '#e76f51');
    // door (right wall)
    b.box(6.1, 0, 0.72, 0.5, 2.2, 0.12, '#ffffff');
    b.box(6.1, 0, 2.28, 0.5, 2.2, 0.12, '#ffffff');
    b.box(6.1, 2.1, 1.5, 0.5, 0.14, 1.7, '#ffffff');
    b.box(6.2, 0, 1.5, 0.14, 2.1, 1.4, '#e07a5f');
    b.box(6.1, 1.3, 1.5, 0.05, 0.5, 0.8, '#bde0fe', { mat: 'glow' });
    b.box(6.06, 0.9, 1.0, 0.1, 0.12, 0.12, '#ffd23f');
    b.box(6.34, 0.9, 1.0, 0.1, 0.12, 0.12, '#ffd23f');
    b.box(5.5, 0, 1.5, 1.2, 0.02, 1.4, '#2ec4b6', { mat: 'carpet', world: true });
    // window on back wall
    props.windowOn(b, 1.3, 1.0, -4.05, 2.0, 1.3, 0);
    props.curtains(b, 1.3, 1.0, -4.05, 2.0, 1.3, '#ff8fa3');
    sky.box(1.3, 1.0, -3.99, 2.0, 1.3, 0.02, '#ffffff', { mat: 'sky' });
    // kitchen
    props.kitchenSet(b, 4.55, 0, -3.65, 2.9);
    props.fridge(b, 5.5, 0, -3.62);
    // dining table + chairs
    props.table(b, 0.3, 0, 0.2, { w: 2.2, d: 1.3, top: '#c68b59', cloth: '#ffffff' });
    props.chair(b, -0.25, 0, -0.75, 0, '#e76f51');
    props.chair(b, 0.85, 0, -0.75, 0, '#e76f51');
    props.chair(b, -1.35, 0, 0.2, Math.PI / 2, '#e76f51');
    props.chair(b, 1.95, 0, 0.2, -Math.PI / 2, '#e76f51');
    b.box(0.85, 0.75, 0.3, 0.2, 0.18, 0.2, '#e6f7ff', { mat: 'glass' });
    b.box(0.85, 0.75, 0.3, 0.16, 0.1, 0.16, '#ff9f1c');
    props.flowerPot(b, 0.4, 0.75, 0.05, '#ff6fa7');
    props.rug(b, 0.3, 0, 0.2, 3.6, 2.6, '#f4a261', '#ffd6a5');
    // book stand, fish tank, cat tree, frames, clock, plants
    props.bookStand(b, -3.0, 0, -3.4);
    props.fishTank(b, 1.3, 0, -3.6);
    props.catTree(b, -3.4, 0, 3.0);
    props.frame(b, -1.5, 1.4, -3.97, 0.9, 0.7, 0, '#8d5a36', ['#8fd3ff', '#52b788', '#ffd23f']);
    props.frame(b, -2.5, 1.7, -3.97, 0.6, 0.5, 0, '#e76f51', ['#ffd6a5', '#f4a261']);
    props.wallClock(b, 3.4, 1.9, -3.95, 0);
    props.plant(b, 5.5, 0, 3.4, 1.1);
    props.plant(b, -1.6, 0, -3.55, 0.8, '#2ec4b6');
    // floor lamp next to the fish tank
    b.box(2.5, 0, -3.55, 0.36, 0.06, 0.36, '#8d5a36');
    b.box(2.5, 0.06, -3.55, 0.06, 1.5, 0.06, '#8d5a36');
    b.box(2.5, 1.56, -3.55, 0.5, 0.36, 0.5, '#ffd166');
    // stairs
    for (let i = 0; i < 12; i++) {
      const h = (i + 1) * 0.25;
      const z1 = STAIR.zBot - i * (4 / 12);
      b.box(-5.2, 0, z1 - 0.1667, 1.6, h, 0.3333, i % 2 ? '#d4a373' : '#c68b59', { mat: 'wood', world: true });
      b.box(-5.2, h, z1 - 0.02, 1.62, 0.04, 0.06, '#9c6644');
    }
    b.box(-5.2, 0, -3.2, 1.6, 2.8, 1.6, '#c68b59', { mat: 'wood', world: true });
    // railing
    for (let i = 0; i <= 8; i++) {
      const z = STAIR.zBot - i * 0.5;
      const y = (STAIR.zBot - z) / 4 * 3;
      b.box(-4.32, y, z, 0.08, 0.9, 0.08, '#ffffff');
    }
    b.box(-4.32, 0.9, -0.4, 0.1, 0.08, 5.1, '#9c6644', { rx: Math.atan2(3, 4) });
    const g = b.build({ cast: true });
    this.g1.add(g);
    this.skyMesh1 = sky.build();
    this.g1.add(this.skyMesh1);
    this.lampGlow1 = this.makeLampGlow(2.5, 1.53, -3.55);
    this.g1.add(this.lampGlow1);

    // breakfast plate (dynamic)
    this.plate = buildItem('ikan');
    this.plate.position.set(-0.2, 0.76, 0.55);
    this.g1.add(this.plate);

    // fish in tank
    this.fish = [];
    for (let i = 0; i < 3; i++) {
      const f = new Blocks();
      const col = ['#ff8c42', '#ffd23f', '#ff6fa7'][i];
      f.box(0, 0, 0, 0.16, 0.1, 0.06, col, { mat: 'plain' });
      f.box(-0.11, 0, 0, 0.06, 0.12, 0.03, col, { mat: 'plain' });
      f.box(0.05, 0.03, 0.031, 0.02, 0.02, 0.01, '#1f1a24', { mat: 'plain' });
      const m = f.build();
      m.position.set(1.3, 1.1 + i * 0.1, -3.6);
      this.g1.add(m);
      this.fish.push({ m, ph: i * 2, sp: 0.8 + i * 0.3 });
    }

    // colliders (floor 1: y 0..2.9)
    const A = (x0, x1, z0, z1) => this.addBox(x0, x1, z0, z1, -1, 2.75);
    A(-0.8, 1.4, -0.45, 0.85);
    this.addCircle(-0.25, -0.8, 0.3, -1, 2.75);
    this.addCircle(0.85, -0.8, 0.3, -1, 2.75);
    this.addCircle(-1.4, 0.2, 0.3, -1, 2.75);
    this.addCircle(2.0, 0.2, 0.3, -1, 2.75);
    A(3.05, 6, -4, -3.25);
    this.addCircle(2.5, -3.55, 0.28, -1, 2.75);
    A(0.7, 1.9, -4, -3.3);
    this.addCircle(-3.0, -3.4, 0.35, -1, 2.75);
    A(-3.85, -2.95, 2.55, 3.45);
    this.addCircle(5.5, 3.4, 0.32, -1, 2.75);
    this.addCircle(-1.6, -3.55, 0.3, -1, 2.75);
    A(-6, -4.2, -4, STAIR.zTop);                 // under landing
    this.addBox(-4.45, -4.2, STAIR.zTop, STAIR.zBot, -1, 6);   // railing both floors
    this.bounds = { x0: -6, x1: 6, z0: -4, z1: 3.9 };

    // interactables floor 1
    this.addInteract({
      name: 'door', pos: new THREE.Vector3(5.15, 0, 1.5), look: new THREE.Vector3(6.0, 2.5, 1.5), floorY: 0, range: 1.3,
      action: () => ({ label: 'Ke Warung', svg: SVG.warung, color: 'green', pulse: true, run: () => this.app.openDayPicker() }),
    });
    this.tableIt = this.addInteract({
      name: 'table', pos: new THREE.Vector3(-0.2, 0, 1.45), look: new THREE.Vector3(-0.2, 1.3, 0.55), floorY: 0, range: 1.2,
      action: () => {
        if (this.app.save.time !== 'morning' || this.app.save.breakfast) return null;
        return { label: 'Sarapan', icon: 'ikan', color: 'pink', pulse: true, run: () => this.eatBreakfast() };
      },
    });
    this.addInteract({
      name: 'book', pos: new THREE.Vector3(-3.0, 0, -2.55), look: new THREE.Vector3(-3.0, 1.4, -3.4), floorY: 0, range: 1.15,
      action: () => ({ label: 'Buku Resep', icon: 'i_book', color: 'teal', run: () => this.app.openRecipeBook() }),
    });
    this.addInteract({
      name: 'tank', pos: new THREE.Vector3(1.3, 0, -2.8), look: new THREE.Vector3(1.3, 1.6, -3.6), floorY: 0, range: 1.0,
      action: () => ({ label: 'Lihat Ikan', icon: 'i_fish', color: 'teal', run: () => this.watchFish() }),
    });
    this.addInteract({
      name: 'cattree', pos: new THREE.Vector3(-3.4, 0, 2.2), look: new THREE.Vector3(-3.4, 2.2, 3.0), floorY: 0, range: 1.1,
      action: () => ({ label: 'Garuk!', icon: 'i_cattree', color: 'purple', run: () => this.scratch() }),
    });
    this.addBall(2.6, 0, 2.4, '#ff6fa7');
  }

  buildFloor2() {
    const b = new Blocks();
    const sky = new Blocks();
    // slab + floor
    b.box(0.9, F2 - 0.2, 0, 10.2, 0.2, 8.4, '#ffffff', { mat: 'wood', world: true, tile: 2 });
    b.box(-5.1, F2 - 0.2, -3.2, 1.8, 0.2, 1.6, '#ffffff', { mat: 'wood', world: true, tile: 2 });
    b.box(0.9, F2 - 0.24, 4.15, 10.2, 0.26, 0.12, '#e76f51');
    // walls
    const wc = '#cde7ff';
    b.box(0, F2, -4.2, 12.8, 2.8, 0.4, wc, { mat: 'wall', world: true });
    b.box(-6.2, F2, 0, 0.4, 2.8, 8.8, wc, { mat: 'wall', world: true });
    b.box(6.2, F2, 0, 0.4, 2.8, 8.8, wc, { mat: 'wall', world: true });
    const ex = '#ffd6a5';
    b.box(0, F2, -4.45, 13.2, 2.8, 0.1, ex, { mat: 'brick', world: true });
    b.box(-6.45, F2, 0, 0.1, 2.8, 9.0, ex, { mat: 'brick', world: true });
    b.box(6.45, F2, 0, 0.1, 2.8, 9.0, ex, { mat: 'brick', world: true });
    b.box(6.52, F2 + 0.9, 0.5, 0.06, 1.2, 1.4, '#bde0fe', { mat: 'glow' });
    b.box(6.56, F2 + 0.8, 0.5, 0.12, 0.1, 1.6, '#ffffff');
    b.box(6.56, F2 + 2.1, 0.5, 0.12, 0.1, 1.6, '#ffffff');
    b.box(0, F2 + 2.8, -4.2, 12.9, 0.12, 0.5, '#9b6dff');
    b.box(-6.2, F2 + 2.8, 0, 0.5, 0.12, 8.9, '#9b6dff');
    b.box(6.2, F2 + 2.8, 0, 0.5, 0.12, 8.9, '#9b6dff');
    // stars wallpaper dots
    for (let i = 0; i < 16; i++) {
      const x = -5.5 + (i % 8) * 1.5 + (i > 7 ? 0.75 : 0);
      const y = F2 + 1.5 + (i > 7 ? 0.7 : 0);
      if (x > 2.8 && x < 6 && y < F2 + 2) continue;
      b.box(x, y, -3.99, 0.14, 0.14, 0.02, '#ffffff', { rz: Math.PI / 4 });
    }
    // window
    props.windowOn(b, -2.3, F2 + 1.1, -4.05, 1.6, 1.2, 0);
    props.curtains(b, -2.3, F2 + 1.1, -4.05, 1.6, 1.2, '#9b6dff');
    sky.box(-2.3, F2 + 1.1, -3.99, 1.6, 1.2, 0.02, '#ffffff', { mat: 'sky' });
    // furniture
    props.rug(b, 1.3, F2, 0.9, 3.4, 2.6, '#c77dff', '#e0c3fc');
    props.bed(b, 4.6, F2, -2.75, '#8ecae6');
    props.wardrobe(b, 1.4, F2, -3.6);
    props.mirror(b, -0.5, F2, -3.72);
    props.desk(b, -2.4, F2, -3.6);
    props.laptop(b, -2.3, F2 + 0.8, -3.55);
    props.trophyShelf(b, 5.72, F2, 1.4, -Math.PI / 2);
    props.plant(b, 5.5, F2, 3.5, 0.9, '#9b6dff');
    // nightstand + lamp
    b.box(3.05, F2, -3.65, 0.6, 0.55, 0.5, '#9c6644');
    b.box(3.05, F2 + 0.3, -3.39, 0.4, 0.14, 0.02, '#c68b59');
    b.box(3.05, F2 + 0.55, -3.65, 0.08, 0.35, 0.08, '#6c757d');
    b.box(3.05, F2 + 0.9, -3.65, 0.4, 0.3, 0.4, '#c77dff');
    // toy box
    b.at(-1.9, F2, 2.9, 0.2, () => {
      b.box(0, 0, 0, 1.0, 0.55, 0.6, '#ffd166');
      b.box(0, 0.55, 0, 1.04, 0.08, 0.64, '#ef476f');
      b.box(-0.2, 0.63, 0, 0.2, 0.2, 0.2, '#3d8bfd');
      b.box(0.2, 0.63, 0.05, 0.16, 0.26, 0.16, '#2ec4b6');
    });
    // railing along stair hole
    for (let i = 0; i <= 13; i++) b.box(-4.32, F2, -2.4 + i * 0.5, 0.08, 0.9, 0.08, '#ffffff');
    b.box(-4.32, F2 + 0.9, 0.85, 0.12, 0.08, 6.5, '#9c6644');
    b.box(-5.2, F2, 1.62, 1.7, 0.9, 0.08, '#ffffff');
    b.box(-5.2, F2 + 0.9, 1.62, 1.7, 0.08, 0.12, '#9c6644');
    const g = b.build({ cast: true });
    this.g2inner.add(g);
    this.skyMesh2 = sky.build();
    this.g2inner.add(this.skyMesh2);
    this.lampGlow2 = this.makeLampGlow(3.05, F2 + 0.87, -3.65);
    this.g2inner.add(this.lampGlow2);
    // laptop screen (glowing)
    const ls = new Blocks();
    ls.box(0, 0, 0, 0.56, 0.36, 0.01, '#9be7ff', { mat: 'glow' });
    ls.box(-0.12, 0.2, 0.006, 0.2, 0.08, 0.01, '#ff8c42', { mat: 'glow' });
    ls.box(0.12, 0.08, 0.006, 0.16, 0.16, 0.01, '#ffd23f', { mat: 'glow' });
    this.laptopScreen = ls.build();
    this.laptopScreen.position.set(-2.3, F2 + 0.87, -3.71);
    this.laptopScreen.rotation.x = -0.2;
    this.g2inner.add(this.laptopScreen);
    this.trophyGroup = new THREE.Group();
    this.g2inner.add(this.trophyGroup);

    const A = (x0, x1, z0, z1) => this.addBox(x0, x1, z0, z1, F2 - 0.3, F2 + 3);
    A(3.6, 5.6, -4, -1.45);
    A(2.7, 3.4, -4, -3.35);
    A(0.6, 2.2, -4, -3.2);
    A(-0.95, -0.05, -4, -3.5);
    A(-3.2, -1.6, -4, -3.2);
    A(5.45, 6, 0.4, 2.4);
    A(-2.45, -1.35, 2.55, 3.25);
    this.addCircle(5.5, 3.5, 0.3, F2 - 0.3, F2 + 3);
    A(-6, -4.2, STAIR.zBot, 4);           // hole beyond stairs

    this.addInteract({
      name: 'bed', pos: new THREE.Vector3(4.6, F2, -0.95), look: new THREE.Vector3(4.6, F2 + 1.3, -2.4), floorY: F2, range: 1.3,
      action: () => ({ label: 'Tidur', icon: 'i_bed', color: this.app.save.time === 'evening' ? 'purple' : 'gray', pulse: this.app.save.time === 'evening', run: () => this.app.goSleep() }),
    });
    this.addInteract({
      name: 'wardrobe', pos: new THREE.Vector3(1.4, F2, -2.75), look: new THREE.Vector3(1.4, F2 + 2.2, -3.6), floorY: F2, range: 1.2,
      action: () => ({ label: 'Lemari Baju', icon: 'i_wardrobe', color: 'pink', run: () => this.app.openWardrobe() }),
    });
    this.addInteract({
      name: 'mirror', pos: new THREE.Vector3(-0.5, F2, -2.85), look: new THREE.Vector3(-0.5, F2 + 2.1, -3.72), floorY: F2, range: 1.0,
      action: () => ({ label: 'Cermin', icon: 'i_mirror', color: 'purple', run: () => this.app.openMirror() }),
    });
    this.addInteract({
      name: 'laptop', pos: new THREE.Vector3(-2.4, F2, -2.75), look: new THREE.Vector3(-2.4, F2 + 1.4, -3.6), floorY: F2, range: 1.15,
      action: () => ({ label: 'Toko', icon: 'i_laptop', color: 'teal', run: () => this.app.openShop() }),
    });
    this.addInteract({
      name: 'trophy', pos: new THREE.Vector3(4.75, F2, 1.4), look: new THREE.Vector3(5.6, F2 + 2.2, 1.4), floorY: F2, range: 1.2,
      action: () => ({ label: 'Rak Piala', icon: 'i_trophy', color: '', run: () => this.app.openTrophies() }),
    });
    this.addBall(2.2, F2, 1.8, '#3d8bfd');
  }

  buildFacadeAndRoof() {
    // facade = front wall of both floors, hinged at the bottom so it can swing open
    const b = new Blocks();
    const H = F2 + 2.8;
    const wc = '#ffd6a5';
    const cols = [[-6.4, -4.4], [-2.9, -0.4], [1.1, 3.6], [5.1, 6.4]];
    for (const [x0, x1] of cols) b.box((x0 + x1) / 2, 0, 0, x1 - x0, H, 0.35, wc, { mat: 'brick', world: true });
    for (const [x0, x1] of [[-4.4, -2.9], [-0.4, 1.1], [3.6, 5.1]]) {
      b.box((x0 + x1) / 2, 0, 0, x1 - x0, 0.9, 0.35, wc, { mat: 'brick', world: true });
      b.box((x0 + x1) / 2, 2.2, 0, x1 - x0, 1.8, 0.35, wc, { mat: 'brick', world: true });
      b.box((x0 + x1) / 2, 5.0, 0, x1 - x0, H - 5.0, 0.35, wc, { mat: 'brick', world: true });
      for (const [y0, y1] of [[0.9, 2.2], [4.0, 5.0]]) {
        const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2;
        b.box(cx, y0, 0.05, w, h, 0.1, '#bde0fe', { mat: 'glow' });
        b.box(cx, y0, 0.2, 0.08, h, 0.06, '#ffffff');
        b.box(cx, y0 + h / 2, 0.2, w, 0.08, 0.06, '#ffffff');
        b.box(cx, y0 - 0.1, 0.25, w + 0.3, 0.12, 0.25, '#ffffff');
        b.box(cx, y1, 0.25, w + 0.3, 0.12, 0.2, '#ffffff');
        if (y0 < 2) {
          b.box(cx, y0 - 0.45, 0.32, w, 0.35, 0.3, '#8d5a36');
          for (let k = 0; k < 4; k++) b.box(x0 + 0.25 + k * (w - 0.5) / 3, y0 - 0.1, 0.32, 0.18, 0.16, 0.18, ['#ff6fa7', '#ffd23f', '#9b6dff', '#ff8c42'][k]);
        }
      }
    }
    b.box(0, F2 - 0.2, 0.1, 12.9, 0.25, 0.5, '#e76f51');
    b.box(0, H, 0.1, 12.9, 0.16, 0.5, '#e76f51');
    // tiny cat face sign
    b.box(0, H - 0.5, 0.2, 1.1, 0.45, 0.08, '#ff8c42');
    b.box(-0.2, H - 0.36, 0.25, 0.1, 0.1, 0.02, '#1f1a24');
    b.box(0.2, H - 0.36, 0.25, 0.1, 0.1, 0.02, '#1f1a24');
    this.facade = new THREE.Group();
    const fm = b.build({ cast: true });
    this.facade.add(fm);
    this.facade.position.set(0, 0, 4.42);
    this.scene.add(this.facade);

    // stepped roof (gable along x)
    const r = new Blocks();
    for (let i = 0; i < 7; i++) {
      const d = 9.6 - i * 1.35;
      if (d <= 0.2) break;
      r.box(0, H + 0.1 + i * 0.42, 0, 13.6, 0.42, d, '#ffffff', { mat: 'roof', world: true, tile: 1 });
    }
    r.box(0, H + 0.1, 0, 13.8, 0.1, 9.8, '#b5563f');
    r.box(3.6, H + 1.0, -1.6, 0.8, 2.0, 0.8, '#ffffff', { mat: 'brick', world: true });
    r.box(3.6, H + 3.0, -1.6, 1.0, 0.2, 1.0, '#7f5539');
    this.roof = r.build({ cast: true });
    this.scene.add(this.roof);
  }

  makeLampGlow(x, y, z) {
    const b = new Blocks();
    b.box(x, y - 0.02, z, 0.34, 0.1, 0.34, '#fff1a8', { mat: 'glow' });
    const g = b.build();
    return g;
  }

  addBall(x, y, z, col) {
    const b = new Blocks();
    b.box(0, -0.18, 0, 0.36, 0.36, 0.36, col);
    b.box(0, -0.2, 0, 0.3, 0.4, 0.3, col);
    b.box(0, -0.15, 0, 0.4, 0.3, 0.3, col);
    b.box(-0.1, -0.05, 0.19, 0.3, 0.03, 0.02, '#ffffff', { rz: 0.5 });
    b.box(0.19, -0.1, 0.0, 0.02, 0.03, 0.3, '#ffffff', { rx: 0.5 });
    const inner = b.build({ cast: true });
    const g = new THREE.Group();
    inner.position.y = 0.2;
    g.add(inner);
    g.position.set(x, y, z);
    (y > 1 ? this.g2inner : this.g1).add(g);
    this.balls.push({ g, inner, vx: 0, vz: 0, y, r: 0.2 });
  }

  // ------------------------------------------------------------------
  setTime(t) {
    const L = LIGHTS[t] || LIGHTS.morning;
    this.time = t;
    this.hemi.color.set(L.hemiSky);
    this.hemi.groundColor.set(L.hemiGround);
    this.hemi.intensity = L.hemi;
    this.sun.color.set(L.sun);
    this.sun.intensity = L.sunI;
    this.sun.position.set(t === 'evening' ? -10 : 6, t === 'evening' ? 7 : 14, 9);
    this.lamp1.intensity = L.lamp ? 9 : 0;
    this.lamp2.intensity = L.lamp ? 9 : 0;
    this.lampGlow1.visible = this.lampGlow2.visible = L.lamp;
    for (const m of [this.skyMesh1, this.skyMesh2]) {
      m.traverse(o => { if (o.isMesh) { o.material = new THREE.MeshBasicMaterial({ color: L.sky[0] }); } });
    }
    this.clouds.visible = true;
    this.clouds.children.forEach(m => { if (m.material) m.material = new THREE.MeshLambertMaterial({ color: t === 'evening' ? 0xffc3b0 : 0xffffff }); });
    document.body.className = this.mode === 'title' ? 'sky-title' : L.body;
    // breakfast plate
    const eaten = this.app.save.breakfast || t === 'evening';
    if (this.plate) this.plate.visible = !eaten;
  }

  refreshTrophies() {
    const G = this.trophyGroup;
    for (const c of [...G.children]) { G.remove(c); c.traverse(o => o.geometry && o.geometry.dispose()); }
    const b = new Blocks();
    let n = 0;
    TROPHIES.forEach((t) => {
      if (!this.app.save.trophies[t.id]) return;
      const shelf = Math.floor(n / 3), slot = n % 3;
      const y = F2 + 0.08 + shelf * 0.62;
      const z = 1.4 - 0.6 + slot * 0.6;
      props.trophy(b, 5.62, y, z, t.color, 0.95);
      n++;
    });
    if (!b.isEmpty()) G.add(b.build({ cast: true }));
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 1 ? 62 : 50;
    this.camera.updateProjectionMatrix();
    this.portrait = w / h < 1;
  }

  // ------------------------------------------------------------------
  // modes: 'title' | 'intro' | 'charsel' | 'play' | 'sleep'
  enterTitle() {
    this.build();
    this.mode = 'title';
    this.facade.visible = true;
    this.facade.rotation.x = 0;
    this.roof.visible = true;
    this.roof.position.y = 0;
    this.showUpper(true, true);
    this.player.root.visible = false;
    this.arrow.visible = false;
    this.ring.visible = false;
    this.orbitA = 0.45;
    document.body.className = 'sky-title';
  }

  // Scene 1: the dollhouse opens up
  async playIntro() {
    this.mode = 'intro';
    const ui = this.app.ui;
    const far = this.portrait ? 26 : 17;
    await this.moveCam(new THREE.Vector3(0, 3.4, far), new THREE.Vector3(0, 2.9, 0), 1.4);
    sound.whoosh();
    await this.tween(1.1, (k) => {
      const e = easeOutBounce(k);
      this.facade.rotation.x = e * Math.PI / 2;
      this.roof.position.y = k * 6;
    });
    this.facade.visible = false;
    this.roof.visible = false;
    sound.sparkle();
    ui.banner('Rumah Si Kucing', 'Lantai atas: Kamar. Lantai bawah: Ruang Makan', 'teal');
    const l1 = this.app.wui.add(labelEl('Kamar'), new THREE.Vector3(1.5, 5.7, 0), 'bottom');
    const l2 = this.app.wui.add(labelEl('Ruang Makan'), new THREE.Vector3(0.5, 2.6, 0.5), 'bottom');
    await wait(2600);
    l1.remove(); l2.remove();
  }

  // Scene 2 staging: camera close to the mirror in the bedroom
  stageCharSelect() {
    this.mode = 'charsel';
    this.facade.visible = false;
    this.roof.visible = false;
    this.showUpper(true, true);
    const P = this.player;
    P.root.visible = true;
    P.place(-0.5, -2.35, F2, 0);
    const pos = this.portrait ? new THREE.Vector3(-0.5, F2 + 1.45, 2.3) : new THREE.Vector3(0.6, F2 + 1.9, 1.4);
    const look = this.portrait ? new THREE.Vector3(-0.5, F2 - 0.55, -2.35) : new THREE.Vector3(-1.75, F2 + 0.85, -2.35);
    return this.moveCam(pos, look, 1.3);
  }
  rebuildPlayer() {
    this.player.rebuild(this.app.save.char);
  }

  // hand control to the player
  enterPlay(spawn, smooth) {
    this.build();
    this.mode = 'play';
    this.facade.visible = false;
    this.roof.visible = false;
    this.player.root.visible = true;
    this.app.input.reset();
    const P = this.player;
    if (spawn === 'bed') P.place(4.6, -0.8, F2, 0);
    else if (spawn === 'door') P.place(4.9, 1.5, 0, -Math.PI / 2);
    else if (spawn === 'mirror') { /* keep */ }
    this.setTime(this.app.save.time);
    this.showUpper(P.y > 1.5, true);
    this.snapCam = !smooth;
    this.camAnim = null;
  }

  showUpper(show, instant) {
    if (show === this.upperShown && !instant) return;
    this.upperShown = show;
    if (!show) { this.g2.visible = false; return; }
    this.g2.visible = true;
    this.g2.position.y = instant ? 0 : 1.6;
  }

  groundY(x, z, y) {
    if (x > STAIR.x0 - 0.05 && x < STAIR.x1 + 0.1 && z > STAIR.zTop && z < STAIR.zBot) {
      return THREE.MathUtils.clamp((STAIR.zBot - z) / (STAIR.zBot - STAIR.zTop) * F2, 0, F2);
    }
    return y > F2 / 2 ? F2 : 0;
  }

  // ------------------------------------------------------------------
  moveCam(pos, look, dur) {
    return new Promise(res => {
      this.camAnim = { p0: this.camPos.clone(), l0: this.camLook.clone(), p1: pos.clone(), l1: look.clone(), t: 0, dur, res };
    });
  }
  tween(dur, fn) {
    return new Promise(res => { this.tweenAnim = { t: 0, dur, fn, res }; });
  }

  eatBreakfast() {
    const P = this.player;
    this.app.save.breakfast = true;
    this.app.persist();
    P.playPose('eat', 1.6);
    sound.eat();
    this.fx.crumbs(new THREE.Vector3(-0.2, 1.0, 0.8), ['#ff9f5a', '#ffe066', '#ffffff']);
    setTimeout(() => {
      this.plate.visible = false;
      this.fx.hearts(new THREE.Vector3(P.pos.x, P.y + 1.7, P.pos.z));
      sound.purr();
      this.app.ui.toast('Kenyang! Hari ini kamu jalan lebih cepat', 2600);
      this.app.houseTutorialStep();
    }, 1300);
  }
  watchFish() {
    this.fishFast = 2.5;
    sound.pop();
    this.fx.emit(new THREE.Vector3(1.3, 1.3, -3.6), { count: 10, color: ['#caf0f8', '#ffffff'], speed: 0.3, up: 1.2, gravity: 0.5, drag: 1, life: 1, size: 0.05 });
    this.player.playPose('happy', 0.8);
  }
  scratch() {
    this.player.playPose('scratch', 1.2);
    sound.scratch();
    this.fx.emit(new THREE.Vector3(-3.6, 1.1, 2.9), { count: 12, color: ['#e9d8a6', '#d4b98f'], speed: 1.5, up: 2, life: 0.6, size: 0.06 });
  }

  // guidance: where should the arrow point
  guideTarget() {
    const S = this.app.save;
    if (!S.settings.helper) return null;
    const P = this.player;
    let targetName = null;
    if (S.time === 'evening') targetName = 'bed';
    else if (!S.breakfast) targetName = 'table';
    else targetName = 'door';
    const it = this.interactables.find(i => i.name === targetName);
    if (!it) return null;
    const onUpper = P.y > 1.5;
    const tUpper = it.floorY > 1.5;
    if (onUpper !== tUpper) {
      // point to the stairs
      return onUpper ? new THREE.Vector3(-5.2, F2 + 1.4, -3.2) : new THREE.Vector3(-5.2, 1.5, 2.3);
    }
    const lp = it.look || it.pos;
    return new THREE.Vector3(lp.x, lp.y + 0.2, lp.z);
  }

  update(dt) {
    this.t += dt;
    const app = this.app;
    // camera animation
    if (this.camAnim) {
      const A = this.camAnim;
      A.t += dt;
      const k = easeInOut(Math.min(1, A.t / A.dur));
      this.camPos.lerpVectors(A.p0, A.p1, k);
      this.camLook.lerpVectors(A.l0, A.l1, k);
      if (A.t >= A.dur) { this.camAnim = null; A.res(); }
    }
    if (this.tweenAnim) {
      const T = this.tweenAnim;
      T.t += dt;
      T.fn(Math.min(1, T.t / T.dur));
      if (T.t >= T.dur) { this.tweenAnim = null; T.res(); }
    }
    if (this.mode === 'title') {
      this.orbitA += dt * 0.12;
      const a = 0.45 + Math.sin(this.orbitA) * 0.4;
      const R = this.portrait ? 27 : 18;
      this.camPos.set(Math.sin(a) * R, 5.5 + Math.sin(this.orbitA * 0.7), Math.cos(a) * R);
      this.camLook.set(0, 2.6, 0);
    }
    const P = this.player;
    if (this.mode === 'play') {
      const move = app.input.vector();
      const frozen = app.ui.modalOpen || this.busy;
      P.update(dt, move, this, frozen);
      this.updateBalls(dt);
      this.showUpper(P.y > 1.5);
      if (!frozen) {
        this.updateTarget(dt);
        if (app.input.consumeAction()) this.doAction();
      } else { app.input.consumeAction(); }
      const g = this.guideTarget();
      this.showArrow(g, dt);
      // follow camera
      const off = this.portrait ? new THREE.Vector3(0, 6.6, 7.8) : new THREE.Vector3(0, 4.5, 6.1);
      const tx = THREE.MathUtils.clamp(P.pos.x, -3.2, 3.2);
      const tz = THREE.MathUtils.clamp(P.pos.z, -1.8, 1.2);
      const look = new THREE.Vector3(tx, P.y + 0.7, tz - 0.3);
      const pos = look.clone().add(off);
      const k = this.snapCam ? 1 : 1 - Math.exp(-dt * 5);
      this.snapCam = false;
      this.camPos.lerp(pos, k);
      this.camLook.lerp(look, k);
    } else if (this.mode === 'charsel') {
      animateIdle(P, dt);
      this.arrow.visible = false;
      this.ring.visible = false;
    } else {
      if (P.root.visible) animateIdle(P, dt);
    }
    // upper floor drop-in
    if (this.g2.visible && this.g2.position.y > 0) {
      this.g2.position.y = Math.max(0, this.g2.position.y - dt * 9);
    }
    // fish swim
    const fs = this.fishFast > 0 ? 3 : 1;
    if (this.fishFast > 0) this.fishFast -= dt;
    for (const f of this.fish) {
      f.ph += dt * f.sp * fs;
      f.m.position.x = 1.3 + Math.sin(f.ph) * 0.38;
      f.m.position.z = -3.6 + Math.cos(f.ph * 1.3) * 0.1;
      f.m.rotation.y = Math.cos(f.ph) > 0 ? 0 : Math.PI;
    }
    this.clouds.position.x = Math.sin(this.t * 0.03) * 4;
    this.fx.update(dt);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  updateBalls(dt) {
    const P = this.player;
    for (const ball of this.balls) {
      if (Math.abs(P.y - ball.y) > 1) continue;
      const bp = ball.g.position;
      const dx = bp.x - P.pos.x, dz = bp.z - P.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.55 && d > 0.001) {
        const push = Math.max(2.5, Math.hypot(P.vel.x, P.vel.z) * 1.4);
        ball.vx = dx / d * push; ball.vz = dz / d * push;
        bp.x = P.pos.x + dx / d * 0.55; bp.z = P.pos.z + dz / d * 0.55;
        if (!ball.cd || ball.cd <= 0) { sound.boing(); ball.cd = 0.4; }
      }
      if (ball.cd > 0) ball.cd -= dt;
      const ox = bp.x, oz = bp.z;
      bp.x += ball.vx * dt; bp.z += ball.vz * dt;
      const p = { x: bp.x, z: bp.z };
      this.collide(p, ball.y, ball.r);
      if (Math.abs(p.x - bp.x) > 1e-4) ball.vx *= -0.7;
      if (Math.abs(p.z - bp.z) > 1e-4) ball.vz *= -0.7;
      bp.x = p.x; bp.z = p.z;
      // keep balls off the stairs
      if (bp.x < STAIR.x1 + 0.3 && bp.z > STAIR.zTop - 0.2 && bp.z < STAIR.zBot + 0.3) { bp.x = STAIR.x1 + 0.3; ball.vx = Math.abs(ball.vx); }
      const damp = Math.exp(-dt * 1.6);
      ball.vx *= damp; ball.vz *= damp;
      const moved = Math.hypot(bp.x - ox, bp.z - oz);
      if (moved > 0) {
        ball.inner.rotation.x += (bp.z - oz) / 0.2;
        ball.inner.rotation.z -= (bp.x - ox) / 0.2;
      }
    }
  }
}

function animateIdle(P, dt) {
  P.update(dt, { x: 0, y: 0 }, { collide() {}, groundY: () => P.y }, true);
}
function easeInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
function easeOutBounce(x) {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
}
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
function labelEl(t) {
  const d = document.createElement('div');
  d.className = 'tlabel';
  d.style.fontSize = '20px';
  d.style.transform = 'none';
  d.textContent = t;
  return d;
}
