const KEY = 'warungMeong.save.v1';

export function defaultSave() {
  return {
    v: 1,
    started: false,
    char: { gender: 'm', fur: 'oranye', name: 'Oyen', hat: 'koki', outfit: 'biru' },
    coins: 0,
    totalCoins: 0,
    day: 1,          // highest unlocked day
    lastDay: 0,      // last day played
    stars: {},
    upgrades: {},
    hats: ['none', 'koki'],
    outfits: ['biru', 'pink'],
    trophies: {},
    stats: { served: 0, sate: 0, angry: 0, days: 0 },
    settings: { music: true, sfx: true, helper: true },
    time: 'morning',
    breakfast: false,
    seenRecipes: {},
    tips: {},
  };
}

let memory = null;

export function loadSave() {
  let data = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) data = JSON.parse(raw);
  } catch (e) { data = memory; }
  const def = defaultSave();
  if (!data || data.v !== 1) return def;
  // merge to keep new fields
  const out = { ...def, ...data };
  out.char = { ...def.char, ...(data.char || {}) };
  out.settings = { ...def.settings, ...(data.settings || {}) };
  out.stats = { ...def.stats, ...(data.stats || {}) };
  return out;
}

export function writeSave(s) {
  memory = JSON.parse(JSON.stringify(s));
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: keep in memory */ }
}

export function clearSave() {
  memory = null;
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}

// Some Android browsers block localStorage for pages opened from a file.
export function storageWorks() {
  try {
    localStorage.setItem(KEY + '-t', '1');
    const ok = localStorage.getItem(KEY + '-t') === '1';
    localStorage.removeItem(KEY + '-t');
    return ok;
  } catch (e) { return false; }
}
