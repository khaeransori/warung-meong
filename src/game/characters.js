import * as THREE from 'three';
import { Blocks } from '../engine/blocks.js';
import { OUTFITS } from './data.js';

export const FUR = {
  oranye: { base: '#f5a142', dark: '#d9772b', light: '#fff0d9', ear: '#ffb3a7', stripes: true },
  abu: { base: '#a6afba', dark: '#6f7985', light: '#eef1f4', ear: '#ffb3c1', stripes: true },
  putih: { base: '#f9f7f2', dark: '#ddd6ca', light: '#ffffff', ear: '#ffb3c1' },
  hitam: { base: '#34343f', dark: '#23232b', light: '#4b4b58', ear: '#ff9fb2', eye: 'yellow' },
  belang: { base: '#faf7f1', dark: '#35353f', light: '#ffffff', ear: '#ffb3c1', calico: true },
  siam: { base: '#f3e5cc', dark: '#5b3e2d', light: '#fff8ea', ear: '#8a5f45', points: true, eye: 'blue' },
};

const DARK = '#1f1a24';
const PINK = '#ff8fa3';

function outfitColor(id) {
  const o = OUTFITS.find(x => x.id === id);
  return o ? o.color : '#3d8bfd';
}
function shade(hex, k) {
  const c = new THREE.Color(hex);
  c.r = Math.min(1, c.r * k); c.g = Math.min(1, c.g * k); c.b = Math.min(1, c.b * k);
  return '#' + c.getHexString();
}

// ---------------- eyes ----------------
function addEyes(b, style = 'black', spacing = 0.17, size = 1) {
  const w = 0.11 * size, h = 0.15 * size;
  for (const s of [-1, 1]) {
    const x = s * spacing;
    if (style === 'yellow' || style === 'blue') {
      const iris = style === 'yellow' ? '#d7e65a' : '#6ec6ff';
      b.box(x, -h / 2, 0, w + 0.02, h, 0.03, iris, { mat: 'plain' });
      b.box(x, -h / 2 + 0.015, 0.012, 0.045 * size, h - 0.03, 0.03, DARK, { mat: 'plain' });
      b.box(x - 0.025, h / 2 - 0.05, 0.02, 0.035, 0.035, 0.02, '#ffffff', { mat: 'plain' });
    } else if (style === 'dot') {
      b.box(x, -0.04, 0, 0.07 * size, 0.08 * size, 0.03, DARK, { mat: 'plain' });
      b.box(x - 0.015, 0.005, 0.015, 0.025, 0.025, 0.02, '#ffffff', { mat: 'plain' });
    } else {
      b.box(x, -h / 2, 0, w, h, 0.03, DARK, { mat: 'plain' });
      b.box(x - 0.025, h / 2 - 0.055, 0.015, 0.04, 0.04, 0.02, '#ffffff', { mat: 'plain' });
      b.box(x + 0.025, -h / 2 + 0.02, 0.015, 0.02, 0.02, 0.02, '#ffffff', { mat: 'plain' });
    }
  }
}

// ---------------- hats (head-local, head top at y=0.62) ----------------
export function addHat(b, hat) {
  switch (hat) {
    case 'koki':
      b.box(0, 0.58, 0.02, 0.34, 0.14, 0.4, '#ffffff');
      b.box(0, 0.72, 0.02, 0.44, 0.22, 0.48, '#ffffff');
      b.box(0, 0.94, 0.02, 0.34, 0.08, 0.38, '#ffffff');
      b.box(0, 0.6, 0.225, 0.35, 0.03, 0.01, '#e9e9f0');
      break;
    case 'pita':
      b.box(0.02, 0.6, 0.06, 0.12, 0.12, 0.12, '#ff4f8b');
      b.box(-0.14, 0.58, 0.06, 0.2, 0.18, 0.09, '#ff6fa7', { rz: 0.35 });
      b.box(0.18, 0.58, 0.06, 0.2, 0.18, 0.09, '#ff6fa7', { rz: -0.35 });
      b.box(-0.14, 0.62, 0.1, 0.06, 0.06, 0.02, '#ffc2da', { rz: 0.35 });
      break;
    case 'topi':
      b.box(0, 0.56, -0.01, 0.84, 0.16, 0.7, '#ef476f');
      b.box(0, 0.72, -0.01, 0.64, 0.08, 0.56, '#ef476f');
      b.box(0, 0.8, -0.01, 0.1, 0.04, 0.1, '#ffffff');
      b.box(0, 0.56, 0.47, 0.64, 0.05, 0.3, '#d63a5c');
      b.box(0, 0.62, 0.345, 0.2, 0.1, 0.02, '#ffffff');
      break;
    case 'baret':
      b.box(0.05, 0.58, 0, 0.84, 0.12, 0.72, '#e63946', { rz: -0.14 });
      b.box(0.1, 0.7, 0, 0.6, 0.06, 0.54, '#e63946', { rz: -0.14 });
      b.box(0.05, 0.76, 0, 0.06, 0.08, 0.06, '#b8212f');
      break;
    case 'bunga': {
      const cols = ['#ff6fa7', '#ffd23f', '#9b6dff', '#ff8c42', '#2ec4b6', '#ff4f8b'];
      b.box(0, 0.6, 0, 0.84, 0.05, 0.7, '#5cb85c');
      const pts = [[-0.34, 0.2], [-0.12, 0.34], [0.12, 0.34], [0.34, 0.2], [0.38, -0.12], [-0.38, -0.12]];
      pts.forEach(([x, z], i) => {
        b.box(x, 0.6, z, 0.14, 0.12, 0.14, cols[i % cols.length]);
        b.box(x, 0.66, z, 0.06, 0.08, 0.06, '#fff3a3');
      });
      break;
    }
    case 'pesta': {
      const cols = ['#2ec4b6', '#ffd23f', '#2ec4b6', '#ffd23f', '#2ec4b6'];
      for (let i = 0; i < 5; i++) {
        const s = 0.4 - i * 0.075;
        b.box(0, 0.6 + i * 0.1, 0.02, s, 0.1, s, cols[i]);
      }
      b.box(0, 1.1, 0.02, 0.12, 0.12, 0.12, '#ff4f8b');
      break;
    }
    case 'kacamata':
      b.box(-0.17, 0.2, 0.36, 0.22, 0.15, 0.04, '#15151c');
      b.box(0.17, 0.2, 0.36, 0.22, 0.15, 0.04, '#15151c');
      b.box(0, 0.25, 0.36, 0.14, 0.04, 0.04, '#15151c');
      b.box(-0.2, 0.3, 0.385, 0.07, 0.03, 0.01, '#6a6a80');
      b.box(0.14, 0.3, 0.385, 0.07, 0.03, 0.01, '#6a6a80');
      b.box(-0.39, 0.25, 0.15, 0.03, 0.04, 0.4, '#15151c');
      b.box(0.39, 0.25, 0.15, 0.03, 0.04, 0.4, '#15151c');
      break;
    case 'mahkota':
      b.box(0, 0.58, 0.02, 0.5, 0.14, 0.46, '#ffcc33');
      for (const [x, z] of [[-0.2, 0.18], [0, 0.2], [0.2, 0.18], [-0.2, -0.16], [0.2, -0.16]]) b.box(x, 0.72, z, 0.09, 0.14, 0.09, '#ffcc33');
      b.box(0, 0.62, 0.25, 0.1, 0.07, 0.03, '#e63946');
      b.box(-0.16, 0.62, 0.245, 0.06, 0.06, 0.03, '#2ec4b6');
      b.box(0.16, 0.62, 0.245, 0.06, 0.06, 0.03, '#2ec4b6');
      break;
    default: break;
  }
}

// ---------------- heads ----------------
const HEAD_W = 0.8, HEAD_H = 0.62, HEAD_D = 0.66, FRONT = 0.33;

function catHead(b, e, spec) {
  const F = spec.furSpec;
  const base = F.base;
  b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, base);
  // calico patches
  if (F.calico) {
    b.box(-0.2, 0.36, 0.02, 0.42, 0.27, 0.64, '#f09a3e');
    b.box(0.26, 0.4, -0.05, 0.3, 0.23, 0.58, F.dark);
  }
  if (F.stripes) {
    for (const x of [-0.12, 0, 0.12]) b.box(x, 0.44, FRONT, 0.06, 0.16, 0.02, F.dark);
    for (const x of [-0.2, 0, 0.2]) b.box(x, HEAD_H, -0.06, 0.08, 0.015, 0.48, F.dark);
    for (const s of [-1, 1]) {
      b.box(s * 0.4, 0.3, -0.05, 0.02, 0.05, 0.3, F.dark);
      b.box(s * 0.4, 0.4, -0.05, 0.02, 0.05, 0.24, F.dark);
    }
  }
  // ears
  const earCol = F.points ? F.dark : (F.calico ? '#f09a3e' : base);
  const earCol2 = F.calico ? F.dark : earCol;
  b.box(-0.28, 0.46, -0.02, 0.25, 0.25, 0.1, earCol, { rz: Math.PI / 4 });
  b.box(0.28, 0.46, -0.02, 0.25, 0.25, 0.1, earCol2, { rz: Math.PI / 4 });
  b.box(-0.28, 0.53, 0.035, 0.13, 0.13, 0.04, F.ear, { rz: Math.PI / 4 });
  b.box(0.28, 0.53, 0.035, 0.13, 0.13, 0.04, F.ear, { rz: Math.PI / 4 });
  // muzzle
  const muz = F.points ? F.dark : F.light;
  if (F.points) b.box(0, 0.02, FRONT - 0.005, 0.5, 0.36, 0.02, shade(F.dark, 1.25));
  b.box(0, 0.08, FRONT + 0.005, 0.38, 0.16, 0.04, muz);
  b.box(0, 0.19, FRONT + 0.03, 0.1, 0.06, 0.03, F.points ? '#3b2a20' : PINK);
  b.box(0, 0.14, FRONT + 0.03, 0.02, 0.05, 0.02, DARK);
  b.box(-0.04, 0.125, FRONT + 0.03, 0.07, 0.02, 0.02, DARK);
  b.box(0.04, 0.125, FRONT + 0.03, 0.07, 0.02, 0.02, DARK);
  // cheeks
  const blush = spec.gender === 'f' ? '#ff9fb8' : '#ffc0cb';
  b.box(-0.29, 0.12, FRONT + 0.005, 0.1, 0.05, 0.02, blush);
  b.box(0.29, 0.12, FRONT + 0.005, 0.1, 0.05, 0.02, blush);
  // whiskers
  const wc = (spec.fur === 'putih' || spec.fur === 'belang' || spec.fur === 'siam') ? '#9a8f84' : '#fffaf2';
  for (const s of [-1, 1]) {
    b.box(s * 0.47, 0.12, 0.26, 0.2, 0.014, 0.014, wc, { mat: 'plain', rz: s * 0.08 });
    b.box(s * 0.47, 0.17, 0.26, 0.2, 0.014, 0.014, wc, { mat: 'plain', rz: -s * 0.08 });
  }
  // eyes (separate for blinking)
  addEyes(e, F.eye || 'black');
  if (spec.gender === 'f') {
    e.box(-0.245, 0.04, 0.005, 0.06, 0.03, 0.02, DARK, { mat: 'plain', rz: 0.6 });
    e.box(0.245, 0.04, 0.005, 0.06, 0.03, 0.02, DARK, { mat: 'plain', rz: -0.6 });
    e.box(-0.235, 0.0, 0.005, 0.05, 0.025, 0.02, DARK, { mat: 'plain', rz: 0.2 });
    e.box(0.235, 0.0, 0.005, 0.05, 0.025, 0.02, DARK, { mat: 'plain', rz: -0.2 });
    if (spec.hat !== 'pita' && spec.hat !== 'bunga' && spec.hat !== 'mahkota') {
      // small ribbon on the ear
      b.box(0.33, 0.6, 0.06, 0.08, 0.08, 0.08, '#ff4f8b');
      b.box(0.24, 0.58, 0.06, 0.12, 0.12, 0.06, '#ff6fa7', { rz: 0.4 });
      b.box(0.42, 0.58, 0.06, 0.12, 0.12, 0.06, '#ff6fa7', { rz: -0.4 });
    }
  }
}

function genericFace(b, e, o = {}) {
  addEyes(e, o.eye || 'black', o.spacing || 0.17, o.eyeSize || 1);
  if (o.blush !== false) {
    b.box(-0.29, 0.12, FRONT + 0.005, 0.1, 0.05, 0.02, '#ffb3c1');
    b.box(0.29, 0.12, FRONT + 0.005, 0.1, 0.05, 0.02, '#ffb3c1');
  }
}

const ANIMAL_HEADS = {
  anjing(b, e) {
    const c = '#c98f55', d = '#7a4b2a', l = '#f4dfc3';
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, c);
    b.box(0.18, 0.28, FRONT - 0.005, 0.26, 0.28, 0.02, l);
    b.box(-0.45, 0.08, -0.02, 0.12, 0.5, 0.3, d, { rz: 0.12 });
    b.box(0.45, 0.08, -0.02, 0.12, 0.5, 0.3, d, { rz: -0.12 });
    b.box(0, 0.02, FRONT + 0.06, 0.36, 0.2, 0.14, l);
    b.box(0, 0.16, FRONT + 0.13, 0.13, 0.08, 0.04, DARK);
    b.box(0, -0.02, FRONT + 0.12, 0.08, 0.06, 0.04, '#ff6f8f');
    genericFace(b, e, { blush: false });
  },
  kelinci(b, e) {
    const c = '#f3eeec', p = '#ffb3c8';
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, c);
    for (const s of [-1, 1]) {
      b.box(s * 0.17, 0.55, -0.05, 0.15, 0.55, 0.1, c, { rz: -s * 0.12 });
      b.box(s * 0.17, 0.62, 0.0, 0.08, 0.42, 0.03, p, { rz: -s * 0.12 });
    }
    b.box(0, 0.08, FRONT + 0.005, 0.3, 0.16, 0.04, '#ffffff');
    b.box(0, 0.18, FRONT + 0.03, 0.08, 0.05, 0.03, '#ff7fa0');
    b.box(0, 0.0, FRONT + 0.03, 0.1, 0.08, 0.02, '#ffffff');
    b.box(0, 0.0, FRONT + 0.035, 0.01, 0.08, 0.02, '#d9d0cc');
    genericFace(b, e);
  },
  panda(b, e) {
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, '#fafafa');
    b.box(-0.3, 0.52, 0, 0.2, 0.2, 0.14, DARK);
    b.box(0.3, 0.52, 0, 0.2, 0.2, 0.14, DARK);
    b.box(-0.17, 0.16, FRONT - 0.005, 0.2, 0.24, 0.02, '#2a2a33');
    b.box(0.17, 0.16, FRONT - 0.005, 0.2, 0.24, 0.02, '#2a2a33');
    b.box(0, 0.06, FRONT + 0.02, 0.3, 0.14, 0.06, '#ffffff');
    b.box(0, 0.14, FRONT + 0.05, 0.1, 0.06, 0.03, DARK);
    genericFace(b, e, { eye: 'dot', blush: true });
    e.box(-0.17, -0.03, -0.004, 0.09, 0.1, 0.02, '#ffffff', { mat: 'plain' });
    e.box(0.17, -0.03, -0.004, 0.09, 0.1, 0.02, '#ffffff', { mat: 'plain' });
  },
  beruang(b, e) {
    const c = '#9b6a42', l = '#d9b48c';
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, c);
    b.box(-0.3, 0.52, 0, 0.2, 0.2, 0.14, c);
    b.box(0.3, 0.52, 0, 0.2, 0.2, 0.14, c);
    b.box(-0.3, 0.56, 0.06, 0.1, 0.1, 0.04, l);
    b.box(0.3, 0.56, 0.06, 0.1, 0.1, 0.04, l);
    b.box(0, 0.03, FRONT + 0.04, 0.34, 0.2, 0.1, l);
    b.box(0, 0.16, FRONT + 0.09, 0.12, 0.07, 0.03, DARK);
    genericFace(b, e);
  },
  bebek(b, e) {
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, '#ffd84a');
    b.box(0, 0.62, 0.05, 0.08, 0.1, 0.08, '#ffd84a');
    b.box(0.05, 0.66, 0.05, 0.06, 0.1, 0.06, '#ffd84a', { rz: -0.4 });
    b.box(0, 0.05, FRONT + 0.1, 0.4, 0.07, 0.24, '#ff9a2e');
    b.box(0, 0.11, FRONT + 0.08, 0.36, 0.06, 0.2, '#ffab45');
    genericFace(b, e, { spacing: 0.19 });
  },
  babi(b, e) {
    const c = '#ffb6c6';
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, c);
    b.box(-0.27, 0.54, 0.05, 0.18, 0.18, 0.08, '#ff9ab2', { rz: Math.PI / 4 });
    b.box(0.27, 0.54, 0.05, 0.18, 0.18, 0.08, '#ff9ab2', { rz: Math.PI / 4 });
    b.box(0, 0.06, FRONT + 0.05, 0.28, 0.18, 0.1, '#ff97ae');
    b.box(-0.06, 0.12, FRONT + 0.1, 0.05, 0.07, 0.02, '#b8586f');
    b.box(0.06, 0.12, FRONT + 0.1, 0.05, 0.07, 0.02, '#b8586f');
    genericFace(b, e, { blush: false });
  },
  monyet(b, e) {
    const c = '#8a5a3c', f = '#f2d2ad';
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, c);
    b.box(0, 0.02, FRONT - 0.005, 0.58, 0.46, 0.03, f);
    b.box(-0.47, 0.22, 0, 0.14, 0.2, 0.14, f);
    b.box(0.47, 0.22, 0, 0.14, 0.2, 0.14, f);
    b.box(0, 0.02, FRONT + 0.03, 0.34, 0.14, 0.06, f);
    b.box(-0.04, 0.1, FRONT + 0.065, 0.04, 0.04, 0.02, '#6b4128');
    b.box(0.04, 0.1, FRONT + 0.065, 0.04, 0.04, 0.02, '#6b4128');
    b.box(0, 0.04, FRONT + 0.065, 0.14, 0.02, 0.02, '#6b4128');
    genericFace(b, e, { blush: false });
  },
  katak(b, e) {
    const c = '#6cc24a';
    b.box(0, 0, 0, HEAD_W + 0.08, HEAD_H - 0.08, HEAD_D, c);
    for (const s of [-1, 1]) {
      b.box(s * 0.22, 0.44, 0.08, 0.24, 0.22, 0.24, c);
      b.box(s * 0.22, 0.47, 0.205, 0.17, 0.16, 0.02, '#ffffff');
      b.box(s * 0.22, 0.49, 0.22, 0.08, 0.1, 0.02, DARK);
    }
    b.box(0, 0.14, FRONT + 0.005, 0.46, 0.035, 0.02, '#2f6b22');
    b.box(-0.32, 0.18, FRONT + 0.005, 0.1, 0.06, 0.02, '#ff9fb2');
    b.box(0.32, 0.18, FRONT + 0.005, 0.1, 0.06, 0.02, '#ff9fb2');
  },
  rubah(b, e) {
    const c = '#f07b2c', w = '#fff6ea';
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, c);
    b.box(-0.25, 0.46, -0.02, 0.26, 0.26, 0.1, c, { rz: Math.PI / 4 });
    b.box(0.25, 0.46, -0.02, 0.26, 0.26, 0.1, c, { rz: Math.PI / 4 });
    b.box(-0.25, 0.68, -0.02, 0.09, 0.09, 0.11, '#3a2a22', { rz: Math.PI / 4 });
    b.box(0.25, 0.68, -0.02, 0.09, 0.09, 0.11, '#3a2a22', { rz: Math.PI / 4 });
    b.box(0, 0, FRONT - 0.004, 0.62, 0.22, 0.02, w);
    b.box(0, 0.02, FRONT + 0.06, 0.3, 0.16, 0.12, w);
    b.box(0, 0.12, FRONT + 0.12, 0.1, 0.06, 0.03, DARK);
    genericFace(b, e);
  },
  singa(b, e) {
    const c = '#e9b04c', m = '#b8652a';
    b.box(0, -0.12, -0.08, 1.08, 0.88, 0.5, m);
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, c);
    b.box(-0.28, 0.54, 0.05, 0.16, 0.14, 0.1, c);
    b.box(0.28, 0.54, 0.05, 0.16, 0.14, 0.1, c);
    b.box(0, 0.04, FRONT + 0.04, 0.34, 0.18, 0.1, '#fbe3b5');
    b.box(0, 0.16, FRONT + 0.09, 0.12, 0.06, 0.03, '#6b3f23');
    genericFace(b, e);
    // crown
    b.box(0, 0.6, 0.02, 0.46, 0.12, 0.42, '#ffcc33');
    for (const [x, z] of [[-0.18, 0.17], [0, 0.19], [0.18, 0.17]]) b.box(x, 0.72, z, 0.08, 0.13, 0.08, '#ffcc33');
    b.box(0, 0.63, 0.23, 0.08, 0.06, 0.03, '#e63946');
  },
  pinguin(b, e) {
    b.box(0, 0, 0, HEAD_W, HEAD_H, HEAD_D, '#2b2d3a');
    b.box(0, 0, FRONT - 0.004, 0.62, 0.48, 0.02, '#ffffff');
    b.box(0, 0.06, FRONT + 0.06, 0.2, 0.08, 0.14, '#ff9a2e');
    genericFace(b, e);
    // glasses
    b.box(-0.17, 0.18, FRONT + 0.035, 0.2, 0.18, 0.02, '#1b1b22', { skip: ['pz'] });
    b.box(0.17, 0.18, FRONT + 0.035, 0.2, 0.18, 0.02, '#1b1b22', { skip: ['pz'] });
    b.box(-0.17, 0.33, FRONT + 0.045, 0.22, 0.03, 0.02, '#1b1b22');
    b.box(0.17, 0.33, FRONT + 0.045, 0.22, 0.03, 0.02, '#1b1b22');
    b.box(-0.17, 0.18, FRONT + 0.045, 0.22, 0.03, 0.02, '#1b1b22');
    b.box(0.17, 0.18, FRONT + 0.045, 0.22, 0.03, 0.02, '#1b1b22');
    // little top hat
    b.box(0, 0.62, 0, 0.5, 0.04, 0.46, '#1b1b22');
    b.box(0, 0.66, 0, 0.34, 0.28, 0.32, '#1b1b22');
    b.box(0, 0.68, 0, 0.35, 0.06, 0.33, '#e63946');
  },
};

const ANIMAL_BODY = {
  anjing: { fur: '#c98f55', light: '#f4dfc3', tail: 'up' },
  kelinci: { fur: '#f3eeec', light: '#ffffff', tail: 'puff' },
  panda: { fur: '#2a2a33', light: '#fafafa', tail: 'puff', lightTail: true },
  beruang: { fur: '#9b6a42', light: '#d9b48c', tail: 'puff' },
  bebek: { fur: '#ffd84a', light: '#ffe78a', tail: 'puff', feet: '#ff9a2e' },
  babi: { fur: '#ffb6c6', light: '#ffc9d6', tail: 'curl' },
  monyet: { fur: '#8a5a3c', light: '#f2d2ad', tail: 'long' },
  katak: { fur: '#6cc24a', light: '#a8e07f', tail: 'none' },
  rubah: { fur: '#f07b2c', light: '#fff6ea', tail: 'bushy' },
  singa: { fur: '#e9b04c', light: '#fbe3b5', tail: 'lion' },
  pinguin: { fur: '#2b2d3a', light: '#ffffff', tail: 'none', feet: '#ff9a2e' },
};

const SHIRTS = ['#ef476f', '#3d8bfd', '#2ec27e', '#ffc93c', '#9b6dff', '#ff8c42', '#06d6a0', '#118ab2', '#f78c6b', '#c77dff'];
const PANTS = ['#3a4a6b', '#5a4636', '#2f4858', '#6c4f8c', '#355c4f', '#474760'];

// ---------------- generic character ----------------
function buildCharacter(spec) {
  const root = new THREE.Group();
  const parts = {};
  const fur = spec.furCol, light = spec.lightCol;
  const shirt = spec.shirt, pants = spec.pants;
  const dress = spec.gender === 'f' && spec.species === 'cat';

  // legs
  for (const s of [-1, 1]) {
    const b = new Blocks();
    if (!dress) b.box(0, -0.2, 0, 0.22, 0.2, 0.24, pants);
    b.box(0, -0.42, 0, 0.21, dress ? 0.42 : 0.22, 0.23, fur);
    b.box(0, -0.42, 0.03, 0.22, 0.07, 0.22, spec.feet || light);
    const leg = new THREE.Group();
    leg.position.set(s * 0.13, 0.42, 0);
    const m = b.mesh({ cast: true });
    leg.add(m);
    root.add(leg);
    parts[s < 0 ? 'legL' : 'legR'] = leg;
  }
  // body
  const body = new THREE.Group();
  body.position.y = 0.42;
  root.add(body);
  parts.body = body;
  {
    const b = new Blocks();
    b.box(0, 0, 0, 0.56, 0.5, 0.36, shirt);
    if (dress) {
      b.box(0, -0.08, 0, 0.7, 0.22, 0.46, shirt);
      b.box(0, -0.09, 0, 0.72, 0.04, 0.48, shade(shirt, 0.8));
      b.box(0, 0.36, 0.185, 0.2, 0.08, 0.02, '#ffffff');
    } else {
      b.box(0, 0, 0, 0.58, 0.12, 0.38, pants);
      b.box(0, 0.4, 0.185, 0.22, 0.06, 0.02, '#ffffff');
    }
    if (spec.apron) {
      b.box(0, -0.02, 0.19, 0.44, 0.42, 0.03, '#ffffff');
      b.box(0, 0.08, 0.205, 0.18, 0.1, 0.02, '#e9edf2');
      b.box(0, 0.42, 0.185, 0.3, 0.07, 0.03, '#ffffff');
      b.box(0, 0.18, 0.19, 0.58, 0.05, 0.37, '#ffffff');
    }
    if (spec.bowtie) {
      b.box(-0.07, 0.38, 0.19, 0.12, 0.1, 0.04, '#e63946');
      b.box(0.07, 0.38, 0.19, 0.12, 0.1, 0.04, '#e63946');
      b.box(0, 0.39, 0.2, 0.05, 0.07, 0.04, '#b8212f');
    }
    if (spec.belly) b.box(0, 0.02, 0.185, 0.36, 0.36, 0.02, spec.belly);
    body.add(b.mesh({ cast: true }));
  }
  // head
  const head = new THREE.Group();
  head.position.y = 0.48;
  body.add(head);
  parts.head = head;
  {
    const b = new Blocks();
    const e = new Blocks();
    spec.headFn(b, e, spec);
    if (spec.hat) addHat(b, spec.hat);
    head.add(b.build({ cast: true }));
    const eyes = e.build();
    eyes.position.set(0, 0.26, FRONT + 0.012);
    head.add(eyes);
    parts.eyes = eyes;
  }
  // arms
  for (const s of [-1, 1]) {
    const b = new Blocks();
    b.box(0, -0.2, 0, 0.17, 0.22, 0.19, spec.sleeve || shirt);
    b.box(0, -0.42, 0, 0.155, 0.23, 0.175, fur);
    b.box(0, -0.44, 0, 0.165, 0.07, 0.185, light);
    const arm = new THREE.Group();
    arm.position.set(s * 0.365, 0.44, 0);
    arm.add(b.mesh({ cast: true }));
    body.add(arm);
    parts[s < 0 ? 'armL' : 'armR'] = arm;
  }
  // tail
  parts.tail = [];
  if (spec.tail !== 'none') {
    let parent = body;
    const tailType = spec.tail || 'cat';
    const segs = tailType === 'cat' || tailType === 'long' || tailType === 'lion' ? 3 : 1;
    for (let i = 0; i < segs; i++) {
      const g = new THREE.Group();
      const b = new Blocks();
      let col = spec.tailCol || fur;
      if (tailType === 'cat' && spec.furSpec) {
        const F = spec.furSpec;
        if (F.stripes && i === 1) col = F.dark;
        if (F.points) col = F.dark;
        if (F.calico) col = i === 2 ? F.dark : '#f09a3e';
      }
      if (tailType === 'puff') b.box(0, -0.08, -0.06, 0.16, 0.16, 0.14, spec.lightTail ? light : (spec.tailCol || light));
      else if (tailType === 'curl') { b.box(0, -0.03, -0.05, 0.06, 0.06, 0.12, fur); b.box(0, 0.02, -0.1, 0.06, 0.08, 0.06, fur); }
      else if (tailType === 'bushy') { b.box(0, -0.08, -0.2, 0.2, 0.2, 0.4, fur); b.box(0, -0.08, -0.42, 0.18, 0.18, 0.08, '#fff6ea'); }
      else if (tailType === 'up') b.box(0, -0.04, -0.12, 0.08, 0.08, 0.26, fur);
      else {
        b.box(0, -0.05, -0.11, 0.1, 0.1, 0.22, col);
        if (tailType === 'lion' && i === segs - 1) b.box(0, -0.08, -0.22, 0.16, 0.16, 0.12, '#b8652a');
      }
      g.add(b.mesh({ cast: true }));
      if (i === 0) g.position.set(0, 0.06, -0.18);
      else g.position.set(0, 0, -0.2);
      g.rotation.x = tailType === 'up' ? 0.9 : tailType === 'bushy' ? 0.35 : 0.55;
      parent.add(g);
      parts.tail.push(g);
      parent = g;
    }
  }
  // carry anchor
  const anchor = new THREE.Group();
  anchor.position.set(0, 0.2, 0.46);
  body.add(anchor);
  parts.anchor = anchor;

  const ch = {
    root, parts, t: Math.random() * 10, phase: 0, blink: 2 + Math.random() * 3, blinkT: 0,
    cur: { legL: 0, legR: 0, armL: 0, armR: 0, bodyY: 0.42, bodyRX: 0, headRX: 0, headRY: 0, headRZ: 0, hop: 0 },
    held: null, spec,
  };
  return ch;
}

export function buildCat(c, opts = {}) {
  const F = FUR[c.fur] || FUR.oranye;
  const spec = {
    species: 'cat', gender: c.gender, fur: c.fur, furSpec: F,
    furCol: F.points ? F.dark : F.base, lightCol: F.points ? shade(F.dark, 1.2) : F.light,
    shirt: outfitColor(c.outfit), pants: c.gender === 'f' ? outfitColor(c.outfit) : '#34405e',
    apron: opts.apron !== false, hat: c.hat === 'none' ? null : c.hat,
    headFn: catHead, tail: 'cat',
  };
  if (F.points) spec.tailCol = F.dark;
  const ch = buildCharacter(spec);
  ch.root.scale.setScalar(opts.scale || 1);
  return ch;
}

export function buildAnimal(kind, rnd = Math.random) {
  const B = ANIMAL_BODY[kind] || ANIMAL_BODY.anjing;
  const spec = {
    species: kind, gender: 'm', furCol: B.fur, lightCol: B.light, feet: B.feet,
    shirt: SHIRTS[Math.floor(rnd() * SHIRTS.length)], pants: PANTS[Math.floor(rnd() * PANTS.length)],
    headFn: ANIMAL_HEADS[kind] || ANIMAL_HEADS.anjing, tail: B.tail, lightTail: B.lightTail,
  };
  if (kind === 'singa') { spec.shirt = '#7b2cbf'; spec.pants = '#3c096c'; spec.sleeve = '#9d4edd'; }
  if (kind === 'pinguin') { spec.shirt = '#2b2d3a'; spec.belly = '#ffffff'; spec.pants = '#2b2d3a'; spec.bowtie = true; }
  if (kind === 'panda') { spec.shirt = rnd() < 0.5 ? '#2ec27e' : '#ffc93c'; }
  return buildCharacter(spec);
}

// ---------------- animation ----------------
// s: { speed 0..1, carry bool, pose: 'stand'|'sit'|'eat'|'happy'|'angry'|'wave'|'sleep'|'cheer'|'stir'|'scratch' }
export function animateChar(ch, dt, s = {}) {
  const P = ch.parts;
  ch.t += dt;
  const t = ch.t;
  const pose = s.pose || 'stand';
  const sp = Math.min(1, s.speed || 0);
  let legL = 0, legR = 0, armL = 0, armR = 0, armLz = 0, armRz = 0;
  let bodyY = 0.42, bodyRX = 0, headRX = 0, headRY = 0, headRZ = 0, hop = 0;

  if (sp > 0.05) ch.phase += dt * (7 + 6 * sp);
  const sw = Math.sin(ch.phase);
  legL = sw * 0.8 * sp; legR = -legL;
  armL = -sw * 0.7 * sp; armR = sw * 0.7 * sp;
  bodyY = 0.42 + Math.abs(Math.cos(ch.phase)) * 0.05 * sp + Math.sin(t * 2.2) * 0.006;
  bodyRX = 0.06 * sp;
  headRZ = Math.sin(t * 1.3) * 0.04 * (1 - sp);
  headRX = Math.sin(t * 0.9) * 0.03;

  switch (pose) {
    case 'sit':
      legL = legR = -1.45; bodyY = 0.42; armL = armR = -0.35;
      headRY = Math.sin(t * 0.7) * 0.2;
      break;
    case 'eat':
      legL = legR = -1.45;
      armL = -1.6 + Math.sin(t * 9) * 0.35; armR = -1.6 - Math.sin(t * 9) * 0.35;
      headRX = 0.15 + Math.sin(t * 9) * 0.08;
      break;
    case 'happy':
      hop = Math.abs(Math.sin(t * 7)) * 0.22;
      armL = armR = -2.7; armLz = -0.3; armRz = 0.3;
      headRZ = Math.sin(t * 7) * 0.12;
      if (s.seated) { legL = legR = -1.45; hop *= 0.6; }
      break;
    case 'cheer':
      hop = Math.abs(Math.sin(t * 6)) * 0.3;
      armL = -2.9 + Math.sin(t * 12) * 0.2; armR = -2.9 - Math.sin(t * 12) * 0.2;
      armLz = -0.4; armRz = 0.4;
      break;
    case 'angry':
      armL = armR = 0.15; armLz = -0.35; armRz = 0.35;
      headRY = Math.sin(t * 22) * 0.18; headRX = 0.12;
      if (s.seated) { legL = legR = -1.45; }
      break;
    case 'wave':
      armR = -2.8; armRz = 0.3 + Math.sin(t * 10) * 0.35;
      headRZ = 0.1;
      break;
    case 'stir':
      armL = -1.3 + Math.sin(t * 16) * 0.25; armR = -1.3 - Math.sin(t * 16) * 0.25;
      headRX = 0.25;
      break;
    case 'scratch':
      armL = -2.4 + Math.sin(t * 18) * 0.5; armR = -2.4 - Math.sin(t * 18) * 0.5;
      headRX = -0.2;
      break;
    case 'sleep':
      legL = legR = 0; armL = armR = -0.2;
      headRX = 0.1;
      break;
    default: break;
  }
  if (s.carry && pose !== 'eat') {
    armL = armR = -1.3 + Math.sin(ch.phase) * 0.06 * sp;
    armLz = armRz = 0;
  }

  const k = 1 - Math.exp(-dt * 16);
  const c = ch.cur;
  c.legL += (legL - c.legL) * k; c.legR += (legR - c.legR) * k;
  c.armL += (armL - c.armL) * k; c.armR += (armR - c.armR) * k;
  c.armLz = (c.armLz || 0) + (armLz - (c.armLz || 0)) * k;
  c.armRz = (c.armRz || 0) + (armRz - (c.armRz || 0)) * k;
  c.bodyY += (bodyY - c.bodyY) * k; c.bodyRX += (bodyRX - c.bodyRX) * k;
  c.headRX += (headRX - c.headRX) * k; c.headRY += (headRY - c.headRY) * k; c.headRZ += (headRZ - c.headRZ) * k;
  c.hop += (hop - c.hop) * Math.min(1, k * 1.5);

  P.legL.rotation.x = c.legL; P.legR.rotation.x = c.legR;
  P.armL.rotation.x = c.armL; P.armR.rotation.x = c.armR;
  P.armL.rotation.z = c.armLz; P.armR.rotation.z = c.armRz;
  P.body.position.y = c.bodyY + c.hop;
  P.legL.position.y = 0.42 + c.hop; P.legR.position.y = 0.42 + c.hop;
  P.body.rotation.x = c.bodyRX;
  P.head.rotation.set(c.headRX, c.headRY, c.headRZ);

  // tail sway
  const tl = P.tail;
  for (let i = 0; i < tl.length; i++) {
    tl[i].rotation.y = Math.sin(t * 2.6 - i * 0.7) * (0.25 + i * 0.1) * (pose === 'happy' ? 2 : 1);
  }
  // blink
  ch.blink -= dt;
  if (ch.blink < 0) { ch.blinkT = 0.13; ch.blink = 2 + Math.random() * 3.5; }
  if (ch.blinkT > 0) ch.blinkT -= dt;
  const closed = pose === 'sleep' || ch.blinkT > 0;
  P.eyes.scale.y = closed ? 0.12 : (pose === 'happy' || pose === 'cheer' ? 0.55 : 1);
}

export function setHeld(ch, model) {
  const a = ch.parts.anchor;
  if (ch.held) { a.remove(ch.held); ch.held = null; }
  if (model) { a.add(model); ch.held = model; }
}

export function disposeChar(ch) {
  ch.root.traverse(o => { if (o.geometry) o.geometry.dispose(); });
}
