import * as THREE from 'three';
import { Blocks } from '../engine/blocks.js';
import { RECIPES, INGREDIENTS } from './data.js';

function plate(b, col = '#ffffff') {
  b.box(0, 0, 0, 0.4, 0.02, 0.4, '#e3e3ea');
  b.box(0, 0.02, 0, 0.56, 0.03, 0.56, col);
  b.box(0, 0.05, 0, 0.56, 0.005, 0.56, col, { skip: ['ny'] });
}
function glass(b, liquid, top, straw) {
  b.box(0, 0.005, 0, 0.19, 0.29, 0.19, liquid);
  b.box(0, 0.295, 0, 0.19, 0.02, 0.19, top);
  b.box(-0.04, 0.27, 0.03, 0.075, 0.075, 0.075, '#eefcff');
  b.box(0.045, 0.28, -0.03, 0.065, 0.065, 0.065, '#eefcff');
  b.box(0.05, 0.2, 0.02, 0.035, 0.36, 0.035, straw, { rz: -0.2 });
  b.box(0, 0, 0, 0.23, 0.36, 0.23, '#e6f7ff', { mat: 'glass' });
}
function egg(b, x, z, s = 1) {
  b.box(x, 0, z, 0.12 * s, 0.05 * s, 0.11 * s, '#fff1dc');
  b.box(x, 0.05 * s, z, 0.15 * s, 0.09 * s, 0.13 * s, '#fff1dc');
  b.box(x, 0.14 * s, z, 0.11 * s, 0.06 * s, 0.1 * s, '#fff1dc');
}
function skewer(b, z, chunk, char) {
  b.box(0, 0.05, z, 0.56, 0.022, 0.022, '#d9b27c');
  for (const x of [-0.12, 0, 0.12]) {
    b.box(x, 0.015, z, 0.09, 0.09, 0.09, chunk);
    if (char) b.box(x, 0.105, z, 0.05, 0.005, 0.09, char);
  }
}

const BUILD = {
  esteh(b) { glass(b, '#b8631c', '#d9923e', '#ff4d6d'); },
  esjeruk(b) {
    glass(b, '#ffa31a', '#ffc24d', '#2ec27e');
    b.box(0.13, 0.24, 0, 0.03, 0.13, 0.13, '#ff9a1f');
    b.box(0.135, 0.255, 0, 0.025, 0.1, 0.1, '#ffd98a');
  },
  nasgor(b) {
    plate(b);
    b.box(0, 0.05, 0, 0.38, 0.08, 0.34, '#d98f3f');
    b.box(0, 0.13, 0, 0.28, 0.07, 0.25, '#cf8637');
    b.box(0.02, 0.2, 0, 0.16, 0.03, 0.14, '#d98f3f');
    for (const [x, z, c] of [[-0.12, 0.1, '#5cb85c'], [0.1, -0.08, '#e63946'], [0.14, 0.12, '#5cb85c'], [-0.08, -0.12, '#ff9f1c']]) b.box(x, 0.13, z, 0.04, 0.04, 0.04, c);
    b.box(-0.02, 0.215, 0.03, 0.21, 0.025, 0.18, '#fffdf5', { ry: 0.3 });
    b.box(-0.02, 0.24, 0.03, 0.08, 0.03, 0.08, '#ffb319');
    b.box(-0.2, 0.05, 0.17, 0.09, 0.025, 0.09, '#8fd16a');
    b.box(-0.2, 0.075, 0.17, 0.06, 0.006, 0.06, '#e9f7d0');
    b.box(0.18, 0.05, -0.16, 0.16, 0.025, 0.13, '#fff0c8', { ry: 0.5 });
  },
  miegor(b) {
    plate(b);
    b.box(0, 0.05, 0, 0.4, 0.08, 0.36, '#e7b14a');
    b.box(0, 0.13, 0, 0.3, 0.07, 0.27, '#e0a843');
    for (let i = 0; i < 6; i++) b.box(-0.13 + i * 0.05, 0.2, 0, 0.025, 0.02, 0.26, '#cf9533', { ry: (i % 2 ? 0.25 : -0.25) });
    for (const [x, z] of [[-0.14, 0.12], [0.12, -0.1], [0.08, 0.14]]) b.box(x, 0.13, z, 0.07, 0.03, 0.05, '#4caf50', { ry: x * 5 });
    for (const [x, z] of [[-0.05, -0.12], [0.15, 0.03], [-0.15, -0.02]]) b.box(x, 0.14, z, 0.05, 0.03, 0.05, '#ffe066');
    b.box(0.19, 0.05, -0.17, 0.15, 0.025, 0.12, '#fff0c8', { ry: -0.4 });
  },
  sate(b) {
    b.box(0, 0, 0, 0.6, 0.025, 0.46, '#4caf50');
    b.box(0, 0.025, 0, 0.56, 0.005, 0.03, '#81c784');
    for (const z of [-0.12, 0, 0.12]) skewer(b, z, '#8a4b22', '#5a2e12');
    b.box(0.02, 0.025, 0.19, 0.32, 0.035, 0.07, '#a8672e');
    b.box(0.02, 0.06, 0.19, 0.2, 0.01, 0.04, '#c27d3a');
  },
  bakso(b) {
    b.box(0, 0, 0, 0.3, 0.05, 0.3, '#d8d8e2');
    b.box(0, 0.05, 0, 0.46, 0.15, 0.46, '#ffffff');
    b.box(0, 0.15, 0, 0.465, 0.025, 0.465, '#e63946');
    b.box(0, 0.2, 0, 0.4, 0.004, 0.4, '#d9a45f');
    for (const [x, z] of [[-0.09, 0.05], [0.08, 0.08], [0.02, -0.1]]) b.box(x, 0.16, z, 0.12, 0.1, 0.12, '#a08670');
    for (const [x, z] of [[0.12, -0.08], [-0.12, -0.1]]) b.box(x, 0.2, z, 0.1, 0.02, 0.05, '#f2cf6a', { ry: x * 4 });
    for (const [x, z] of [[-0.02, 0.14], [0.14, 0.02], [-0.14, -0.02], [0.05, -0.02]]) b.box(x, 0.2, z, 0.03, 0.02, 0.03, '#5cb85c');
  },
  pisgor(b) {
    plate(b);
    for (const [x, z, r] of [[-0.1, -0.08, 0.3], [0.08, 0.02, -0.2], [-0.04, 0.12, 0.1]]) {
      b.box(x, 0.05, z, 0.28, 0.08, 0.11, '#e8a53a', { ry: r });
      b.box(x, 0.13, z, 0.2, 0.02, 0.07, '#f5c56b', { ry: r });
    }
    for (const [x, z] of [[0.12, -0.14], [-0.16, 0.06], [0.16, 0.14]]) b.box(x, 0.05, z, 0.03, 0.02, 0.03, '#ffffff');
  },
  gosong(b) {
    plate(b, '#e2ded6');
    b.box(0, 0.05, 0, 0.34, 0.1, 0.3, '#2a2522');
    b.box(0.03, 0.15, -0.02, 0.22, 0.08, 0.2, '#3b3431');
    b.box(-0.08, 0.15, 0.08, 0.08, 0.06, 0.08, '#1d1917');
    b.box(0.1, 0.05, 0.14, 0.08, 0.05, 0.08, '#57504b');
  },
  // ingredients
  nasi(b) {
    b.box(0, 0, 0, 0.2, 0.04, 0.2, '#5aa9e6');
    b.box(0, 0.04, 0, 0.32, 0.12, 0.32, '#7cc6fe');
    b.box(0, 0.12, 0, 0.33, 0.025, 0.33, '#ffffff');
    b.box(0, 0.16, 0, 0.26, 0.06, 0.26, '#ffffff');
    b.box(0, 0.22, 0, 0.16, 0.04, 0.16, '#ffffff');
  },
  telur(b) { egg(b, -0.08, 0.02); egg(b, 0.09, -0.03, 0.95); },
  mie(b) {
    b.box(0, 0, 0, 0.32, 0.11, 0.26, '#f2cf6a');
    for (let i = 0; i < 5; i++) b.box(-0.12 + i * 0.06, 0.11, 0, 0.025, 0.015, 0.24, '#dcaf4c', { ry: i % 2 ? 0.15 : -0.15 });
    b.box(0, 0.03, 0.131, 0.33, 0.05, 0.005, '#e63946');
  },
  pisang(b) {
    for (const z of [-0.055, 0.055]) {
      for (let i = 0; i < 5; i++) {
        const x = -0.16 + i * 0.08;
        const y = Math.pow(i - 2, 2) * 0.018;
        b.box(x, y, z, 0.09, 0.075, 0.09, '#ffd93d', { rz: (i - 2) * -0.28 });
      }
      b.box(0.2, 0.08, z, 0.03, 0.05, 0.03, '#6b4f2a');
    }
    b.box(-0.2, 0.08, 0, 0.05, 0.08, 0.17, '#7a8f3a');
  },
  bakso_raw(b) {
    b.box(0, 0, 0, 0.44, 0.03, 0.36, '#e8e8f0');
    for (const [x, z] of [[-0.1, -0.07], [0.1, -0.07], [-0.1, 0.08], [0.1, 0.08]]) b.box(x, 0.03, z, 0.13, 0.11, 0.13, '#b9a592');
  },
  ayam(b) {
    for (const z of [-0.06, 0.06]) skewer(b, z, '#f4a3a0', null);
  },
  jeruk(b) {
    for (const [x, s] of [[-0.1, 1], [0.1, 0.9]]) {
      b.box(x, 0, 0, 0.18 * s, 0.17 * s, 0.18 * s, '#ff9a1f');
      b.box(x, 0.17 * s, 0, 0.03, 0.03, 0.03, '#6b4f2a');
      b.box(x + 0.04, 0.17 * s, 0, 0.08, 0.02, 0.05, '#4caf50', { rz: 0.3 });
    }
  },
  // misc
  kotor(b) {
    plate(b, '#ece8df');
    for (const [x, z, c] of [[-0.1, 0.05, '#c9a26b'], [0.08, -0.1, '#d98f3f'], [0.12, 0.12, '#a08670'], [-0.05, -0.05, '#8a4b22']]) b.box(x, 0.05, z, 0.05, 0.015, 0.05, c);
    b.box(0.02, 0.055, 0.02, 0.36, 0.02, 0.03, '#b8bcc6', { ry: 0.7 });
  },
  ikan(b) {
    plate(b, '#fff7ec');
    b.box(0, 0.05, 0, 0.3, 0.08, 0.14, '#ff9f5a');
    b.box(-0.03, 0.13, 0, 0.18, 0.03, 0.1, '#ffb27a');
    b.box(0.2, 0.05, 0, 0.12, 0.1, 0.16, '#ff8a3d', { ry: 0 });
    b.box(-0.1, 0.09, 0.071, 0.03, 0.03, 0.01, '#1f1a24');
    b.box(0.02, 0.06, 0.18, 0.08, 0.02, 0.08, '#8fd16a');
    b.box(-0.18, 0.05, -0.16, 0.07, 0.03, 0.07, '#ffe066');
  },
};

export function itemName(id) {
  if (RECIPES[id]) return RECIPES[id].name;
  if (id === 'bakso_raw') return 'Bola Bakso';
  if (INGREDIENTS[id]) return INGREDIENTS[id].name;
  if (id === 'gosong') return 'Gosong';
  return id;
}

export function buildItem(id) {
  const b = new Blocks();
  const fn = BUILD[id] || BUILD.gosong;
  fn(b);
  const g = b.build({ cast: true });
  g.userData.itemId = id;
  return g;
}

// ---------------- icon rendering (separate tiny renderer) ----------------
let iconR = null;
export function iconRenderer() {
  if (!iconR) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    iconR = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    iconR.setPixelRatio(1);
    iconR.setSize(128, 128, false);
    iconR.outputColorSpace = THREE.SRGBColorSpace;
  }
  return iconR;
}
export function disposeIconRenderer() {
  if (iconR) { iconR.dispose(); iconR.forceContextLoss(); iconR = null; }
}

const ICON_DIR = new THREE.Vector3(0.75, 1.0, 1.35).normalize();
export function renderIcon(obj, opts = {}) {
  const size = opts.size || 128;
  const r = iconRenderer();
  r.setSize(size, size, false);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f86, 1.9));
  const d = new THREE.DirectionalLight(0xffffff, 1.6);
  d.position.set(2, 4, 3);
  scene.add(d);
  scene.add(obj);
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const cam = new THREE.PerspectiveCamera(opts.fov || 28, 1, 0.01, 100);
  const dir = opts.dir || ICON_DIR;
  let dist = sphere.radius / Math.sin(THREE.MathUtils.degToRad((opts.fov || 28) / 2));
  const look = sphere.center.clone();
  // tighten the framing using the projected bounding box corners
  const corners = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z));
  const fill = 0.86 / (opts.zoom || 1);
  for (let it = 0; it < 4; it++) {
    cam.position.copy(look).addScaledVector(dir, dist);
    cam.lookAt(look);
    cam.updateMatrixWorld();
    let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
    for (const c of corners) { const v = c.clone().project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    const ext = Math.max(x1 - x0, y1 - y0) / 2;
    // recentre: move the look point by the NDC offset converted to world units
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const halfH = Math.tan(THREE.MathUtils.degToRad((opts.fov || 28) / 2)) * dist;
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
    look.addScaledVector(right, cx * halfH).addScaledVector(up, cy * halfH);
    dist *= ext / fill;
  }
  cam.position.copy(look).addScaledVector(dir, dist);
  cam.lookAt(look);
  r.setClearColor(0x000000, 0);
  r.clear();
  r.render(scene, cam);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  c.getContext('2d').drawImage(r.domElement, 0, 0);
  scene.remove(obj);
  return c;
}

export const ICONS = {};     // id -> dataURL
export const ICON_CANVAS = {}; // id -> canvas

export function makeItemIcons() {
  const ids = [...Object.keys(BUILD)];
  for (const id of ids) {
    const obj = buildItem(id);
    const c = renderIcon(obj);
    ICON_CANVAS[id] = c;
    ICONS[id] = c.toDataURL();
    obj.traverse(o => o.geometry && o.geometry.dispose());
  }
}
export function addIcon(id, obj, opts) {
  const c = renderIcon(obj, opts);
  ICON_CANVAS[id] = c;
  ICONS[id] = c.toDataURL();
  obj.traverse(o => o.geometry && o.geometry.dispose());
}

// ingredient id -> item model id
export function ingItem(id) { return id === 'bakso' ? 'bakso_raw' : id; }
