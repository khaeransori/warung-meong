import * as THREE from 'three';
import { sound } from './engine/audio.js';
import { Input } from './engine/input.js';
import { loadSave, writeSave, clearSave, defaultSave, storageWorks } from './engine/save.js';
import { UI, WorldUI, SVG } from './ui/ui.js';
import * as panels from './ui/panels.js';
import { makeAllIcons, catIcon, catHeadIcon } from './game/icons.js';
import { ICONS } from './game/items.js';
import { House } from './game/house.js';
import { Warung } from './game/warung.js';
import { DAYS, TROPHIES, newRecipeOnDay, dayConfig, HATS } from './game/data.js';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

class App {
  async boot() {
    const canvas = document.getElementById('c');
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      document.querySelector('#loading .lt').textContent = 'Maaf, HP ini tidak mendukung WebGL.';
      return;
    }
    this.renderer = renderer;
    renderer.setClearColor(0x000000, 0);
    this.pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(this.pr);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    this.save = loadSave();
    // progress can't be saved here (e.g. opened as a file on some Android phones): open every day
    this.storageBlocked = !storageWorks();
    if (this.storageBlocked) this.save.day = Math.max(this.save.day, 10);
    sound.musicOn = this.save.settings.music;
    sound.sfxOn = this.save.settings.sfx;
    this.ui = new UI();
    this.wui = new WorldUI();
    this.input = new Input();
    this.icons = ICONS;

    try {
      await Promise.race([
        Promise.all([document.fonts.load('700 40px Fredoka'), document.fonts.load('600 20px Fredoka')]),
        wait(2500),
      ]);
    } catch (e) { /* fonts optional */ }

    makeAllIcons();
    this.catIconUrl = catIcon(this.save.char);

    this.house = new House(this);
    this.warung = new Warung(this);
    this.house.enterTitle();
    this.current = this.house;
    this.ui.setHud('none');

    document.getElementById('btn-pause').onclick = () => {
      sound.click();
      if (this.ui.modalOpen) return;
      const inW = this.current === this.warung && this.warung.running && !this.warung.finished;
      panels.settings(this, { inWarung: inW });
    };
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
    // any first touch unlocks audio
    const unlock = () => { sound.unlock(); };
    for (const ev of ['pointerdown', 'touchend', 'click', 'keydown']) window.addEventListener(ev, unlock, { capture: true, passive: true });

    this.resize();
    document.getElementById('loading').remove();
    this.showTitle();
    this.last = performance.now();
    this.perf = { acc: 0, n: 0, cooldown: 3 };
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.house && this.house.resize();
    if (this.warung && this.warung.player) this.warung.resize();
  }

  loop(now) {
    requestAnimationFrame(this.loop);
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.1) dt = 0.1;
    this.frame(Math.min(dt, 0.05));
    this.monitor(dt);
  }
  frame(dt) {
    const sc = this.current;
    const paused = sc === this.warung && this.ui.modalOpen && !this.warung.finished;
    if (!paused) sc.update(dt);
    if (sc === this.house && sc.mode === 'play') this.ui.coach(this.houseCoach());
    this.renderer.render(sc.scene, sc.camera);
    this.wui.update(sc.camera);
    sound.update();
  }
  // lower resolution / shadows automatically on slow phones
  monitor(dt) {
    const P = this.perf;
    if (P.cooldown > 0) { P.cooldown -= dt; return; }
    P.acc += dt; P.n++;
    if (P.n >= 90) {
      const avg = P.acc / P.n;
      P.acc = 0; P.n = 0;
      if (avg > 0.028) {
        if (this.pr > 1.01) {
          this.pr = Math.max(1, this.pr - 0.5);
          this.renderer.setPixelRatio(this.pr);
          this.resize();
          P.cooldown = 2;
        } else if (this.renderer.shadowMap.enabled) {
          this.renderer.shadowMap.enabled = false;
          for (const s of [this.house.scene, this.warung.scene]) s && s.traverse(o => { if (o.material) o.material.needsUpdate = true; });
          P.cooldown = 2;
        }
      }
    }
  }

  persist() { writeSave(this.save); }

  // ---------------- title ----------------
  showTitle() {
    this.ui.setHud('none');
    sound.playSong('home');
    this.ui.showTitle({
      hasSave: this.save.started,
      onPlay: () => this.play(),
      onNew: async () => {
        if (!(await this.ui.confirm('Mulai dari awal? Semua koin dan bintang akan hilang.', 'Mulai Baru', 'Batal'))) return;
        clearSave();
        this.save = defaultSave();
        if (this.storageBlocked) this.save.day = 10;
        this.house.player.rebuild(this.save.char);
        this.house.refreshTrophies();
        this.catIconUrl = catIcon(this.save.char);
        this.play();
      },
      onFull: () => this.fullscreen(),
    });
  }
  fullscreen() {
    const d = document.documentElement;
    const p = d.requestFullscreen ? d.requestFullscreen() : d.webkitRequestFullscreen ? d.webkitRequestFullscreen() : null;
    if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) { /* ignore */ } }).catch(() => {});
  }
  async toTitle() {
    this.input.enabled = false;
    await this.ui.fade(true);
    this.house.enterTitle();
    this.current = this.house;
    this.ui.coach(null);
    this.showTitle();
    await this.ui.fade(false);
  }
  async play() {
    this.ui.hideTitle();
    if (!this.save.started) { this.newGameIntro(); return; }
    this.input.enabled = false;
    await this.ui.fade(true);
    this.house.enterPlay(this.save.time === 'evening' ? 'door' : 'bed');
    this.enterHouseHud();
    await this.ui.fade(false);
    this.input.enabled = true;
    if (this.save.time === 'morning') this.ui.banner('Selamat Pagi!', `Halo ${this.save.char.name}!`, 'teal');
    this.storageNotice();
  }

  // ---------------- Scene 1 + Scene 2 ----------------
  async newGameIntro() {
    const H = this.house;
    this.ui.setHud('none');
    this.input.enabled = false;
    sound.playSong('home');
    this.save.time = 'morning';
    H.setTime('morning');
    await H.playIntro();
    await H.stageCharSelect();
    sound.meow(1);
    this.openCharSelect(true);
  }
  openCharSelect(first) {
    const H = this.house;
    const pitch = () => (this.save.char.gender === 'f' ? 1.25 : 1);
    panels.charSelect(this, {
      first,
      onChange: (what) => {
        H.rebuildPlayer();
        H.player.playPose(what === 'gender' ? 'wave' : 'happy', 1.1);
        sound.meow(pitch());
        H.fx.sparkle(new THREE.Vector3(H.player.pos.x, H.player.y + 1.0, H.player.pos.z), ['#ffffff', '#ffd23f', '#ff6fa7']);
      },
      onDone: () => {
        const firstTime = !this.save.started;
        this.save.started = true;
        this.persist();
        this.catIconUrl = catIcon(this.save.char);
        H.player.playPose('cheer', 1.3);
        sound.meow(pitch());
        sound.fanfare();
        H.fx.confetti(new THREE.Vector3(H.player.pos.x, H.player.y + 1.4, H.player.pos.z), 50);
        setTimeout(() => {
          H.enterPlay('mirror', true);
          this.enterHouseHud();
          this.input.enabled = true;
          if (firstTime) {
            this.ui.banner(`Halo, ${this.save.char.name}!`, 'Ayo sarapan dulu di lantai bawah', 'teal');
            this.showControlsTip();
            this.storageNotice();
          }
        }, 1100);
      },
    });
  }
  storageNotice() {
    if (!this.storageBlocked || this.storageNoticed) return;
    this.storageNoticed = true;
    setTimeout(() => this.ui.toast('Progres tidak bisa disimpan di browser ini, jadi semua hari sudah dibuka.', 4500), 2500);
  }
  showControlsTip() {
    if (this.save.tips.controls) return;
    this.save.tips.controls = true;
    this.persist();
    const hint = document.createElement('div');
    hint.id = 'joy-hint';
    hint.textContent = 'Geser di sini';
    document.body.appendChild(hint);
    const done = () => { hint.remove(); window.removeEventListener('pointerdown', done); window.removeEventListener('keydown', done); };
    setTimeout(() => { window.addEventListener('pointerdown', done); window.addEventListener('keydown', done); }, 300);
    setTimeout(done, 9000);
  }
  enterHouseHud() {
    this.current = this.house;
    this.ui.setHud('house');
    this.ui.setCoins(this.save.coins);
    const d = this.save.day > 10 ? 'Hari Bebas' : `Hari ${this.save.day}`;
    this.ui.setDay(d);
    sound.playSong(this.save.time === 'evening' ? 'evening' : 'home');
  }
  houseCoach() {
    if (!this.save.settings.helper) return null;
    const S = this.save;
    if (this.ui.modalOpen) return null;
    if (S.time === 'evening') return 'Sudah malam. Naik ke kamar dan tidur di kasur!';
    if (!S.breakfast) return 'Sarapan dulu di meja makan (lantai bawah) biar semangat!';
    return 'Ayo berangkat! Keluar lewat pintu untuk ke warung.';
  }
  houseTutorialStep() { /* coach text updates automatically from state */ }

  // ---------------- panels from the house ----------------
  openDayPicker() { panels.dayPicker(this, (n) => { this.ui.closeModal(true); this.goWarung(n); }); }
  openRecipeBook() { panels.recipeBook(this); }
  openWardrobe() { panels.wardrobe(this); }
  openShop() { panels.shop(this); }
  openTrophies() { panels.trophies(this); }
  async openMirror() {
    const H = this.house;
    this.input.enabled = false;
    this.ui.setHud('none');
    await H.stageCharSelect();
    this.openCharSelect(false);
  }
  onCharChanged() {
    this.house.rebuildPlayer();
    this.catIconUrl = catIcon(this.save.char);
    this.house.player.playPose('happy', 0.8);
    sound.meow(this.save.char.gender === 'f' ? 1.25 : 1);
  }
  async goSleep() {
    const S = this.save;
    if (S.time !== 'evening') { this.ui.toast('Belum ngantuk! Ayo ke warung dulu.'); sound.nope(); return; }
    this.input.enabled = false;
    this.house.busy = true;
    sound.sleep();
    await this.ui.fade(true, true);
    this.ui.banner('Zzz...', 'Selamat tidur', 'purple');
    await wait(1600);
    S.time = 'morning';
    S.breakfast = false;
    this.persist();
    this.house.enterPlay('bed');
    this.enterHouseHud();
    await this.ui.fade(false, true);
    this.house.busy = false;
    this.input.enabled = true;
    sound.meow(S.char.gender === 'f' ? 1.25 : 1);
    this.ui.banner('Selamat Pagi!', S.day > 10 ? 'Siap buka warung lagi?' : `Hari ini: Hari ${S.day}`, 'teal');
  }

  // ---------------- warung ----------------
  async goWarung(n) {
    const S = this.save;
    const W = this.warung;
    this.input.enabled = false;
    this.ui.coach(null);
    await this.ui.fade(true);
    this.ui.setHud('none');
    sound.stopSong();
    const tr = this.ui.travel(true, this.catIconUrl, false);
    await this.ui.fade(false);
    await tr;
    await this.ui.fade(true);
    W.start(n);
    this.current = W;
    document.body.className = 'sky-warung';
    const cfg = dayConfig(n);
    this.ui.setHud('warung');
    this.ui.setCoins(0);
    this.ui.starSound = false;
    this.ui.setStarBar(0, cfg.stars);
    this.ui.starSound = true;
    this.ui.setClock(0, cfg.dur);
    this.ui.setAction(null);
    this.ui.setCarry(null);
    await this.ui.fade(false);
    sound.playSong('warung');
    this.ui.banner(n > 10 ? 'Hari Bebas' : `Hari ${n}`, cfg.title);
    await wait(2300);
    if (!S.tips.howto) {
      S.tips.howto = true;
      this.persist();
      await this.infoModal('Cara Main', `
        <div class="msg" style="text-align:left">
        1. Pelanggan datang dan pesan makanan (lihat gambar di atas kepalanya).<br>
        2. Ambil bahan, masak di alat yang benar, tunggu matang.<br>
        3. Antar ke pelanggan sebelum mereka marah!<br>
        <span style="color:#d9661f">Ikuti panah oranye kalau bingung.</span></div>`);
    }
    const nr = newRecipeOnDay(n);
    if (nr && !S.seenRecipes[nr]) {
      await this.ui.recipeIntro(nr);
      S.seenRecipes[nr] = true;
      this.persist();
    }
    if (cfg.dirty && !S.tips.dirty) {
      S.tips.dirty = true;
      this.persist();
      await this.infoModal('Meja Kotor', '<div class="intro-flow"><div class="step">' + `<img src="${ICONS.kotor}">` + 'Piring kotor</div></div><div class="msg">Mulai hari ini, pelanggan meninggalkan piring kotor. Tekan tombol di meja untuk membersihkan supaya pelanggan baru bisa duduk!</div>');
    }
    if (cfg.vip && !S.tips.vip) {
      S.tips.vip = true;
      this.persist();
      await this.infoModal('Tamu VIP', '<div class="msg">Pak Singa suka makan di sini! Dia bayar 2x lipat, tapi tidak terlalu sabar. Layani dia duluan ya!</div>');
    }
    this.input.reset();
    this.input.enabled = true;
    W.begin();
    this.ui.banner('Warung Buka!', '', 'teal');
    sound.jingle();
  }
  infoModal(title, html) {
    return new Promise(res => {
      this.ui.modal({ title, color: 'teal', closable: false, body: html, buttons: [{ label: 'Oke!', cls: 'green big', onClick: () => { this.ui.closeModal(true); res(); } }] });
    });
  }
  onDayFinished(R) {
    const S = this.save;
    const cfg = dayConfig(R.day);
    S.coins += R.earned;
    S.totalCoins += R.earned;
    S.stats.served += R.served;
    S.stats.angry += R.angry;
    S.stats.sate += R.dishCount.sate || 0;
    S.stats.days++;
    if (R.day <= 10) S.stars[R.day] = Math.max(S.stars[R.day] || 0, R.stars);
    let unlockedNew = false;
    if (R.stars > 0 && R.day === S.day && S.day <= 10) { S.day++; unlockedNew = true; }
    S.lastDay = R.day;
    S.breakfast = false;
    const newT = this.checkTrophies(R, true);
    this.persist();
    this.warung.fx.confetti(new THREE.Vector3(this.warung.player.pos.x, 2, this.warung.player.pos.z), R.stars * 20);
    setTimeout(() => {
      panels.results(this, { ...R, target: cfg.stars[2] }, {
        newTrophies: newT,
        onHome: () => { this.ui.closeModal(true); this.goHome(); },
        onRetry: () => { this.ui.closeModal(true); this.warung.exit(); this.goWarung(R.day); },
      });
      if (unlockedNew && R.day === 10) setTimeout(() => this.ui.banner('Selamat!', 'Kamu Koki Hebat! Hari Bebas terbuka', 'teal'), 2600);
    }, 1400);
  }
  checkTrophies(R, silent) {
    const S = this.save;
    const got = [];
    const give = (id) => { if (!S.trophies[id]) { S.trophies[id] = true; got.push(TROPHIES.find(t => t.id === id)); } };
    if (R) {
      if (R.day >= 1 && R.stars > 0) give('pemula');
      if (R.bestCombo >= 5) give('combo5');
      if (R.angry === 0 && R.served >= 6) give('sabar');
      if (R.stars === 3) give('bintang3');
      if (R.day === 10 && R.stars > 0) give('hebat');
    }
    if (S.stats.sate >= 25) give('sate');
    if (S.totalCoins >= 1000) give('juragan');
    if (S.hats.filter(h => h !== 'none').length >= 4) give('gaya');
    if (got.length) {
      this.house.refreshTrophies();
      if (!silent) { this.ui.toast(`Piala baru: <b>${got[0].name}</b>!`, 3000); sound.fanfare(); }
      this.persist();
    }
    return got;
  }
  async goHome(abandon) {
    const S = this.save;
    this.input.enabled = false;
    await this.ui.fade(true);
    this.warung.exit();
    this.ui.setHud('none');
    this.ui.coach(null);
    sound.stopSong();
    S.time = 'evening';
    S.breakfast = false;
    this.persist();
    const tr = this.ui.travel(false, this.catIconUrl, true);
    await this.ui.fade(false);
    await tr;
    await this.ui.fade(true);
    this.house.enterPlay('door');
    this.enterHouseHud();
    await this.ui.fade(false);
    this.input.enabled = true;
    this.ui.toast(abandon ? 'Warung ditutup lebih awal.' : 'Kerja bagus! Belanja di laptop atau tidur di kamar atas.', 3200);
  }
}

const app = new App();
window.__wm = app;
window.__sound = sound;
app.boot();

// simple test helpers (used by automated checks)
window.__sim = (seconds, step = 1 / 30) => {
  const n = Math.round(seconds / step);
  for (let i = 0; i < n; i++) app.frameSim(step);
};
App.prototype.frameSim = function (dt) {
  const sc = this.current;
  sc.update(dt);
  this.wui.update(sc.camera);
};
window.__catHead = (size, bg) => catHeadIcon({ gender: 'm', fur: 'oranye', name: 'Oyen', hat: 'koki', outfit: 'biru' }, size, bg).toDataURL('image/png');
export { SVG };
