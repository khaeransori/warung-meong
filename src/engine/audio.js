// Everything is synthesized with WebAudio — no sound files, works offline.

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function nf(n) {
  const m = /^([A-G])([#b]?)(\d)$/.exec(n);
  if (!m) return 0;
  let s = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = (parseInt(m[3], 10) + 1) * 12 + s;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function parseLine(str) {
  return str.replace(/\|/g, ' ').trim().split(/\s+/);
}
const CHORDS = {
  C: ['C4', 'E4', 'G4'], Am: ['A3', 'C4', 'E4'], F: ['F3', 'A3', 'C4'], G: ['G3', 'B3', 'D4'],
  Bb: ['Bb3', 'D4', 'F4'], Dm: ['D4', 'F4', 'A4'], Em: ['E3', 'G3', 'B3'], G7: ['G3', 'B3', 'F4'],
};
const ROOT = { C: 'C3', Am: 'A2', F: 'F2', G: 'G2', Bb: 'Bb2', Dm: 'D3', Em: 'E2', G7: 'G2' };
const FIFTH = { C: 'G2', Am: 'E3', F: 'C3', G: 'D3', Bb: 'F3', Dm: 'A2', Em: 'B2', G7: 'D3' };

const SONGS = {
  warung: {
    bpm: 132, inst: 'lead', drums: true, stabs: true,
    lead: parseLine(`E5 - G5 - C6 - B5 C6 | G5 - E5 - C5 - D5 E5 | F5 - A5 - C6 - A5 F5 | G5 - - - . . D5 . |
                     A5 - C6 - A5 - G5 E5 | F5 - A5 - G5 - F5 D5 | D5 E5 F5 G5 A5 B5 D6 B5 | C6 - - - . . G5 . |
                     E5 E5 G5 . E5 E5 C6 . | D5 D5 F5 . D5 D5 B5 . | C5 E5 G5 C6 B5 A5 G5 F5 | E5 - D5 - C5 - . . |
                     F5 - F5 - A5 - F5 - | E5 - E5 - G5 - E5 - | D5 - G5 - B5 - D6 - | C6 - G5 - C5 - . . `),
    chords: ['C', 'C', 'F', 'G', 'Am', 'F', 'G', 'C', 'C', 'G', 'C', 'C', 'F', 'C', 'G', 'C'],
  },
  home: {
    bpm: 96, inst: 'bell', drums: false, pad: true,
    lead: parseLine(`A5 - C6 - F5 - A5 - | Bb5 - D6 - C6 - Bb5 - | A5 - F5 - C5 - F5 - | G5 - - - E5 - - - |
                     A5 - C6 - F6 - E6 D6 | D6 - Bb5 - G5 - Bb5 - | C6 - E5 - G5 - Bb5 - | A5 - - - F5 - - - `),
    chords: ['F', 'Bb', 'F', 'C', 'F', 'Bb', 'C', 'F'],
  },
  evening: {
    bpm: 78, inst: 'bell', drums: false, pad: true, oct: -1,
    lead: parseLine(`A5 - C6 - F5 - A5 - | Bb5 - D6 - C6 - Bb5 - | A5 - F5 - C5 - F5 - | G5 - - - E5 - - - |
                     A5 - C6 - F6 - E6 D6 | D6 - Bb5 - G5 - Bb5 - | C6 - E5 - G5 - Bb5 - | A5 - - - F5 - - - `),
    chords: ['F', 'Bb', 'F', 'C', 'F', 'Bb', 'C', 'F'],
  },
};

// iPhone: keep playing when the ringer switch is on silent (like a video/game app).
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported */ }

export class Sound {
  constructor() {
    this.ctx = null;
    this.musicOn = true;
    this.sfxOn = true;
    this.song = null;
    this.songName = null;
    this.loops = {};
    this.timer = null;
  }
  // iOS Safari only unlocks audio inside touchend/click and can leave the context
  // 'suspended' or 'interrupted' (calls, lock screen, app switch): call this on every gesture.
  unlock() {
    if (this.ctx) {
      if (this.ctx.state !== 'running' && !document.hidden) {
        this.ctx.resume().catch(() => {});
        this.blip();
      }
      return;
    }
    {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC(); } catch (e) { return; }
      const c = this.ctx;
      this.blip();
      this.master = c.createGain(); this.master.gain.value = 0.9; this.master.connect(c.destination);
      this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -14; this.comp.ratio.value = 4;
      this.comp.connect(this.master);
      this.sfxBus = c.createGain(); this.sfxBus.gain.value = this.sfxOn ? 0.9 : 0; this.sfxBus.connect(this.comp);
      this.musicBus = c.createGain(); this.musicBus.gain.value = this.musicOn ? 0.42 : 0; this.musicBus.connect(this.comp);
      const len = c.sampleRate * 2;
      this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) this.ctx.suspend().catch(() => {}); else this.ctx.resume().catch(() => {});
      });
      if (this.pendingSong) { const s = this.pendingSong; this.pendingSong = null; this.songName = null; this.playSong(s); }
    }
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
  }
  // a 1-sample silent buffer started inside the gesture wakes iOS audio up
  blip() {
    try {
      const b = this.ctx.createBufferSource();
      b.buffer = this.ctx.createBuffer(1, 1, 22050);
      b.connect(this.ctx.destination);
      b.start(0);
    } catch (e) { /* ignore */ }
  }
  setMusic(on) {
    this.musicOn = on;
    if (this.musicBus) this.musicBus.gain.setTargetAtTime(on ? 0.42 : 0, this.ctx.currentTime, 0.05);
  }
  setSfx(on) {
    this.sfxOn = on;
    if (this.sfxBus) this.sfxBus.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.05);
  }
  get ok() { return !!this.ctx && this.ctx.state === 'running'; }

  // ---------- primitives ----------
  tone({ type = 'sine', f0 = 440, f1 = null, dur = 0.2, vol = 0.2, a = 0.005, when = 0, glide = null, bus = null, filter = null, q = 1, rel = null }) {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (glide) { for (const [ft, fv] of glide) o.frequency.linearRampToValueAtTime(fv, t + ft); }
    else if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + (rel || 0));
    let node = o;
    if (filter) {
      const f = c.createBiquadFilter();
      f.type = filter[0]; f.frequency.value = filter[1]; f.Q.value = q;
      node.connect(f); node = f;
    }
    node.connect(g);
    g.connect(bus || this.sfxBus);
    o.start(t); o.stop(t + dur + (rel || 0) + 0.05);
    return o;
  }
  noise({ dur = 0.2, vol = 0.2, type = 'bandpass', f = 1000, f1 = null, q = 1, when = 0, a = 0.005, bus = null }) {
    if (!this.ctx) return;
    const c = this.ctx;
    const t = c.currentTime + when;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    const fl = c.createBiquadFilter();
    fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(bus || this.sfxBus);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }

  // ---------- sfx ----------
  click() { this.tone({ type: 'sine', f0: 660, f1: 990, dur: 0.07, vol: 0.18 }); }
  pop() { this.tone({ type: 'sine', f0: 380, f1: 1100, dur: 0.1, vol: 0.25 }); }
  place() { this.tone({ type: 'triangle', f0: 260, f1: 140, dur: 0.12, vol: 0.3 }); this.noise({ dur: 0.05, vol: 0.08, f: 1800 }); }
  pickup() { this.tone({ type: 'sine', f0: 520, f1: 880, dur: 0.09, vol: 0.2 }); this.tone({ type: 'sine', f0: 880, f1: 1320, dur: 0.08, vol: 0.12, when: 0.05 }); }
  plop() { this.tone({ type: 'sine', f0: 900, f1: 300, dur: 0.12, vol: 0.25 }); }
  nope() { this.tone({ type: 'square', f0: 180, dur: 0.12, vol: 0.08, filter: ['lowpass', 900] }); this.tone({ type: 'square', f0: 140, dur: 0.16, vol: 0.08, when: 0.1, filter: ['lowpass', 900] }); }
  coin() { this.tone({ type: 'square', f0: 988, dur: 0.07, vol: 0.09, filter: ['lowpass', 4000] }); this.tone({ type: 'square', f0: 1319, dur: 0.22, vol: 0.09, when: 0.07, filter: ['lowpass', 4000] }); }
  ding() {
    this.tone({ type: 'sine', f0: 1318, dur: 0.6, vol: 0.22 });
    this.tone({ type: 'sine', f0: 1976, dur: 0.4, vol: 0.1, when: 0.01 });
  }
  bell() {
    this.tone({ type: 'sine', f0: 1568, dur: 0.9, vol: 0.18 });
    this.tone({ type: 'sine', f0: 1976, dur: 0.9, vol: 0.14, when: 0.16 });
  }
  beep() { this.tone({ type: 'square', f0: 1046, dur: 0.07, vol: 0.07, filter: ['lowpass', 3000] }); }
  burn() {
    this.noise({ dur: 0.5, vol: 0.25, type: 'lowpass', f: 2000, f1: 300 });
    this.tone({ type: 'sawtooth', f0: 400, f1: 90, dur: 0.5, vol: 0.1, filter: ['lowpass', 1200] });
  }
  trash() {
    this.noise({ dur: 0.25, vol: 0.2, type: 'bandpass', f: 600, f1: 2400, q: 1.5 });
    this.tone({ type: 'triangle', f0: 180, f1: 90, dur: 0.18, vol: 0.25, when: 0.15 });
  }
  whoosh() { this.noise({ dur: 0.35, vol: 0.18, type: 'bandpass', f: 400, f1: 3000, q: 2 }); }
  sparkle() {
    [1568, 2093, 2637, 3136].forEach((f, i) => this.tone({ type: 'sine', f0: f, dur: 0.18, vol: 0.08, when: i * 0.05 }));
  }
  stir() { this.noise({ dur: 0.07, vol: 0.12, type: 'highpass', f: 2500 }); this.tone({ type: 'triangle', f0: 700, f1: 500, dur: 0.05, vol: 0.06 }); }
  pour() {
    for (let i = 0; i < 6; i++) this.noise({ dur: 0.18, vol: 0.07, type: 'bandpass', f: 900 + Math.random() * 900, q: 4, when: i * 0.1 });
    this.tone({ type: 'sine', f0: 500, f1: 1200, dur: 0.7, vol: 0.05 });
  }
  blend() {
    this.tone({ type: 'sawtooth', f0: 90, f1: 140, dur: 0.9, vol: 0.06, filter: ['lowpass', 900] });
    this.noise({ dur: 0.9, vol: 0.05, type: 'bandpass', f: 1200, q: 0.8 });
  }
  eat() {
    for (let i = 0; i < 3; i++) this.tone({ type: 'sine', f0: 330, glide: [[0.05, 420], [0.1, 300]], dur: 0.12, vol: 0.18, when: i * 0.22 });
  }
  meow(pitch = 1, vol = 0.3) {
    if (!this.ctx) return;
    const base = 520 * pitch;
    const glide = [[0.08, base * 1.55], [0.28, base * 1.35], [0.5, base * 0.8]];
    this.tone({ type: 'sawtooth', f0: base, glide, dur: 0.5, vol: vol * 0.5, a: 0.04, filter: ['bandpass', 1300 * pitch], q: 2.5 });
    this.tone({ type: 'sawtooth', f0: base, glide, dur: 0.5, vol: vol * 0.35, a: 0.04, filter: ['bandpass', 2600 * pitch], q: 4 });
    this.tone({ type: 'sine', f0: base, glide, dur: 0.5, vol: vol * 0.25, a: 0.04 });
  }
  purr() {
    this.tone({ type: 'sawtooth', f0: 38, dur: 0.9, vol: 0.12, filter: ['lowpass', 300] });
  }
  voice(kind, mood = 'happy') {
    const s = mood === 'angry' ? 0.75 : 1;
    switch (kind) {
      case 'anjing':
        this.tone({ type: 'square', f0: 420 * s, f1: 260 * s, dur: 0.12, vol: 0.1, filter: ['lowpass', 1400] });
        this.tone({ type: 'square', f0: 440 * s, f1: 270 * s, dur: 0.12, vol: 0.1, when: 0.18, filter: ['lowpass', 1400] });
        break;
      case 'kelinci':
        this.tone({ type: 'sine', f0: 1300 * s, f1: 1800 * s, dur: 0.08, vol: 0.14 });
        this.tone({ type: 'sine', f0: 1400 * s, f1: 1900 * s, dur: 0.08, vol: 0.14, when: 0.11 });
        break;
      case 'bebek':
        this.tone({ type: 'sawtooth', f0: 560 * s, f1: 480 * s, dur: 0.14, vol: 0.12, filter: ['bandpass', 1100], q: 3 });
        this.tone({ type: 'sawtooth', f0: 580 * s, f1: 470 * s, dur: 0.14, vol: 0.12, when: 0.18, filter: ['bandpass', 1100], q: 3 });
        break;
      case 'babi':
        this.tone({ type: 'sawtooth', f0: 260 * s, glide: [[0.1, 320 * s], [0.25, 200 * s]], dur: 0.25, vol: 0.15, filter: ['bandpass', 700], q: 3 });
        break;
      case 'katak':
        for (let i = 0; i < 2; i++) this.tone({ type: 'square', f0: 170 * s, f1: 130 * s, dur: 0.1, vol: 0.12, when: i * 0.13, filter: ['lowpass', 900] });
        break;
      case 'monyet':
        [600, 850, 1100].forEach((f, i) => this.tone({ type: 'sine', f0: f * s, f1: f * 1.3 * s, dur: 0.08, vol: 0.12, when: i * 0.09 }));
        break;
      case 'rubah':
        this.tone({ type: 'sine', f0: 900 * s, f1: 1400 * s, dur: 0.1, vol: 0.14 });
        break;
      case 'singa':
        this.noise({ dur: 0.6, vol: 0.12, type: 'lowpass', f: 700, f1: 300 });
        this.tone({ type: 'sawtooth', f0: 140, glide: [[0.2, 170], [0.6, 90]], dur: 0.6, vol: 0.12, filter: ['lowpass', 700] });
        break;
      case 'pinguin':
        this.tone({ type: 'sawtooth', f0: 480 * s, glide: [[0.1, 620 * s], [0.2, 420 * s]], dur: 0.2, vol: 0.1, filter: ['bandpass', 1400], q: 2 });
        break;
      case 'panda':
      case 'beruang':
      default:
        this.tone({ type: 'sawtooth', f0: 200 * s, glide: [[0.12, 240 * s], [0.3, 170 * s]], dur: 0.3, vol: 0.12, filter: ['lowpass', 800] });
    }
  }
  happy() {
    this.tone({ type: 'triangle', f0: 784, dur: 0.1, vol: 0.14 });
    this.tone({ type: 'triangle', f0: 1175, dur: 0.18, vol: 0.14, when: 0.08 });
  }
  angry() {
    this.tone({ type: 'sawtooth', f0: 220, f1: 110, dur: 0.35, vol: 0.12, filter: ['lowpass', 900] });
  }
  star(i) {
    const base = [784, 988, 1175][i] || 1175;
    this.tone({ type: 'triangle', f0: base, dur: 0.3, vol: 0.2 });
    this.tone({ type: 'sine', f0: base * 2, dur: 0.3, vol: 0.08 });
    this.sparkle();
  }
  fanfare() {
    const n = [523, 659, 784, 1047];
    n.forEach((f, i) => this.tone({ type: 'triangle', f0: f, dur: 0.18, vol: 0.18, when: i * 0.1 }));
    [523, 659, 784].forEach(f => this.tone({ type: 'triangle', f0: f * 2, dur: 0.7, vol: 0.09, when: 0.4 }));
  }
  jingle() {
    const n = [784, 988, 1175, 1568];
    n.forEach((f, i) => this.tone({ type: 'square', f0: f, dur: 0.12, vol: 0.07, when: i * 0.08, filter: ['lowpass', 3000] }));
  }
  sad() {
    [523, 494, 466].forEach((f, i) => this.tone({ type: 'triangle', f0: f, dur: 0.25, vol: 0.14, when: i * 0.2 }));
  }
  sleep() {
    [1047, 880, 784, 659, 523].forEach((f, i) => this.tone({ type: 'sine', f0: f, dur: 0.5, vol: 0.1, when: i * 0.18 }));
  }
  scratch() {
    for (let i = 0; i < 4; i++) this.noise({ dur: 0.08, vol: 0.12, type: 'bandpass', f: 3000, q: 2, when: i * 0.09 });
  }
  boing() { this.tone({ type: 'sine', f0: 180, glide: [[0.1, 520], [0.3, 260]], dur: 0.3, vol: 0.2 }); }

  // ---------- continuous loops (sizzle, bubbling) ----------
  setLoop(name, level) {
    if (!this.ctx) return;
    let L = this.loops[name];
    if (!L) {
      if (level <= 0) return;
      const c = this.ctx;
      const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
      const f = c.createBiquadFilter();
      const g = c.createGain(); g.gain.value = 0;
      if (name === 'sizzle') { f.type = 'highpass'; f.frequency.value = 2600; }
      else { f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 2; }
      s.connect(f); f.connect(g); g.connect(this.sfxBus);
      s.start();
      L = this.loops[name] = { s, f, g, level: 0 };
    }
    L.level = level;
  }
  update() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const name in this.loops) {
      const L = this.loops[name];
      let target = 0;
      if (L.level > 0) {
        if (name === 'sizzle') target = L.level * (0.035 + Math.random() * 0.05);
        else { target = L.level * (0.03 + Math.random() * 0.06); L.f.frequency.setTargetAtTime(300 + Math.random() * 500, t, 0.03); }
      }
      L.g.gain.setTargetAtTime(target, t, 0.04);
    }
  }
  stopLoops() { for (const n in this.loops) this.loops[n].level = 0; }

  // ---------- music ----------
  playSong(name) {
    if (this.songName === name) return;
    this.songName = name;
    if (!this.ctx) { this.pendingSong = name; return; }
    this.stopSong(true);
    this.songName = name;
    const song = SONGS[name];
    if (!song) return;
    this.song = song;
    this.stepDur = 60 / song.bpm / 2;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.15;
    this.timer = setInterval(() => this.schedule(), 30);
  }
  stopSong(keepName) {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.song = null;
    if (!keepName) this.songName = null;
  }
  schedule() {
    if (!this.ctx || !this.song) return;
    const c = this.ctx;
    const S = this.song;
    while (this.nextTime < c.currentTime + 0.15) {
      const i = this.step % S.lead.length;
      const bar = Math.floor(i / 8) % S.chords.length;
      const inBar = i % 8;
      const ch = S.chords[bar];
      const when = this.nextTime - c.currentTime;
      const tok = S.lead[i];
      if (tok !== '.' && tok !== '-') {
        let len = 1;
        while (S.lead[(i + len) % S.lead.length] === '-' && len < 8) len++;
        let f = nf(tok);
        if (S.oct) f *= Math.pow(2, S.oct);
        this.instr(S.inst, f, when, len * this.stepDur);
      }
      // bass
      if (inBar === 0 || inBar === 4) this.bass(nf(ROOT[ch]) * (S.oct === -1 ? 1 : 1), when, this.stepDur * (S.pad ? 3.5 : 1.6));
      else if (!S.pad && (inBar === 2 || inBar === 6)) this.bass(nf(FIFTH[ch]), when, this.stepDur * 1.4);
      // chords
      if (S.stabs && inBar % 2 === 1) for (const n of CHORDS[ch]) this.stab(nf(n) * 2, when);
      if (S.pad && inBar === 0) for (const n of CHORDS[ch]) this.pad(nf(n) * 2, when, this.stepDur * 7.5);
      // drums
      if (S.drums) {
        if (inBar === 0 || inBar === 4) this.kick(when);
        if (inBar === 2 || inBar === 6) this.snare(when);
        if (inBar % 2 === 1) this.hat(when);
      }
      this.nextTime += this.stepDur;
      this.step++;
    }
  }
  instr(kind, f, when, dur) {
    const bus = this.musicBus;
    if (kind === 'bell') {
      this.tone({ type: 'sine', f0: f, dur: Math.max(0.5, dur), vol: 0.16, when, bus, a: 0.004 });
      this.tone({ type: 'sine', f0: f * 3, dur: 0.25, vol: 0.03, when, bus, a: 0.002 });
    } else {
      this.tone({ type: 'square', f0: f, dur: dur * 0.9, vol: 0.06, when, bus, a: 0.01, filter: ['lowpass', 2600] });
      this.tone({ type: 'triangle', f0: f, dur: dur * 0.9, vol: 0.08, when, bus, a: 0.01 });
    }
  }
  bass(f, when, dur) { this.tone({ type: 'triangle', f0: f, dur, vol: 0.2, when, bus: this.musicBus, a: 0.01 }); }
  stab(f, when) { this.tone({ type: 'triangle', f0: f, dur: 0.09, vol: 0.035, when, bus: this.musicBus, a: 0.003 }); }
  pad(f, when, dur) { this.tone({ type: 'sine', f0: f, dur, vol: 0.035, when, bus: this.musicBus, a: 0.3 }); }
  kick(when) { this.tone({ type: 'sine', f0: 150, f1: 45, dur: 0.14, vol: 0.28, when, bus: this.musicBus }); }
  snare(when) { this.noise({ dur: 0.1, vol: 0.06, type: 'bandpass', f: 1900, q: 0.8, when, bus: this.musicBus }); }
  hat(when) { this.noise({ dur: 0.035, vol: 0.035, type: 'highpass', f: 7000, when, bus: this.musicBus }); }
}

export const sound = new Sound();
