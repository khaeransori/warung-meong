import * as THREE from 'three';
import { Blocks } from '../engine/blocks.js';
import * as props from './props.js';
import { addIcon, makeItemIcons, buildItem, renderIcon, ICONS } from './items.js';
import { addHat, buildCat } from './characters.js';
import { HATS } from './data.js';

function m(fn) { const b = new Blocks(); fn(b); return b.build(); }
const SIDE = new THREE.Vector3(0.55, 0.6, 1.3).normalize();

export function makeAllIcons() {
  makeItemIcons();
  // stations
  addIcon('st_wajan', m(b => {
    b.box(0, 0, 0, 0.9, 0.3, 0.7, '#4ecdc4'); b.box(0, 0.3, 0, 0.9, 0.06, 0.7, '#343a40');
    b.box(0, 0.36, 0, 0.3, 0.05, 0.3, '#2b2d42'); b.box(0, 0.41, 0, 0.5, 0.06, 0.5, '#3d405b'); b.box(0, 0.47, 0, 0.64, 0.06, 0.64, '#3d405b');
    b.box(0.45, 0.46, 0.1, 0.34, 0.05, 0.07, '#8d5a36', { ry: -0.3 });
    b.box(-0.15, 0.3, 0, 0.08, 0.1, 0.08, '#ff7b00', { mat: 'glow' }); b.box(0.15, 0.3, 0, 0.08, 0.1, 0.08, '#ffd23f', { mat: 'glow' });
  }));
  addIcon('st_bakar', m(b => {
    props.grillBody(b, 0, -0.92, 0, 0);
    for (const z of [-0.12, 0.08]) {
      b.box(0, 0.2, z, 0.6, 0.022, 0.022, '#d9b27c');
      for (const x of [-0.12, 0, 0.12]) b.box(x, 0.16, z, 0.09, 0.09, 0.09, '#8a4b22');
    }
  }));
  addIcon('st_panci', m(b => {
    b.box(0, 0, 0, 0.9, 0.3, 0.7, '#4ecdc4'); b.box(0, 0.3, 0, 0.9, 0.06, 0.7, '#343a40');
    b.box(0, 0.36, 0, 0.6, 0.5, 0.6, '#ced4da'); b.box(0, 0.86, 0, 0.64, 0.05, 0.64, '#adb5bd');
    b.box(-0.36, 0.7, 0, 0.1, 0.06, 0.2, '#495057'); b.box(0.36, 0.7, 0, 0.1, 0.06, 0.2, '#495057');
    b.box(0, 0.91, 0, 0.14, 0.08, 0.14, '#343a40');
  }));
  addIcon('st_teh', m(b => {
    b.box(0, 0, -0.1, 0.6, 0.32, 0.46, '#ff8c42');
    b.box(0, 0.32, -0.1, 0.52, 0.7, 0.44, '#e6f7ff', { mat: 'glass' });
    b.box(0, 0.33, -0.1, 0.46, 0.5, 0.38, '#b8631c');
    b.box(0, 1.02, -0.1, 0.56, 0.08, 0.48, '#e76f51');
    b.box(0, 0.22, 0.16, 0.1, 0.1, 0.12, '#adb5bd');
  }));
  addIcon('st_jus', m(b => {
    b.box(0, 0, 0, 0.36, 0.22, 0.36, '#ef476f');
    b.box(0, 0.22, 0, 0.3, 0.46, 0.3, '#e6f7ff', { mat: 'glass' });
    b.box(0, 0.24, 0, 0.26, 0.2, 0.26, '#ffa31a');
    b.box(0, 0.68, 0, 0.32, 0.06, 0.32, '#343a40');
  }));
  // house things
  addIcon('i_book', m(b => props.bookStand(b, 0, 0, 0)), { dir: SIDE });
  addIcon('i_bed', m(b => props.bed(b, 0, 0, 0, '#8ecae6')));
  addIcon('i_wardrobe', m(b => props.wardrobe(b, 0, 0, 0)), { dir: SIDE });
  addIcon('i_laptop', m(b => {
    props.laptop(b, 0, 0, 0);
    b.box(0, 0.08, -0.15, 0.56, 0.36, 0.01, '#9be7ff', { mat: 'glow', rx: -0.2 });
    b.box(0, 0.2, -0.13, 0.2, 0.14, 0.02, '#ff8c42', { mat: 'glow', rx: -0.2 });
  }), { dir: SIDE });
  addIcon('i_trophy', m(b => props.trophy(b, 0, 0, 0, '#ffd23f', 1)), { dir: SIDE });
  addIcon('i_mirror', m(b => props.mirror(b, 0, 0, 0)), { dir: SIDE });
  addIcon('i_fish', m(b => props.fishTank(b, 0, 0, 0)), { dir: SIDE });
  addIcon('i_cattree', m(b => props.catTree(b, 0, 0, 0)), { dir: SIDE });
  // upgrades
  addIcon('up_sepatu', m(b => {
    b.box(0, 0, 0, 0.36, 0.08, 0.8, '#ffffff'); b.box(0, 0.08, -0.08, 0.34, 0.26, 0.56, '#ef476f');
    b.box(0, 0.08, 0.22, 0.32, 0.16, 0.24, '#ef476f'); b.box(0, 0.34, -0.12, 0.3, 0.06, 0.3, '#ffffff');
    for (let i = 0; i < 3; i++) b.box(0, 0.2 + i * 0.05, 0.05 + i * 0.07, 0.36, 0.02, 0.03, '#ffffff');
    b.box(-0.18, 0.12, -0.1, 0.02, 0.1, 0.3, '#ffd23f');
  }));
  addIcon('up_radio', m(b => {
    b.box(0, 0, 0, 0.8, 0.5, 0.3, '#e63946'); b.box(-0.15, 0.08, 0.155, 0.34, 0.34, 0.01, '#343a40');
    b.box(0.24, 0.3, 0.155, 0.2, 0.08, 0.01, '#ffd23f'); b.box(0.24, 0.12, 0.155, 0.1, 0.1, 0.01, '#ffffff');
    b.box(0.28, 0.5, 0, 0.03, 0.4, 0.03, '#adb5bd');
    b.box(-0.2, 0.7, 0.1, 0.08, 0.18, 0.03, '#9b6dff'); b.box(-0.14, 0.82, 0.1, 0.12, 0.05, 0.03, '#9b6dff');
  }));
  addIcon('up_wajan2', m(b => {
    for (const x of [-0.42, 0.42]) {
      b.box(x, 0, 0, 0.3, 0.05, 0.3, '#2b2d42'); b.box(x, 0.05, 0, 0.5, 0.06, 0.5, '#3d405b'); b.box(x, 0.11, 0, 0.64, 0.06, 0.64, '#3d405b');
    }
    b.box(0, 0.3, 0, 0.1, 0.3, 0.1, '#2ec27e'); b.box(0, 0.4, 0, 0.3, 0.1, 0.1, '#2ec27e');
  }));
  addIcon('up_antigosong', m(b => {
    b.box(0, 0, 0, 0.3, 0.05, 0.3, '#2b2d42'); b.box(0, 0.05, 0, 0.5, 0.06, 0.5, '#2a9d8f'); b.box(0, 0.11, 0, 0.64, 0.06, 0.64, '#2a9d8f');
    b.box(0.45, 0.1, 0.1, 0.34, 0.05, 0.07, '#8d5a36', { ry: -0.3 });
    b.box(-0.1, 0.3, 0, 0.3, 0.36, 0.06, '#3d8bfd'); b.box(-0.1, 0.36, 0.04, 0.12, 0.2, 0.02, '#ffffff');
  }));
  addIcon('up_tanaman', m(b => props.plant(b, 0, 0, 0, 1, '#2ec4b6')));
  addIcon('up_turbo', m(b => {
    b.box(0, 0, 0, 0.9, 0.3, 0.7, '#4ecdc4'); b.box(0, 0.3, 0, 0.9, 0.06, 0.7, '#343a40');
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; b.box(Math.cos(a) * 0.16, 0.36, Math.sin(a) * 0.16, 0.08, 0.24, 0.08, ['#4cc9f0', '#90e0ef', '#3a86ff'][i % 3], { mat: 'glow' }); }
    b.box(0, 0.36, 0, 0.1, 0.4, 0.1, '#4cc9f0', { mat: 'glow' });
  }));
  addIcon('up_meja4', m(b => { props.table(b, 0, 0, 0, { round: true, w: 1.15, d: 1.15, cloth: '#ffd6a5' }); props.stool(b, -0.85, 0, 0, '#9b6dff'); props.stool(b, 0.85, 0, 0, '#9b6dff'); }));
  addIcon('up_bakar2', m(b => { props.grillBody(b, 0, -0.92, 0, 0); props.grillBody(b, 0, -0.92 + 0.3, 0.1, 0); }));
  addIcon('up_kipas', m(b => {
    b.box(0, 0, 0, 0.5, 0.06, 0.5, '#3d8bfd'); b.box(0, 0.06, 0, 0.08, 1.0, 0.08, '#adb5bd'); b.box(0, 0.95, -0.05, 0.26, 0.26, 0.2, '#3d8bfd');
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; b.box(Math.cos(a) * 0.26, 1.03 + Math.sin(a) * 0.26, 0.1, 0.4, 0.16, 0.02, '#caf0f8', { rz: a }); }
  }));
  addIcon('up_lampu', m(b => {
    const cols = ['#ff6b6b', '#ffd23f', '#2ec4b6', '#9b6dff', '#ff8c42'];
    for (let i = 0; i < 7; i++) { const x = -0.9 + i * 0.3; const y = -Math.sin(i / 6 * Math.PI) * 0.3; b.box(x, y, 0, 0.14, 0.2, 0.14, cols[i % 5], { mat: 'glow' }); b.box(x, y + 0.2, 0, 0.06, 0.05, 0.06, '#343a40'); }
    b.box(0, 0.25, 0, 2.0, 0.02, 0.02, '#343a40');
  }));
  // hats
  for (const h of HATS) {
    if (h.id === 'none') continue;
    const b = new Blocks();
    b.box(0, 0.3, 0, 0.8, 0.32, 0.66, '#f0e6da');
    addHat(b, h.id);
    addIcon('hat_' + h.id, b.build(), { dir: new THREE.Vector3(0.35, 0.55, 1.4).normalize() });
  }
}

// icon of the player's cat (used for travel screen & app icon)
export function catIcon(charSave, size = 128) {
  const ch = buildCat(charSave, { apron: false });
  ch.parts.armR.rotation.x = -2.6; ch.parts.armR.rotation.z = 0.3;
  ch.root.rotation.y = 0.35;
  const c = renderIcon(ch.root, { size, dir: new THREE.Vector3(0.15, 0.35, 1).normalize(), zoom: 0.95 });
  return c.toDataURL();
}
export function catHeadIcon(charSave, size = 512, bg = null) {
  const ch = buildCat(charSave, { apron: false });
  const head = ch.parts.head;
  ch.root.updateMatrixWorld(true);
  const g = new THREE.Group();
  const clone = head.clone(true);
  g.add(clone);
  const c = renderIcon(g, { size, dir: new THREE.Vector3(0.0, 0.12, 1).normalize(), zoom: 0.92 });
  if (!bg) return c;
  const out = document.createElement('canvas');
  out.width = out.height = size;
  const x = out.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, size, size);
  x.drawImage(c, size * 0.08, size * 0.1, size * 0.84, size * 0.84);
  return out;
}
export { ICONS, buildItem };
