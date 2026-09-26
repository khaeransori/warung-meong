import * as THREE from 'three';
import { Blocks } from '../engine/blocks.js';

// All props are drawn into a Blocks builder. (x,z) = footprint centre, y = floor height.

export function table(b, x, y, z, o = {}) {
  const top = o.top || '#c68b59', leg = o.leg || '#8d5a36';
  const w = o.w || 1.1, d = o.d || 1.1, h = o.h || 0.74;
  b.at(x, y, z, 0, () => {
    if (o.round) {
      b.box(0, 0, 0, 0.5, 0.05, 0.5, leg);
      b.box(0, 0.05, 0, 0.14, h - 0.12, 0.14, leg);
      b.box(0, h - 0.08, 0, w * 0.72, 0.08, d, top);
      b.box(0, h - 0.08, 0, w, 0.08, d * 0.72, top);
      b.box(0, h - 0.07, 0, w * 0.88, 0.08, d * 0.88, top);
      if (o.cloth) {
        b.box(0, h, 0, w * 0.62, 0.01, d * 0.62, o.cloth, { skip: ['ny'] });
      }
    } else {
      for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.box(lx * (w / 2 - 0.08), 0, lz * (d / 2 - 0.08), 0.1, h - 0.08, 0.1, leg);
      b.box(0, h - 0.08, 0, w, 0.08, d, top);
      if (o.cloth) b.box(0, h, 0, w * 0.9, 0.01, d * 0.5, o.cloth);
    }
  });
}

export function stool(b, x, y, z, col = '#ef476f') {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.1, 0.4, 0.1, '#8d99ae');
    b.box(0, 0, 0, 0.34, 0.04, 0.34, '#8d99ae');
    b.box(0, 0.4, 0, 0.44, 0.08, 0.44, col);
  });
}

export function chair(b, x, y, z, ry, col = '#d4a373') {
  b.at(x, y, z, ry, () => {
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.box(lx * 0.18, 0, lz * 0.18, 0.07, 0.44, 0.07, col);
    b.box(0, 0.44, 0, 0.46, 0.07, 0.46, col);
    b.box(0, 0.51, -0.2, 0.46, 0.5, 0.07, col);
    b.box(0, 0.51, -0.2, 0.3, 0.3, 0.075, '#fefae0');
  });
}

export function plant(b, x, y, z, s = 1, pot = '#e76f51') {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.36 * s, 0.34 * s, 0.36 * s, pot);
    b.box(0, 0.3 * s, 0, 0.4 * s, 0.06 * s, 0.4 * s, pot);
    b.box(0, 0.34 * s, 0, 0.32 * s, 0.02, 0.32 * s, '#6b4f2a');
    b.box(0, 0.34 * s, 0, 0.1 * s, 0.4 * s, 0.1 * s, '#4f772d');
    b.box(0, 0.6 * s, 0, 0.5 * s, 0.3 * s, 0.5 * s, '#6ab04c');
    b.box(0, 0.86 * s, 0, 0.36 * s, 0.22 * s, 0.36 * s, '#7bc95a');
    b.box(0.18 * s, 0.5 * s, 0.1 * s, 0.22 * s, 0.2 * s, 0.22 * s, '#5c9e3f');
    b.box(-0.16 * s, 0.7 * s, -0.12 * s, 0.2 * s, 0.2 * s, 0.2 * s, '#5c9e3f');
  });
}

export function flowerPot(b, x, y, z, col = '#ff6fa7') {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.26, 0.22, 0.26, '#f4a261');
    b.box(0, 0.22, 0, 0.06, 0.2, 0.06, '#4f772d');
    b.box(0.08, 0.26, 0, 0.12, 0.05, 0.05, '#6ab04c', { rz: 0.4 });
    b.box(0, 0.42, 0, 0.18, 0.1, 0.18, col);
    b.box(0, 0.44, 0, 0.08, 0.09, 0.08, '#ffd23f');
  });
}

export function rug(b, x, y, z, w, d, c1, c2) {
  b.box(x, y, z, w, 0.02, d, c1, { mat: 'carpet', world: true, tile: 0.6 });
  b.box(x, y + 0.02, z, w - 0.3, 0.004, d - 0.3, c2, { mat: 'carpet', world: true, tile: 0.6 });
  b.box(x, y + 0.024, z, w - 0.5, 0.004, d - 0.5, c1, { mat: 'carpet', world: true, tile: 0.6 });
}

export function windowOn(b, x, y, z, w, h, ry, frame = '#ffffff', sill = '#f1dca7') {
  // window facing +z in local space (put on a back wall)
  b.at(x, y, z, ry, () => {
    b.box(0, 0, 0.04, w + 0.2, 0.1, 0.12, frame);
    b.box(0, h - 0.1, 0.04, w + 0.2, 0.12, 0.12, frame);
    b.box(-w / 2 - 0.05, 0, 0.04, 0.1, h, 0.12, frame);
    b.box(w / 2 + 0.05, 0, 0.04, 0.1, h, 0.12, frame);
    b.box(0, 0, 0.04, 0.06, h, 0.1, frame);
    b.box(0, h / 2 - 0.03, 0.04, w, 0.06, 0.1, frame);
    b.box(0, -0.06, 0.14, w + 0.4, 0.08, 0.26, sill);
  });
}

export function curtains(b, x, y, z, w, h, col) {
  b.at(x, y, z, 0, () => {
    b.box(0, h + 0.05, 0.12, w + 0.8, 0.06, 0.06, '#8d5a36');
    for (const s of [-1, 1]) {
      b.box(s * (w / 2 + 0.2), -0.1, 0.16, 0.36, h + 0.15, 0.08, col);
      b.box(s * (w / 2 + 0.2), h * 0.45, 0.2, 0.38, 0.06, 0.04, '#ffd23f');
    }
  });
}

export function hangingLamp(b, x, y, z, col = '#ffd166') {
  // y = ceiling height
  b.box(x, y - 0.6, z, 0.03, 0.6, 0.03, '#444');
  b.box(x, y - 0.85, z, 0.46, 0.25, 0.46, col);
  b.box(x, y - 0.9, z, 0.3, 0.06, 0.3, '#fff7d6', { mat: 'glow' });
}

export function wallClock(b, x, y, z, ry = 0) {
  b.at(x, y, z, ry, () => {
    b.box(0, 0, 0, 0.5, 0.5, 0.06, '#ff8c42');
    b.box(0, 0.05, 0.03, 0.4, 0.4, 0.02, '#ffffff');
    b.box(0, 0.24, 0.045, 0.03, 0.14, 0.01, '#222');
    b.box(0.04, 0.24, 0.045, 0.12, 0.03, 0.01, '#222');
    for (const [dx, dy] of [[0, 0.17], [0.17, 0], [0, -0.17], [-0.17, 0]]) b.box(dx, 0.24 + dy - 0.015, 0.045, 0.03, 0.03, 0.01, '#555');
  });
}

export function frame(b, x, y, z, w, h, ry, border, picture) {
  b.at(x, y, z, ry, () => {
    b.box(0, 0, 0, w, h, 0.05, border);
    b.box(0, 0.06, 0.02, w - 0.12, h - 0.12, 0.02, picture[0]);
    if (picture[1]) b.box(0, 0.06, 0.03, w - 0.12, (h - 0.12) * 0.4, 0.02, picture[1]);
    if (picture[2]) b.box((w - 0.12) * 0.2, h * 0.45, 0.035, 0.12, 0.12, 0.02, picture[2]);
  });
}

export function shelfWithJars(b, x, y, z, w, ry = 0) {
  b.at(x, y, z, ry, () => {
    b.box(0, 0, 0, w, 0.06, 0.3, '#b07d53');
    b.box(-w / 2 + 0.05, -0.2, -0.1, 0.05, 0.2, 0.08, '#8d5a36');
    b.box(w / 2 - 0.05, -0.2, -0.1, 0.05, 0.2, 0.08, '#8d5a36');
    const cols = ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#f78c6b', '#c77dff'];
    const n = Math.floor(w / 0.32);
    for (let i = 0; i < n; i++) {
      const jx = -w / 2 + 0.2 + i * (w - 0.3) / Math.max(1, n - 1);
      const h = 0.2 + (i % 3) * 0.06;
      b.box(jx, 0.06, 0, 0.18, h, 0.18, '#e8f6ff', { mat: 'glass' });
      b.box(jx, 0.06, 0, 0.15, h * 0.7, 0.15, cols[i % cols.length]);
      b.box(jx, 0.06 + h, 0, 0.19, 0.04, 0.19, '#8d5a36');
    }
  });
}

export function counterBlock(b, x, y, z, w, d, base = '#4ecdc4', top = '#ffffff') {
  b.box(x, y, z, w, 0.08, d, '#2a9d8f');
  b.box(x, y + 0.08, z, w - 0.02, 0.74, d - 0.02, base);
  b.box(x, y + 0.82, z, w + 0.04, 0.1, d + 0.04, top);
}

// ---------- house furniture ----------
export function bed(b, x, y, z, blanket = '#8ecae6') {
  // headboard at -z
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 1.9, 0.35, 2.5, '#9c6644');
    b.box(0, 0.35, 0.05, 1.8, 0.2, 2.3, '#ffffff');
    b.box(0, 0.55, 0.35, 1.84, 0.1, 1.64, blanket);
    b.box(0, 0.4, 0.35, 1.9, 0.25, 1.66, blanket, { skip: ['py'] });
    for (let i = 0; i < 4; i++) b.box(-0.6 + i * 0.4, 0.65, 0.35, 0.16, 0.006, 1.6, '#ffffff', { skip: ['ny'] });
    b.box(-0.42, 0.55, -0.85, 0.7, 0.18, 0.46, '#fff4f4');
    b.box(0.42, 0.55, -0.85, 0.7, 0.18, 0.46, '#fff4f4');
    b.box(0, 0, -1.22, 2.0, 1.25, 0.12, '#7f5539');
    b.box(0, 1.15, -1.22, 1.6, 0.18, 0.13, '#9c6644');
    b.box(0, 0, 1.2, 2.0, 0.6, 0.1, '#7f5539');
  });
}

export function wardrobe(b, x, y, z, col = '#f4a261') {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 1.6, 2.3, 0.7, col);
    b.box(0, 2.3, 0, 1.7, 0.1, 0.78, '#e76f51');
    b.box(0, 0.08, 0.35, 0.02, 2.1, 0.02, '#c1553b');
    b.box(-0.39, 0.1, 0.355, 0.7, 2.05, 0.02, '#f7b27a');
    b.box(0.39, 0.1, 0.355, 0.7, 2.05, 0.02, '#f7b27a');
    b.box(-0.1, 1.05, 0.38, 0.06, 0.24, 0.05, '#ffd23f');
    b.box(0.1, 1.05, 0.38, 0.06, 0.24, 0.05, '#ffd23f');
    // hanger sign: shirt shape
    b.box(-0.4, 1.6, 0.37, 0.3, 0.26, 0.02, '#ff7eb6');
    b.box(-0.4, 1.8, 0.37, 0.46, 0.08, 0.02, '#ff7eb6');
    b.box(0.4, 1.6, 0.37, 0.3, 0.26, 0.02, '#3d8bfd');
    b.box(0.4, 1.8, 0.37, 0.46, 0.08, 0.02, '#3d8bfd');
  });
}

export function mirror(b, x, y, z) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.8, 0.08, 0.4, '#c77dff');
    b.box(0, 0.08, -0.05, 0.9, 1.9, 0.12, '#c77dff');
    b.box(0, 0.2, 0.02, 0.7, 1.66, 0.02, '#cfefff', { mat: 'glow' });
    b.box(-0.18, 1.2, 0.035, 0.12, 0.5, 0.01, '#f1fbff', { mat: 'glow', rz: 0.5 });
    b.box(0.05, 1.3, 0.035, 0.06, 0.3, 0.01, '#f1fbff', { mat: 'glow', rz: 0.5 });
    b.box(0, 1.95, -0.05, 0.3, 0.16, 0.12, '#ffd23f');
  });
}

export function desk(b, x, y, z) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 1.5, 0.74, 0.7, '#b07d53');
    b.box(0, 0.74, 0, 1.6, 0.06, 0.76, '#d4a373');
    b.box(0.35, 0.3, 0.355, 0.6, 0.3, 0.02, '#c68b59');
    b.box(0.35, 0.42, 0.37, 0.16, 0.05, 0.03, '#ffd23f');
    b.box(-0.55, 0.8, -0.15, 0.16, 0.2, 0.16, '#90e0ef');
    b.box(-0.55, 1.0, -0.15, 0.04, 0.14, 0.04, '#ff6b6b');
  });
}

export function laptop(b, x, y, z) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0.05, 0.7, 0.04, 0.46, '#b8c0cc');
    b.box(0, 0.04, 0.08, 0.6, 0.005, 0.28, '#6c757d');
    b.box(0, 0.04, -0.18, 0.7, 0.46, 0.04, '#b8c0cc', { rx: -0.2 });
  });
}

export function trophyShelf(b, x, y, z, ry) {
  b.at(x, y, z, ry, () => {
    b.box(0, 0, 0, 1.9, 0.08, 0.5, '#9c6644');
    for (const sy of [0.62, 1.24, 1.86]) b.box(0, sy, 0, 1.9, 0.06, 0.5, '#b07d53');
    b.box(-0.93, 0, 0, 0.06, 1.95, 0.5, '#9c6644');
    b.box(0.93, 0, 0, 0.06, 1.95, 0.5, '#9c6644');
    b.box(0, 0, -0.23, 1.9, 1.95, 0.04, '#7f5539');
  });
}

export function trophy(b, x, y, z, col, s = 1) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.26 * s, 0.07 * s, 0.26 * s, '#6b4f2a');
    b.box(0, 0.07 * s, 0, 0.07 * s, 0.14 * s, 0.07 * s, col);
    b.box(0, 0.21 * s, 0, 0.26 * s, 0.2 * s, 0.26 * s, col);
    b.box(0, 0.41 * s, 0, 0.3 * s, 0.04 * s, 0.3 * s, col);
    b.box(-0.17 * s, 0.25 * s, 0, 0.06 * s, 0.14 * s, 0.05 * s, col);
    b.box(0.17 * s, 0.25 * s, 0, 0.06 * s, 0.14 * s, 0.05 * s, col);
    b.box(0, 0.26 * s, 0.132 * s, 0.08 * s, 0.08 * s, 0.01, '#ffffff');
  });
}

export function bookStand(b, x, y, z) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.5, 0.06, 0.5, '#8d5a36');
    b.box(0, 0.06, 0, 0.14, 0.86, 0.14, '#9c6644');
    b.box(0, 0.9, 0, 0.8, 0.06, 0.56, '#9c6644', { rx: 0.35 });
    b.box(-0.19, 0.97, 0.02, 0.36, 0.04, 0.46, '#fffdf5', { rx: 0.35, rz: 0.06 });
    b.box(0.19, 0.97, 0.02, 0.36, 0.04, 0.46, '#fffdf5', { rx: 0.35, rz: -0.06 });
    b.box(-0.19, 1.0, 0.0, 0.2, 0.01, 0.14, '#ff9f1c', { rx: 0.35 });
    b.box(0.19, 1.0, 0.0, 0.2, 0.01, 0.14, '#2ec4b6', { rx: 0.35 });
    b.box(0, 0.93, 0.02, 0.8, 0.03, 0.5, '#e63946', { rx: 0.35 });
  });
}

export function fridge(b, x, y, z, ry = 0) {
  b.at(x, y, z, ry, () => {
    b.box(0, 0, 0, 0.9, 2.0, 0.75, '#e9f5f9');
    b.box(0, 1.28, 0.38, 0.86, 0.02, 0.02, '#b8c7cf');
    b.box(0.34, 1.45, 0.4, 0.06, 0.35, 0.05, '#9aa9b1');
    b.box(0.34, 0.75, 0.4, 0.06, 0.35, 0.05, '#9aa9b1');
    b.box(-0.2, 1.6, 0.385, 0.14, 0.14, 0.01, '#ff6b6b');
    b.box(0.0, 1.7, 0.385, 0.12, 0.12, 0.01, '#ffd166');
  });
}

export function sofa(b, x, y, z, ry, col = '#2ec4b6') {
  b.at(x, y, z, ry, () => {
    b.box(0, 0, 0, 2.0, 0.45, 0.8, col);
    b.box(0, 0.45, -0.3, 2.0, 0.5, 0.2, col);
    b.box(-0.95, 0.45, 0, 0.14, 0.25, 0.8, col);
    b.box(0.95, 0.45, 0, 0.14, 0.25, 0.8, col);
    b.box(-0.45, 0.45, 0.05, 0.86, 0.1, 0.6, '#caf0f8');
    b.box(0.45, 0.45, 0.05, 0.86, 0.1, 0.6, '#caf0f8');
    b.box(-0.6, 0.55, -0.12, 0.35, 0.3, 0.12, '#ffd166', { rz: 0.1 });
  });
}

export function catTree(b, x, y, z) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.9, 0.1, 0.9, '#c9ada7');
    b.box(-0.2, 0.1, -0.2, 0.18, 1.5, 0.18, '#e9d8a6');
    b.box(0.25, 0.1, 0.2, 0.18, 0.9, 0.18, '#e9d8a6');
    for (let i = 0; i < 7; i++) b.box(-0.2, 0.2 + i * 0.2, -0.2, 0.2, 0.03, 0.2, '#d4b98f');
    b.box(0.2, 1.0, 0.15, 0.6, 0.1, 0.6, '#c9ada7');
    b.box(-0.2, 1.6, -0.2, 0.7, 0.12, 0.7, '#c9ada7');
    b.box(-0.2, 1.72, -0.2, 0.5, 0.2, 0.5, '#9a8c98');
    b.box(-0.2, 1.8, -0.2, 0.36, 0.14, 0.36, '#c9ada7');
    // dangling toy
    b.box(0.35, 0.6, 0.35, 0.02, 0.4, 0.02, '#555');
    b.box(0.35, 0.5, 0.35, 0.12, 0.12, 0.12, '#ff6fa7');
  });
}

export function fishTank(b, x, y, z) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 1.2, 0.8, 0.55, '#8d5a36');
    b.box(0, 0.8, 0, 1.1, 0.06, 0.5, '#e9c46a');
    b.box(0, 0.86, 0, 1.06, 0.56, 0.46, '#48cae4', { mat: 'glass' });
    b.box(0, 1.42, 0, 1.12, 0.06, 0.5, '#343a40');
    b.box(-0.3, 0.86, -0.05, 0.08, 0.3, 0.08, '#52b788');
    b.box(-0.22, 0.86, 0.08, 0.06, 0.2, 0.06, '#40916c');
    b.box(0.3, 0.86, 0.0, 0.2, 0.08, 0.14, '#adb5bd');
  });
}

export function kitchenSet(b, x, y, z, w) {
  // home kitchen along back wall, facing +z; x = centre
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, w, 0.88, 0.7, '#8ecae6');
    b.box(0, 0.88, 0, w + 0.04, 0.08, 0.74, '#fefae0');
    for (let i = 0; i < Math.floor(w / 0.6); i++) {
      const dx = -w / 2 + 0.3 + i * 0.6;
      b.box(dx, 0.1, 0.355, 0.54, 0.7, 0.02, '#a8dadc');
      b.box(dx, 0.62, 0.37, 0.14, 0.04, 0.03, '#457b9d');
    }
    // stove top
    b.box(-w / 2 + 0.5, 0.96, 0.05, 0.7, 0.03, 0.5, '#343a40');
    b.box(-w / 2 + 0.35, 0.99, 0.05, 0.16, 0.02, 0.16, '#6c757d');
    b.box(-w / 2 + 0.65, 0.99, 0.05, 0.16, 0.02, 0.16, '#6c757d');
    b.box(-w / 2 + 0.35, 1.01, 0.05, 0.36, 0.2, 0.36, '#e63946');
    b.box(-w / 2 + 0.35, 1.21, 0.05, 0.1, 0.05, 0.1, '#222');
    // sink
    b.box(w / 2 - 0.55, 0.9, 0.05, 0.6, 0.07, 0.44, '#ced4da');
    b.box(w / 2 - 0.55, 0.97, -0.22, 0.06, 0.28, 0.06, '#adb5bd');
    b.box(w / 2 - 0.55, 1.2, -0.12, 0.06, 0.05, 0.22, '#adb5bd');
    // upper cabinets
    b.box(0, 1.65, -0.1, w, 0.7, 0.5, '#a8dadc');
    for (let i = 0; i < Math.floor(w / 0.6); i++) {
      const dx = -w / 2 + 0.3 + i * 0.6;
      b.box(dx, 1.7, 0.155, 0.54, 0.6, 0.02, '#caf0f8');
    }
  });
}

// ---------- exterior ----------
export function tree(b, x, y, z, s = 1) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.4 * s, 1.4 * s, 0.4 * s, '#8d5a36');
    b.box(0, 1.2 * s, 0, 1.8 * s, 1.0 * s, 1.8 * s, '#52b788');
    b.box(0, 2.2 * s, 0, 1.3 * s, 0.7 * s, 1.3 * s, '#74c69d');
    b.box(0.5 * s, 1.5 * s, 0.4 * s, 0.9 * s, 0.8 * s, 0.9 * s, '#40916c');
    b.box(0.3 * s, 1.6 * s, 0.91 * s, 0.14 * s, 0.14 * s, 0.05, '#ff6b6b');
    b.box(-0.5 * s, 1.9 * s, 0.66 * s, 0.14 * s, 0.14 * s, 0.05, '#ff6b6b');
  });
}

export function bush(b, x, y, z, s = 1, flower = null) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.9 * s, 0.5 * s, 0.7 * s, '#52b788');
    b.box(0.1 * s, 0.4 * s, 0, 0.6 * s, 0.3 * s, 0.5 * s, '#74c69d');
    if (flower) {
      b.box(-0.2 * s, 0.45 * s, 0.33 * s, 0.1, 0.1, 0.05, flower);
      b.box(0.25 * s, 0.6 * s, 0.24 * s, 0.1, 0.1, 0.05, flower);
    }
  });
}

export function fence(b, x0, x1, y, z) {
  b.box((x0 + x1) / 2, y + 0.3, z, x1 - x0, 0.08, 0.06, '#ffffff');
  b.box((x0 + x1) / 2, y + 0.6, z, x1 - x0, 0.08, 0.06, '#ffffff');
  for (let x = x0; x <= x1 + 0.01; x += 0.5) b.box(x, y, z, 0.12, 0.85, 0.1, '#ffffff');
}

export function cloud(b, x, y, z, s = 1) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 2.4 * s, 0.6 * s, 1.2 * s, '#ffffff', { mat: 'plain' });
    b.box(-0.4 * s, 0.5 * s, 0, 1.2 * s, 0.5 * s, 1.0 * s, '#ffffff', { mat: 'plain' });
    b.box(0.5 * s, 0.4 * s, 0.1 * s, 0.9 * s, 0.45 * s, 0.9 * s, '#ffffff', { mat: 'plain' });
  });
}

// ---------- warung station bodies (static part) ----------
export function stoveBody(b, x, y, z, ry) {
  b.at(x, y, z, ry, () => {
    b.box(0, 0.92, 0, 0.9, 0.06, 0.7, '#343a40');
    b.box(0, 0.98, 0.05, 0.4, 0.03, 0.4, '#495057');
    b.box(0.3, 0.62, 0.47, 0.1, 0.1, 0.04, '#e63946');
    b.box(-0.3, 0.62, 0.47, 0.1, 0.1, 0.04, '#adb5bd');
  });
}
export function grillBody(b, x, y, z, ry) {
  b.at(x, y, z, ry, () => {
    b.box(0, 0.92, 0, 0.94, 0.16, 0.66, '#2b2d42');
    b.box(0, 1.02, 0, 0.84, 0.03, 0.56, '#ff7b00', { mat: 'glow' });
    for (let i = 0; i < 5; i++) b.box(0, 1.08, -0.24 + i * 0.12, 0.86, 0.02, 0.02, '#8d99ae');
    b.box(-0.47, 0.98, 0, 0.04, 0.1, 0.6, '#1d1e2c');
    b.box(0.47, 0.98, 0, 0.04, 0.1, 0.6, '#1d1e2c');
  });
}
export function crateBox(b, x, y, z, ry, col = '#d4a373') {
  b.at(x, y, z, ry, () => {
    b.box(0, 0.92, 0, 0.84, 0.3, 0.64, col);
    b.box(0, 0.94, 0.325, 0.86, 0.06, 0.02, '#8d5a36');
    b.box(0, 1.12, 0.325, 0.86, 0.06, 0.02, '#8d5a36');
  });
}
export function riceCooker(b, x, y, z, ry) {
  b.at(x, y, z, ry, () => {
    b.box(0, 0.92, 0, 0.62, 0.42, 0.56, '#ffc8dd');
    b.box(0, 1.34, 0, 0.58, 0.1, 0.52, '#ffafcc');
    b.box(0, 1.44, 0, 0.2, 0.06, 0.1, '#ff85a1');
    b.box(0, 1.05, 0.285, 0.2, 0.1, 0.02, '#ffffff');
    b.box(-0.05, 1.08, 0.3, 0.04, 0.04, 0.01, '#06d6a0', { mat: 'glow' });
  });
}
export function trashBin(b, x, y, z) {
  b.at(x, y, z, 0, () => {
    b.box(0, 0, 0, 0.62, 0.8, 0.62, '#2ec27e');
    b.box(0, 0.1, 0.315, 0.3, 0.3, 0.01, '#ffffff');
    b.box(0, 0.18, 0.32, 0.18, 0.12, 0.01, '#2ec27e');
  });
}
