import * as THREE from 'three';
import { ICONS } from '../game/items.js';
import { sound } from '../engine/audio.js';
import { RECIPES, INGREDIENTS, STATIONS } from '../game/data.js';

export const SVG = {
  star: '<svg viewBox="0 0 24 24"><path d="M12 2.2l2.95 6.2 6.75.8-5 4.7 1.35 6.75L12 17.3l-6.05 3.35 1.35-6.75-5-4.7 6.75-.8z" fill="#ffd23f" stroke="#c98a00" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 9.5l1.6-.2" stroke="#fff6c8" stroke-width="1.6" stroke-linecap="round"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.6" fill="#3b2a1e"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.6" fill="#3b2a1e"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
  paw: '<svg viewBox="0 0 24 24" fill="#fff"><ellipse cx="12" cy="15.5" rx="5" ry="4.4"/><circle cx="5.8" cy="10.3" r="2.3"/><circle cx="18.2" cy="10.3" r="2.3"/><circle cx="9" cy="5.8" r="2.2"/><circle cx="15" cy="5.8" r="2.2"/></svg>',
  pawOrange: '<svg viewBox="0 0 24 24" fill="#ff8c42"><ellipse cx="12" cy="15.5" rx="5" ry="4.4"/><circle cx="5.8" cy="10.3" r="2.3"/><circle cx="18.2" cy="10.3" r="2.3"/><circle cx="9" cy="5.8" r="2.2"/><circle cx="15" cy="5.8" r="2.2"/></svg>',
  house: '<svg viewBox="0 0 64 64"><path d="M8 30L32 10l24 20" fill="none" stroke="#e76f51" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="28" width="36" height="28" rx="3" fill="#ffd6a5"/><rect x="27" y="38" width="10" height="18" rx="2" fill="#e07a5f"/><rect x="17" y="33" width="8" height="8" rx="1" fill="#8fd3ff"/><rect x="39" y="33" width="8" height="8" rx="1" fill="#8fd3ff"/></svg>',
  shop: '<svg viewBox="0 0 64 64"><rect x="10" y="26" width="44" height="30" rx="3" fill="#fff4dc"/><path d="M6 26h52l-5-14H11z" fill="#ef476f"/><path d="M16 12l-3 14M26 12l-1 14M38 12l1 14M48 12l3 14" stroke="#fff" stroke-width="4"/><rect x="26" y="38" width="12" height="18" rx="2" fill="#2ec4b6"/><rect x="14" y="32" width="9" height="8" rx="1" fill="#8fd3ff"/><rect x="41" y="32" width="9" height="8" rx="1" fill="#8fd3ff"/></svg>',
  music: '<svg viewBox="0 0 24 24"><path d="M9 17V5l10-2v12" fill="none" stroke="#3b2a1e" stroke-width="2.4" stroke-linejoin="round"/><circle cx="6.5" cy="17.5" r="3" fill="#3b2a1e"/><circle cx="16.5" cy="15.5" r="3" fill="#3b2a1e"/></svg>',
  boy: '<svg viewBox="0 0 40 40"><path d="M8 14l3-10 7 7h4l7-7 3 10v12a12 12 0 0 1-24 0z" fill="#f5a142"/><circle cx="15" cy="21" r="2.4" fill="#1f1a24"/><circle cx="25" cy="21" r="2.4" fill="#1f1a24"/><path d="M18 27l2 1.6 2-1.6" stroke="#1f1a24" stroke-width="1.6" fill="none" stroke-linecap="round"/><rect x="12" y="6" width="16" height="5" rx="2" fill="#3d8bfd"/><rect x="24" y="9" width="9" height="3" rx="1.5" fill="#3d8bfd"/></svg>',
  girl: '<svg viewBox="0 0 40 40"><path d="M8 14l3-10 7 7h4l7-7 3 10v12a12 12 0 0 1-24 0z" fill="#f9f7f2" stroke="#e6ddd0"/><circle cx="15" cy="21" r="2.4" fill="#1f1a24"/><circle cx="25" cy="21" r="2.4" fill="#1f1a24"/><path d="M11.5 18.5l1.5 1M28.5 18.5l-1.5 1" stroke="#1f1a24" stroke-width="1.4" stroke-linecap="round"/><path d="M18 27l2 1.6 2-1.6" stroke="#1f1a24" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M26 4l4 4-4 3-4-3z M34 3l-4 5 5 2z" fill="#ff4f8b"/><circle cx="11" cy="26" r="2" fill="#ffb3c8"/><circle cx="29" cy="26" r="2" fill="#ffb3c8"/></svg>',
  warung: '<svg viewBox="0 0 64 64"><rect x="8" y="28" width="48" height="28" rx="3" fill="#ffe8b8"/><path d="M4 28h56l-4-14H8z" fill="#ff8c42"/><path d="M14 14l-2 14M26 14v14M38 14v14M50 14l2 14" stroke="#fff" stroke-width="5"/><rect x="14" y="36" width="36" height="8" rx="2" fill="#2ec4b6"/><circle cx="24" cy="50" r="3" fill="#ef476f"/><circle cx="40" cy="50" r="3" fill="#ef476f"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="#ff8c42" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  trophy: '<svg viewBox="0 0 48 48"><path d="M14 8h20v10a10 10 0 0 1-20 0z" fill="currentColor"/><path d="M14 11H8a6 6 0 0 0 6 7M34 11h6a6 6 0 0 1-6 7" fill="none" stroke="currentColor" stroke-width="3"/><rect x="21" y="27" width="6" height="8" fill="currentColor"/><rect x="14" y="35" width="20" height="6" rx="2" fill="#8d5a36"/><path d="M20 12v6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".7"/></svg>',
  replay: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z" fill="#fff"/></svg>',
};

export function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
export function coinHTML(n) {
  return `<span class="price"><i class="coin-ic"></i><b>${n}</b></span>`;
}
function img(id) {
  return ICONS[id] ? `<img src="${ICONS[id]}" alt="">` : '';
}
export function iconImg(id, cls = '') {
  return ICONS[id] ? `<img class="${cls}" src="${ICONS[id]}" alt="">` : '';
}

// ---------------- world-anchored DOM ----------------
const V = new THREE.Vector3();
export class WorldUI {
  constructor() {
    this.root = document.getElementById('world-ui');
    this.items = new Set();
  }
  add(el, pos, anchor = 'bottom', offset = 0) {
    const wrap = document.createElement('div');
    wrap.className = 'wui';
    wrap.appendChild(el);
    this.root.appendChild(wrap);
    const it = { wrap, el, pos, anchor, offset, visible: true, remove: () => { wrap.remove(); this.items.delete(it); } };
    this.items.add(it);
    return it;
  }
  float(text, pos, cls = '') {
    const e = el('div', 'floater ' + cls, text);
    const it = this.add(e, pos.clone ? pos.clone() : pos, 'bottom');
    setTimeout(() => it.remove(), 1300);
    return it;
  }
  clear() {
    for (const it of [...this.items]) it.remove();
  }
  update(camera) {
    const w = window.innerWidth, h = window.innerHeight;
    const avoid = [];
    for (const it of this.items) {
      const p = typeof it.pos === 'function' ? it.pos() : it.pos;
      if (!p) { it.wrap.style.display = 'none'; continue; }
      V.copy(p).project(camera);
      if (V.z > 1 || it.hidden) { if (it.visible) { it.wrap.style.display = 'none'; it.visible = false; } continue; }
      if (!it.visible) { it.wrap.style.display = ''; it.visible = true; }
      it.sx = (V.x * 0.5 + 0.5) * w;
      it.sy = (-V.y * 0.5 + 0.5) * h - it.offset;
      if (it.el.classList.contains('bubble')) {
        if (!it.w || it.wKey !== it.el.childElementCount) { it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; it.wKey = it.el.childElementCount; }
        avoid.push(it);
      }
    }
    // push overlapping order bubbles apart sideways
    if (avoid.length > 1) {
      avoid.sort((a, b) => a.sx - b.sx);
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < avoid.length - 1; i++) {
          const a = avoid[i], b = avoid[i + 1];
          if (Math.abs(a.sy - b.sy) > (a.h + b.h) / 2) continue;
          const need = (a.w + b.w) / 2 + 6 - (b.sx - a.sx);
          if (need > 0) { a.sx -= need / 2; b.sx += need / 2; }
        }
      }
      for (const it of avoid) it.sx = Math.max(it.w / 2 + 4, Math.min(w - it.w / 2 - 4, it.sx));
    }
    for (const it of this.items) {
      if (!it.visible || it.sx === undefined) continue;
      const ty = it.anchor === 'bottom' ? '-100%' : '-50%';
      it.wrap.style.transform = `translate(${it.sx.toFixed(1)}px,${it.sy.toFixed(1)}px) translate(-50%,${ty})`;
    }
  }
}

// ---------------- main UI ----------------
export class UI {
  constructor() {
    this.hud = document.getElementById('hud');
    this.coinPill = document.getElementById('coin-pill');
    this.coinNum = document.getElementById('coin-num');
    this.dayPill = document.getElementById('day-pill');
    this.tc = document.getElementById('hud-tc');
    this.clock = document.getElementById('clock');
    this.clockT = document.getElementById('clock-t');
    this.starbar = document.getElementById('starbar');
    this.coachEl = document.getElementById('coach');
    this.actBtn = document.getElementById('act-btn');
    this.actIc = document.getElementById('act-ic');
    this.actLabel = document.getElementById('act-label');
    this.carryEl = document.getElementById('carry');
    this.fadeEl = document.getElementById('fade');
    this.bannerEl = document.getElementById('banner');
    this.toastEl = document.getElementById('toast');
    this.screens = document.getElementById('screens');
    this.modalEl = null;
    this.lastAction = '';
    this.coachText = null;
    document.getElementById('btn-pause').innerHTML = SVG.pause;
    this.starbar.innerHTML = '<div class="fill"></div>' + [0, 1, 2].map(i => `<div class="st" data-i="${i}">${SVG.star}</div>`).join('');
  }
  setHud(mode) {
    this.hud.classList.toggle('hidden', mode === 'none');
    this.tc.classList.toggle('hidden', mode !== 'warung');
    this.dayPill.classList.toggle('hidden', mode === 'warung');
    document.getElementById('touch').classList.toggle('hidden', mode === 'none');
    this.coachEl.classList.toggle('house', mode === 'house');
    if (mode === 'none') this.coach(null);
  }
  setCoins(n, bump) {
    this.coinNum.textContent = n;
    if (bump) {
      this.coinPill.classList.remove('bump');
      void this.coinPill.offsetWidth;
      this.coinPill.classList.add('bump');
    }
  }
  setDay(t) { this.dayPill.textContent = t; }
  setClock(frac, left) {
    const pk = frac.toFixed(2) + '|' + Math.ceil(left);
    if (pk === this.clockKey) return;
    this.clockKey = pk;
    this.clock.style.setProperty('--p', frac.toFixed(3));
    const s = Math.max(0, Math.ceil(left));
    this.clockT.textContent = left <= 0 ? 'Tutup' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    this.clock.classList.toggle('late', left > 0 && left < 15);
  }
  setStarBar(coins, th) {
    const max = th[2] * 1.08;
    const fill = this.starbar.querySelector('.fill');
    fill.style.width = `calc(${Math.min(1, coins / max) * 100}% - 6px)`;
    this.starbar.querySelectorAll('.st').forEach((s, i) => {
      s.style.left = (th[i] / max * 100) + '%';
      const on = coins >= th[i];
      if (on && !s.classList.contains('on')) { s.classList.add('on'); if (this.starSound) sound.star(i); }
      else if (!on) s.classList.remove('on');
    });
  }
  setAction(a) {
    const key = a ? a.label + '|' + (a.icon || '') + '|' + (a.color || '') : '';
    if (key === this.lastAction) return;
    this.lastAction = key;
    const b = this.actBtn;
    b.className = a && a.color ? 'c-' + a.color : '';
    if (a && a.pulse) b.classList.add('ready');
    if (!a) {
      this.actIc.outerHTML = `<div id="act-ic" class="paw">${SVG.paw}</div>`;
      this.actIc = document.getElementById('act-ic');
      this.actLabel.textContent = 'Meong!';
      return;
    }
    if (a.icon && ICONS[a.icon]) {
      if (this.actIc.tagName !== 'IMG') {
        this.actIc.outerHTML = '<img id="act-ic" alt="">';
        this.actIc = document.getElementById('act-ic');
      }
      this.actIc.src = ICONS[a.icon];
    } else {
      this.actIc.outerHTML = `<div id="act-ic" class="paw">${a.svg || SVG.paw}</div>`;
      this.actIc = document.getElementById('act-ic');
    }
    this.actLabel.textContent = a.label;
  }
  setCarry(id) {
    if (!id) { this.carryEl.classList.add('hidden'); this.carryId = null; return; }
    if (this.carryId === id) return;
    this.carryId = id;
    this.carryEl.innerHTML = img(id);
    this.carryEl.classList.remove('hidden');
  }
  coach(text) {
    if (text === this.coachText) return;
    this.coachText = text;
    if (!text) { this.coachEl.classList.add('hide'); return; }
    this.coachEl.textContent = text;
    this.coachEl.classList.remove('hide');
  }
  toast(text, ms = 2200) {
    const t = this.toastEl;
    t.innerHTML = text;
    t.classList.add('on');
    clearTimeout(this.toastT);
    this.toastT = setTimeout(() => t.classList.remove('on'), ms);
  }
  banner(t1, t2 = '', cls = '') {
    this.bannerEl.innerHTML = `<div class="b1 ${cls}">${t1}</div>${t2 ? `<div class="b2">${t2}</div>` : ''}`;
    clearTimeout(this.bannerT);
    this.bannerT = setTimeout(() => { this.bannerEl.innerHTML = ''; }, 2300);
  }
  fade(on, dark = false) {
    this.fadeEl.classList.toggle('dark', dark);
    this.fadeEl.classList.toggle('on', on);
    return new Promise(r => setTimeout(r, 380));
  }

  // ---------- modal ----------
  modal({ title, color = '', body, buttons = [], closable = true, onClose, small = false, cls = '' }) {
    this.closeModal(true);
    const scr = el('div', 'screen dim');
    const p = el('div', 'panel ' + (small ? 'small ' : '') + cls);
    if (title) p.appendChild(el('h2', color, title));
    if (closable) {
      const x = el('button', 'x', SVG.close);
      x.onclick = () => { sound.click(); this.closeModal(); };
      p.appendChild(x);
    }
    const bd = el('div', 'body');
    if (typeof body === 'string') bd.innerHTML = body; else if (body) body(bd);
    p.appendChild(bd);
    if (buttons.length) {
      const f = el('div', 'foot');
      for (const bt of buttons) {
        const b = el('button', 'btn ' + (bt.cls || ''), bt.label);
        b.onclick = () => { sound.click(); bt.onClick && bt.onClick(); };
        f.appendChild(b);
      }
      p.appendChild(f);
    }
    scr.appendChild(p);
    scr.addEventListener('pointerdown', e => { if (e.target === scr && closable) { this.closeModal(); } });
    this.screens.appendChild(scr);
    this.modalEl = scr;
    this.modalOnClose = onClose;
    this.modalBody = bd;
    return { el: scr, body: bd, close: () => this.closeModal() };
  }
  closeModal(silent) {
    if (!this.modalEl) return;
    this.modalEl.remove();
    this.modalEl = null;
    const cb = this.modalOnClose;
    this.modalOnClose = null;
    if (!silent && cb) cb();
  }
  get modalOpen() { return !!this.modalEl; }
  confirm(text, yes = 'Ya', no = 'Tidak') {
    return new Promise(res => {
      this.modal({
        title: 'Yakin?', small: true, closable: false, color: 'teal',
        body: `<div class="msg">${text}</div>`,
        buttons: [
          { label: no, cls: 'gray', onClick: () => { this.closeModal(true); res(false); } },
          { label: yes, cls: 'green', onClick: () => { this.closeModal(true); res(true); } },
        ],
      });
    });
  }

  // ---------- title ----------
  showTitle({ hasSave, onPlay, onNew, onFull }) {
    this.hideTitle();
    const s = el('div', 'screen');
    s.id = 'title';
    const portrait = window.innerHeight > window.innerWidth;
    s.innerHTML = `
      <div class="logo"><div class="l1">Warung<br><span>Meong</span></div><div class="l2">Masak &amp; layani pelanggan!</div></div>
      <div class="title-btns">
        <button class="btn big green" id="t-play">${SVG.play} ${hasSave ? 'Lanjut Main' : 'Main!'}</button>
        <div class="title-small">
          ${hasSave ? '<button class="btn small gray" id="t-new">Mulai Baru</button>' : ''}
          <button class="btn small teal" id="t-full">Layar Penuh</button>
        </div>
        ${portrait ? '<div class="tip-rotate">Tips: miringkan HP biar layarnya lebih lebar</div>' : ''}
      </div>
      <div class="build">versi ${typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev'}</div>`;
    this.screens.appendChild(s);
    s.querySelector('#t-play').onclick = () => { sound.unlock(); sound.click(); onPlay(); };
    const nb = s.querySelector('#t-new');
    if (nb) nb.onclick = () => { sound.unlock(); sound.click(); onNew(); };
    s.querySelector('#t-full').onclick = () => { sound.unlock(); sound.click(); onFull(); };
    this.titleEl = s;
  }
  hideTitle() { if (this.titleEl) { this.titleEl.remove(); this.titleEl = null; } }

  // ---------- travel ----------
  travel(toWarung, catIcon, evening) {
    return new Promise(res => {
      const s = el('div', 'screen' + (evening ? ' evening' : ''));
      s.id = 'travel';
      s.innerHTML = `
        <div class="travel-t">${toWarung ? 'Berangkat ke Warung!' : 'Pulang ke Rumah...'}</div>
        <div class="road"><div class="line"></div>
          <div class="ic a">${toWarung ? SVG.house : SVG.warung}</div>
          <div class="ic b">${toWarung ? SVG.warung : SVG.house}</div>
          <div class="walker"><img src="${catIcon}" alt=""></div>
        </div>`;
      this.screens.appendChild(s);
      const walker = s.querySelector('.walker');
      requestAnimationFrame(() => requestAnimationFrame(() => { walker.style.left = 'calc(100% - 132px)'; }));
      setTimeout(() => { res(); setTimeout(() => s.remove(), 300); }, 2100);
    });
  }

  // ---------- recipe intro ----------
  recipeIntro(id) {
    const r = RECIPES[id];
    return new Promise(res => {
      const steps = [];
      if (r.ing.length) {
        r.ing.forEach((g, i) => {
          if (i) steps.push('<div class="arr">+</div>');
          steps.push(`<div class="step">${iconImg(g === 'bakso' ? 'bakso_raw' : g)}${INGREDIENTS[g].name}</div>`);
        });
        steps.push('<div class="arr">→</div>');
      }
      steps.push(`<div class="step">${iconImg('st_' + r.station)}${STATIONS[r.station].name}</div>`);
      steps.push('<div class="arr">→</div>');
      steps.push(`<div class="step">${iconImg(id)}${r.name}</div>`);
      const note = r.ing.length
        ? `Masukkan bahan ke ${STATIONS[r.station].name}, tunggu matang, lalu antar!` + (STATIONS[r.station].burns ? ' Jangan sampai gosong ya!' : '')
        : `Tekan tombol di ${STATIONS[r.station].name}, tunggu, lalu antar!`;
      this.modal({
        title: 'Menu Baru!', color: 'pink', closable: false,
        body: `<div class="intro-flow">${steps.join('')}</div><div class="intro-note">${note}</div>`,
        buttons: [{ label: 'Oke, siap!', cls: 'green big', onClick: () => { this.closeModal(true); res(); } }],
      });
      sound.fanfare();
    });
  }
}
