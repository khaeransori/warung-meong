import { el, SVG, coinHTML, iconImg } from './ui.js';
import { sound } from '../engine/audio.js';
import { FURS, HATS, OUTFITS, UPGRADES, RECIPES, RECIPE_ORDER, INGREDIENTS, STATIONS, TROPHIES, DAYS, DEFAULT_NAMES } from '../game/data.js';
import { ICONS } from '../game/items.js';

const FUR_CSS = {
  oranye: 'repeating-linear-gradient(90deg,#f5a142 0 9px,#d9772b 9px 13px)',
  abu: 'repeating-linear-gradient(90deg,#a6afba 0 9px,#6f7985 9px 13px)',
  putih: '#f9f7f2',
  hitam: '#34343f',
  belang: 'linear-gradient(135deg,#f09a3e 0 35%,#faf7f1 35% 65%,#35353f 65%)',
  siam: 'radial-gradient(circle at 50% 55%,#5b3e2d 0 30%,#f3e5cc 32%)',
};

// ---------------- Scene 2: pick your cat ----------------
export function charSelect(app, { first, onChange, onDone }) {
  const S = app.save;
  const c = S.char;
  let nameEdited = !first;
  const scr = el('div', 'screen');
  scr.id = 'charsel';
  scr.innerHTML = `
    <div class="cs-top"><div class="cs-title">${first ? 'Pilih Kucingmu!' : 'Cermin Ajaib'}</div></div>
    <div class="cs-col">
      <div class="cs-card"><h3>Kucing cowok atau cewek?</h3>
        <div class="gender">
          <button class="m" data-g="m">${SVG.boy}Cowok</button>
          <button class="f" data-g="f">${SVG.girl}Cewek</button>
        </div>
      </div>
      <div class="cs-card"><h3>Warna bulu</h3>
        <div class="swatches fur">${FURS.map(f => `<button class="sw" data-f="${f.id}" style="background:${FUR_CSS[f.id]}"></button>`).join('')}</div>
        <div class="swlabel"></div>
      </div>
      <div class="cs-card"><h3>Nama</h3><input class="name-in" maxlength="10" autocomplete="off" spellcheck="false"></div>
    </div>
    <div class="cs-side">
      <div></div>
      <button class="btn big green cs-done">${SVG.check} Siap!</button>
    </div>`;
  // In landscape the title sits in the right column
  if (window.innerWidth > window.innerHeight) {
    const top = scr.querySelector('.cs-top');
    scr.querySelector('.cs-side').firstElementChild.replaceWith(top);
  }
  const input = scr.querySelector('.name-in');
  input.value = c.name;
  const refresh = () => {
    scr.querySelectorAll('.gender button').forEach(b => b.classList.toggle('on', b.dataset.g === c.gender));
    scr.querySelectorAll('.fur .sw').forEach(b => b.classList.toggle('on', b.dataset.f === c.fur));
    scr.querySelector('.swlabel').textContent = FURS.find(f => f.id === c.fur).name;
  };
  scr.querySelectorAll('.gender button').forEach(b => b.onclick = () => {
    sound.click();
    c.gender = b.dataset.g;
    if (!nameEdited) { c.name = DEFAULT_NAMES[c.gender]; input.value = c.name; }
    if (first) c.outfit = c.gender === 'f' ? 'pink' : 'biru';
    refresh();
    onChange('gender');
  });
  scr.querySelectorAll('.fur .sw').forEach(b => b.onclick = () => {
    sound.click();
    c.fur = b.dataset.f;
    refresh();
    onChange('fur');
  });
  input.addEventListener('input', () => { nameEdited = true; c.name = input.value.trim().slice(0, 10); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  scr.querySelector('.cs-done').onclick = () => {
    sound.click();
    if (!c.name) c.name = DEFAULT_NAMES[c.gender];
    scr.remove();
    onDone();
  };
  refresh();
  app.ui.screens.appendChild(scr);
  return scr;
}

// ---------------- Wardrobe ----------------
export function wardrobe(app) {
  const S = app.save;
  let tab = 'topi';
  const m = app.ui.modal({ title: 'Lemari Baju', color: 'pink', body: () => {} });
  const render = () => {
    const bd = m.body;
    bd.innerHTML = '';
    bd.appendChild(el('div', 'wallet', `<div class="pill">${coinHTML(S.coins)}</div>`));
    const tabs = el('div', 'tabs');
    for (const [id, label] of [['topi', 'Topi & Aksesoris'], ['baju', 'Baju']]) {
      const b = el('button', tab === id ? 'on' : '', label);
      b.onclick = () => { sound.click(); tab = id; render(); };
      tabs.appendChild(b);
    }
    bd.appendChild(tabs);
    const grid = el('div', 'grid');
    const list = tab === 'topi' ? HATS : OUTFITS;
    for (const it of list) {
      const owned = tab === 'topi' ? S.hats.includes(it.id) : S.outfits.includes(it.id);
      const eq = tab === 'topi' ? S.char.hat === it.id : S.char.outfit === it.id;
      const card = el('div', 'card' + (eq ? ' equipped' : owned ? ' owned' : ''));
      let pic;
      if (tab === 'topi') pic = it.id === 'none' ? `<div style="width:76px;height:76px;display:flex;align-items:center;justify-content:center;font-size:44px;color:#c9bdb1">✕</div>` : iconImg('hat_' + it.id);
      else pic = shirtSVG(it.color);
      card.innerHTML = `${pic}<div class="nm">${it.name}</div>`;
      const btn = el('button', 'btn small ' + (eq ? 'gray' : owned ? 'teal' : 'green'));
      if (eq) { btn.innerHTML = 'Dipakai'; btn.disabled = true; }
      else if (owned) btn.innerHTML = 'Pakai';
      else { btn.innerHTML = `Beli ${coinHTML(it.price)}`; if (S.coins < it.price) btn.disabled = true; }
      btn.onclick = () => {
        if (!owned) {
          if (S.coins < it.price) return;
          S.coins -= it.price;
          (tab === 'topi' ? S.hats : S.outfits).push(it.id);
          sound.coin();
          app.checkTrophies();
        } else sound.click();
        if (tab === 'topi') S.char.hat = it.id; else S.char.outfit = it.id;
        app.persist();
        app.onCharChanged();
        app.ui.setCoins(S.coins);
        render();
      };
      card.appendChild(btn);
      grid.appendChild(card);
    }
    bd.appendChild(grid);
  };
  render();
}
function shirtSVG(col) {
  return `<svg width="76" height="76" viewBox="0 0 48 48"><path d="M16 6l-10 6 4 9 5-3v24h18V18l5 3 4-9-10-6c-1 3-4 5-8 5s-7-2-8-5z" fill="${col}" stroke="rgba(0,0,0,.15)" stroke-width="1.5"/><rect x="20" y="22" width="8" height="6" rx="1.5" fill="#fff" opacity=".6"/></svg>`;
}

// ---------------- Shop (laptop) ----------------
export function shop(app) {
  const S = app.save;
  const m = app.ui.modal({ title: 'Toko Warung', color: 'teal', body: () => {} });
  const render = () => {
    const bd = m.body;
    bd.innerHTML = '';
    bd.appendChild(el('div', 'wallet', `<div class="pill">${coinHTML(S.coins)}</div>`));
    const grid = el('div', 'grid');
    for (const u of UPGRADES) {
      const owned = !!S.upgrades[u.id];
      const locked = S.day < u.day;
      const card = el('div', 'card' + (owned ? ' owned' : ''));
      card.innerHTML = `${iconImg('up_' + u.id)}<div class="nm">${u.name}</div><div class="ds">${u.desc}</div>`;
      if (owned) card.appendChild(el('div', 'lock', '✓ Sudah punya'));
      else if (locked) card.appendChild(el('div', 'lock', `Buka di Hari ${u.day}`));
      else {
        const btn = el('button', 'btn small green', `Beli ${coinHTML(u.price)}`);
        if (S.coins < u.price) btn.disabled = true;
        btn.onclick = () => {
          if (S.coins < u.price) return;
          S.coins -= u.price;
          S.upgrades[u.id] = true;
          sound.coin(); sound.sparkle();
          app.persist();
          app.ui.setCoins(S.coins);
          app.ui.toast(`${u.name} sudah dibeli!`);
          render();
        };
        card.appendChild(btn);
      }
      grid.appendChild(card);
    }
    bd.appendChild(grid);
  };
  render();
}

// ---------------- Recipe book ----------------
export function recipeBook(app) {
  const S = app.save;
  app.ui.modal({
    title: 'Buku Resep', color: 'teal',
    body: (bd) => {
      for (const id of RECIPE_ORDER) {
        const r = RECIPES[id];
        const locked = r.unlock > Math.min(S.day, 10) && S.day <= 10;
        const row = el('div', 'recipe' + (locked ? ' locked' : ''));
        let h = '';
        r.ing.forEach((g, i) => {
          if (i) h += '<span class="op">+</span>';
          h += `<div class="ingbox">${iconImg(g === 'bakso' ? 'bakso_raw' : g, 'rimg')}${INGREDIENTS[g].name}</div>`;
        });
        if (r.ing.length) h += '<span class="op">→</span>';
        h += `<div class="ingbox">${iconImg('st_' + r.station, 'rimg')}${STATIONS[r.station].name}</div><span class="op">→</span>`;
        h += `${iconImg(id, 'rimg big')}<div class="rname">${r.name}<small>${locked ? 'Terbuka di Hari ' + r.unlock : 'Harga ' + r.price + ' koin' + (STATIONS[r.station].burns ? ' · awas gosong!' : '')}</small></div>`;
        row.innerHTML = h;
        bd.appendChild(row);
      }
    },
  });
}

// ---------------- Trophies ----------------
export function trophies(app) {
  const S = app.save;
  app.ui.modal({
    title: 'Rak Piala', color: '',
    body: (bd) => {
      const have = TROPHIES.filter(t => S.trophies[t.id]).length;
      bd.appendChild(el('div', 'msg', `Piala: ${have} / ${TROPHIES.length}`));
      bd.appendChild(el('div', '', '<div style="height:10px"></div>'));
      for (const t of TROPHIES) {
        const ok = !!S.trophies[t.id];
        const row = el('div', 'troph' + (ok ? '' : ' no'));
        row.innerHTML = `<div class="ti" style="color:${t.color}">${SVG.trophy}</div><div><div class="tt">${t.name}</div><div class="td">${t.desc}</div></div>`;
        bd.appendChild(row);
      }
      const total = Object.values(S.stars).reduce((a, b) => a + b, 0);
      bd.appendChild(el('div', 'msg', `Total bintang: ${total} / 30`));
    },
  });
}

// ---------------- Day picker ----------------
export function dayPicker(app, onPick) {
  const S = app.save;
  const next = Math.min(S.day, 10);
  app.ui.modal({
    title: 'Pilih Hari', color: 'green',
    body: (bd) => {
      const g = el('div', 'days');
      for (const d of DAYS) {
        const st = S.stars[d.n] || 0;
        const locked = d.n > S.day;
        const b = el('button', 'dayb' + (locked ? ' locked' : '') + (d.n === next && S.day <= 10 ? ' next' : ''));
        b.innerHTML = `<div class="n">${d.n}</div><div class="mini">${[0, 1, 2].map(i => `<span style="opacity:${i < st ? 1 : 0.25}">${SVG.star}</span>`).join('')}</div>`;
        b.onclick = () => { sound.click(); onPick(d.n); };
        g.appendChild(b);
      }
      if (S.day > 10) {
        const b = el('button', 'dayb free next', `${SVG.star} Hari Bebas (semua menu)`);
        b.onclick = () => { sound.click(); onPick(11); };
        g.appendChild(b);
      }
      bd.appendChild(g);
      const d = DAYS[next - 1];
      bd.appendChild(el('div', 'daytitle', S.day > 10 ? 'Semua hari sudah selesai! Main Hari Bebas atau ulangi untuk 3 bintang.' : `Hari ${d.n}: ${d.title}`));
    },
  });
}

// ---------------- Settings / pause ----------------
export function settings(app, { inWarung }) {
  const S = app.save;
  const row = (label, key, apply) => {
    const r = el('div', 'setrow', `<span>${label}</span>`);
    const t = el('button', 'toggle' + (S.settings[key] ? ' on' : ''));
    t.onclick = () => {
      S.settings[key] = !S.settings[key];
      t.classList.toggle('on', S.settings[key]);
      apply && apply(S.settings[key]);
      sound.click();
      app.persist();
    };
    r.appendChild(t);
    return r;
  };
  const buttons = [{ label: `${SVG.play} Lanjut`, cls: 'green', onClick: () => app.ui.closeModal() }];
  if (inWarung) buttons.unshift({ label: 'Pulang', cls: 'red', onClick: async () => { app.ui.closeModal(true); if (await app.ui.confirm('Tutup warung sekarang? Koin hari ini hilang.', 'Pulang', 'Batal')) app.goHome(true); } });
  else buttons.unshift({ label: 'Layar Judul', cls: 'gray', onClick: () => { app.ui.closeModal(true); app.toTitle(); } });
  app.ui.modal({
    title: inWarung ? 'Istirahat' : 'Pengaturan', color: 'purple', small: true,
    body: (bd) => {
      bd.appendChild(row('Musik', 'music', v => sound.setMusic(v)));
      bd.appendChild(row('Suara', 'sfx', v => sound.setSfx(v)));
      bd.appendChild(row('Panah bantuan', 'helper'));
    },
    buttons,
  });
}

// ---------------- Results ----------------
export function results(app, R, { onHome, onRetry, newTrophies }) {
  const ok = R.stars > 0;
  const tr = newTrophies.length ? `<div class="newtrophy">Piala baru: ${newTrophies.map(t => `<span class="tchip" style="color:${t.color}">${SVG.trophy}<b>${t.name}</b></span>`).join('')}</div>` : '';
  app.ui.modal({
    title: R.day > 10 ? 'Hari Bebas Selesai!' : `Hari ${R.day} Selesai!`, color: ok ? 'green' : 'purple', closable: false,
    cls: 'results',
    body: `
      <div class="res-top"><div class="stars-big">${[0, 1, 2].map(() => `<div class="s">${SVG.star}</div>`).join('')}</div>
      <div class="res-total">Dapat ${coinHTML(R.earned)} koin</div></div>
      <div class="res-rows">
        <div>Pelanggan senang <b>${R.served}</b></div>
        <div>Pelanggan marah <b>${R.angry}</b></div>
        <div>Combo terbaik <b>${R.bestCombo}</b></div>
        <div>Target 3 bintang <b>${R.target}</b></div>
      </div>
      ${ok ? '' : '<div class="intro-note">Butuh 1 bintang untuk buka hari berikutnya. Coba lagi ya!</div>'}
      ${tr}`,
    buttons: ok
      ? [{ label: `${SVG.replay} Ulangi`, cls: 'gray', onClick: onRetry }, { label: 'Pulang', cls: 'green big', onClick: onHome }]
      : [{ label: 'Pulang', cls: 'gray', onClick: onHome }, { label: `${SVG.replay} Coba Lagi`, cls: 'green big', onClick: onRetry }],
  });
  const stars = app.ui.modalEl.querySelectorAll('.stars-big .s');
  for (let i = 0; i < R.stars; i++) {
    setTimeout(() => { stars[i].classList.add('on'); sound.star(i); }, 500 + i * 450);
  }
  if (R.stars === 0) setTimeout(() => sound.sad(), 400);
  else setTimeout(() => sound.fanfare(), 500 + R.stars * 450);
}

export function iconFor(id) { return ICONS[id]; }
