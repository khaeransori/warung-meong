import * as THREE from 'three';

const cache = {};

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function finish(c, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = 4;
  return t;
}
function hex(c) {
  const col = new THREE.Color(c);
  return [col.r * 255, col.g * 255, col.b * 255];
}

// Per-pixel painter helper
function paint(w, h, fn) {
  const c = mk(w, h), g = c.getContext('2d');
  const img = g.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, gg, b] = fn(x, y);
      const i = (y * w + x) * 4;
      d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function tex(name) {
  if (cache[name]) return cache[name];
  let t;
  const r = rng(name.length * 977 + 13);
  switch (name) {
    case 'edge': {
      // white face with darker border — gives every block a toy-like outline
      const S = 64;
      const c = paint(S, S, (x, y) => {
        let v = 250 - r() * 9;
        const d = Math.min(x, y, S - 1 - x, S - 1 - y);
        if (d < 1) v *= 0.7; else if (d < 2) v *= 0.8; else if (d < 3) v *= 0.9; else if (d < 5) v *= 0.97;
        if (d >= 3 && d < 5 && (x < 6 || y < 6)) v = Math.min(255, v * 1.04);
        return [v, v, v];
      });
      t = finish(c, false);
      break;
    }
    case 'tile': {
      // 1m: 2x2 checker cream / peach tiles with grout
      const S = 128;
      const A = hex('#fff4dc'), B = hex('#f7c59f'), G = hex('#e3c8a4');
      const c = paint(S, S, (x, y) => {
        const gx = x % 64, gy = y % 64;
        if (gx < 2 || gy < 2) return G;
        const base = ((x >> 6) + (y >> 6)) % 2 ? A : B;
        const n = 1 - r() * 0.05;
        const edge = (gx < 5 || gy < 5) ? 1.03 : (gx > 60 || gy > 60) ? 0.95 : 1;
        return [base[0] * n * edge, base[1] * n * edge, base[2] * n * edge];
      });
      t = finish(c);
      break;
    }
    case 'wood': {
      // 2m x 2m planks
      const S = 256, P = 32;
      const tones = [];
      for (let i = 0; i < 8; i++) tones.push(0.88 + r() * 0.2);
      const base = hex('#d49a63');
      const offs = [];
      for (let i = 0; i < 8; i++) offs.push(Math.floor(r() * S));
      const c = paint(S, S, (x, y) => {
        const row = Math.floor(y / P);
        const gy = y % P;
        let k = tones[row];
        const xx = (x + offs[row]) % S;
        if (gy < 2) k *= 0.62;
        else if (xx < 2 || (xx > 127 && xx < 130)) k *= 0.7;
        const grain = Math.sin((xx * 0.09) + Math.sin(y * 0.7 + row) * 2.2) * 0.04;
        k *= 1 + grain - r() * 0.04;
        return [base[0] * k, base[1] * k, base[2] * k];
      });
      t = finish(c);
      break;
    }
    case 'wall': {
      // subtle wallpaper stripes, tinted by vertex color
      const S = 64;
      const c = paint(S, S, (x, y) => {
        let v = (Math.floor(x / 8) % 2) ? 255 : 243;
        if (x % 16 === 12 && y % 8 < 4) v = 232;
        v -= r() * 5;
        return [v, v, v];
      });
      t = finish(c);
      break;
    }
    case 'carpet': {
      const S = 64;
      const c = paint(S, S, (x, y) => {
        let v = 240 - r() * 22;
        if ((x + y) % 8 === 0) v -= 6;
        return [v, v, v];
      });
      t = finish(c);
      break;
    }
    case 'grass': {
      const S = 64;
      const base = hex('#7fcf5e');
      const c = paint(S, S, (x, y) => {
        let k = 0.9 + r() * 0.16;
        if (r() < 0.05) k = 1.18;
        if (r() < 0.04) k = 0.78;
        return [base[0] * k, base[1] * k, base[2] * k];
      });
      t = finish(c);
      break;
    }
    case 'roof': {
      const S = 64;
      const base = hex('#e76f51');
      const c = paint(S, S, (x, y) => {
        const row = Math.floor(y / 16);
        const gy = y % 16;
        const xx = (x + (row % 2) * 16) % 32;
        let k = 1 - gy * 0.012;
        if (gy < 2) k *= 0.65;
        if (xx < 2) k *= 0.75;
        k *= 1 - r() * 0.05;
        return [base[0] * k, base[1] * k, base[2] * k];
      });
      t = finish(c);
      break;
    }
    case 'brick': {
      const S = 64;
      const c = paint(S, S, (x, y) => {
        const row = Math.floor(y / 16);
        const gy = y % 16;
        const xx = (x + (row % 2) * 16) % 32;
        let v = 250 - r() * 14;
        if (gy < 2 || xx < 2) v = 205;
        return [v, v, v];
      });
      t = finish(c);
      break;
    }
    case 'paving': {
      const S = 64;
      const c = paint(S, S, (x, y) => {
        const gx = x % 32, gy = y % 32;
        let v = 236 - r() * 16;
        if (gx < 2 || gy < 2) v = 190;
        return [v, v, v];
      });
      t = finish(c);
      break;
    }
    default:
      throw new Error('unknown tex ' + name);
  }
  cache[name] = t;
  return t;
}

// A canvas texture that we draw text/pictures on (not cached)
export function canvasTex(w, h, draw) {
  const c = mk(w, h);
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData.canvas = c;
  return t;
}
